import { ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { ChipVariant, ChipSize } from './Chip.types';

export const useChipStyles = (
  variant: ChipVariant,
  size: ChipSize,
  outline: boolean,
  disabled?: boolean,
  pressed?: boolean,
  style?: ViewStyle,
) => {
  const { colors } = useTheme();

  // Get variant colors
  const getVariantColors = () => {
    const colorMap = {
      primary: { main: colors.primary, light: colors.primary + '20' },
      secondary: { main: colors.textSecondary, light: colors.textSecondary + '20' },
      success: { main: colors.success, light: colors.successLight },
      warning: { main: colors.warning, light: colors.warningLight },
      error: { main: colors.error, light: colors.errorLight },
      info: { main: colors.info, light: colors.infoLight },
    };

    return colorMap[variant] || colorMap.primary;
  };

  // Get size styles
  const getSizeStyles = (): { height: number; fontSize: number; iconSize: number } => {
    switch (size) {
      case 'sm':
        return { height: 24, fontSize: 12, iconSize: 14 };
      case 'md':
        return { height: 32, fontSize: 14, iconSize: 16 };
      case 'lg':
        return { height: 40, fontSize: 16, iconSize: 18 };
      default:
        return { height: 32, fontSize: 14, iconSize: 16 };
    }
  };

  const variantColors = getVariantColors();
  const sizeStyles = getSizeStyles();

  return {
    chip: {
      height: sizeStyles.height,
      backgroundColor: outline ? 'transparent' : disabled ? colors.border : variantColors.main,
      borderWidth: 1,
      borderColor: disabled ? colors.border : outline ? variantColors.main : 'transparent',
      borderRadius: sizeStyles.height / 2,
      paddingHorizontal: sizeStyles.height / 2,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      opacity: disabled ? 0.5 : 1,
      ...(pressed &&
        !disabled && {
          transform: [{ scale: 0.98 }],
        }),
      ...style,
    } as ViewStyle,
    label: {
      color: outline ? variantColors.main : disabled ? colors.textTertiary : colors.textInverse,
      fontSize: sizeStyles.fontSize,
      fontWeight: '500',
      marginRight: 4,
    } as TextStyle,
    closeIcon: {
      marginLeft: 4,
    } as ViewStyle,
  };
};
