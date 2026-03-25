import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useOrderBookingStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '30',
    } as ViewStyle,

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    headerTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('600'),
      color: colors.textPrimary,
    } as TextStyle,

    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    // Book Sale Section
    bookSaleSection: {
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[4],
      paddingBottom: utils.spacing[3],
    } as ViewStyle,

    bookSaleTitle: {
      fontSize: utils.fontSize.xl,
      fontWeight: utils.getFontWeight('700'),
      color: colors.textPrimary,
    } as TextStyle,

    // Categories
    categoriesContainer: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '30',
      paddingBottom: utils.spacing[3],
    } as ViewStyle,

    categoriesList: {
      paddingHorizontal: utils.spacing[4],
      gap: utils.spacing[3],
    } as ViewStyle,

    categoryItem: {
      paddingVertical: utils.spacing[2],
      paddingHorizontal: utils.spacing[3],
      borderRadius: 8,
      backgroundColor: colors.surface,
      minWidth: 100,
    } as ViewStyle,

    categoryItemActive: {
      backgroundColor: colors.primary,
    } as ViewStyle,

    categoryCode: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('600'),
      color: colors.textPrimary,
      marginBottom: 2,
    } as TextStyle,

    categoryCodeActive: {
      color: 'white',
    } as TextStyle,

    categoryLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      marginBottom: 4,
    } as TextStyle,

    categoryLabelActive: {
      color: 'white',
      opacity: 0.9,
    } as TextStyle,

    categoryCountContainer: {
      backgroundColor: colors.border + '30',
      paddingHorizontal: utils.spacing[1.5],
      paddingVertical: 2,
      borderRadius: 4,
      alignSelf: 'flex-start',
    } as ViewStyle,

    categoryCount: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    // Order List
    orderList: {
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[3],
      paddingBottom: utils.spacing[20],
    } as ViewStyle,

    orderItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: utils.spacing[4],
      marginBottom: utils.spacing[3],
      borderWidth: 1,
      borderColor: colors.border + '20',
    } as ViewStyle,

    productHeader: {
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    productName: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('600'),
      color: colors.textPrimary,
      marginBottom: 2,
    } as TextStyle,

    productSku: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
    } as TextStyle,

    stockContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    stockText: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      marginLeft: utils.spacing[1],
    } as TextStyle,

    discountBadge: {
      backgroundColor: colors.success + '15',
      paddingHorizontal: utils.spacing[2],
      paddingVertical: 4,
      borderRadius: 4,
      alignSelf: 'flex-start',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    discountText: {
      fontSize: utils.fontSize.sm,
      color: colors.success,
      fontWeight: utils.getFontWeight('500'),
    } as TextStyle,

    quantityContainer: {
      gap: utils.spacing[2],
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    quantityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    } as ViewStyle,

    quantityLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1.5],
      flex: 1,
    } as ViewStyle,

    quantityLabel: {
      fontSize: utils.fontSize.md,
      color: colors.textPrimary,
      fontWeight: utils.getFontWeight('500'),
    } as TextStyle,

    quantityInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1.5],
    } as ViewStyle,

    quantityButton: {
      width: 36,
      height: 36,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    quantityInput: {
      width: 50,
      height: 36,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      textAlign: 'center',
      fontSize: utils.fontSize.md,
      color: colors.textPrimary,
      padding: 0,
    } as ViewStyle,

    pricingContainer: {
      borderTopWidth: 1,
      borderTopColor: colors.border + '20',
      paddingTop: utils.spacing[3],
      gap: utils.spacing[1.5],
    } as ViewStyle,

    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as ViewStyle,

    priceLabel: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
    } as TextStyle,

    priceValue: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('600'),
      color: colors.textPrimary,
    } as TextStyle,

    itemTotalContainer: {
      marginTop: utils.spacing[2],
      paddingTop: utils.spacing[2],
      borderTopWidth: 1,
      borderTopColor: colors.border + '20',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as ViewStyle,

    itemTotalLabel: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('500'),
      color: colors.textSecondary,
    } as TextStyle,

    itemTotalValue: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('700'),
      color: colors.primary,
    } as TextStyle,

    // Checkout Bar
    checkoutBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border + '30',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 8,
    } as ViewStyle,

    totalContainer: {
      flex: 1,
    } as ViewStyle,

    totalLabel: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: 2,
    } as TextStyle,

    totalAmount: {
      fontSize: utils.fontSize.xl,
      fontWeight: utils.getFontWeight('700'),
      color: colors.primary,
    } as TextStyle,

    confirmButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: utils.spacing[5],
      paddingVertical: utils.spacing[3],
      borderRadius: 30,
    } as ViewStyle,

    confirmButtonText: {
      color: 'white',
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('600'),
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
