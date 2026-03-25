import React, { forwardRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  Pressable,
  ViewStyle,
  TextStyle,
  Platform,
  I18nManager,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/shared/hooks/useTheme";
import { useFormFieldStyles } from "@/shared/styles/FormField.style";

export type FormFieldVariant = "default" | "filled" | "outlined";
export type FormFieldSize = "small" | "medium" | "large";

export interface FormFieldProps extends Omit<TextInputProps, "style"> {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (value: string) => void;

  variant?: FormFieldVariant;
  size?: FormFieldSize;
  fullWidth?: boolean;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;

  icon?: React.ComponentProps<typeof Feather>["name"];
  iconPosition?: "left" | "right";
  iconColor?: string;

  error?: string;
  helperText?: string;
  success?: boolean;
  warning?: string;

  isPassword?: boolean;
  showPasswordToggle?: boolean;

  renderLeft?: () => React.ReactNode;
  renderRight?: () => React.ReactNode;

  required?: boolean;
  disabled?: boolean;
}

export const FormField = forwardRef<TextInput, FormFieldProps>(
  (
    {
      label,
      placeholder,
      value,
      onChangeText,

      variant = "default",
      size = "medium",
      fullWidth = true,
      containerStyle,
      labelStyle,
      inputStyle,

      icon,
      iconPosition = "left",
      iconColor,

      error,
      helperText,
      success,
      warning,

      isPassword = false,
      showPasswordToggle = true,

      renderLeft,
      renderRight,

      required = false,
      disabled = false,

      onFocus,
      onBlur,
      ...textInputProps
    },
    ref
  ) => {
    const { colors } = useTheme();
    const styles = useFormFieldStyles(colors);

    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isRTL = I18nManager.isRTL;

    const handleFocus = (e: any) => {
      if (disabled) return;
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleTogglePassword = () => {
      setShowPassword((p) => !p);
    };

    const getInputWrapperStyle = () => {
      const styleArray: ViewStyle[] = [styles.inputWrapper];

      const sizeKey =
        `size${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles;
      if (styles[sizeKey]) styleArray.push(styles[sizeKey] as ViewStyle);

      if (variant !== "default") {
        const variantKey =
          `variant${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles;
        if (styles[variantKey]) styleArray.push(styles[variantKey] as ViewStyle);
      }

      if (error && styles.inputWrapperError) styleArray.push(styles.inputWrapperError as ViewStyle);
      if (success && styles.inputWrapperSuccess) styleArray.push(styles.inputWrapperSuccess as ViewStyle);
      if (warning && styles.inputWrapperWarning) styleArray.push(styles.inputWrapperWarning as ViewStyle);
      if (disabled && styles.inputWrapperDisabled) styleArray.push(styles.inputWrapperDisabled as ViewStyle);

      return styleArray;
    };

    const getInputStyle = () => {
      const styleArray: TextStyle[] = [styles.inputField];

      if (size === "small" && styles.inputSmall) styleArray.push(styles.inputSmall as TextStyle);
      if (size === "large" && styles.inputLarge) styleArray.push(styles.inputLarge as TextStyle);

      return styleArray;
    };

    const getIconColor = () => {
      if (iconColor) return iconColor;
      if (error) return colors.error;
      if (success) return colors.success;
      if (warning) return colors.warning;
      if (isFocused) return colors.primary;
      return colors.textTertiary;
    };

    const getHelperTextStyle = () => {
      if (error) return styles.errorText;
      if (warning) return styles.warningText;
      if (success) return styles.successText;
      return styles.helperText;
    };

    // ✅ Force direction for typing + placeholder
    const finalTextAlign =
      (textInputProps.textAlign as any) ?? (isRTL ? "right" : "left");

    const finalWritingDirection =
      (textInputProps as any)?.writingDirection ?? (isRTL ? "rtl" : "ltr");

    return (
      <View style={[styles.container, fullWidth && styles.containerFullWidth, containerStyle]}>
        {/* Label */}
        {label && (
          <View style={styles.labelContainer}>
            <Text style={[styles.label, error && styles.labelError, labelStyle]}>
              {label}
              {required && <Text style={styles.requiredIndicator}> *</Text>}
            </Text>

            {error && !helperText && <Text style={[styles.label, styles.labelError]}>{error}</Text>}
          </View>
        )}

        {/* Input Wrapper */}
        <View style={getInputWrapperStyle()}>
          {iconPosition === "left" && icon && (
            <View style={[styles.iconContainer, styles.iconLeft]}>
              <Feather
                name={icon}
                size={size === "small" ? 16 : size === "large" ? 24 : 20}
                color={getIconColor()}
              />
            </View>
          )}

          {renderLeft?.()}

          <TextInput
            ref={ref}
            value={value}
            placeholder={placeholder}
            placeholderTextColor={colors.placeholder}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={isPassword && !showPassword}
            editable={!disabled}
            selectTextOnFocus={!disabled}
            selectionColor={colors.primary}
            underlineColorAndroid="transparent"

            // ✅ IMPORTANT: These 2 lines fix typing + placeholder direction
            textAlign={finalTextAlign}
            style={[
              ...getInputStyle(),
              inputStyle,
              { writingDirection: finalWritingDirection },

              ...(Platform.OS === "web"
                ? ([{ outlineStyle: "none" }] as unknown as TextStyle[])
                : []),
            ]}
            {...textInputProps}
          />

          {renderRight?.()}

          {isPassword && showPasswordToggle && (
            <Pressable style={styles.actionButton} onPress={handleTogglePassword} disabled={disabled} hitSlop={10}>
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={size === "small" ? 16 : size === "large" ? 24 : 20}
                color={getIconColor()}
              />
            </Pressable>
          )}

          {iconPosition === "right" && icon && !isPassword && (
            <View style={[styles.iconContainer, styles.iconRight]}>
              <Feather
                name={icon}
                size={size === "small" ? 16 : size === "large" ? 24 : 20}
                color={getIconColor()}
              />
            </View>
          )}
        </View>

        {(helperText || error || warning) && (
          <View style={styles.helperContainer}>
            <Text style={getHelperTextStyle() as TextStyle}>{error || warning || helperText}</Text>
          </View>
        )}
      </View>
    );
  }
);

FormField.displayName = "AppFormField";
