// styles/OutletDetail.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useOutletDetailStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    // ── Container ────────────────────────────────────────────────────────────
    container: {
      flex: 1,
      backgroundColor: colors.background,
      flexDirection: 'column',
    } as ViewStyle,

    mainScrollView: {
      flex: 1,
    } as ViewStyle,

    mainScrollContent: {
      flexGrow: 1,
      paddingBottom: 24,
    } as ViewStyle,

    // ── Empty / loading shared ────────────────────────────────────────────────
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[8],
    } as ViewStyle,

    emptyTabContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      gap: 10,
    } as ViewStyle,

    emptyTabTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    emptyTabText: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
    } as TextStyle,

    emptyStateTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: utils.spacing[2],
    } as TextStyle,

    emptyStateText: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: utils.spacing[3],
    } as TextStyle,

    emptyStateButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: utils.spacing[6],
      paddingVertical: utils.spacing[2.5],
      borderRadius: utils.borderRadius.md,
    } as ViewStyle,

    emptyStateButtonText: {
      color: colors.primaryContrast,
      fontSize: 13,
      fontWeight: '600',
    } as TextStyle,

    // ── Tab bar ───────────────────────────────────────────────────────────────
    // (used by LoadingState skeleton only — live tab bar is inline)
    tabBar: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    } as ViewStyle,

    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      gap: 5,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    } as ViewStyle,

    tabActive: {
      borderBottomColor: colors.primary,
    } as ViewStyle,

    tabText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
    } as TextStyle,

    tabTextActive: {
      fontWeight: '700',
      color: colors.primary,
    } as TextStyle,

    // ── Tab content ───────────────────────────────────────────────────────────
    tabContentContainer: {
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[3],
      paddingBottom: utils.spacing[6],
    } as ViewStyle,

    // ── Summary: stat cards ───────────────────────────────────────────────────
    summaryContainer: {
      gap: 12,
    } as ViewStyle,

    salesSectionCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,

    // Unified stat card (replaces statCard + statCardSmall)
    statCard: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      gap: 7,
    } as ViewStyle,

    statValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
    } as TextStyle,

    statLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      textAlign: 'center',
      fontWeight: '400',
    } as TextStyle,

    statSubLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      textAlign: 'center',
    } as TextStyle,

    statsGrid: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 14,
    } as ViewStyle,

    statsGridSmall: {
      flexDirection: 'row',
      gap: 10,
    } as ViewStyle,

    statsDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 14,
    } as ViewStyle,

    statsSubtitle: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 10,
    } as TextStyle,

    // ── Insights card ─────────────────────────────────────────────────────────
    insightsCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,

    insightsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    } as ViewStyle,

    insightsTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    insightItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      paddingVertical: 5,
    } as ViewStyle,

    insightDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginTop: 6,
    } as ViewStyle,

    insightText: {
      flex: 1,
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    } as TextStyle,

    // ── Sales table ───────────────────────────────────────────────────────────
    salesTableContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,

    salesTableHeader: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    } as ViewStyle,

    salesTableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    } as ViewStyle,

    salesTableCell: {
      width: 70,
      paddingVertical: 12,
      paddingHorizontal: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderRightWidth: 1,
      borderRightColor: colors.border,
    } as ViewStyle,

    salesTableCellCategory: {
      width: 120,
      alignItems: 'flex-start',
      backgroundColor: colors.background,
    } as ViewStyle,

    salesTableCellTotal: {
      width: 80,
      backgroundColor: colors.background,
      borderRightWidth: 0,
    } as ViewStyle,

    salesTableHeaderText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 0.4,
      textAlign: 'center',
    } as TextStyle,

    salesTableCategoryText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textPrimary,
    } as TextStyle,

    salesTableUnitText: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
    } as TextStyle,

    salesTableCellValue: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
    } as TextStyle,

    salesTableCellValueHighlight: {
      color: colors.success,
      fontWeight: '700',
    } as TextStyle,

    salesTableCellTotalValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
    } as TextStyle,

    // ── Invoice cards ─────────────────────────────────────────────────────────
    invoiceCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    } as ViewStyle,

    invoiceTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    } as ViewStyle,

    invoiceMeta: {
      flex: 1,
      minWidth: 0,
    } as ViewStyle,

    invoiceDate: {
      fontSize: 11,
      color: colors.textSecondary,
    } as TextStyle,

    invoiceNumber: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textPrimary,
      marginTop: 3,
    } as TextStyle,

    invoiceAmountCol: {
      alignItems: 'flex-end',
      flexShrink: 0,
    } as ViewStyle,

    invoiceAmount: {
      fontSize: 16,
      fontWeight: '700',
    } as TextStyle,

    invoiceAmountLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
    } as TextStyle,

    invoiceDetailGrid: {
      flexDirection: 'row',
      gap: 7,
      marginTop: 12,
    } as ViewStyle,

    invoiceDetailItem: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 10,
    } as ViewStyle,

    invoiceDetailLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      marginBottom: 3,
    } as TextStyle,

    invoiceDetailValue: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textPrimary,
    } as TextStyle,

    invoiceFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginTop: 10,
    } as ViewStyle,

    invoiceStatusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    } as ViewStyle,

    invoiceStatusText: {
      fontSize: 10,
      fontWeight: '700',
    } as TextStyle,

    invoicePendingText: {
      fontSize: 11,
      color: colors.warning,
    } as TextStyle,

    // ── Visit cards ───────────────────────────────────────────────────────────
    visitCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      borderLeftWidth: 3,
    } as ViewStyle,

    visitCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    } as ViewStyle,

    visitDate: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textPrimary,
      flex: 1,
    } as TextStyle,

    visitDurationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    } as ViewStyle,

    visitDuration: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: '500',
    } as TextStyle,

    visitNote: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    } as ViewStyle,

    visitNoteText: {
      fontSize: 11,
      color: colors.textSecondary,
      flex: 1,
      lineHeight: 17,
    } as TextStyle,

    // ── Visit timeline (bottom sheet) ─────────────────────────────────────────
    visitTimelineList: {
      paddingTop: 4,
    } as ViewStyle,

    visitTimelineItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    } as ViewStyle,

    visitTimelineMarkerWrap: {
      alignItems: 'center',
      width: 32,
    } as ViewStyle,

    visitTimelineMarker: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    visitTimelineLine: {
      width: 1,
      flex: 1,
      minHeight: 24,
      backgroundColor: colors.border,
      marginTop: 4,
    } as ViewStyle,

    visitTimelineContent: {
      flex: 1,
      minWidth: 0,
      paddingBottom: 16,
    } as ViewStyle,

    visitTimelineTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    } as ViewStyle,

    visitTimelineTitle: {
      flex: 1,
      fontSize: 13,
      fontWeight: '700',
      color: colors.textPrimary,
    } as TextStyle,

    visitTimelineTime: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    } as TextStyle,

    visitTimelineSubtitle: {
      marginTop: 3,
      fontSize: 12,
      lineHeight: 17,
      color: colors.textSecondary,
    } as TextStyle,

    // ── List header ───────────────────────────────────────────────────────────
    listHeader: {
      marginBottom: 14,
    } as ViewStyle,

    listHeaderTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    listHeaderSubtitle: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    } as TextStyle,

    // ── Footer button ─────────────────────────────────────────────────────────
    footerSafeArea: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    } as ViewStyle,

    fullWidthButtonContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    } as ViewStyle,

    fullWidthButton: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 15,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 7,
    } as ViewStyle,

    fullWidthButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    } as ViewStyle,

    fullWidthButtonTextContainer: {
      flex: 1,
      marginLeft: 12,
    } as ViewStyle,

    fullWidthButtonTitle: {
      color: colors.primaryContrast,
      fontSize: 15,
      fontWeight: '700',
    } as TextStyle,

    fullWidthButtonSubtitle: {
      color: colors.primaryContrast,
      fontSize: 11,
      opacity: 0.75,
      marginTop: 1,
    } as TextStyle,

    fullWidthAutoStartIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      gap: 10,
    } as ViewStyle,

    autoStartText: {
      fontSize: 13,
      fontWeight: '500',
    } as TextStyle,

    // ── Utilities ─────────────────────────────────────────────────────────────
    divider: {
      height: 1,
      backgroundColor: colors.border,
    } as ViewStyle,

    row: {
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,

    // ── Last visit / order strip ──────────────────────────────────────────────
    lastInfoContainer: {
      paddingHorizontal: 16,
      marginTop: 8,
      marginBottom: 8,
    } as ViewStyle,

    lastInfoCard: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,

    lastInfoItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    } as ViewStyle,

    lastInfoDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginHorizontal: 12,
    } as ViewStyle,

    lastInfoLabel: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.textSecondary,
    } as TextStyle,

    lastInfoValue: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textPrimary,
      marginTop: 1,
    } as TextStyle,

    // ── Dev geofence pill ─────────────────────────────────────────────────────
    debugGeofenceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginHorizontal: 16,
      marginBottom: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    } as ViewStyle,

    debugGeofenceText: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.primaryContrast,
    } as TextStyle,

    // ── Header hero ───────────────────────────────────────────────────────────
    detailHeader: {
      paddingHorizontal: 16,
      paddingTop: 12,
    } as ViewStyle,

    detailHeroCard: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,

    detailHeroCardCompact: {
      paddingVertical: 12,
    } as ViewStyle,

    detailHeroTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    } as ViewStyle,

    detailAvatarWrap: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.primary + '12',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    } as ViewStyle,

    detailHeaderInfo: {
      flex: 1,
    } as ViewStyle,

    detailTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: 3,
    } as ViewStyle,

    detailName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
      flex: 1,
    } as TextStyle,

    detailOwner: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 8,
    } as TextStyle,

    detailMetaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    } as ViewStyle,

    detailMetaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: colors.primary + '0D',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.primary + '1E',
    } as ViewStyle,

    detailMetaChipText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.primary,
    } as TextStyle,

    detailLocationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    } as ViewStyle,

    detailLocation: {
      fontSize: 13,
      color: colors.textSecondary,
      flex: 1,
    } as TextStyle,

    // ── Modal shared (kept for any legacy usage) ──────────────────────────────
    invoiceModalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.45)',
    } as ViewStyle,

    invoiceModalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
      borderTopWidth: 1,
      borderTopColor: colors.border,
    } as ViewStyle,

    invoiceModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    } as ViewStyle,

    invoiceModalTitleBlock: {
      flex: 1,
      minWidth: 0,
    } as ViewStyle,

    invoiceModalTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    } as TextStyle,

    invoiceModalSubtitle: {
      marginTop: 2,
      fontSize: 11,
      color: colors.textSecondary,
    } as TextStyle,

    invoiceModalCloseButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    } as ViewStyle,

    invoiceModalSummaryRow: {
      flexDirection: 'row',
      gap: 8,
      padding: 16,
    } as ViewStyle,

    invoiceModalSummaryItem: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 10,
    } as ViewStyle,

    invoiceModalSummaryLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      marginBottom: 4,
    } as TextStyle,

    invoiceModalSummaryValue: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textPrimary,
    } as TextStyle,

    invoiceProductsList: {
      maxHeight: 340,
    } as ViewStyle,

    invoiceProductRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    } as ViewStyle,

    invoiceProductInfo: {
      flex: 1,
      minWidth: 0,
    } as ViewStyle,

    invoiceProductName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
      lineHeight: 18,
    } as TextStyle,

    invoiceProductCategory: {
      marginTop: 2,
      fontSize: 10,
      color: colors.textSecondary,
    } as TextStyle,

    invoiceProductQtyBlock: {
      alignItems: 'flex-end',
      flexShrink: 0,
      maxWidth: 110,
    } as ViewStyle,

    invoiceProductQty: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textPrimary,
    } as TextStyle,

    invoiceProductAmount: {
      marginTop: 2,
      fontSize: 11,
      color: colors.textSecondary,
    } as TextStyle,

    invoiceNoProducts: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 28,
    } as ViewStyle,

    invoiceBackdrop: {
      position: 'absolute',
      top: 0, right: 0, bottom: 0, left: 0,
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};