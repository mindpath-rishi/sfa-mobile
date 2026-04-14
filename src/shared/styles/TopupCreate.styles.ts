// shared/styles/TopupCreate.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useCreateTopupStyles = () => {
  const { colors, spacing, fontSize } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    // Header
    pageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[12],
      paddingBottom: utils.spacing[4],
      borderBottomWidth: 1,
    } as ViewStyle,

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    pageTitle: {
      fontSize: utils.fontSize.xl,
      fontWeight: '700',
    } as TextStyle,

    clearButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    // Van Info
    vanInfoCard: {
      margin: utils.spacing[4],
      padding: utils.spacing[3],
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,

    vanInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[3],
    } as ViewStyle,

    vanName: {
      fontSize: utils.fontSize.md,
      fontWeight: '600',
    } as TextStyle,

    vanId: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    // Products Container
    productsContainer: {
      flex: 1,
    } as ViewStyle,

    // Cart Summary
    cartSummaryContainer: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } as ViewStyle,

    cartSummaryContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    } as ViewStyle,

    cartSummaryLabel: {
      fontSize: utils.fontSize.xs,
      marginBottom: utils.spacing[0.5],
    } as TextStyle,

    cartSummaryValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
    } as TextStyle,

    cartSummaryRight: {
      alignItems: 'flex-end',
      gap: utils.spacing[1],
    } as ViewStyle,

    cartTotalValue: {
      fontSize: utils.fontSize.md,
      fontWeight: '700',
    } as TextStyle,

    reviewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[2],
      borderRadius: 8,
      gap: utils.spacing[1],
    } as ViewStyle,

    reviewButtonText: {
      color: '#FFFFFF',
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
