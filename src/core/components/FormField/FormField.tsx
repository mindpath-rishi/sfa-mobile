import React, { forwardRef, memo, useCallback, useState } from 'react';
import { View, Pressable, Keyboard, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Input from '../Input';
import Text from '../Text';
import { FormFieldProps } from './FormField.types';
import { useFormFieldStyles } from './FormField.styles';
import { useTheme } from '@/shared/hooks/useTheme';

const FormField = forwardRef<TextInput, FormFieldProps>(
  (
    {
      label,
      errorText,
      helperText,
      successText,
      icon,
      secureTextEntry = false,
      required = false,
      success = false,
      touched = false,
      disabled = false,
      editable = true,
      clearable = false,
      characterCount = false,
      maxLength,
      value,
      onChangeText,
      onIconPress,
      onClear,
      iconPosition = 'left',
      size = 'medium',
      variant = 'outlined',
      multiline = false,
      ...props
    },
    ref,
  ) => {
    const { colors } = useTheme();
    const [secure, setSecure] = useState<boolean>(secureTextEntry);
    const [isFocused, setIsFocused] = useState(false);

    const isDisabled = disabled || editable === false;
    const hasError = !!errorText && touched;
    const isValid = success && touched && !hasError;
    const currentLength = value?.length || 0;

    const styles = useFormFieldStyles({
      size,
      variant,
      error: hasError,
      success: isValid,
      disabled: isDisabled,
      focused: isFocused,
    });

    const toggleSecure = useCallback(() => {
      Keyboard.dismiss();
      setSecure((prev) => !prev);
    }, []);

    const handleClear = useCallback(() => {
      onChangeText?.('');
      onClear?.();
    }, [onChangeText, onClear]);

    const handleFocus = useCallback(() => {
      setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
    }, []);

    const getIconColor = () => {
      if (isDisabled) return colors.textTertiary;
      if (hasError) return colors.error;
      if (isValid) return colors.success;
      if (isFocused) return colors.primary;
      return colors.textTertiary;
    };

    const renderLeftIcon = () => {
      if (icon && iconPosition === 'left') {
        return (
          <Pressable onPress={onIconPress} disabled={!onIconPress || isDisabled} hitSlop={10}>
            <Ionicons name={icon} size={20} color={getIconColor()} />
          </Pressable>
        );
      }
      return null;
    };

    const renderRightIcon = () => {
      const icons = [];

      // Clear button
      if (clearable && value && !isDisabled && !secureTextEntry) {
        icons.push(
          <Pressable
            key="clear"
            onPress={handleClear}
            accessibilityRole="button"
            accessibilityLabel="Clear input"
            hitSlop={10}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={hasError ? colors.error : colors.textTertiary}
            />
          </Pressable>,
        );
      }

      // Secure text toggle
      if (secureTextEntry) {
        icons.push(
          <Pressable
            key="secure"
            onPress={toggleSecure}
            accessibilityRole="button"
            accessibilityLabel={secure ? 'Show password' : 'Hide password'}
            hitSlop={10}
          >
            <Ionicons
              name={secure ? 'eye-off' : 'eye'}
              size={20}
              color={isDisabled ? colors.textTertiary : colors.textSecondary}
            />
          </Pressable>,
        );
      }

      // Right icon
      if (icon && iconPosition === 'right') {
        icons.push(
          <Pressable
            key="icon"
            onPress={onIconPress}
            disabled={!onIconPress || isDisabled}
            hitSlop={10}
          >
            <Ionicons name={icon} size={20} color={getIconColor()} />
          </Pressable>,
        );
      }

      return icons.length > 0 ? (
        <View style={styles.rightIconContainer}>
          {icons.map((iconElement, index) => (
            <View key={index} style={styles.iconSpacing}>
              {iconElement}
            </View>
          ))}
        </View>
      ) : null;
    };

    return (
      <View style={styles.container}>
        {/* Label with required indicator */}
        {!!label && (
          <View style={styles.labelContainer}>
            <Text style={styles.label}>{label}</Text>
            {required && <Text style={styles.requiredStar}>*</Text>}
          </View>
        )}

        {/* Input Row */}
        <View style={styles.inputRow}>
          {renderLeftIcon()}

          <Input
            ref={ref}
            {...props}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secure}
            editable={!isDisabled}
            maxLength={maxLength}
            onFocus={handleFocus}
            onBlur={handleBlur}
            size={size}
            variant={variant}
            multiline={multiline}
            style={styles.input}
            placeholderTextColor={colors.placeholder}
          />

          {renderRightIcon()}
        </View>

        {/* Helper Text, Error, Success, and Character Count */}
        {(helperText || errorText || successText || (characterCount && maxLength)) && (
          <View style={styles.helperContainer}>
            {/* Helper/Error/Success Text */}
            <View style={{ flex: 1 }}>
              {hasError && errorText && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color={colors.error} />
                  <Text style={styles.errorText}>{errorText}</Text>
                </View>
              )}

              {!hasError && isValid && successText && (
                <View style={styles.successContainer}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <Text style={styles.successText}>{successText}</Text>
                </View>
              )}

              {!hasError && !isValid && helperText && (
                <Text style={styles.helperText}>{helperText}</Text>
              )}
            </View>

            {/* Character Counter */}
            {characterCount && maxLength && (
              <Text
                style={[
                  styles.counterText,
                  currentLength >= maxLength && { color: colors.error },
                  currentLength >= maxLength * 0.8 &&
                    currentLength < maxLength && { color: colors.warning },
                ]}
              >
                {currentLength}/{maxLength}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  },
);

FormField.displayName = 'FormField';

export default memo(FormField);
