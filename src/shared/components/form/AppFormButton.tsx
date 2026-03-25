import React from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/shared/hooks/useTheme";
import { useFormButtonStyles } from "@/shared/styles/FormButton.style";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
export type ButtonSize = "small" | "medium" | "large";
export type ButtonIconPosition = "left" | "right";

export interface FormButtonProps extends Omit<TouchableOpacityProps, "style"> {
  // Core props
  title?: string;
  onPress?: () => void;

  // Styling
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  rounded?: boolean;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;

  // States
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  success?: boolean;

  // Icon
  icon?: React.ComponentProps<typeof Feather>["name"];
  iconPosition?: ButtonIconPosition;
  iconSize?: number;
  iconColor?: string;

  // Custom content
  children?: React.ReactNode;
}

export const FormButton: React.FC<FormButtonProps> = ({
  // Core props
  title,
  onPress,

  // Styling
  variant = "primary",
  size = "medium",
  fullWidth = true,
  rounded = false,
  containerStyle,
  textStyle,

  // States
  loading = false,
  loadingText = "Loading...",
  disabled = false,
  success = false,

  // Icon
  icon,
  iconPosition = "left",
  iconSize,
  iconColor,

  // Custom content
  children,

  // Touchable props
  ...touchableProps
}) => {
  const { colors } = useTheme();
  const styles = useFormButtonStyles(colors);

  const handlePress = () => {
    if (loading || disabled) return;
    onPress?.();
  };

  const getButtonStyle = (): ViewStyle[] => {
    const styleArray: ViewStyle[] = [styles.button];

    // Size
    const sizeKey =
      `size${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles;
    if (styles[sizeKey]) {
      styleArray.push(styles[sizeKey] as ViewStyle);
    }

    // Variant
    const variantKey =
      `variant${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles;
    if (styles[variantKey]) {
      styleArray.push(styles[variantKey] as ViewStyle);
    }

    // States
    if (success && styles.success) {
      styleArray.push(styles.success as ViewStyle);
    }

    if (disabled) {
      if (styles.disabled) {
        styleArray.push(styles.disabled as ViewStyle);
      }
      if (variant === "outline" && styles.disabledOutline) {
        styleArray.push(styles.disabledOutline as ViewStyle);
      }
      if (variant === "ghost" && styles.disabledGhost) {
        styleArray.push(styles.disabledGhost as ViewStyle);
      }
    }

    // Full width
    if (fullWidth && styles.fullWidth) {
      styleArray.push(styles.fullWidth as ViewStyle);
    }

    // Rounded
    if (rounded && styles.rounded) {
      styleArray.push(styles.rounded as ViewStyle);
    }

    return styleArray;
  };

  const getTextStyle = (): TextStyle[] => {
    const styleArray: TextStyle[] = [styles.buttonText];

    // Size
    if (size === "small" && styles.textSmall) {
      styleArray.push(styles.textSmall as TextStyle);
    }
    if (size === "large" && styles.textLarge) {
      styleArray.push(styles.textLarge as TextStyle);
    }

    // Variant
    const textVariantKey =
      `text${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles;
    if (styles[textVariantKey]) {
      styleArray.push(styles[textVariantKey] as TextStyle);
    }

    // States
    if (disabled && styles.textDisabled) {
      styleArray.push(styles.textDisabled as TextStyle);
    }
    if (success && styles.textSuccess) {
      styleArray.push(styles.textSuccess as TextStyle);
    }

    return styleArray;
  };

  const getIconColor = () => {
    if (iconColor) return iconColor;
    if (disabled) return colors.textTertiary; // Fallback for textDisabled
    if (success) return colors.textInverse;

    switch (variant) {
      case "primary":
      case "secondary":
      case "danger":
        return colors.textInverse;
      case "outline":
        return colors.primary;
      case "ghost":
        return colors.textPrimary;
      default:
        return colors.textInverse;
    }
  };

  const getIconSize = () => {
    if (iconSize) return iconSize;
    if (size === "small") return 16;
    if (size === "large") return 24;
    return 20;
  };

  const renderContent = () => {
    if (children) return children;

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={getIconColor()} />
          <Text style={[...getTextStyle(), styles.loadingText as TextStyle]}>
            {loadingText}
          </Text>
        </View>
      );
    }

    return (
      <>
        {icon && iconPosition === "left" && (
          <View style={[styles.iconContainer, styles.iconLeft]}>
            <Feather name={icon} size={getIconSize()} color={getIconColor()} />
          </View>
        )}

        {title && <Text style={[...getTextStyle(), textStyle]}>{title}</Text>}

        {icon && iconPosition === "right" && (
          <View style={[styles.iconContainer, styles.iconRight]}>
            <Feather name={icon} size={getIconSize()} color={getIconColor()} />
          </View>
        )}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), containerStyle]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...touchableProps}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};
