import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useProductCardStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      marginBottom: utils.spacing[1],
    } as ViewStyle,

    card: {
      borderRadius: utils.borderRadius.lg,
    } as ViewStyle,

    contentRow: {
      flexDirection: 'row',
      gap: utils.spacing[3],
    } as ViewStyle,

    detailsContainer: {
      flex: 1,
      gap: utils.spacing[1.5],
    } as ViewStyle,

    // Header Section
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: utils.spacing[2],
    } as ViewStyle,

    titleContainer: {
      flex: 1,
    } as ViewStyle,

    productName: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('600'),
      color: colors.textPrimary,
      marginBottom: 2,
    } as TextStyle,

    productMeta: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
    } as TextStyle,

    // Info Row
    infoRow: {
      flexDirection: 'row',
      gap: utils.spacing[3],
    } as ViewStyle,

    skuText: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
    } as TextStyle,

    unitText: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
    } as TextStyle,

    // Price Row
    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 2,
    } as ViewStyle,

    stockText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('500'),
      color: colors.textSecondary,
    } as TextStyle,

    // Scheme
    schemeContainer: {
      marginTop: 2,
    } as ViewStyle,

    schemeText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('500'),
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
