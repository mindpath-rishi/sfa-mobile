// src/core/components/Button/Button.tsx
import React from 'react';
import { View, Button as RNButton, ActivityIndicator } from 'react-native';
import { ButtonProps } from './Button.types';
import { useTheme } from '@/shared/hooks/useTheme';
import { createButtonStyles } from './Button.styles';

/**
 * Button component wrapper around React Native's Button with app theming and icon support
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
  testID = 'button',
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { colors } = useTheme();
  const styles = createButtonStyles(colors);
  const isDisabled = disabled || loading;

  // Get button color based on variant
  const getButtonColor = (): string => {
    if (isDisabled) return colors.border;

    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.textSecondary;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      case 'info':
        return colors.info;
      case 'outline':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  // Get text color for outline variant
  const getOutlineTextColor = (): string => {
    if (isDisabled) return colors.border;
    return colors.primary;
  };

  // Get icon color based on variant
  const getIconColor = (): string => {
    if (isDisabled) return colors.textTertiary;

    switch (variant) {
      case 'outline':
        return colors.primary;
      case 'secondary':
        return colors.textSecondary;
      default:
        return colors.textInverse;
    }
  };

  // Get size style
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  // Clone icon with color and size
  const renderIcon = (icon: React.ReactNode, position: 'left' | 'right') => {
    if (!icon) return null;

    const iconSize = size === 'small' ? 16 : size === 'large' ? 22 : 18;

    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, {
        size: iconSize,
        color: getIconColor(),
        style: [
          styles.iconWrapper,
          position === 'left' ? styles.leftIconWrapper : styles.rightIconWrapper,
          // @ts-ignore - icon.props.style might exist
          icon.props.style,
        ],
      } as any);
    }

    return (
      <View
        style={[
          styles.iconWrapper,
          position === 'left' ? styles.leftIconWrapper : styles.rightIconWrapper,
        ]}
      >
        {icon}
      </View>
    );
  };

  // Loading state - FIXED: removed duplicate ActivityIndicator
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.loaderContainer,
          getSizeStyle(),
          fullWidth ? styles.fullWidth : styles.autoWidth,
          style,
        ]}
        testID={testID ? `${testID}-loading` : 'button-loading'}
      >
        <ActivityIndicator
          color={variant === 'outline' ? colors.primary : colors.textInverse}
          size={size === 'small' ? 'small' : 'large'}
        />
      </View>
    );
  }

  // For outline variant, we need to wrap RNButton to add border
  if (variant === 'outline') {
    return (
      <View
        style={[
          styles.container,
          fullWidth ? styles.fullWidth : styles.autoWidth,
          isDisabled && styles.disabled,
          style,
        ]}
        testID={testID}
      >
        <View
          style={[
            styles.buttonWrapper,
            getSizeStyle(),
            {
              borderWidth: 1,
              borderColor: isDisabled ? colors.border : colors.primary,
              backgroundColor: 'transparent',
            },
          ]}
        >
          {renderIcon(leftIcon, 'left')}
          <View style={{ flex: 1, paddingHorizontal: 40 }}>
            <RNButton
              title={title}
              onPress={onPress}
              color={getOutlineTextColor()}
              disabled={isDisabled}
              accessibilityLabel={accessibilityLabel || title}
              // accessibilityHint={accessibilityHint}
              testID={testID ? `${testID}-button` : 'button-button'}
            />
          </View>
          {renderIcon(rightIcon, 'right')}
        </View>
      </View>
    );
  }

  // For regular variants
  return (
    <View
      style={[
        styles.container,
        fullWidth ? styles.fullWidth : styles.autoWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      testID={testID}
    >
      <View style={[styles.buttonWrapper, getSizeStyle()]}>
        {renderIcon(leftIcon, 'left')}
        <View style={{ flex: 1, paddingHorizontal: leftIcon || rightIcon ? 40 : 0 }}>
          <RNButton
            title={title}
            onPress={onPress}
            color={getButtonColor()}
            disabled={isDisabled}
            accessibilityLabel={accessibilityLabel || title}
            // accessibilityHint={accessibilityHint}
            testID={testID ? `${testID}-button` : 'button-button'}
          />
        </View>
        {renderIcon(rightIcon, 'right')}
      </View>
    </View>
  );
};

export default Button;
