// src/core/components/Rating/Rating.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { RatingSize } from './Rating.types';

export const useRatingStyles = (
  size: RatingSize,
  color?: string,
  emptyColor?: string,
  style?: ViewStyle,
) => {
  const { colors } = useTheme();

  // Get size values
  const getSize = (): { icon: number; labelFontSize: number } => {
    switch (size) {
      case 'sm':
        return { icon: 16, labelFontSize: 12 };
      case 'md':
        return { icon: 24, labelFontSize: 14 };
      case 'lg':
        return { icon: 32, labelFontSize: 16 };
      default:
        return { icon: 24, labelFontSize: 14 };
    }
  };

  const sizeValues = getSize();

  return {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      ...style,
    } as ViewStyle,
    starsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    } as ViewStyle,
    star: {
      marginHorizontal: 1,
    } as ViewStyle,
    label: {
      fontSize: sizeValues.labelFontSize,
      color: colors.textSecondary,
      marginLeft: 4,
    } as TextStyle,
    filledStar: {
      color: color || colors.warning,
    },
    emptyStar: {
      color: emptyColor || colors.border,
    },
  };
};
