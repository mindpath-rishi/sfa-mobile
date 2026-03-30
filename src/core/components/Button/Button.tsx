// src/core/components/Button/Button.tsx
import React, { useMemo, useCallback } from 'react';
import {
  View,
  Pressable,
  ActivityIndicator,
  Text,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { ButtonProps } from './Button.types';
import { useTheme } from '@/shared/hooks/useTheme';
import { createButtonStyles } from './Button.styles';

/**
 * Button component with theming, icons, and loading state support
 *
 * @example
 * ```tsx
 * // Primary button with icon
 * <Button
 *   title="Click Me"
 *   leftIcon={<Icon name="heart" />}
 *   onPress={() => {}}
 * />
 *
 * // Success button with right icon
 * <Button
 *   title="Save"
 *   variant="success"
 *   rightIcon={<Icon name="check" />}
 *   onPress={() => {}}
 * />
 *
 * // Full width button with loading state
 * <Button
 *   title="Submit"
 *   fullWidth
 *   loading={isLoading}
 *   onPress={() => {}}
 * />
 * ```
 */
const Button: React.FC<ButtonProps> = ({
  title = '',
  loading = false,
  disabled = false,
  onPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = true,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  testID = 'button',
  accessibilityLabel,
  accessibilityHint,
  hapticFeedback = false,
  animation = true,
  iconOnly = false,
}) => {
  const { colors } = useTheme();
  const styles = createButtonStyles(colors);
  const isDisabled = disabled || loading;

  // Get button colors based on variant and state
  const getButtonColors = useCallback(() => {
    if (isDisabled) {
      return {
        background: colors.disabled || colors.border + '50',
        text: colors.textTertiary,
        border: colors.border + '30',
      };
    }

    switch (variant) {
      case 'primary':
        return {
          background: colors.primary,
          text: colors.primaryContrast || colors.textInverse,
          border: colors.primary,
        };
      case 'secondary':
        return {
          background: colors.secondary || colors.textSecondary,
          text: colors.secondaryContrast || colors.textInverse,
          border: colors.secondary || colors.textSecondary,
        };
      case 'success':
        return {
          background: colors.success,
          text: colors.textInverse,
          border: colors.success,
        };
      case 'warning':
        return {
          background: colors.warning,
          text: colors.textInverse,
          border: colors.warning,
        };
      case 'error':
        return {
          background: colors.error,
          text: colors.textInverse,
          border: colors.error,
        };
      case 'info':
        return {
          background: colors.info,
          text: colors.textInverse,
          border: colors.info,
        };
      case 'outline':
        return {
          background: 'transparent',
          text: colors.primary,
          border: colors.primary,
        };
      case 'ghost':
        return {
          background: 'transparent',
          text: colors.textPrimary,
          border: 'transparent',
        };
      default:
        return {
          background: colors.primary,
          text: colors.primaryContrast || colors.textInverse,
          border: colors.primary,
        };
    }
  }, [variant, isDisabled, colors]);

  // Get size styles
  const getSizeStyles = useCallback(() => {
    const sizeMap = {
      small: {
        container: styles.smallButton,
        text: styles.smallText,
        iconSize: 16,
        padding: { paddingVertical: 8, paddingHorizontal: 12 },
      },
      medium: {
        container: styles.mediumButton,
        text: styles.mediumText,
        iconSize: 18,
        padding: { paddingVertical: 12, paddingHorizontal: 16 },
      },
      large: {
        container: styles.largeButton,
        text: styles.largeText,
        iconSize: 22,
        padding: { paddingVertical: 16, paddingHorizontal: 24 },
      },
    };
    return sizeMap[size];
  }, [size, styles]);

  // Get icon color
  const getIconColor = useCallback((): string => {
    if (isDisabled) return colors.textTertiary;
    if (variant === 'outline') return colors.primary;
    if (variant === 'ghost') return colors.textPrimary;
    return colors.textInverse;
  }, [variant, isDisabled, colors]);

  // Memoized styles
  const containerStyle = useMemo<ViewStyle[]>(() => {
    const sizeStyles = getSizeStyles();
    return [
      styles.container,
      sizeStyles.container,
      fullWidth ? styles.fullWidth : styles.autoWidth,
      !isDisabled && animation && styles.pressable,
      style,
    ].filter(Boolean) as ViewStyle[];
  }, [styles, getSizeStyles, fullWidth, isDisabled, animation, style]);

  const buttonStyle = useMemo<ViewStyle>(() => {
    const buttonColors = getButtonColors();
    return {
      backgroundColor: buttonColors.background,
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor: buttonColors.border,
    };
  }, [getButtonColors, variant]);

  const textColorStyle = useMemo<TextStyle>(() => {
    const buttonColors = getButtonColors();
    return { color: buttonColors.text };
  }, [getButtonColors]);

  // Handle press with haptic feedback
  const handlePress = useCallback(() => {
    if (!isDisabled && onPress) {
      if (hapticFeedback && Platform.OS !== 'web') {
        // You can implement haptic feedback here
        // import { Haptics } from 'expo-haptics';
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress();
    }
  }, [isDisabled, onPress, hapticFeedback]);

  // Render icon
  const renderIcon = useCallback(
    (icon: React.ReactNode, position: 'left' | 'right') => {
      if (!icon) return null;

      const { iconSize } = getSizeStyles();
      const iconColor = getIconColor();

      if (React.isValidElement(icon)) {
        return React.cloneElement(icon, {
          size: iconSize,
          color: iconColor,
          style: [
            styles.icon,
            position === 'left' ? styles.leftIcon : styles.rightIcon,
            // @ts-ignore - icon.props.style might exist
            icon.props.style,
          ],
        } as any);
      }

      return (
        <View style={[styles.icon, position === 'left' ? styles.leftIcon : styles.rightIcon]}>
          {icon}
        </View>
      );
    },
    [getSizeStyles, getIconColor, styles],
  );

  // Loading state
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.loaderContainer,
          getSizeStyles().container,
          fullWidth ? styles.fullWidth : styles.autoWidth,
          style,
        ]}
        testID={testID ? `${testID}-loading` : 'button-loading'}
        accessibilityLabel={`${title} loading`}
      >
        <ActivityIndicator
          color={getButtonColors().text}
          size={size === 'small' ? 'small' : 'large'}
        />
      </View>
    );
  }

  // Icon-only button
  if (iconOnly && (leftIcon || rightIcon) && !title) {
    const icon = leftIcon || rightIcon;
    const { iconSize } = getSizeStyles();
    const iconColor = getIconColor();

    return (
      <Pressable
        testID={testID}
        onPress={handlePress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.iconOnlyContainer,
          {
            width: iconSize * 2,
            height: iconSize * 2,
            borderRadius: iconSize,
          },
          buttonStyle,
          pressed && animation && styles.pressed,
          isDisabled && styles.disabled,
          style,
        ]}
        accessibilityLabel={accessibilityLabel || title || 'Button'}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
      >
        {React.isValidElement(icon)
          ? React.cloneElement(icon, {
              size: iconSize,
              color: iconColor,
            } as any)
          : icon}
      </Pressable>
    );
  }

  // Main button render
  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        containerStyle,
        buttonStyle,
        pressed && animation && styles.pressed,
        isDisabled && styles.disabled,
      ]}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {({ pressed }) => (
        <View style={[styles.buttonContent]}>
          {renderIcon(leftIcon, 'left')}

          {title ? (
            <Text
              style={[
                getSizeStyles().text,
                textColorStyle,
                textStyle,
                pressed && animation && styles.textPressed,
                leftIcon || rightIcon ? styles.textWithIcon : undefined,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
          ) : null}

          {renderIcon(rightIcon, 'right')}
        </View>
      )}
    </Pressable>
  );
};

export default Button;
