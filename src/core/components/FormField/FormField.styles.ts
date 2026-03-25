import { createStyles, StyleUtils } from '@/shared/theme/styles';
import { ViewStyle, TextStyle, Platform } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export interface FormFieldStyleProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled' | 'underlined' | 'ghost';
  error?: boolean;
  success?: boolean;
  disabled?: boolean;
  focused?: boolean;
}

// Create a custom hook that uses useTheme internally
export const useFormFieldStyles = (props: FormFieldStyleProps = {}) => {
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
    } = props;

    // Get border color based on state
    const getBorderColor = (): string => {
      if (error) return colors.error;
      if (success) return colors.success;
      if (focused) return colors.primary;
      if (disabled) return colors.border;
      return colors.border;
    };

    // Get background color based on state and variant
    const getBackgroundColor = (): string => {
      if (disabled) return colors.divider;
      if (variant === 'filled') return colors.surface + '20';
      if (variant === 'ghost') return 'transparent';
      return colors.background;
    };

    // Get min height based on size
    const getMinHeight = (): number => {
      switch (size) {
        case 'small':
          return utils.spacing[10];
        case 'large':
          return utils.spacing[14];
        default:
          return utils.spacing[12];
      }
    };

    // Label size based on input size
    const getLabelSize = (): TextStyle => {
      switch (size) {
        case 'small':
          return { fontSize: utils.fontSize.xs };
        case 'large':
          return { fontSize: utils.fontSize.base };
        default:
          return { fontSize: utils.fontSize.sm };
      }
    };

    return {
      container: {
        gap: utils.spacing[2],
        marginBottom: utils.spacing[4],
      } as ViewStyle,

      labelContainer: {
        flexDirection: utils.rowDirection(),
        alignItems: 'center',
        gap: utils.spacing[1],
      } as ViewStyle,

      label: {
        color: colors.textSecondary,
        fontWeight: utils.getFontWeight('medium'),
        textAlign: utils.textAlign(),
        ...getLabelSize(),
      } as TextStyle,

      requiredStar: {
        color: colors.error,
        fontSize: utils.fontSize.sm,
        fontWeight: utils.getFontWeight('bold'),
      } as TextStyle,

      inputRow: {
        flexDirection: utils.rowDirection(),
        alignItems: 'center',
        borderWidth: variant === 'underlined' ? 0 : 1,
        borderBottomWidth: variant === 'underlined' ? 1 : undefined,
        borderColor: getBorderColor(),
        borderRadius: variant === 'underlined' || variant === 'ghost' ? 0 : utils.borderRadius.md,
        paddingHorizontal: variant === 'underlined' || variant === 'ghost' ? 0 : utils.spacing[3],
        gap: utils.spacing[2],
        backgroundColor: getBackgroundColor(),
        minHeight: getMinHeight(),
      } as ViewStyle,

      input: {
        flex: 1,
        borderWidth: 0,
        color: disabled ? colors.textTertiary : colors.textPrimary,
        fontSize: utils.fontSize.base,
        textAlign: utils.textAlign(),
        writingDirection: utils.writingDirection(),
        paddingVertical: Platform.select({
          ios: utils.spacing[3],
          android: 0,
        }),
      } as TextStyle,

      rightIconContainer: {
        flexDirection: utils.rowDirection(),
        alignItems: 'center',
        gap: utils.spacing[2],
      } as ViewStyle,

      iconSpacing: {
        marginLeft: utils.spacing[1],
      } as ViewStyle,

      helperContainer: {
        flexDirection: utils.rowDirection(),
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: utils.spacing[1],
        marginTop: utils.spacing[1],
      } as ViewStyle,

      helperText: {
        color: colors.textTertiary,
        fontSize: utils.fontSize.xs,
        textAlign: utils.textAlign(),
      } as TextStyle,

      errorContainer: {
        flexDirection: utils.rowDirection(),
        alignItems: 'center',
        gap: utils.spacing[1],
      } as ViewStyle,

      errorText: {
        color: colors.error,
        fontSize: utils.fontSize.xs,
        fontWeight: utils.getFontWeight('medium'),
        textAlign: utils.textAlign(),
      } as TextStyle,

      successContainer: {
        flexDirection: utils.rowDirection(),
        alignItems: 'center',
        gap: utils.spacing[1],
      } as ViewStyle,

      successText: {
        color: colors.success,
        fontSize: utils.fontSize.xs,
        textAlign: utils.textAlign(),
      } as TextStyle,

      counterText: {
        color: colors.textTertiary,
        fontSize: utils.fontSize.xs,
        textAlign: utils.textAlign(),
      } as TextStyle,
    };
  });

  // Call the generator with colors to get the actual styles
  return styleGenerator(colors);
};
