import { ViewStyle, ImageStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useProductImageStyles = () => {
  const { colors } = useTheme();
  const styleGenerator = createStyles((utils) => ({
    container: {
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.md,
      overflow: 'hidden',
      position: 'relative',
    } as ViewStyle,

    small: {
      width: 56,
      height: 56,
    } as ViewStyle,

    medium: {
      width: 70,
      height: 70,
    } as ViewStyle,

    large: {
      width: 100,
      height: 100,
    } as ViewStyle,

    image: {
      width: '100%',
      height: '100%',
    } as ImageStyle,

    placeholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    discountBadge: {
      position: 'absolute',
      top: 2,
      left: 2,
      paddingHorizontal: 4,
      paddingVertical: 1,
      borderRadius: 4,
    } as ViewStyle,

    discountText: {
      color: 'white',
      fontSize: 8,
      fontWeight: utils.getFontWeight('bold'),
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
