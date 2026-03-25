import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const usePaymentCollectionStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      flex: 1,
    } as ViewStyle,

    scrollContent: {
      padding: 16,
      paddingBottom: 100,
      gap: 12,
    } as ViewStyle,

    // Order Header
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
    } as ViewStyle,

    customerName: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    } as TextStyle,

    orderRef: {
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 2,
    } as TextStyle,

    // Invoice Card
    invoiceCard: {
      borderRadius: 12,
    } as ViewStyle,

    invoiceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    } as ViewStyle,

    invoiceNumber: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    invoiceDate: {
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 2,
    } as TextStyle,

    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    } as ViewStyle,

    statusText: {
      fontSize: 11,
      fontWeight: '600',
    } as TextStyle,

    amountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    } as ViewStyle,

    amountLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    } as TextStyle,

    amountValue: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textPrimary,
    } as TextStyle,

    dueAmount: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.error,
    } as TextStyle,

    historyToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border + '20',
    } as ViewStyle,

    historyToggleText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.primary,
    } as TextStyle,

    historySection: {
      marginTop: 12,
      gap: 8,
    } as ViewStyle,

    historyItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '10',
    } as ViewStyle,

    historyDate: {
      fontSize: 12,
      color: colors.textSecondary,
    } as TextStyle,

    historyAmount: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textPrimary,
    } as TextStyle,

    historyStatus: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.success,
    } as TextStyle,

    // Payment Modes
    section: {
      gap: 12,
    } as ViewStyle,

    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    } as TextStyle,

    paymentModeCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    } as ViewStyle,

    paymentModeSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '5',
    } as ViewStyle,

    paymentModeLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    } as ViewStyle,

    paymentModeIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    paymentModeLabel: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.textPrimary,
    } as TextStyle,

    paymentModeRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    } as ViewStyle,

    // Amount Input
    amountInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
    } as ViewStyle,

    currencySymbol: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    amountInput: {
      flex: 1,
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
      paddingVertical: 14,
    } as TextStyle,

    fullAmountButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
    } as ViewStyle,

    fullAmountText: {
      fontSize: 12,
      fontWeight: '600',
    } as TextStyle,

    errorText: {
      fontSize: 11,
      marginTop: 4,
    } as TextStyle,

    // Remarks Input
    remarksInput: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      fontSize: 14,
      minHeight: 80,
      textAlignVertical: 'top',
    } as TextStyle,

    // Bottom Bar
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border + '20',
    } as ViewStyle,

    collectButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    collectButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    } as TextStyle,

    bottomSpacer: {
      height: 20,
    } as ViewStyle,
    // Add these to your PaymentCollection.styles.ts

    orderSummaryCard: {
      borderRadius: 12,
    } as ViewStyle,

    summaryTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 12,
      textTransform: 'uppercase',
    } as TextStyle,

    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    } as ViewStyle,

    summaryLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    } as TextStyle,

    summaryValue: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textPrimary,
    } as TextStyle,

    summaryDivider: {
      height: 1,
      backgroundColor: colors.border + '20',
      marginVertical: 8,
    } as ViewStyle,

    totalRow: {
      paddingTop: 8,
    } as ViewStyle,

    totalLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    totalValue: {
      fontSize: 18,
      fontWeight: '700',
    } as TextStyle,
    // Add these styles to your PaymentCollection.styles.ts

    // Credit Card Styles
    creditCard: {
      borderRadius: 12,
    } as ViewStyle,

    creditHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    } as ViewStyle,

    creditTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    } as ViewStyle,

    creditTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    creditStatsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    } as ViewStyle,

    creditStatItem: {
      flex: 1,
      alignItems: 'center',
    } as ViewStyle,

    creditStatLabel: {
      fontSize: 11,
      color: colors.textTertiary,
      marginBottom: 4,
    } as TextStyle,

    creditStatValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    } as TextStyle,

    creditProgressContainer: {
      marginBottom: 12,
    } as ViewStyle,

    creditProgressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    } as ViewStyle,

    creditProgressLabel: {
      fontSize: 11,
      color: colors.textTertiary,
    } as TextStyle,

    creditProgressPercent: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    } as TextStyle,

    creditProgressBar: {
      height: 4,
      backgroundColor: colors.border + '30',
      borderRadius: 2,
      overflow: 'hidden',
    } as ViewStyle,

    creditProgressFill: {
      height: '100%',
      borderRadius: 2,
    } as ViewStyle,

    paymentTermsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border + '20',
    } as ViewStyle,

    paymentTermsText: {
      fontSize: 11,
      color: colors.textTertiary,
    } as TextStyle,

    // Payment Mode Sub Label
    paymentModeSubLabel: {
      fontSize: 10,
      color: colors.textTertiary,
      marginTop: 2,
    } as TextStyle,

    // Warning and Info Boxes
    warningBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 10,
      borderRadius: 8,
      marginTop: 8,
    } as ViewStyle,

    warningText: {
      fontSize: 12,
      flex: 1,
    } as TextStyle,

    infoBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 10,
      borderRadius: 8,
      marginTop: 8,
    } as ViewStyle,

    infoText: {
      fontSize: 12,
      flex: 1,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
