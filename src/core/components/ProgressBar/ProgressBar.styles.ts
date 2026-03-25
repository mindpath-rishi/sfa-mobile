import { ViewStyle } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { ProgressBarVariant, ProgressBarSize } from './ProgressBar.types';

export const useProgressBarStyles = (
  variant: ProgressBarVariant,
  size: ProgressBarSize,
  progress: number,
  style?: ViewStyle,
) => {
  const { colors } = useTheme();

  // Get variant color
  const getVariantColor = (): string => {
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
      default:
        return colors.primary;
    }
  };

  // Get size values
  const getSize = (): { height: number; labelFontSize: number } => {
    switch (size) {
      case 'sm':
        return { height: 4, labelFontSize: 10 };
      case 'md':
        return { height: 8, labelFontSize: 12 };
      case 'lg':
        return { height: 12, labelFontSize: 14 };
      default:
        return { height: 8, labelFontSize: 12 };
    }
  };

  const variantColor = getVariantColor();
  const sizeValues = getSize();

  return {
    container: {
      width: '100%',
      ...style,
    } as ViewStyle,
    track: {
      height: sizeValues.height,
      backgroundColor: colors.border,
      borderRadius: sizeValues.height / 2,
      overflow: 'hidden',
    } as ViewStyle,
    fill: {
      height: '100%',
      width: `${Math.min(100, Math.max(0, progress))}%`,
      backgroundColor: variantColor,
      borderRadius: sizeValues.height / 2,
    } as ViewStyle,
    labelContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: size === 'sm' ? 2 : 4,
    } as ViewStyle,
    label: {
      color: colors.textSecondary,
      fontSize: sizeValues.labelFontSize,
    } as ViewStyle,
    percentage: {
      color: variantColor,
      fontSize: sizeValues.labelFontSize,
      fontWeight: '600',
    } as ViewStyle,
  };
};
