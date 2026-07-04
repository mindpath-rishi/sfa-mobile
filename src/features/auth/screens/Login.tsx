import React, { useState, useRef, useEffect, useCallback } from 'react';

import {
  View,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';

import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import * as Haptics from 'expo-haptics';
import * as Application from 'expo-application';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

import { toast } from '@/shared/utils/toast';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppText, AppFormField } from '@/core/components';
import { t } from '@/shared/locales/engine/t';
import { authService } from '../services/auth.service';
import { LoginFormData, LoginScreenProps } from '../types/login.types';
import { useAuthStore } from '@/core/store/auth.store';
import { syncService } from '@/sync';
import { useLoginStyles } from '../styles/Login.style';
import {
  getPushNotificationTokenAsync,
  isPushNotificationsEnabledAsync,
} from '@/shared/services/push-notification.service';
import { getClientDeviceIdAsync } from '@/shared/services/device.service';

const isWeb = Platform.OS === 'web';
const { height: screenHeight } = Dimensions.get('window');

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const { colors } = useTheme();
  const styles = useLoginStyles(colors);

  // Animation refs
  const logoAnimValue = useRef(new Animated.Value(0)).current;
  const formAnimValue = useRef(new Animated.Value(0)).current;
  const inputScaleRef = useRef(new Animated.Value(1)).current;

  // Refs
  const userIdRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // State
  const [loading, setLoading] = useState(false);
  const [loginStage, setLoginStage] = useState<'signing-in' | 'syncing'>('signing-in');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  // Form
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty, touchedFields },
    setValue,
    setFocus,
    trigger,
    watch,
  } = useForm<LoginFormData>({
    defaultValues: {
      userId: '',
      password: '',
    },
    mode: 'onChange',
  });

  const passwordValue = watch('password');

  // Animation on mount
  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnimValue, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(formAnimValue, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoAnimValue, formAnimValue]);

  // Keyboard handling
  useEffect(() => {
    if (isWeb) return;

    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        if (focusedInput === 'password' && scrollViewRef.current) {
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({
              y: 120,
              animated: true,
            });
          }, 250);
        }
      },
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [focusedInput]);

  // Caps lock detection (for web)
  const handlePasswordKeyPress = (e: any) => {
    if (isWeb && e.nativeEvent) {
      const { shiftKey, code } = e.nativeEvent;
      if (code?.startsWith('Key')) {
        setCapsLockOn(shiftKey);
      }
    }
  };

  // Toggle password
  const toggleSecureEntry = () => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSecureTextEntry((prev) => !prev);
  };

  // Focus password
  const focusPassword = () => {
    setFocus('password');
    setTimeout(() => {
      passwordRef.current?.focus();
      scrollViewRef.current?.scrollTo({
        y: 120,
        animated: true,
      });
    }, 100);
  };

  // Focus handler
  const handleFocus = useCallback((field: string) => {
    setFocusedInput(field);
    Animated.spring(inputScaleRef, {
      toValue: 1.02,
      useNativeDriver: true,
      speed: 15,
    }).start();
    if (field === 'password') {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: 120,
          animated: true,
        });
      }, 100);
    }
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  // Blur handler
  const handleBlur = useCallback(
    (field: keyof LoginFormData) => {
      setFocusedInput(null);
      Animated.spring(inputScaleRef, {
        toValue: 1,
        useNativeDriver: true,
        speed: 15,
      }).start();
      trigger(field);
    },
    [trigger, inputScaleRef],
  );

  // Error message
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

  // Device info
  const getDeviceInfo = async () => ({
    deviceId: await getClientDeviceIdAsync(),
    deviceType: Platform.OS,
    os: Platform.OS,
    osVersion: String(Platform.Version),
    browser: isWeb ? 'Modern Browser' : 'N/A',
    appVersion: Application.nativeApplicationVersion ?? '1.3.0',
    fcmToken: (await isPushNotificationsEnabledAsync())
      ? await getPushNotificationTokenAsync()
      : null,
  });

  // Submit
  const onSubmit = async (data: LoginFormData) => {
    if (!isWeb) {
      Keyboard.dismiss();
    }
    setLoading(true);
    setLoginStage('signing-in');
    try {
      const payload = {
        loginId: data.userId.trim(),
        password: data.password,
        deviceInfo: await getDeviceInfo(),
      };
      const response = await authService.login(payload);
      const resData: any = response.data;
      const profile = resData.user.profile;
      const user = {
        userId: resData.user.profileId || resData.user.id,
        id: resData.user.id,
        name: profile?.name || resData.user.name,
        email: profile?.email || resData.user.email,
        mobile: profile?.mobile || profile?.phone || resData.user.mobile || resData.user.phone,
        employeeId: profile?.employeeId || resData.user.employeeId || resData.user.profileId,
        employeeName: profile?.employeeName,
        designation: profile?.designation,
        role: profile?.role || resData.user.role,
        roleId: profile?.roleId || profile?.role || resData.user.roleId || resData.user.role,
        route: profile?.route,
        routeName: profile?.routeName,
        territory: profile?.territory,
        manager: profile?.manager || profile?.reportingEmployeeName,
        managerName: profile?.managerName || profile?.reportingEmployeeName,
        vanId: resData.user.vanId ?? null,
        offlineAccessAllowed: profile?.offlineAccessAllowed === true,
        avatar: profile?.avatar || profile?.profileImage || profile?.profileImageUrl || null,
      };
      await useAuthStore.getState().setAuth(resData.accessToken, resData.refreshToken, user);
      setLoginStage('syncing');
      await syncService.initialise();
      if (user.offlineAccessAllowed) await syncService.sync();
      toast.success(t('auth.login.welcomeBack'));
      router.replace('/(drawer)/(tabs)/home');
    } catch (error: any) {
      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      toast.error(t('auth.login.loginFailed'), error?.message);
      setValue('password', '', {
        shouldValidate: true,
      });
      setFocus('password');
    } finally {
      setLoading(false);
      setLoginStage('signing-in');
    }
  };

  const isFormValid = isValid && isDirty;
  const userIdError = getErrorMessage('userId');
  const passwordError = getErrorMessage('password');

  const logoOpacity = logoAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const logoScale = logoAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const formOpacity = formAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const formTranslateY = formAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Background */}
      <LinearGradient
        colors={[colors.primary, colors.secondary || colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />

      {/* Main */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            if (!isWeb) {
              Keyboard.dismiss();
            }
          }}
        >
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={isWeb ? 'none' : 'interactive'}
            scrollEnabled={true}
            bounces={false}
            overScrollMode="never"
            nestedScrollEnabled={false}
          >
            <View>
              {/* HERO SECTION */}
              <View style={styles.topSection}>
                <View style={{ alignItems: 'center' }}>
                  {/* Logo */}
                  <Animated.View
                    style={[
                      styles.logoContainer,
                      {
                        opacity: logoOpacity,
                        transform: [
                          { scale: logoScale },
                          {
                            translateY: logoAnimValue.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-20, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {!logoError ? (
                      <Image
                        source={require('@/assets/images/logo1.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                        onError={() => setLogoError(true)}
                      />
                    ) : (
                      <Ionicons name="rocket-outline" size={40} color={colors.primary} />
                    )}
                  </Animated.View>

                  {/* Title */}
                  <Animated.View
                    style={{
                      opacity: logoOpacity,
                      transform: [
                        {
                          translateY: logoAnimValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-15, 0],
                          }),
                        },
                      ],
                    }}
                  >
                    <AppText style={styles.appTitle}>{t('common.appTitle')}</AppText>
                  </Animated.View>

                  {/* Subtitle */}
                  <Animated.View
                    style={{
                      opacity: logoOpacity,
                      transform: [
                        {
                          translateY: logoAnimValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-10, 0],
                          }),
                        },
                      ],
                    }}
                  >
                    <AppText style={styles.appSubtitle}>
                      Experience the future of digital access
                    </AppText>
                  </Animated.View>
                </View>
              </View>

              {/* FORM SECTION */}
              <Animated.View
                style={[
                  styles.bottomSection,
                  {
                    opacity: formOpacity,
                    transform: [{ translateY: formTranslateY }],
                  },
                ]}
              >
                <View style={styles.formContainer}>
                  {/* Welcome */}
                  <View style={styles.welcomeContainer}>
                    <AppText style={styles.welcomeTitle}>Welcome Back!</AppText>
                    <AppText style={styles.welcomeSubtitle}>
                      Please enter your credentials to continue
                    </AppText>
                  </View>

                  {/* USER ID - Using AppFormField */}
                  <Controller
                    control={control}
                    name="userId"
                    rules={{
                      required: 'auth.login.userIdRequired',
                      validate: (value) => (value?.trim() ? true : 'auth.login.userIdRequired'),
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View>
                        <AppFormField
                          ref={userIdRef}
                          value={value}
                          placeholder="Enter your loginId"
                          onChangeText={(text: string) => {
                            onChange(text);
                          }}
                          onBlur={() => {
                            onBlur();
                            handleBlur('userId');
                          }}
                          onFocus={() => handleFocus('userId')}
                          errorText={userIdError}
                          returnKeyType="next"
                          onSubmitEditing={focusPassword}
                          icon="person-outline"
                          iconColor="#FFFFFF"
                          placeholderTextColor="#000000"
                          editable={!loading}
                          touched={touchedFields.userId}
                          containerStyle={styles.inputContainer}
                          accessibilityLabel="User ID or Login ID input field"
                          accessibilityHint="Enter your unique user ID or login ID"
                        />
                        {userIdError && (
                          <Animated.View
                            style={{
                              opacity: formAnimValue,
                              transform: [
                                {
                                  translateX: formAnimValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-10, 0],
                                  }),
                                },
                              ],
                            }}
                          >
                            <AppText style={styles.errorHelperText}>
                              <Ionicons
                                name="alert-circle-outline"
                                size={12}
                                color={colors.error}
                              />{' '}
                              {userIdError}
                            </AppText>
                          </Animated.View>
                        )}
                      </View>
                    )}
                  />

                  {/* PASSWORD - Using AppFormField */}
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
                      <View>
                        <AppFormField
                          ref={passwordRef}
                          value={value}
                          placeholder="Enter your password"
                          onChangeText={(text: string) => {
                            onChange(text);
                          }}
                          onBlur={() => {
                            onBlur();
                            handleBlur('password');
                          }}
                          onFocus={() => handleFocus('password')}
                          onKeyPress={handlePasswordKeyPress}
                          errorText={passwordError}
                          secureTextEntry={secureTextEntry}
                          returnKeyType="done"
                          onSubmitEditing={handleSubmit(onSubmit)}
                          icon="lock-closed-outline"
                          iconColor="#FFFFFF"
                          placeholderTextColor="#000000"
                          rightIcon={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
                          onRightIconPress={toggleSecureEntry}
                          editable={!loading}
                          touched={touchedFields.password}
                          containerStyle={styles.inputContainer}
                          accessibilityLabel="Password input field"
                          accessibilityHint="Enter your password. Use the eye icon to toggle visibility"
                        />
                        {passwordError && (
                          <Animated.View
                            style={{
                              opacity: formAnimValue,
                              transform: [
                                {
                                  translateX: formAnimValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-10, 0],
                                  }),
                                },
                              ],
                            }}
                          >
                            <AppText style={styles.errorHelperText}>
                              <Ionicons
                                name="alert-circle-outline"
                                size={12}
                                color={colors.error}
                              />{' '}
                              {passwordError}
                            </AppText>
                          </Animated.View>
                        )}
                        {/* Caps Lock Warning */}
                        {capsLockOn && (
                          <View style={styles.capsLockWarning}>
                            <Ionicons name="alert-circle" size={14} color={colors.warning} />
                            <AppText style={styles.capsLockText}>Caps Lock is on</AppText>
                          </View>
                        )}
                        {/* Password Requirements */}
                        {/* {passwordValue && (
                          <View style={styles.passwordRequirements}>
                            <PasswordRequirement
                              met={passwordValue.length >= 6}
                              text="At least 6 characters"
                            />
                            <PasswordRequirement
                              met={/[A-Z]/.test(passwordValue)}
                              text="One uppercase letter"
                            />
                            <PasswordRequirement
                              met={/[a-z]/.test(passwordValue)}
                              text="One lowercase letter"
                            />
                            <PasswordRequirement
                              met={/[0-9]/.test(passwordValue)}
                              text="One number"
                            />
                          </View>
                        )} */}
                      </View>
                    )}
                  />

                  {/* LOGIN BUTTON */}
                  <Pressable
                    onPress={handleSubmit(onSubmit)}
                    disabled={!isFormValid || loading}
                    style={({ pressed }) => [
                      styles.loginButton,
                      (!isFormValid || loading) && styles.disabledButton,
                      pressed && {
                        opacity: 0.85,
                        transform: [{ scale: 0.99 }],
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Sign in button"
                    accessibilityHint={
                      !isFormValid ? 'Please fill in all required fields' : 'Double tap to sign in'
                    }
                    accessibilityState={{ disabled: !isFormValid || loading }}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.primary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.loginButtonGradient}
                    >
                      {loading ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <ActivityIndicator
                            size="small"
                            color={colors.textInverse}
                            accessibilityLabel={
                              loginStage === 'syncing' ? 'Preparing offline data' : 'Signing in'
                            }
                          />
                          <AppText style={[styles.loginButtonText, { marginLeft: 8 }]}>
                            {loginStage === 'syncing' ? 'Preparing offline data…' : 'Signing in…'}
                          </AppText>
                        </View>
                      ) : (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Ionicons name="log-in-outline" size={18} color={colors.textInverse} />
                          <AppText style={[styles.loginButtonText, { marginLeft: 8 }]}>
                            Sign In
                          </AppText>
                        </View>
                      )}
                    </LinearGradient>
                  </Pressable>

                  {/* Forgot Password Link */}
                  {!loading && !keyboardVisible && (
                    <Pressable
                      onPress={() => router.push('/forgot-password')}
                      style={styles.forgotPasswordContainer}
                      accessibilityRole="link"
                      accessibilityLabel="Forgot password"
                    >
                      <AppText style={styles.forgotPasswordText}>Forgot password?</AppText>
                    </Pressable>
                  )}

                  {/* Footer */}
                  {!loading && !keyboardVisible && (
                    <AppText style={styles.footerText}>🔒 Secure & Encrypted Connection</AppText>
                  )}
                </View>
              </Animated.View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Password Requirement Component
const PasswordRequirement: React.FC<{ met: boolean; text: string }> = ({ met, text }) => {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 3 }}>
      <Ionicons
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={14}
        color={met ? colors.success : colors.textTertiary}
      />
      <AppText
        style={{ marginLeft: 8, fontSize: 12, color: met ? colors.success : colors.textTertiary }}
      >
        {text}
      </AppText>
    </View>
  );
};

export default React.memo(LoginScreen);
