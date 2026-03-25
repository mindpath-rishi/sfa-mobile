import React, { forwardRef } from "react";
import {
  View,
  TextInput,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Pressable,
} from "react-native";
import { useTheme } from "@/shared/hooks/useTheme";

interface AppInputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: React.ReactNode;

  rightIcon?: React.ReactNode;
  onPressRightIcon?: () => void;

  error?: boolean;
  focused?: boolean;
}

export const AppInput = forwardRef<TextInput, AppInputProps>(
  (
    {
      containerStyle,
      inputStyle,
      leftIcon,
      rightIcon,
      onPressRightIcon,
      error,
      focused,
      ...props
    },
    ref
  ) => {
    const { colors } = useTheme();

    return (
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingHorizontal: 14,
            borderWidth: 1.5,
            borderColor: error
              ? colors.error
              : focused
              ? colors.primary
              : colors.border,
            height: 52,
          },
          containerStyle,
        ]}
      >
        {leftIcon ? (
          <View style={{ marginRight: 10, opacity: 0.8 }}>{leftIcon}</View>
        ) : null}

        <TextInput
          ref={ref}
          style={[
            {
              flex: 1,
              fontSize: 16,
              color: colors.textPrimary,
              paddingVertical: 0,
            },
            inputStyle,
          ]}
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.primary}
          autoCorrect={false}
          spellCheck={false}
          {...props}
        />

        {rightIcon ? (
          <Pressable
            onPress={onPressRightIcon}
            disabled={!onPressRightIcon}
            style={{ marginLeft: 8, padding: 6 }}
          >
            {rightIcon}
          </Pressable>
        ) : null}
      </View>
    );
  }
);

AppInput.displayName = "AppInput";
