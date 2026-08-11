import React, { forwardRef } from 'react';
import { TextInput } from 'react-native';
import { CoreInputProps } from './Input.types';
import { useTheme } from '@/shared/hooks/useTheme';
import { useInputStyles } from './Input.styles';

const Input = forwardRef<TextInput, CoreInputProps>(
  (
    {
      style,
      error,
      size = 'medium',
      variant = 'outlined',
      multiline = false,
      editable = true,
      placeholderTextColor,
      ...props
    },
    ref,
  ) => {
    const { colors, mode } = useTheme();

    // This now returns the actual styles object directly
    const styles = useInputStyles({
      size,
      variant,
      error,
      multiline,
      disabled: !editable,
    });

    return (
      <TextInput
        ref={ref}
        {...props}
        style={[styles.input, multiline && styles.inputMultiline, style]}
        placeholderTextColor={placeholderTextColor ?? colors.textSecondary}
        selectionColor={colors.primary}
        keyboardAppearance={mode === 'dark' ? 'dark' : 'light'}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        editable={editable}
      />
    );
  },
);

Input.displayName = 'Input';

export default Input;
