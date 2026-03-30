import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Platform,
  Alert,
  Pressable,
  Keyboard,
  TextInput,
  KeyboardAvoidingView,
  Dimensions,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { useForm, Controller } from 'react-hook-form';

import { toast } from '@/shared/utils/toast';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppFormField, AppButton, AppText } from '@/core/components';
import { t } from '@/shared/locales/engine/t';
import { authService } from '../services/auth.service';
import { LoginFormData, LoginRequest, LoginScreenProps } from '../types/login.types';
import { useLoginStyles } from '../styles/Login.style';
import { useLoginAnimation } from '../hooks/useLoginAnimation';
// import messaging from '@react-native-firebase/messaging';
import Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { setTokens } from '@/shared/services/storage/tokenStorage';
import { useAuthStore } from '@/core/store/auth.store';

const { height } = Dimensions.get('window');
const SMALL_SCREEN_HEIGHT = 700;

/**
 * Login Screen Component
 * Handles user authentication with form validation and animations
 */
const LoginScreen: React.FC<LoginScreenProps> = () => {
  const { colors } = useTheme();
  const styles = useLoginStyles(colors);

  // ============================================================================
  // Refs
  // ============================================================================
  const userIdRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // ============================================================================
  // State
  // ============================================================================
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // ============================================================================
  // Form Handling with React Hook Form
  // ============================================================================
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty, touchedFields },
    setValue,
    setFocus,
    trigger,
  } = useForm<LoginFormData>({
    defaultValues: {
      userId: '',
      password: '',
    },
    mode: 'onChange', // Real-time validation
  });

  // ============================================================================
  // Custom Hooks
  // ============================================================================
  const { animatedLogo, animatedForm, animatedButton } = useLoginAnimation();

  // ============================================================================
  // Constants & Memoized Values
  // ============================================================================
  const isSmallScreen = height < SMALL_SCREEN_HEIGHT;
  const isFormValid = isValid && isDirty;
  const shouldHideFooter = keyboardVisible && isSmallScreen && focusedInput === 'password';

  // ============================================================================
  // Effects
  // ============================================================================

  /**
   * Keyboard event listeners for native platforms
   * Handles keyboard show/hide and scrolling behavior
   */
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardVisible(true);

        // Scroll to password field when keyboard opens
        setTimeout(() => {
          if (focusedInput === 'password' && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 200, animated: true });
          }
        }, 100);
      },
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setFocusedInput(null);
      },
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [focusedInput]);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Toggle password visibility
   */
  const toggleSecureEntry = useCallback(() => {
    setSecureTextEntry((prev) => !prev);
  }, []);

  /**
   * Handle forgot password press
   */
  const handleForgotPassword = useCallback(() => {
    Alert.alert(t('auth.login.forgotTitle'), t('auth.login.forgotMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.continue'),
        onPress: () => router.push('/forgot-password'),
      },
    ]);
  }, []);

  /**
   * Focus password field (used for next button)
   */
  const focusPassword = useCallback(() => {
    setFocus('password');
    passwordRef.current?.focus();
  }, [setFocus]);

  /**
   * Handle input focus
   */
  const handleFocus = useCallback(
    (field: string) => {
      setFocusedInput(field);

      // Auto-scroll for smaller screens
      if (isSmallScreen && scrollViewRef.current) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: field === 'password' ? 200 : 100,
            animated: true,
          });
        }, 300);
      }
    },
    [isSmallScreen],
  );

  /**
   * Handle input blur
   */
  const handleBlur = useCallback(
    (field: keyof LoginFormData) => {
      setFocusedInput(null);
      trigger(field); // Validate on blur
    },
    [trigger],
  );

  // const getFcmToken = async (): Promise<string | null> => {
  //   try {
  //     // Request permission (important for iOS + Android 13+)
  //     const authStatus = await messaging().requestPermission();

  //     const enabled =
  //       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //       authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //     if (!enabled) return null;

  //     return await messaging().getToken();
  //   } catch (error) {
  //     console.log('FCM Token Error:', error);
  //     return null;
  //   }
  // };

  const getDeviceInfo = async () => {
    // const fcmToken = await getPushToken();

    return {
      deviceId: 'dsfjklfkjdskfjl',
      // deviceId: Device.osInternalBuildId || Device.modelId || 'unknown-device',
      deviceType: Platform.OS,
      os: Platform.OS,
      osVersion: String(Platform.Version),
      browser: Platform.OS === 'web' ? 'Chrome' : 'N/A',
      appVersion: '1.3.0',
      fcmToken: 'dklfjfj',
      // agent: 'BACK_OFFICE',
    };
  };

  const getPushToken = async (): Promise<string | null> => {
    try {
      if (!Device.isDevice) return null;

      // Request permission
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return null;

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync();

      return tokenData.data;
    } catch (error) {
      console.log('Push Token Error:', error);
      return null;
    }
  };

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      Keyboard.dismiss();

      try {
        setLoading(true);

        const payload = {
          loginId: data.userId.trim(),
          password: data.password,
          deviceInfo: await getDeviceInfo(),
        };

        const response = await authService.login(payload);

        console.log('Login Response:', response);

        const resData: any = response.data;

        /**
         * ✅ Extract user from API response
         */
        const user = {
          userId: resData.user.profileId,
          name: resData.user.profile?.name,
          role: resData.user.profile?.role,
          vanId: resData.user.profile?.associatedVans?.[0] ?? null,
        };

        console.log('Authenticated User:', user);

        /**
         * ✅ Store auth (token + user)
         * ❌ No need to call setTokens again
         */
        await useAuthStore.getState().setAuth(resData.accessToken, resData.refreshToken, user);

        toast.success(t('auth.login.welcomeBack'), t('auth.login.loginSuccess'));

        router.replace('/(tabs)/home');
      } catch (error: any) {
        toast.error(
          t('auth.login.loginFailed'),
          error?.message || t('auth.login.invalidCredentials'),
        );

        setValue('password', '', { shouldValidate: true });
        setFocus('password');
      } finally {
        setLoading(false);
      }
    },
    [setValue, setFocus],
  );

  /**
   * Navigate to sign up
   */
  const handleSignUp = useCallback(() => {
    router.push('/register');
  }, []);

  /**
   * Dismiss keyboard on tap outside
   */
  const handleDismissKeyboard = useCallback(() => {
    if (Platform.OS !== 'web') {
      Keyboard.dismiss();
    }
  }, []);

  // ============================================================================
  // Helper Functions
  // ============================================================================

  /**
   * Get dynamic icon size based on screen size and keyboard state
   */
  const getIconSize = useCallback(
    () => (keyboardVisible && isSmallScreen ? 28 : 36),
    [keyboardVisible, isSmallScreen],
  );

  /**
   * Get localized error message for a field
   */
  const getErrorMessage = useCallback(
    (field: keyof LoginFormData): string => {
      const error = errors[field];
      if (error?.message && touchedFields[field]) {
        return t(error.message);
      }
      return '';
    },
    [errors, touchedFields],
  );

  // ============================================================================
  // Render Methods
  // ============================================================================

  /**
   * Render header with logo and app title
   */
  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,
        animatedLogo,
        keyboardVisible && isSmallScreen && styles.headerCompact,
      ]}
    >
      <View
        style={[
          styles.logoBox,
          { backgroundColor: colors.primary },
          keyboardVisible && isSmallScreen && styles.logoBoxCompact,
        ]}
      >
        <Ionicons name="shield-checkmark" size={getIconSize()} color={colors.textInverse} />
      </View>

      <AppText
        style={[styles.appTitle, keyboardVisible && isSmallScreen && styles.appTitleCompact]}
      >
        {t('common.appTitle')}
      </AppText>

      {!keyboardVisible && (
        <AppText style={styles.appSubtitle}>{t('auth.login.appSubtitle')}</AppText>
      )}
    </Animated.View>
  );

  /**
   * Render login form with validation
   */
  const renderForm = () => (
    <Animated.View style={[styles.formSection, animatedForm]}>
      {/* User ID Field */}
      <Controller
        control={control}
        name="userId"
        rules={{
          required: 'auth.login.userIdRequired',
          validate: (value) => (value?.trim() ? true : 'auth.login.userIdRequired'),
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <AppFormField
            ref={userIdRef}
            label={!keyboardVisible ? t('auth.login.userIdLabel') : ''}
            value={value}
            placeholder={t('auth.login.userIdPlaceholder')}
            onChangeText={onChange}
            onBlur={() => {
              onBlur();
              handleBlur('userId');
            }}
            onFocus={() => handleFocus('userId')}
            errorText={getErrorMessage('userId')}
            returnKeyType="next"
            onSubmitEditing={focusPassword}
            icon="person-outline"
            editable={!loading}
            touched={touchedFields.userId}
          />
        )}
      />

      {/* Password Field */}
      <Controller
        control={control}
        name="password"
        rules={{
          required: 'auth.login.passwordRequired',
          minLength: {
            value: 6,
            message: 'auth.login.passwordMinLength',
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <AppFormField
            ref={passwordRef}
            label={!keyboardVisible ? t('auth.login.passwordLabel') : ''}
            value={value}
            placeholder={t('auth.login.passwordPlaceholder')}
            onChangeText={onChange}
            onBlur={() => {
              onBlur();
              handleBlur('password');
            }}
            onFocus={() => handleFocus('password')}
            errorText={getErrorMessage('password')}
            secureTextEntry={secureTextEntry}
            returnKeyType="done"
            onSubmitEditing={handleSubmit(onSubmit)}
            icon="lock-closed-outline"
            rightIcon={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={toggleSecureEntry}
            editable={!loading}
            touched={touchedFields.password}
          />
        )}
      />

      {/* Forgot Password Link */}
      {!keyboardVisible && (
        <Pressable
          onPress={handleForgotPassword}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AppText style={styles.forgotLink}>{t('auth.login.forgotPassword')}</AppText>
        </Pressable>
      )}

      {/* Submit Button */}
      <Animated.View style={[styles.buttonContainer, animatedButton]}>
        <AppButton
          title={t('auth.login.title')}
          loading={loading}
          disabled={!isFormValid || loading}
          onPress={handleSubmit(onSubmit)}
          fullWidth
        />
      </Animated.View>
    </Animated.View>
  );

  /**
   * Render footer with sign up link
   */
  const renderFooter = () => (
    <View style={styles.footer}>
      <View style={styles.signupContainer}>
        <AppText style={styles.signupText}>{t('auth.login.noAccount')} </AppText>
        <Pressable
          onPress={handleSignUp}
          hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
          disabled={loading}
        >
          <AppText style={styles.signupLink}>{t('auth.login.signUp')}</AppText>
        </Pressable>
      </View>
    </View>
  );

  /**
   * Render main content
   */
  const renderContent = () => (
    <View style={[styles.scrollContentInner, { backgroundColor: 'transparent' }]}>
      {renderHeader()}
      {renderForm()}
      {!shouldHideFooter && renderFooter()}
      {keyboardVisible && <View style={{ height: 20 }} />}
    </View>
  );

  // ============================================================================
  // Main Render
  // ============================================================================
  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={[styles.scrollView, { backgroundColor: 'transparent' }]}
          contentContainerStyle={[styles.scrollContent, { backgroundColor: 'transparent' }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <Pressable
            onPress={handleDismissKeyboard}
            accessible={false}
            style={{ backgroundColor: 'transparent' }}
          >
            {renderContent()}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default React.memo(LoginScreen);
