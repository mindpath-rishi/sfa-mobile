// DayEndSummaryModal.styles.ts
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export const useDayEndSummaryModalStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    // DayEndSummaryModal.styles.ts - Update these specific styles

    // Product Stats - Increased font sizes
    productStatLabel: {
      fontSize: 10,
      marginBottom: 3,
      color: colors.textSecondary,
      fontWeight: '500',
    } as TextStyle,

    productStatValue: {
      fontSize: 13,
      fontWeight: '700',
    } as TextStyle,

    productStatSub: {
      fontSize: 11, // Increased from 9
      marginTop: 3, // Increased from 2
      color: colors.textTertiary,
    } as TextStyle,

    // Product Name - Increased size
    productName: {
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 2,
      color: colors.textPrimary,
      lineHeight: 17,
    } as TextStyle,

    // Product Code
    productCode: {
      fontSize: 10,
      color: colors.textSecondary,
    } as TextStyle,

    // Product Index
    productIndexText: {
      width: 22,
      fontSize: 11,
      fontWeight: '800',
      color: colors.primary,
    } as TextStyle,

    // Product Value Labels
    productValueLabel: {
      fontSize: 11, // Increased from 10
      color: colors.textSecondary,
      flex: 1,
    } as TextStyle,

    productValueAmount: {
      fontSize: 14, // Increased from 13
      fontWeight: '700',
    } as TextStyle,

    // Stats Card Items
    statsCardItemLabel: {
      fontSize: 11, // Increased from 10
      marginBottom: 3,
      color: colors.textSecondary,
    } as TextStyle,

    statsCardItemValue: {
      fontSize: 16, // Increased from 15
      fontWeight: '700',
    } as TextStyle,

    // Financial Row Text
    financialLabelText: {
      fontSize: 15, // Increased from 14
      fontWeight: '500',
      color: colors.textPrimary,
    } as TextStyle,

    financialStockText: {
      width: 70,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    } as TextStyle,

    financialWeightText: {
      width: 72,
      fontSize: 13,
      fontWeight: '700',
      textAlign: 'center',
    } as TextStyle,

    financialItemsText: {
      width: 55,
      fontSize: 15, // Increased from 14
      fontWeight: '700',
      textAlign: 'center',
    } as TextStyle,

    financialValueText: {
      width: 70,
      fontSize: 14,
      fontWeight: '700',
      textAlign: 'right',
    } as TextStyle,

    // Tab Text
    tabText: {
      fontSize: 15, // Increased from 14
      fontWeight: '600',
    } as TextStyle,

    // Card Title
    cardTitle: {
      fontSize: 17, // Increased from 16
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    // Stats Card Title
    statsCardTitle: {
      fontSize: 17, // Increased from 16
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,
    container: {
      flex: 1,
    } as ViewStyle,

    modalContainer: {
      flex: 1,
    } as ViewStyle,

    modalContent: {
      flex: 1,
      padding: 0,
    } as ViewStyle,

    scrollContent: {
      padding: 16,
      paddingBottom: 24,
    } as ViewStyle,

    summaryHero: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.divider,
      backgroundColor: colors.surface,
      padding: 14,
      marginBottom: 16,
      gap: 14,
    } as ViewStyle,

    summaryHeroHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    } as ViewStyle,

    summaryHeroIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    summaryHeroTitleBlock: {
      flex: 1,
    } as ViewStyle,

    summaryHeroTitle: {
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 2,
    } as TextStyle,

    summaryHeroSubtitle: {
      fontSize: 12,
      lineHeight: 17,
    } as TextStyle,

    summaryTileGrid: {
      gap: 10,
    } as ViewStyle,

    summaryTile: {
      minHeight: 74,
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    } as ViewStyle,

    summaryTileIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    summaryTileContent: {
      flex: 1,
    } as ViewStyle,

    summaryTileLabel: {
      fontSize: 11,
      fontWeight: '600',
      marginBottom: 3,
    } as TextStyle,

    summaryTileValue: {
      fontSize: 17,
      fontWeight: '800',
      marginBottom: 2,
    } as TextStyle,

    summaryTileHelper: {
      fontSize: 12,
      fontWeight: '700',
    } as TextStyle,

    topupAlertCard: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 14,
      marginBottom: 16,
      gap: 12,
    } as ViewStyle,

    topupAlertHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    } as ViewStyle,

    topupAlertTitle: {
      fontSize: 15,
      fontWeight: '700',
    } as TextStyle,

    topupAlertSection: {
      gap: 6,
    } as ViewStyle,

    topupAlertMessage: {
      fontSize: 13,
      fontWeight: '700',
    } as TextStyle,

    topupAlertItem: {
      borderRadius: 12,
      padding: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    } as ViewStyle,

    topupAlertItemMain: {
      flex: 1,
    } as ViewStyle,

    topupAlertReference: {
      fontSize: 13,
      fontWeight: '800',
      marginBottom: 2,
    } as TextStyle,

    topupAlertQty: {
      fontSize: 12,
      lineHeight: 17,
    } as TextStyle,

    topupStatusBadge: {
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 5,
    } as ViewStyle,

    topupStatusText: {
      fontSize: 11,
      fontWeight: '800',
    } as TextStyle,

    unacceptedStockBackdrop: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 100,
      elevation: 20,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: 'rgba(15, 23, 42, 0.72)',
    } as ViewStyle,

    unacceptedStockCard: {
      width: '100%',
      maxWidth: 420,
      padding: 20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.warning + '45',
      backgroundColor: colors.surface,
    } as ViewStyle,

    unacceptedStockEyebrow: {
      alignSelf: 'center',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginBottom: 12,
      backgroundColor: colors.warning + '18',
      color: colors.warning,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
    } as TextStyle,

    unacceptedStockIcon: {
      alignSelf: 'center',
      width: 64,
      height: 64,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
      backgroundColor: colors.warning + '16',
    } as ViewStyle,

    unacceptedStockTitle: {
      color: colors.textPrimary,
      fontSize: 20,
      lineHeight: 25,
      fontWeight: '900',
      textAlign: 'center',
      marginBottom: 8,
    } as TextStyle,

    unacceptedStockDescription: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      textAlign: 'center',
      marginBottom: 16,
    } as TextStyle,

    unacceptedStockMetrics: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 14,
    } as ViewStyle,

    unacceptedStockMetric: {
      flex: 1,
      alignItems: 'center',
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 4,
      backgroundColor: colors.background,
    } as ViewStyle,

    unacceptedStockMetricValue: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '900',
      marginBottom: 2,
    } as TextStyle,

    unacceptedStockMetricLabel: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: '700',
    } as TextStyle,

    unacceptedStockNote: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      borderRadius: 12,
      padding: 11,
      marginBottom: 18,
      backgroundColor: colors.warning + '10',
    } as ViewStyle,

    unacceptedStockNoteText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
    } as TextStyle,

    unacceptedStockActions: {
      gap: 9,
    } as ViewStyle,

    unacceptedStockReviewButton: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 46,
      borderRadius: 12,
      backgroundColor: colors.primary,
    } as ViewStyle,

    unacceptedStockReviewText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    } as TextStyle,

    unacceptedStockEndButton: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.error + '70',
      backgroundColor: colors.error + '08',
    } as ViewStyle,

    unacceptedStockEndText: {
      color: colors.error,
      fontSize: 13,
      fontWeight: '800',
    } as TextStyle,

    // ============================
    // Tab Bar
    // ============================
    tabBar: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      backgroundColor: colors.surface,
    } as ViewStyle,

    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
    } as ViewStyle,

    tabActive: {
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    } as ViewStyle,

    // ============================
    // Cards
    // ============================
    card: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.divider,
      padding: 16,
      marginBottom: 16,
      backgroundColor: colors.surface,
    } as ViewStyle,

    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16,
    } as ViewStyle,

    // ============================
    // Stats Card (Reusable component)
    // ============================
    statsCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.divider,
      marginBottom: 16,
      overflow: 'hidden',
      backgroundColor: colors.surface,
    } as ViewStyle,

    statsCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,

    statsCardIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    statsCardGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 12,
      gap: 10,
    } as ViewStyle,

    statsCardItem: {
      flex: 1,
      minWidth: '45%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 10,
      borderRadius: 10,
      backgroundColor: colors.background,
    } as ViewStyle,

    statsCardItemIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    // ============================
    // Financial Summary Header & Rows
    // ============================
    financialHeader: {
      flexDirection: 'row',
      paddingBottom: 10,
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,

    financialHeaderLabel: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    } as TextStyle,

    financialHeaderStock: {
      width: 70,
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
      color: colors.textSecondary,
    } as TextStyle,

    financialHeaderWeight: {
      width: 72,
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
      color: colors.textSecondary,
    } as TextStyle,

    financialHeaderItems: {
      width: 55,
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
      color: colors.textSecondary,
    } as TextStyle,

    financialHeaderValue: {
      width: 70,
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'right',
      color: colors.textSecondary,
    } as TextStyle,

    financialRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,

    financialRowLabel: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    } as ViewStyle,

    // ============================
    // Stat Dot
    // ============================
    statDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    } as ViewStyle,

    // ============================
    // Products List
    // ============================
    productsList: {
      padding: 10,
      paddingBottom: 24,
      gap: 6,
    } as ViewStyle,

    productListHeaderBlock: {
      gap: 8,
    } as ViewStyle,

    productSearchBar: {
      minHeight: 42,
      borderRadius: 10,
    } as ViewStyle,

    productSearchInput: {
      fontSize: 13,
    } as TextStyle,

    productListHeader: {
      minHeight: 34,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    } as ViewStyle,

    productListHeaderName: {
      flex: 1.35,
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
    } as TextStyle,

    productListHeaderQty: {
      width: 44,
      fontSize: 10,
      fontWeight: '800',
      textAlign: 'center',
      textTransform: 'uppercase',
    } as TextStyle,

    productCompactRow: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.divider,
      backgroundColor: colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 7,
      gap: 5,
    } as ViewStyle,

    productCompactTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
    } as ViewStyle,

    productCompactDetails: {
      flex: 1,
      minWidth: 0,
    } as ViewStyle,

    productCompactInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      paddingLeft: 28,
    } as ViewStyle,

    productCompactQtys: {
      flexDirection: 'row',
      gap: 6,
      flexShrink: 0,
    } as ViewStyle,

    productCompactQty: {
      width: 44,
      fontSize: 11,
      fontWeight: '800',
      textAlign: 'center',
    } as TextStyle,

    productCompactValues: {
      flexDirection: 'row',
      gap: 8,
      flex: 1,
      minWidth: 0,
      justifyContent: 'flex-end',
    } as ViewStyle,

    productCompactValue: {
      flexShrink: 1,
      textAlign: 'right',
      fontSize: 10,
      fontWeight: '800',
    } as TextStyle,

    productCard: {
      padding: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.divider,
      backgroundColor: colors.surface,
    } as ViewStyle,

    productRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    } as ViewStyle,

    productIndex: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: colors.primary + '10',
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    productDetails: {
      flex: 1,
    } as ViewStyle,

    productStats: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 12,
      gap: 8,
    } as ViewStyle,

    productStat: {
      width: '48%',
      minHeight: 66,
      alignItems: 'flex-start',
      justifyContent: 'center',
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 8,
    } as ViewStyle,

    productValueRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    } as ViewStyle,

    productValueItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      minWidth: 0,
    } as ViewStyle,

    // ============================
    // Footer
    // ============================
    footer: {
      flexDirection: 'row',
      padding: 16,
      paddingBottom: 24,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      backgroundColor: colors.surface,
    } as ViewStyle,

    cancelButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.divider,
      alignItems: 'center',
      backgroundColor: colors.background,
    } as ViewStyle,

    cancelButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    } as TextStyle,

    proceedButton: {
      flex: 2,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: colors.primary,
    } as ViewStyle,

    proceedButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    } as TextStyle,

    // ============================
    // Empty State
    // ============================
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
      gap: 12,
    } as ViewStyle,

    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
    } as TextStyle,

    // ============================
    // Legacy/Deprecated Styles (Keep for compatibility)
    // ============================
    soldGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    } as ViewStyle,

    soldItem: {
      flex: 1,
      minWidth: '47%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 12,
    } as ViewStyle,

    soldIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    soldLabel: {
      fontSize: 11,
      marginBottom: 2,
      color: colors.textSecondary,
    } as TextStyle,

    soldValue: {
      fontSize: 18,
      fontWeight: '800',
    } as TextStyle,

    closingGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    } as ViewStyle,

    closingItem: {
      flex: 1,
      minWidth: '30%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 12,
    } as ViewStyle,

    closingIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    closingLabel: {
      fontSize: 10,
      marginBottom: 2,
      color: colors.textSecondary,
    } as TextStyle,

    closingValue: {
      fontSize: 16,
      fontWeight: '800',
    } as TextStyle,

    currentStockGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    } as ViewStyle,

    currentStockItem: {
      flex: 1,
      minWidth: '30%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 12,
    } as ViewStyle,

    currentStockIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    currentStockLabel: {
      fontSize: 10,
      marginBottom: 2,
      color: colors.textSecondary,
    } as TextStyle,

    currentStockValue: {
      fontSize: 16,
      fontWeight: '800',
    } as TextStyle,

    statsHeader: {
      flexDirection: 'row',
      paddingBottom: 10,
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,

    statsHeaderLabel: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    } as TextStyle,

    statsHeaderValue: {
      width: 90,
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
      color: colors.textSecondary,
    } as TextStyle,

    statsHeaderItems: {
      width: 60,
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'right',
      color: colors.textSecondary,
    } as TextStyle,

    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,

    statsRowLabel: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    } as ViewStyle,

    statLabelText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textPrimary,
    } as TextStyle,

    statValueText: {
      width: 90,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    } as TextStyle,

    statItemsText: {
      width: 60,
      fontSize: 14,
      fontWeight: '700',
      textAlign: 'right',
    } as TextStyle,

    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    } as ViewStyle,

    statItem: {
      flex: 1,
      minWidth: '22%',
      alignItems: 'center',
      gap: 4,
    } as ViewStyle,

    statLabel: {
      fontSize: 11,
      color: colors.textSecondary,
    } as TextStyle,

    statValue: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textPrimary,
    } as TextStyle,

    valueGrid: {
      gap: 14,
    } as ViewStyle,

    valueItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    } as ViewStyle,

    valueIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    valueLabel: {
      fontSize: 12,
      marginBottom: 2,
      color: colors.textSecondary,
    } as TextStyle,

    valueAmount: {
      fontSize: 16,
      fontWeight: '700',
    } as TextStyle,

    quickStatsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
    } as ViewStyle,

    quickStat: {
      flex: 1,
      alignItems: 'center',
    } as ViewStyle,

    quickStatValue: {
      fontSize: 22,
      fontWeight: '800',
      marginBottom: 4,
    } as TextStyle,

    quickStatLabel: {
      fontSize: 11,
      color: colors.textSecondary,
    } as TextStyle,

    quickDivider: {
      width: 1,
      height: 40,
      backgroundColor: colors.divider,
    } as ViewStyle,
  });
};
