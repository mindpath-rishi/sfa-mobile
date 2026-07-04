import { StyleSheet } from 'react-native';

export const createTopupDetailStyles = (colors: any) =>
  StyleSheet.create({
    // ==================== CONTAINERS ====================

    // ==================== PRODUCT ITEMS (COMPACT VERSION) ====================
    productsList: {
      paddingTop: 12,
      paddingBottom: 32,
      gap: 10,
    },

    // Product Item Container
    productItem: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      marginHorizontal: 16,
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: colors.borderLight,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 2,
    },

    // Product Header Row
    productHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
    },

    // Product Index
    productIndex: {
      width: 30,
      height: 30,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },

    productIndexText: {
      fontSize: 11,
      fontWeight: '600',
    },

    // Product Name
    productName: {
      flex: 1,
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },

    // Status Badge
    productStatusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      minWidth: 24,
    },

    productStatusText: {
      fontSize: 10,
      fontWeight: '600',
    },

    // Single Line Layout (Requested → Approved)
    productSingleLine: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },

    productReqSection: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 6,
      flexWrap: 'wrap',
    },

    productAppSection: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 6,
      flexWrap: 'wrap',
    },

    productReqText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textPrimary,
    },

    productAppText: {
      fontSize: 12,
      fontWeight: '600',
    },

    productPriceText: {
      fontSize: 10,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    productFlowLabel: {
      width: '100%',
      fontSize: 8,
      fontWeight: '800',
      letterSpacing: 0.7,
      color: colors.textTertiary,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    actionBar: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 14,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 1,
      shadowRadius: 10,
      elevation: 8,
    },
    rejectButton: {
      flex: 0.8,
      height: 52,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.error,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 7,
    },
    acceptButton: {
      flex: 1.2,
      height: 52,
      borderRadius: 14,
      backgroundColor: colors.success,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 7,
    },
    rejectButtonText: { color: colors.error, fontSize: 14, fontWeight: '700' },
    acceptButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
    actionDisabled: { opacity: 0.6 },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },

    // ==================== HERO HEADER ====================
    heroHeader: {
      paddingBottom: 22,
      paddingHorizontal: 18,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
    },
    heroTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 20,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.14)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    heroLabel: {
      fontSize: 10,
      color: '#FFFFFF',
      opacity: 0.72,
      letterSpacing: 1.1,
      fontWeight: '700',
      marginBottom: 2,
    },
    heroSubtitle: {
      fontSize: 15,
      color: '#FFFFFF',
      fontWeight: '700',
    },
    heroTitleWrap: { flex: 1 },
    heroStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 20,
    },
    heroStatusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    heroStatusText: {
      fontSize: 11,
      fontWeight: '700',
    },
    heroSummary: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
    },
    heroSummaryMain: { flex: 1 },
    heroSummaryLabel: { color: 'rgba(255,255,255,0.72)', fontSize: 11, marginBottom: 3 },
    heroAmount: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
    heroVanRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
    heroVanText: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '500' },
    heroQtyCard: {
      minWidth: 76,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.13)',
      alignItems: 'center',
    },
    heroQtyValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
    heroQtyLabel: { color: 'rgba(255,255,255,0.72)', fontSize: 10, marginTop: 1 },

    // ==================== TABS ====================
    tabsContainer: {
      flexDirection: 'row',
      padding: 5,
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 4,
      backgroundColor: colors.backgroundTertiary,
      borderRadius: 14,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 9,
      paddingHorizontal: 10,
      gap: 8,
      borderRadius: 10,
    },
    tabActive: {
      backgroundColor: colors.surface,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
    },

    // ==================== OVERVIEW CONTENT ====================
    overviewContent: {
      paddingBottom: 32,
    },
    statusCallout: {
      marginHorizontal: 16,
      marginTop: 14,
      marginBottom: 4,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    statusCalloutIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusCalloutCopy: { flex: 1 },
    statusCalloutTitle: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
    statusCalloutText: { fontSize: 12, lineHeight: 17, color: colors.textSecondary },
    detailSection: { paddingHorizontal: 16, marginTop: 18 },
    detailSectionTitle: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    detailInfoCard: {
      marginTop: 10,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderLight,
      paddingHorizontal: 14,
    },
    detailInfoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 11 },
    detailInfoIcon: {
      width: 34,
      height: 34,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary + '0D',
    },
    detailInfoCopy: { flex: 1 },
    detailInfoLabel: { fontSize: 10, color: colors.textTertiary, marginBottom: 2 },
    detailInfoValue: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
    detailInfoDivider: { height: 1, backgroundColor: colors.borderLight, marginLeft: 45 },
    comparisonLegend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot: { width: 6, height: 6, borderRadius: 3, marginLeft: 4 },
    legendText: { fontSize: 9, color: colors.textTertiary },
    metricTable: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderLight,
      paddingHorizontal: 14,
    },
    metricRow: {
      minHeight: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    metricLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
    metricValues: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 7,
    },
    metricRequested: { fontSize: 13, fontWeight: '700', color: colors.warning },
    metricApproved: { fontSize: 13, fontWeight: '800', color: colors.success },
    metricDivider: { height: 1, backgroundColor: colors.borderLight },
    timelineCard: {
      marginTop: 10,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderLight,
      padding: 12,
      gap: 12,
    },
    timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    timelineIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
    timelineCopy: { flex: 1 },
    timelineTitle: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
    timelineDate: { fontSize: 10, color: colors.textTertiary, marginTop: 2 },
    modernRemarkCard: {
      marginTop: 10,
      padding: 14,
      backgroundColor: colors.primary + '08',
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    modernRemarkText: { flex: 1, fontSize: 12, lineHeight: 18, color: colors.textSecondary },

    // Info Section
    infoSection: {
      padding: 16,
      gap: 10,
    },
    infoRow: {
      flexDirection: 'row',
      gap: 12,
    },
    infoCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 13,
      borderRadius: 14,
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    infoLabel: {
      fontSize: 11,
      color: colors.textTertiary,
      marginBottom: 2,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textPrimary,
    },

    // Comparison Section (Requested vs Approved)
    comparisonSection: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    comparisonHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    comparisonTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    comparisonGrid: {
      gap: 12,
    },
    comparisonCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    comparisonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    requestedBox: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
    },
    approvedBox: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
      position: 'relative',
    },
    comparisonLabel: {
      fontSize: 11,
      color: colors.textTertiary,
    },
    comparisonValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    diffText: {
      fontSize: 10,
      fontWeight: '500',
      marginTop: 2,
    },
    positiveDiff: {
      color: colors.success,
    },
    negativeDiff: {
      color: colors.error,
    },

    // Stats Section
    statsSection: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    statsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 12,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    statCard: {
      flex: 1,
      minWidth: '30%',
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 14,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 11,
      color: colors.textTertiary,
    },

    // Status Cards (Pending/Approved/Rejected)
    pendingSection: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    pendingCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 16,
      borderRadius: 12,
    },
    pendingContent: {
      flex: 1,
    },
    pendingTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.warning,
      marginBottom: 4,
    },
    pendingText: {
      fontSize: 12,
      color: colors.textSecondary,
    },

    approvedSection: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    approvedCard: {
      borderRadius: 12,
      padding: 16,
    },
    approvedHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    approvedIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    approvedTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    approvedName: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.success,
      marginTop: 2,
    },
    approvedDate: {
      fontSize: 11,
      color: colors.textTertiary,
      marginTop: 2,
    },

    rejectedSection: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    rejectedCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 16,
      borderRadius: 12,
    },
    rejectedContent: {
      flex: 1,
    },
    rejectedTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.error,
      marginBottom: 4,
    },
    rejectedText: {
      fontSize: 12,
      color: colors.textSecondary,
    },

    // Remark Section
    remarkCard: {
      flexDirection: 'row',
      marginHorizontal: 16,
      padding: 12,
      backgroundColor: colors.surface,
      borderRadius: 12,
      gap: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    remarkText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSecondary,
    },

    // Single Row Product Item
    productItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 10,
      marginHorizontal: 16,
      marginBottom: 4,
      paddingVertical: 8,
      paddingHorizontal: 10,
      gap: 8,
      borderWidth: 0.5,
      borderColor: colors.divider,
    },

    productNameRow: {
      flex: 2,
      fontSize: 12,
      fontWeight: '500',
      color: colors.textPrimary,
    },

    productQuantities: {
      flex: 1,
      alignItems: 'flex-end',
      gap: 2,
    },

    productQtyText: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.textPrimary,
    },

    productMiniBadge: {
      width: 18,
      height: 18,
      borderRadius: 9,
      justifyContent: 'center',
      alignItems: 'center',
    },

    productMiniText: {
      fontSize: 9,
      fontWeight: '600',
    },

    // Compact Stats Row
    productStatsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    productStatGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    productStatValues: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },

    productStatLabel: {
      fontSize: 8,
      color: colors.textTertiary,
      fontWeight: '500',
      textTransform: 'uppercase',
    },

    productStatNumber: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.textPrimary,
    },

    productStatApproved: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.success,
    },

    productStatArrow: {
      marginHorizontal: 2,
    },

    // Legacy styles
    productRow: {
      flexDirection: 'row',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      alignItems: 'center',
    },
    productLeft: {
      marginRight: 12,
    },
    productCenter: {
      flex: 1,
    },
    productDetails: {
      flexDirection: 'row',
      gap: 12,
    },
    productDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    productDetailText: {
      fontSize: 11,
    },
    productRight: {
      alignItems: 'flex-end',
    },
    productValue: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 2,
    },
    productWeight: {
      fontSize: 11,
    },

    // ==================== SKELETON LOADERS ====================
    skeletonHeader: {
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    skeletonTabs: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    skeletonTab: {
      borderRadius: 20,
    },
    skeletonContent: {
      padding: 16,
    },
    skeletonInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    skeletonCard: {
      borderRadius: 12,
    },
    skeletonSectionTitle: {
      marginTop: 16,
      marginBottom: 12,
      borderRadius: 8,
    },
    skeletonStatsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    skeletonStatCard: {
      borderRadius: 12,
    },

    // ==================== UTILITY ====================
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.textSecondary,
    },
    emptyText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.textSecondary,
    },
  });
