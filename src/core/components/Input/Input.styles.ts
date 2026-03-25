import { createStyles, StyleUtils } from '@/shared/theme/styles';
import { ViewStyle, TextStyle, Platform } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export interface InputStyleProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled' | 'underlined' | 'ghost';
  error?: boolean;
  success?: boolean;
  disabled?: boolean;
  focused?: boolean;
  multiline?: boolean;
}

// Create a custom hook that uses useTheme internally
export const useInputStyles = (props: InputStyleProps = {}) => {
  const { colors } = useTheme();

  // Get the style generator
  const styleGenerator = createStyles((utils: StyleUtils) => {
    const {
      size = 'medium',
      variant = 'outlined',
      error = false,
      success = false,
      disabled = false,
      focused = false,
      multiline = false,
    } = props;

    // Base input styles
    const baseInput: TextStyle = {
      flex: 1,
      color: disabled ? colors.textTertiary : colors.textPrimary,
      fontSize: utils.fontSize.base,
      textAlign: utils.textAlign(),
      writingDirection: utils.writingDirection(),
      paddingVertical: Platform.select({
        ios: utils.spacing[3],
        android: multiline ? utils.spacing[2] : 0,
      }),
    };

    // Size variants
    const sizeStyles = {
      small: {
        fontSize: utils.fontSize.sm,
        paddingVertical: utils.spacing[1.5],
      },
      medium: {
        fontSize: utils.fontSize.base,
        paddingVertical: utils.spacing[2],
      },
      large: {
        fontSize: utils.fontSize.lg,
        paddingVertical: utils.spacing[3],
      },
    };

    // Container styles
    const container: ViewStyle = {
      flexDirection: utils.rowDirection(),
      alignItems: 'center',
      borderWidth: variant === 'underlined' ? 0 : 1,
      borderBottomWidth: variant === 'underlined' ? 1 : undefined,
      borderRadius: variant === 'underlined' || variant === 'ghost' ? 0 : utils.borderRadius.md,
      paddingHorizontal: variant === 'underlined' || variant === 'ghost' ? 0 : utils.spacing[3],
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
      minHeight: getMinHeight(),
    };

    function getBackgroundColor(): string {
      if (disabled) return colors.divider;
      if (variant === 'filled') return colors.surface + '20';
      if (variant === 'ghost') return 'transparent';
      return colors.background;
    }

    function getBorderColor(): string {
      if (error) return colors.error;
      if (success) return colors.success;
      if (focused) return colors.primary;
      if (disabled) return colors.border;
      return colors.border;
    }

    function getMinHeight(): number {
      switch (size) {
        case 'small':
          return utils.spacing[10];
        case 'large':
          return utils.spacing[14];
        default:
          return utils.spacing[12];
      }
    }

    return {
      container,
      input: {
        ...baseInput,
        ...sizeStyles[size],
      },
      inputMultiline: {
        minHeight: utils.spacing[20],
        textAlignVertical: 'top',
        paddingTop: utils.spacing[2],
      } as TextStyle,
    };
  });

  // Call the generator with colors to get the actual styles
  return styleGenerator(colors);
};
