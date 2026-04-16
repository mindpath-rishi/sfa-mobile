// StockCount.styles.ts
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export const useStockCountStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    // Add these to your StockCount.styles.ts

    // Count Info Row for Van and Employee
    countInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 12,
    } as ViewStyle,

    countInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
    } as ViewStyle,

    countInfoText: {
      fontSize: 12,
      flex: 1,
    } as TextStyle,

    // Verified Card Styles
    verifiedCard: {
      backgroundColor: '#10B98110',
      borderRadius: 12,
      padding: 14,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#10B98120',
    } as ViewStyle,

    verifiedHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    } as ViewStyle,

    verifiedTitle: {
      fontSize: 14,
      fontWeight: '600',
    } as TextStyle,

    verifiedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10,
    } as ViewStyle,

    verifiedLabel: {
      fontSize: 11,
    } as TextStyle,

    verifiedValue: {
      fontSize: 14,
      fontWeight: '500',
    } as TextStyle,
    countCardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
      marginTop: 12,
    } as ViewStyle,

    countIdContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    } as ViewStyle,

    countBadge: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    countBadgeText: {
      fontSize: 13,
      fontWeight: '700',
    } as TextStyle,

    countMetrics: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    } as ViewStyle,

    countMetric: {
      flex: 1,
      alignItems: 'center',
    } as ViewStyle,

    countMetricValue: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 4,
    } as TextStyle,

    countMetricLabel: {
      fontSize: 11,
    } as TextStyle,

    countMetricArrow: {
      width: 30,
      alignItems: 'center',
    } as ViewStyle,

    countMetricDivider: {
      width: 1,
      height: 30,
      backgroundColor: colors.divider,
    } as ViewStyle,

    countCardBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    } as ViewStyle,

    countDate: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    } as ViewStyle,

    countDateText: {
      fontSize: 11,
    } as TextStyle,

    countTime: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    } as ViewStyle,

    countTimeText: {
      fontSize: 11,
    } as TextStyle,

    // Detail Tab Styles
    detailTabBar: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      borderBottomWidth: 1,
    } as ViewStyle,

    detailTab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
    } as ViewStyle,

    detailTabActive: {
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    } as ViewStyle,

    detailTabText: {
      fontSize: 14,
      fontWeight: '500',
    } as TextStyle,

    // Items Tab Styles
    itemsTabContent: {
      padding: 16,
    } as ViewStyle,

    itemsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    } as ViewStyle,

    itemsHeaderTitle: {
      fontSize: 16,
      fontWeight: '600',
    } as TextStyle,

    itemsHeaderBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    } as ViewStyle,

    itemsHeaderBadgeText: {
      fontSize: 12,
      fontWeight: '600',
    } as TextStyle,

    productCard: {
      paddingVertical: 14,
      borderBottomWidth: 1,
    } as ViewStyle,

    productCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10,
    } as ViewStyle,

    productIndex: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: colors.primary + '10',
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    productIndexText: {
      fontSize: 12,
      fontWeight: '700',
    } as TextStyle,

    productInfo: {
      flex: 1,
    } as ViewStyle,

    productName: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 2,
    } as TextStyle,

    productCode: {
      fontSize: 11,
    } as TextStyle,

    productStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    } as ViewStyle,

    productStat: {
      flex: 1,
      alignItems: 'center',
    } as ViewStyle,

    productStatLabel: {
      fontSize: 10,
      marginBottom: 4,
    } as TextStyle,

    productStatValue: {
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 2,
    } as TextStyle,

    productStatSub: {
      fontSize: 10,
    } as TextStyle,
    detailInfoCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 14,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    detailInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    } as ViewStyle,

    detailInfoItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    } as ViewStyle,

    detailInfoLabel: {
      fontSize: 11,
    } as TextStyle,

    detailInfoValue: {
      fontSize: 14,
      fontWeight: '500',
    } as TextStyle,

    // Approved Card
    approvedCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: '#10B98110',
      padding: 12,
      borderRadius: 12,
      marginBottom: 16,
    } as ViewStyle,

    approvedLabel: {
      fontSize: 11,
    } as TextStyle,

    approvedValue: {
      fontSize: 14,
      fontWeight: '600',
    } as TextStyle,

    approvedDate: {
      fontSize: 10,
    } as TextStyle,

    // Remark Card
    remarkCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.background,
      padding: 14,
      borderRadius: 12,
      marginTop: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    remarkText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
    } as TextStyle,
    detailItem: {
      paddingVertical: 14,
      borderBottomWidth: 1,
    } as ViewStyle,

    detailItemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    } as ViewStyle,

    detailItemIndex: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: colors.primary + '10',
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    detailItemIndexText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    } as TextStyle,

    detailItemInfo: {
      flex: 1,
    } as ViewStyle,

    detailItemName: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 2,
    } as TextStyle,

    detailItemCode: {
      fontSize: 11,
    } as TextStyle,

    // Detail Stock Section
    detailStockSection: {
      marginBottom: 12,
    } as ViewStyle,

    detailStockLabel: {
      fontSize: 11,
      fontWeight: '500',
      marginBottom: 6,
    } as TextStyle,

    detailStockRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    } as ViewStyle,

    detailStockItem: {
      flex: 1,
      alignItems: 'center',
    } as ViewStyle,

    detailStockValue: {
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 2,
    } as TextStyle,

    detailStockSub: {
      fontSize: 9,
    } as TextStyle,

    // Detail Variance
    detailVariance: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    } as ViewStyle,

    detailVarianceText: {
      fontSize: 12,
      fontWeight: '600',
    } as TextStyle,

    detailVarianceSub: {
      fontSize: 10,
      marginTop: 4,
    } as TextStyle,
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    listContainer: {
      paddingBottom: 24,
    } as ViewStyle,

    // Hero Section
    headerContainer: {
      paddingBottom: 8,
    } as ViewStyle,

    heroSection: {
      paddingBottom: 32,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    } as ViewStyle,

    heroContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as ViewStyle,

    heroTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#FFF',
    } as TextStyle,

    heroSubtitle: {
      fontSize: 13,
      color: '#FFF',
      opacity: 0.9,
      marginTop: 4,
    } as TextStyle,

    // Search Section
    searchSection: {
      paddingHorizontal: 16,
      marginTop: -16,
      marginBottom: 12,
    } as ViewStyle,

    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
      gap: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    } as ViewStyle,

    searchInput: {
      flex: 1,
      fontSize: 15,
      paddingVertical: 0,
    } as TextStyle,

    // Stats Wrapper
    statsWrapper: {
      marginBottom: 16,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.divider,
      backgroundColor: colors.surface,
    } as ViewStyle,

    statsScrollContent: {
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,

    statItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
    } as ViewStyle,

    statValue: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 2,
    } as TextStyle,

    statLabel: {
      fontSize: 11,
    } as TextStyle,

    statDivider: {
      width: 1,
      height: 30,
    } as ViewStyle,

    // Section Header
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 12,
    } as ViewStyle,

    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    } as ViewStyle,

    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
    } as TextStyle,

    sectionCount: {
      fontSize: 12,
    } as TextStyle,

    // Count Card
    countCard: {
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    } as ViewStyle,

    countCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    } as ViewStyle,

    countCardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    } as ViewStyle,

    countIndex: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    countIndexText: {
      fontSize: 14,
      fontWeight: '700',
    } as TextStyle,

    countId: {
      fontSize: 14,
      fontWeight: '600',
    } as TextStyle,

    countMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    } as ViewStyle,

    countStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 16,
    } as ViewStyle,

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    } as ViewStyle,

    countStatusText: {
      fontSize: 11,
      fontWeight: '600',
    } as TextStyle,

    countStats: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      marginBottom: 10,
    } as ViewStyle,

    countStat: {
      flex: 1,
      alignItems: 'center',
    } as ViewStyle,

    countStatValue: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 2,
    } as TextStyle,

    countStatLabel: {
      fontSize: 10,
    } as TextStyle,

    countStatDivider: {
      width: 1,
      height: 30,
    } as ViewStyle,

    varianceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    } as ViewStyle,

    countFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingTop: 10,
      borderTopWidth: 1,
    } as ViewStyle,

    countFooterText: {
      fontSize: 10,
    } as TextStyle,

    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    } as ViewStyle,

    modalContent: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '90%',
      padding: 20,
    } as ViewStyle,

    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    } as ViewStyle,

    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
    } as TextStyle,

    modalScrollContent: {
      paddingBottom: 20,
    } as ViewStyle,

    modalFooter: {
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      marginTop: 8,
    } as ViewStyle,

    closeModalButton: {
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
    } as ViewStyle,

    closeModalText: {
      fontSize: 14,
      fontWeight: '600',
    } as TextStyle,

    // Detail Styles
    detailHeader: {
      marginTop: 10,
    } as ViewStyle,

    detailIdRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    } as ViewStyle,

    detailId: {
      fontSize: 15,
      fontWeight: '600',
    } as TextStyle,

    detailStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 16,
    } as ViewStyle,

    detailStatusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    } as ViewStyle,

    detailStatusText: {
      fontSize: 11,
      fontWeight: '600',
    } as TextStyle,

    detailMeta: {
      flexDirection: 'row',
      gap: 16,
    } as ViewStyle,

    detailMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    } as ViewStyle,

    detailMetaText: {
      fontSize: 12,
    } as TextStyle,

    // Summary Grid
    summaryGrid: {
      gap: 10,
      marginBottom: 20,
    } as ViewStyle,

    summaryCard: {
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    summaryLabel: {
      fontSize: 12,
      marginBottom: 4,
    } as TextStyle,

    summaryValue: {
      fontSize: 18,
      fontWeight: '700',
    } as TextStyle,

    summarySub: {
      fontSize: 11,
      marginTop: 4,
    } as TextStyle,

    // Items Section
    itemsSection: {
      marginBottom: 16,
    } as ViewStyle,

    itemsTitle: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 12,
    } as TextStyle,

    detailItemStats: {
      flexDirection: 'row',
      gap: 20,
    } as ViewStyle,

    detailItemStat: {
      flex: 1,
    } as ViewStyle,

    detailItemStatLabel: {
      fontSize: 10,
      marginBottom: 2,
    } as TextStyle,

    detailItemStatValue: {
      fontSize: 14,
      fontWeight: '600',
    } as TextStyle,

    // FAB
    fab: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    } as ViewStyle,

    // Loading & Empty States
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
      gap: 12,
    } as ViewStyle,

    emptyText: {
      fontSize: 14,
    } as TextStyle,

    // Add these to your StockCount.styles.ts

    // Count Stats Grid
    countStatsGrid: {
      marginBottom: 12,
    } as ViewStyle,

    countStatGroup: {
      marginBottom: 10,
    } as ViewStyle,

    countStatGroupLabel: {
      fontSize: 11,
      fontWeight: '500',
      marginBottom: 6,
    } as TextStyle,

    countStatRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    } as ViewStyle,

    countVariance: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 10,
      borderTopWidth: 1,
    } as ViewStyle,

    varianceLabel: {
      fontSize: 11,
    } as TextStyle,

    varianceValue: {
      fontSize: 13,
      fontWeight: '600',
    } as TextStyle,

    countFooterMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    } as ViewStyle,

    // Summary Card
    summaryCardTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 10,
    } as TextStyle,

    summaryCardStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 8,
    } as ViewStyle,

    summaryCardStat: {
      alignItems: 'center',
    } as ViewStyle,

    summaryCardStatValue: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 2,
    } as TextStyle,

    summaryCardStatLabel: {
      fontSize: 10,
    } as TextStyle,

    summaryCardSub: {
      fontSize: 11,
      textAlign: 'center',
      marginTop: 4,
    } as TextStyle,
  });
};
