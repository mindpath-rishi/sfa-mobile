import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useProductUnitSelectorStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      borderWidth: 1,
      borderRadius: utils.borderRadius.md,
      // padding: utils.spacing[2],
      // backgroundColor: colors.surface,
    } as ViewStyle,

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    labelContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1.5],
    } as ViewStyle,

    label: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('medium'),
      minWidth: 45,
    } as TextStyle,

    price: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    discountBadge: {
      paddingHorizontal: utils.spacing[1],
      paddingVertical: 2,
      borderRadius: utils.borderRadius.xs,
    } as ViewStyle,

    discountText: {
      color: 'white',
      fontSize: 8,
      fontWeight: utils.getFontWeight('bold'),
    } as TextStyle,

    quantityControl: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
    } as ViewStyle,

    quantityButton: {
      width: 28,
      height: 28,
      borderWidth: 1,
      borderRadius: utils.borderRadius.sm,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    quantityInput: {
      width: 45,
      height: 28,
      borderWidth: 1,
      borderRadius: utils.borderRadius.sm,
      textAlign: 'center',
      fontSize: utils.fontSize.sm,
      padding: 0,
    } as ViewStyle,

    footer: {
      // marginTop: utils.spacing[1.5],
      // paddingTop: utils.spacing[1.5],
      borderTopWidth: 1,
      borderTopColor: colors.border + '40',
    } as ViewStyle,

    stockInfo: {
      fontSize: utils.fontSize.xs,
      marginBottom: utils.spacing[1],
    } as TextStyle,

    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    totalLabel: {
      fontSize: utils.fontSize.sm,
    } as TextStyle,

    totalValue: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
    } as TextStyle,

    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[2],
      paddingHorizontal: utils.spacing[3],
      borderRadius: utils.borderRadius.md,
      gap: utils.spacing[1.5],
    } as ViewStyle,

    addButtonText: {
      color: 'white',
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
