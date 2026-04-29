// stock.styles.ts

import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const createStockStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // Header Styles
    headerContainer: {
      backgroundColor: colors.background,
    },

    heroSection: {
      paddingBottom: 24,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      height: 35,
      marginBottom: 40,
      backgroundColor: colors.primary
    },

    heroContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    heroTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 4,
    },

    heroSubtitle: {
      fontSize: 14,
      color: '#FFFFFF',
      opacity: 0.9,
    },

    loadNumberChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 6,
    },

    loadNumberChipText: {
      fontSize: 12,
      color: '#FFFFFF',
      fontWeight: '500',
    },

    // Search Section (inside header)
    searchSection: {
      marginTop: 16,
      paddingHorizontal: 0,
    },

    searchResultText: {
      marginTop: 8,
      fontSize: 12,
      marginLeft: 4,
      color: '#FFFFFF',
      opacity: 0.9,
    },

    // Metrics Section
    metricsWrapper: {
      marginTop: 16,
      marginBottom: 8,
    },

    metricsScrollContainer: {
      paddingHorizontal: 16,
      gap: 16,
    },

    metricItem: {
      alignItems: 'center',
      minWidth: width * 0.22,
    },

    metricLabel: {
      fontSize: 11,
      marginBottom: 4,
      color: colors.textSecondary,
    },

    metricValue: {
      fontSize: 18,
      fontWeight: '600',
    },

    metricDivider: {
      width: 1,
      height: 30,
      backgroundColor: colors.divider,
    },

    // Product List Styles
    listContainer: {
      paddingBottom: 24,
    },

    productRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },

    productLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginRight: 12,
    },

    productIndex: {
      fontSize: 14,
      fontWeight: '500',
      width: 30,
      color: colors.textTertiary,
    },

    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },

    productCenter: {
      flex: 1,
    },

    productName: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 2,
      color: colors.textPrimary,
    },

    productCode: {
      fontSize: 11,
      color: colors.textTertiary,
    },

    productRight: {
      alignItems: 'flex-end',
    },

    productStock: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 2,
    },

    productPrice: {
      fontSize: 11,
      color: colors.textTertiary,
    },

    outOfStockText: {
      fontSize: 12,
      fontWeight: '600',
    },

    // Loading States
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },

    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.textSecondary,
    },

    loadingFooter: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
      gap: 8,
    },

    loadingFooterText: {
      fontSize: 12,
      color: colors.textSecondary,
    },

    // Empty State
    emptyStateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      gap: 12,
    },

    emptyStateText: {
      fontSize: 14,
      color: colors.textSecondary,
    },

    clearSearchButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },

    clearSearchText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.primary,
    },

    // Skeleton Styles
    skeletonContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },

    skeletonHeader: {
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },

    skeletonSearchBar: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },

    skeletonMetrics: {
      marginTop: 16,
      marginBottom: 8,
      paddingHorizontal: 16,
    },

    skeletonMetricsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
    },

    skeletonList: {
      paddingHorizontal: 16,
      gap: 8,
      marginTop: 16,
    },

    skeletonItem: {
      marginBottom: 8,
    },
  });