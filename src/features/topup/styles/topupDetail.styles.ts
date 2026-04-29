// VanInventoryTopupDetail.styles.ts

import { StyleSheet } from 'react-native';

export const createTopupDetailStyles = (colors: any) =>
  StyleSheet.create({
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
    loadingText: {
      marginTop: 12,
      fontSize: 14,
    },
    emptyText: {
      marginTop: 12,
      fontSize: 14,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },

    // Hero Header Styles
    heroHeader: {
      paddingTop: 16,
      paddingBottom: 24,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    heroTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    heroPlaceholder: {
      width: 40,
    },
    heroContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    heroLeft: {
      flex: 1,
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

    // Tabs Styles
    tabsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      borderBottomWidth: 1,
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

    // Overview Styles
    overviewContent: {
      paddingBottom: 24,
    },
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

    // Approved Section Styles
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
      marginBottom: 12,
      gap: 8,
    },
    approvedIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    approvedTitle: {
      fontSize: 14,
      fontWeight: '600',
    },
    approvedRow: {
      flexDirection: 'row',
      gap: 16,
    },
    approvedItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    approvedLabel: {
      fontSize: 11,
      marginBottom: 2,
    },
    approvedValue: {
      fontSize: 13,
      fontWeight: '500',
    },

    // Stats Section Styles
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

    // Remark Styles
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
    },

    // Product Item Styles
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
    productIndex: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    productIndexText: {
      fontSize: 14,
      fontWeight: '600',
    },
    productCenter: {
      flex: 1,
    },
    productName: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 6,
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
  });
