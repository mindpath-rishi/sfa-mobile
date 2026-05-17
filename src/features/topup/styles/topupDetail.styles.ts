import { StyleSheet } from 'react-native';

export const createTopupDetailStyles = (colors: any) =>
  StyleSheet.create({
    // ==================== CONTAINERS ====================

    // ==================== PRODUCT ITEMS (COMPACT VERSION) ====================
    productsList: {
      paddingVertical: 12,
      paddingBottom: 24,
      gap: 6,
    },

    // Product Item Container
    productItem: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      marginHorizontal: 16,
      marginBottom: 6,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderWidth: 0.5,
      borderColor: colors.divider,
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
      width: 24,
      height: 24,
      borderRadius: 12,
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
      fontSize: 13,
      fontWeight: '500',
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
      gap: 8,
    },

    productReqSection: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 6,
    },

    productAppSection: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 6,
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
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
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
      paddingTop: 16,
      paddingBottom: 24,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    heroContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    heroLabel: {
      fontSize: 14,
      color: '#FFFFFF',
      opacity: 0.9,
      marginBottom: 4,
    },
    heroSubtitle: {
      fontSize: 16,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    heroStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    heroStatusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    heroStatusText: {
      fontSize: 12,
      color: '#FFFFFF',
      fontWeight: '600',
    },

    // ==================== TABS ====================
    tabsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginRight: 8,
      gap: 8,
    },
    tabActive: {
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
    },

    // ==================== OVERVIEW CONTENT ====================
    overviewContent: {
      paddingBottom: 24,
    },

    // Info Section
    infoSection: {
      padding: 16,
      gap: 12,
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
      padding: 12,
      borderRadius: 12,
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
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
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    comparisonGrid: {
      gap: 12,
    },
    comparisonCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      borderWidth: 0.5,
      borderColor: colors.divider,
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
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
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
