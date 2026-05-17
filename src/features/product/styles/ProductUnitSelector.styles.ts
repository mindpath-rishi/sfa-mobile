// ProductUnitSelector.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useProductUnitSelectorStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      marginBottom: utils.spacing[1.5],
    } as ViewStyle,

    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: utils.spacing[1.5],
    } as ViewStyle,

    headerLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1.5],
    } as ViewStyle,

    productName: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      flex: 1,
    } as TextStyle,

    lowStockBadge: {
      paddingHorizontal: utils.spacing[1],
      paddingVertical: utils.spacing[0.25],
      borderRadius: utils.borderRadius.xs,
    } as ViewStyle,

    lowStockText: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('bold'),
    } as TextStyle,

    actionIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
    } as ViewStyle,

    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[0.5],
    } as ViewStyle,

    actionText: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,

    quantityRow: {
      flexDirection: 'row',
      gap: utils.spacing[2],
      marginBottom: utils.spacing[1.5],
    } as ViewStyle,

    section: {
      flex: 1,
      borderRadius: utils.borderRadius.sm,
      padding: utils.spacing[1.5],
    } as ViewStyle,

    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: utils.spacing[1.5],
    } as ViewStyle,

    sectionTitle: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    sectionPrice: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('bold'),
    } as TextStyle,

    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    } as ViewStyle,

    quantityButton: {
      width: utils.spacing[6],
      height: utils.spacing[6],
      borderRadius: utils.borderRadius.sm,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    quantityInput: {
      width: 45,
      textAlign: 'center',
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('bold'),
      paddingVertical: utils.spacing[1],
      borderRadius: utils.borderRadius.sm,
      borderWidth: 1,
    } as ViewStyle,

    stockInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: utils.spacing[1.5],
      borderTopWidth: 1,
    } as ViewStyle,

    stockInfoLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
    } as ViewStyle,

    stockInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[0.5],
    } as ViewStyle,

    stockInfoText: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    stockInfoDetail: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    allStockText: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    totalValueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
    } as ViewStyle,

    totalLabel: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    totalValue: {
      fontWeight: utils.getFontWeight('bold'),
      fontSize: utils.fontSize.sm,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
