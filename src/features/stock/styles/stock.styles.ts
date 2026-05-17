import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const createStockStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    headerContainer: {
      backgroundColor: colors.background,
      paddingTop: Platform.OS === 'ios' ? 4 : 8,
    },

    // Metrics Section - Horizontal Scroll (All devices)
    metricsWrapper: {
      marginVertical: 8,
    },

    metricsScrollContainer: {
      paddingHorizontal: 12,
      gap: 8,
      alignItems: 'center',
      flexDirection: 'row',
    },

    metricCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: Platform.OS === 'ios' ? 8 : 10,
      borderRadius: 10,
      borderWidth: 0.5,
      borderColor: colors.divider,
      width: width * 0.42, // Fixed width for consistency
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        },
        android: {
          elevation: 1,
        },
      }),
    },

    metricIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },

    metricContent: {
      flex: 1,
    },

    metricLabel: {
      fontSize: 11,
      fontWeight: '500',
      marginBottom: 2,
      color: colors.textSecondary,
    },

    metricValue: {
      fontSize: 14,
      fontWeight: '600',
    },

    // Product List Styles
    listContainer: {
      paddingHorizontal: 12,
      gap: 8,
      paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    },

    productRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingVertical: Platform.OS === 'ios' ? 10 : 12,
      paddingHorizontal: 12,
      borderWidth: 0.5,
      borderColor: colors.divider,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.03,
          shadowRadius: 2,
        },
        android: {
          elevation: 0.5,
        },
      }),
    },

    productLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginRight: 10,
    },

    productIndex: {
      fontSize: 13,
      fontWeight: '600',
      width: 24,
      color: colors.primary,
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
      marginBottom: 4,
      color: colors.textPrimary,
    },

    productMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    productCode: {
      fontSize: 11,
      color: colors.textTertiary,
    },

    productRight: {
      alignItems: 'flex-end',
      gap: 4,
    },

    stockBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    priceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    productStock: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    },

    productPrice: {
      fontSize: 11,
      color: colors.textTertiary,
    },

    outOfStockBadge: {
      backgroundColor: colors.error + '10',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },

    outOfStockText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.error,
    },

    // Loading States
    loadingFooter: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 16,
      gap: 8,
    },

    loadingFooterText: {
      fontSize: 12,
      color: colors.textSecondary,
    },

    // Skeleton Styles
    skeletonContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },

    skeletonMetrics: {
      marginVertical: 8,
      paddingHorizontal: 12,
    },

    skeletonMetricsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
    },

    skeletonList: {
      paddingHorizontal: 12,
      gap: 8,
      marginTop: 8,
    },

    skeletonItem: {
      marginBottom: 6,
    },
  });
