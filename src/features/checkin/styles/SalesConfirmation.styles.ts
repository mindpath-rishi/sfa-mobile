import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useSalesConfirmationStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    // ─── Layout ──────────────────────────────────────────────────────────────
    container: {
      flex: 1,
    } as ViewStyle,

    scrollUltraCompact: {
      padding: 12,
      paddingBottom: 80,
      gap: 10,
    } as ViewStyle,

    // ─── Header Bar ──────────────────────────────────────────────────────────
    headerBarCompact: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
    } as ViewStyle,

    headerNameCompact: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.textPrimary,
    } as TextStyle,

    headerRefCompact: {
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 2,
    } as TextStyle,

    headerStatsCompact: {
      flexDirection: 'row',
      gap: 16,
    } as ViewStyle,

    headerStatCompact: {
      alignItems: 'center',
    } as ViewStyle,

    headerStatValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    } as TextStyle,

    headerStatLabel: {
      fontSize: 10,
      color: colors.textTertiary,
      marginTop: 2,
    } as TextStyle,

    // ─── Credit Widget ────────────────────────────────────────────────────────
    creditWidgetCompact: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
    } as ViewStyle,

    creditWidgetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    } as ViewStyle,

    creditWidgetTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    creditWidgetBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 14,
    } as ViewStyle,

    creditWidgetBadgeText: {
      fontSize: 11,
      fontWeight: '600',
    } as TextStyle,

    creditWidgetStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    } as ViewStyle,

    creditWidgetStat: {
      alignItems: 'center',
    } as ViewStyle,

    creditWidgetStatValue: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    } as TextStyle,

    creditWidgetStatLabel: {
      fontSize: 10,
      color: colors.textTertiary,
      marginTop: 2,
    } as TextStyle,

    creditWidgetBar: {
      height: 4,
      backgroundColor: colors.border + '30',
      borderRadius: 2,
      overflow: 'hidden',
    } as ViewStyle,

    creditWidgetFill: {
      height: '100%',
      borderRadius: 2,
    } as ViewStyle,

    creditWarningCompact: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 8,
    } as ViewStyle,

    creditWarningTextCompact: {
      fontSize: 11,
      flex: 1,
    } as TextStyle,

    // ─── Total Bar ───────────────────────────────────────────────────────────
    totalBarCompact: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
    } as ViewStyle,

    totalBarLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textSecondary,
    } as TextStyle,

    totalBarValue: {
      fontSize: 18,
      fontWeight: '700',
    } as TextStyle,

    // ─── Payment Pills ────────────────────────────────────────────────────────
    paymentPillsCompact: {
      flexDirection: 'row',
      gap: 10,
    } as ViewStyle,

    paymentPill: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 10,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    } as ViewStyle,

    paymentPillActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    } as ViewStyle,

    paymentPillText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
    } as TextStyle,

    // ─── Items Header ─────────────────────────────────────────────────────────
    itemsHeaderUltraCompact: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginTop: 8,
      marginBottom: 8,
    } as ViewStyle,

    itemsHeaderTitleUltraCompact: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
    } as TextStyle,

    itemsHeaderHintUltraCompact: {
      fontSize: 10,
      color: colors.textTertiary,
    } as TextStyle,

    // ─── Item Row ─────────────────────────────────────────────────────────────
    itemRowCompact: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 6,
    } as ViewStyle,

    itemRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    } as ViewStyle,

    itemIndexCompact: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    itemIndexTextCompact: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
    } as TextStyle,

    itemNameCompact: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 2,
    } as TextStyle,

    itemSkuCompact: {
      fontSize: 11,
      color: colors.textTertiary,
    } as TextStyle,

    itemRowRight: {
      alignItems: 'flex-end',
      gap: 4,
    } as ViewStyle,

    itemTotalCompact: {
      fontSize: 14,
      fontWeight: '700',
    } as TextStyle,

    // ─── Expanded Item ────────────────────────────────────────────────────────
    itemExpandedCompact: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border + '20',
    } as ViewStyle,

    quantityRowCompact: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
      gap: 12,
    } as ViewStyle,

    quantityTypeCompact: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
    } as ViewStyle,

    quantityLabelCompact: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    } as TextStyle,

    priceRowCompact: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 10,
      marginTop: 4,
      borderTopWidth: 1,
      borderTopColor: colors.border + '20',
    } as ViewStyle,

    priceUnitCompact: {
      fontSize: 11,
      color: colors.textTertiary,
    } as TextStyle,

    priceTotalCompact: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    // ─── Empty State ──────────────────────────────────────────────────────────
    emptyStateCompact: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 32,
    } as ViewStyle,

    emptyStateText: {
      fontSize: 13,
      color: colors.textTertiary,
    } as TextStyle,

    // ─── Bottom Bar ───────────────────────────────────────────────────────────
    bottomBarUltraCompact: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 12,
      paddingTop: 10,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border + '20',
    } as ViewStyle,

    confirmBtnUltraCompact: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      gap: 10,
    } as ViewStyle,

    confirmBtnTextUltraCompact: {
      color: 'white',
      fontSize: 15,
      fontWeight: '600',
    } as TextStyle,

    confirmBadgeUltraCompact: {
      backgroundColor: 'rgba(255,255,255,0.25)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 16,
    } as ViewStyle,

    confirmBadgeTextUltraCompact: {
      color: 'white',
      fontSize: 11,
      fontWeight: '700',
    } as TextStyle,

    // ─── Modal ────────────────────────────────────────────────────────────────
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    } as ViewStyle,

    modalUltraCompact: {
      width: '85%',
      maxWidth: 320,
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
    } as ViewStyle,

    modalIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    } as ViewStyle,

    modalTitleUltraCompact: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
      marginTop: 12,
      marginBottom: 6,
    } as TextStyle,

    modalRefUltraCompact: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 20,
    } as TextStyle,

    modalDetailsCompact: {
      width: '100%',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border + '20',
      overflow: 'hidden',
      marginBottom: 20,
    } as ViewStyle,

    modalDetailRowCompact: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '20',
    } as ViewStyle,

    modalDetailLabelCompact: {
      fontSize: 13,
      color: colors.textTertiary,
    } as TextStyle,

    modalDetailValueCompact: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    modalActionsUltraCompact: {
      flexDirection: 'row',
      gap: 10,
      width: '100%',
    } as ViewStyle,

    modalActionUltraCompact: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 10,
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
