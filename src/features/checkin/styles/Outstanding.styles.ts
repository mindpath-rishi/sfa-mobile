import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useCustomerOutstandingStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    // ─── Layout ──────────────────────────────────────────────────────────────

    container: {
      flex: 1,
    } as ViewStyle,

    scrollContent: {
      padding: utils.spacing[4],
      paddingBottom: utils.spacing[20],
      gap: utils.spacing[3],
    } as ViewStyle,

    // ─── Header ──────────────────────────────────────────────────────────────

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: utils.spacing[4],
      paddingBottom: utils.spacing[3],
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '20',
    } as ViewStyle,

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
    } as ViewStyle,

    headerCenter: {
      flex: 1,
      alignItems: 'center',
      gap: 1,
    } as ViewStyle,

    headerTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('600'),
      color: colors.textPrimary,
    } as TextStyle,

    headerSubtitle: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    headerRight: {
      width: 40,
    } as ViewStyle,

    // ─── Security banner ─────────────────────────────────────────────────────

    securityBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: utils.spacing[2],
      padding: utils.spacing[3],
      borderRadius: utils.borderRadius.md,
      borderWidth: 1,
    } as ViewStyle,

    securityText: {
      flex: 1,
      fontSize: utils.fontSize.sm,
      lineHeight: 18,
    } as TextStyle,

    // ─── Balance card ─────────────────────────────────────────────────────────

    balanceCard: {
      borderRadius: utils.borderRadius.lg,
    } as ViewStyle,

    balanceMain: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    balanceLabel: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: utils.spacing[1],
    } as TextStyle,

    balanceValue: {
      fontSize: utils.fontSize.xl,
      fontWeight: utils.getFontWeight('700'),
      letterSpacing: -0.5,
    } as TextStyle,

    exhaustedBadge: {
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
      borderRadius: 20,
    } as ViewStyle,

    exhaustedBadgeText: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('600'),
    } as TextStyle,

    // ─── Credit row ───────────────────────────────────────────────────────────

    creditRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: utils.spacing[3],
      borderTopWidth: 1,
    } as ViewStyle,

    creditItem: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
    } as ViewStyle,

    creditItemLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
    } as TextStyle,

    creditItemValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('600'),
      color: colors.textPrimary,
    } as TextStyle,

    creditDivider: {
      width: 1,
      height: 28,
      marginHorizontal: utils.spacing[2],
    } as ViewStyle,

    // ─── Invoices section ─────────────────────────────────────────────────────

    invoicesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingHorizontal: utils.spacing[1],
    } as ViewStyle,

    invoicesTitle: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('600'),
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    } as TextStyle,

    invoicesSubtitle: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
      marginTop: 1,
    } as TextStyle,

    clearSelection: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('500'),
    } as TextStyle,

    // ─── Invoice card ─────────────────────────────────────────────────────────

    invoiceCard: {
      backgroundColor: colors.background,
      borderRadius: utils.borderRadius.lg,
      padding: utils.spacing[4],
      borderWidth: 1,
      borderColor: colors.border + '30',
      gap: utils.spacing[3],
    } as ViewStyle,

    invoiceTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    } as ViewStyle,

    invoiceMeta: {
      gap: 3,
      flex: 1,
      marginRight: utils.spacing[3],
    } as ViewStyle,

    invoiceDate: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('600'),
      color: colors.textPrimary,
    } as TextStyle,

    invoiceNo: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
      fontFamily: 'monospace',
    } as TextStyle,

    invoiceAmountCol: {
      alignItems: 'flex-end',
      gap: 2,
    } as ViewStyle,

    invoiceAmount: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('700'),
    } as TextStyle,

    invoiceAmountLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
    } as TextStyle,

    // ─── Transaction panel ────────────────────────────────────────────────────

    transactionPanel: {
      borderRadius: utils.borderRadius.md,
      padding: utils.spacing[3],
      gap: utils.spacing[2],
    } as ViewStyle,

    transactionPanelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as ViewStyle,

    transactionPanelLabel: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('500'),
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    } as TextStyle,

    transactionDate: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('500'),
      color: colors.textPrimary,
    } as TextStyle,

    notCollectedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: utils.spacing[2],
      paddingVertical: 3,
      borderRadius: 20,
    } as ViewStyle,

    notCollectedBadgeText: {
      fontSize: 11,
      fontWeight: utils.getFontWeight('600'),
    } as TextStyle,

    transactionDetails: {
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,

    transactionDetailItem: {
      flex: 1,
      gap: 2,
    } as ViewStyle,

    transactionDetailDivider: {
      width: 1,
      height: 24,
      marginHorizontal: utils.spacing[2],
    } as ViewStyle,

    transactionDetailLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
    } as TextStyle,

    transactionDetailValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('600'),
      color: colors.textPrimary,
    } as TextStyle,

    // ─── No transaction panel ─────────────────────────────────────────────────

    noTransactionPanel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
      padding: utils.spacing[3],
      borderRadius: utils.borderRadius.md,
    } as ViewStyle,

    noTransactionText: {
      fontSize: utils.fontSize.sm,
      color: colors.textTertiary,
    } as TextStyle,

    // ─── Invoice footer ───────────────────────────────────────────────────────

    invoiceFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
    } as ViewStyle,

    selectIndicator: {
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    selectLabel: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('500'),
    } as TextStyle,

    // ─── Bottom bar ───────────────────────────────────────────────────────────

    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[3],
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border + '20',
      gap: utils.spacing[2],
    } as ViewStyle,

    selectionSummary: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[1],
    } as ViewStyle,

    selectionSummaryLabel: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
    } as TextStyle,

    selectionSummaryAmount: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('700'),
    } as TextStyle,

    proceedButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[4],
      borderRadius: utils.borderRadius.lg,
      gap: utils.spacing[2],
    } as ViewStyle,

    proceedButtonText: {
      color: 'white',
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('600'),
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
