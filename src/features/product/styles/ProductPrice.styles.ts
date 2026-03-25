import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useProductPriceStyles = () => {
  const { colors } = useTheme();
  const styleGenerator = createStyles((utils) => ({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,

    price: {
      color: colors.primary,
      fontWeight: utils.getFontWeight('bold'),
    } as TextStyle,

    smallPrice: {
      fontSize: utils.fontSize.sm,
    } as TextStyle,

    mediumPrice: {
      fontSize: utils.fontSize.md,
    } as TextStyle,

    largePrice: {
      fontSize: utils.fontSize.lg,
    } as TextStyle,

    mrp: {
      color: colors.textTertiary,
      textDecorationLine: 'line-through',
      marginLeft: utils.spacing[1],
    } as TextStyle,

    smallMrp: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    mediumMrp: {
      fontSize: utils.fontSize.sm,
    } as TextStyle,

    largeMrp: {
      fontSize: utils.fontSize.md,
    } as TextStyle,

    discount: {
      fontSize: utils.fontSize.xs,
      marginLeft: utils.spacing[1],
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
