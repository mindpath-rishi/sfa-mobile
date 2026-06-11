import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { authService } from '@/features/auth/services/auth.service';
import { useTheme } from '@/shared/hooks/useTheme';

const MIN_PASSWORD_LENGTH = 6;

type PasswordErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  form?: string;
};

export default function ChangePasswordScreen() {
  const { colors } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getInputStyle = (hasError: boolean) => ({
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: hasError ? colors.error : colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    color: colors.textPrimary,
    fontSize: 14,
  });

  const validate = () => {
    const nextErrors: PasswordErrors = {};

    if (!currentPassword.trim()) {
      nextErrors.currentPassword = 'Current password is required.';
    }

    if (!newPassword) {
      nextErrors.newPassword = 'New password is required.';
    } else if (newPassword.length < MIN_PASSWORD_LENGTH) {
      nextErrors.newPassword = 'New password must be at least 6 characters.';
    } else if (newPassword === currentPassword) {
      nextErrors.newPassword = 'New password must be different from current password.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your new password.';
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = 'New password and confirm password do not match.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const clearFieldError = (field: keyof PasswordErrors) => {
    setSuccessMessage('');
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const handleSubmit = async () => {
    setSuccessMessage('');
    if (!validate()) return;

    setSubmitting(true);

    try {
      const response = await authService.changePassword({
        currentPassword,
        newPassword,
      });

      if (!response.success) {
        throw new Error(response.message || 'Unable to change password.');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      setSuccessMessage(response.message || 'Password changed successfully.');

      setTimeout(() => {
        router.replace('/(drawer)/(tabs)/profile');
      }, 800);
    } catch (error: any) {
      setErrors({ form: error?.message || 'Unable to change password.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View
          style={{
            borderRadius: 12,
            padding: 16,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 14,
          }}
        >
          {!!errors.form && (
            <Text style={{ color: colors.error, fontSize: 12, fontWeight: '700' }}>
              {errors.form}
            </Text>
          )}

          {!!successMessage && (
            <Text style={{ color: colors.success, fontSize: 12, fontWeight: '700' }}>
              {successMessage}
            </Text>
          )}

          <View>
            <Text style={{ marginBottom: 7, color: colors.textSecondary, fontSize: 12 }}>
              Current Password
            </Text>
            <TextInput
              value={currentPassword}
              onChangeText={(value) => {
                setCurrentPassword(value);
                clearFieldError('currentPassword');
              }}
              secureTextEntry
              placeholder="Enter current password"
              placeholderTextColor={colors.textTertiary}
              style={getInputStyle(Boolean(errors.currentPassword))}
            />
            {!!errors.currentPassword && (
              <Text style={{ color: colors.error, fontSize: 11, marginTop: 5 }}>
                {errors.currentPassword}
              </Text>
            )}
          </View>

          <View>
            <Text style={{ marginBottom: 7, color: colors.textSecondary, fontSize: 12 }}>
              New Password
            </Text>
            <TextInput
              value={newPassword}
              onChangeText={(value) => {
                setNewPassword(value);
                clearFieldError('newPassword');
              }}
              secureTextEntry
              placeholder="Enter new password"
              placeholderTextColor={colors.textTertiary}
              style={getInputStyle(Boolean(errors.newPassword))}
            />
            {!!errors.newPassword && (
              <Text style={{ color: colors.error, fontSize: 11, marginTop: 5 }}>
                {errors.newPassword}
              </Text>
            )}
          </View>

          <View>
            <Text style={{ marginBottom: 7, color: colors.textSecondary, fontSize: 12 }}>
              Confirm Password
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                clearFieldError('confirmPassword');
              }}
              secureTextEntry
              placeholder="Confirm new password"
              placeholderTextColor={colors.textTertiary}
              style={getInputStyle(Boolean(errors.confirmPassword))}
            />
            {!!errors.confirmPassword && (
              <Text style={{ color: colors.error, fontSize: 11, marginTop: 5 }}>
                {errors.confirmPassword}
              </Text>
            )}
            {!errors.confirmPassword &&
              confirmPassword.length > 0 &&
              newPassword === confirmPassword && (
                <Text style={{ color: colors.success, fontSize: 11, marginTop: 5 }}>
                  Passwords match.
                </Text>
              )}
          </View>

          <TouchableOpacity
            activeOpacity={0.86}
            disabled={submitting}
            onPress={handleSubmit}
            style={{
              minHeight: 48,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: submitting ? colors.disabled : colors.primary,
              marginTop: 4,
            }}
          >
            {submitting ? (
              <ActivityIndicator color={colors.primaryContrast} />
            ) : (
              <Text
                style={{
                  color: colors.primaryContrast,
                  fontSize: 14,
                  fontWeight: '800',
                }}
              >
                Update Password
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
