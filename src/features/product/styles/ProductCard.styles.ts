import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useProductCardStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      marginBottom: utils.spacing[1.5],
    } as ViewStyle,

    card: {
      borderRadius: utils.borderRadius.md,
    } as ViewStyle,

    contentRow: {
      flexDirection: 'row',
      gap: utils.spacing[2],
    } as ViewStyle,

    detailsContainer: {
      flex: 1,
      gap: utils.spacing[1],
    } as ViewStyle,

    // Header Section
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: utils.spacing[1.5],
    } as ViewStyle,

    titleContainer: {
      flex: 1,
    } as ViewStyle,

    productName: {
      fontSize: 13, // Small, consistent size
      fontWeight: '500',
      color: colors.textPrimary,
      marginBottom: 2,
      lineHeight: 18,
    } as TextStyle,

    productBrand: {
      fontSize: 11, // Even smaller for secondary info
      fontWeight: '400',
      color: colors.textSecondary,
      lineHeight: 15,
    } as TextStyle,

    productCategory: {
      fontSize: 10,
      fontWeight: '500',
      color: colors.textTertiary,
      lineHeight: 14,
      marginTop: 1,
    } as TextStyle,

    // Info Row
    infoRow: {
      flexDirection: 'row',
      gap: utils.spacing[3],
    } as ViewStyle,

    skuText: {
      fontSize: 10,
      color: colors.textTertiary,
    } as TextStyle,

    unitText: {
      fontSize: 10,
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
      fontSize: 11,
      fontWeight: '500',
      color: colors.textSecondary,
    } as TextStyle,

    // Scheme
    schemeContainer: {
      marginTop: 0,
      alignSelf: 'flex-start',
      paddingHorizontal: utils.spacing[1],
      paddingVertical: utils.spacing[0.5],
      borderRadius: utils.borderRadius.xs,
      backgroundColor: colors.success + '12',
      borderWidth: 0.5,
      borderColor: colors.success + '35',
    } as ViewStyle,

    schemeText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.success,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
