import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useProductGridCardStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      width: '48%',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    card: {
      padding: utils.spacing[2.5],
    } as ViewStyle,

    content: {
      marginTop: utils.spacing[1.5],
    } as ViewStyle,

    productName: {
      color: colors.textPrimary,
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    productBrand: {
      color: colors.textSecondary,
      fontSize: utils.fontSize.xs,
      marginTop: 1,
    } as TextStyle,

    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: utils.spacing[1],
      marginBottom: utils.spacing[1.5],
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
