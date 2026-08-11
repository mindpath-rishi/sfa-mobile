// Cleaned up styles - removed unused styles
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
      backgroundColor: colors.primary + '18',
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

    paymentModeSubLabel: {
      fontSize: 10,
      color: colors.textTertiary,
      marginTop: 2,
    } as TextStyle,

    paymentModeRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    } as ViewStyle,

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

    remarksInput: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      fontSize: 14,
      minHeight: 80,
      textAlignVertical: 'top',
    } as TextStyle,

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
      color: colors.primaryContrast,
      fontSize: 16,
      fontWeight: '600',
    } as TextStyle,

    bottomSpacer: {
      height: 20,
    } as ViewStyle,

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

    weightTotalRow: {
      marginBottom: 0,
    } as ViewStyle,

    // Add these styles to your existing styles object
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },

    modalContent: {
      flex: 1,
      padding: 0,
    } as ViewStyle,

    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    modalLabel: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 8,
    },
    modalAmountInput: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 8,
    },
    modalCurrency: {
      fontSize: 18,
      fontWeight: '600',
      marginRight: 8,
    },
    modalInput: {
      flex: 1,
      fontSize: 18,
      paddingVertical: 12,
    },
    modalAmountDisplay: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    modalDisplayText: {
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
    },
    modalError: {
      fontSize: 12,
      marginBottom: 8,
    },
    modalPaymentOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: 8,
      gap: 12,
    },
    modalPaymentOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '18',
    },
    modalPaymentText: {
      flex: 1,
      fontSize: 16,
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      gap: 12,
    },
    modalCancelButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
    },
    modalCancelText: {
      fontSize: 16,
      fontWeight: '500',
    },
    modalConfirmButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    modalConfirmText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.primaryContrast,
    },
    // Add these styles to your existing styles object
    modalDivider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: 16,
    },
    paymentMethodContainer: {
      marginBottom: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    paymentMethodHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    paymentMethodTitle: {
      fontSize: 14,
      fontWeight: '500',
    },
    paymentMethodRow: {
      flexDirection: 'row',
      gap: 12,
    },
    paymentMethodSelector: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      gap: 8,
      backgroundColor: colors.card,
    },
    paymentMethodMode: {
      flex: 1,
      fontSize: 14,
    },
    paymentAmountInput: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      backgroundColor: colors.card,
    },
    paymentAmountField: {
      flex: 1,
      fontSize: 14,
      paddingVertical: 10,
    },
    addPaymentButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      borderStyle: 'dashed',
      gap: 8,
      marginBottom: 16,
    },
    addPaymentText: {
      fontSize: 14,
      fontWeight: '500',
    },
    splitSummary: {
      marginTop: 16,
      padding: 12,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 8,
    },
    splitSummaryTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    splitSummaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    splitSummaryLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    splitSummaryValue: {
      fontSize: 12,
      fontWeight: '500',
    },
    splitSummaryDivider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: 8,
    },
    splitSummaryTotal: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    creditToggleContainer: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    creditToggle: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      gap: 8,
      backgroundColor: colors.card,
    },
    creditToggleActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '18',
    },
    creditToggleText: {
      fontSize: 14,
      fontWeight: '500',
    },
    // Add these styles to your existing styles object
    remainingAmountContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      padding: 12,
      backgroundColor: colors.infoLight,
      borderRadius: 8,
    },
    remainingAmount: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    // Add these styles to your existing styles object
    modePickerContainer: {
      width: '85%',
      maxHeight: '70%',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignSelf: 'center',
    },
    modePickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    modePickerTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    modePickerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderRadius: 8,
      marginBottom: 8,
      gap: 12,
    },
    modePickerItemText: {
      flex: 1,
      fontSize: 16,
    },
  }));

  return styleGenerator(colors);
};
