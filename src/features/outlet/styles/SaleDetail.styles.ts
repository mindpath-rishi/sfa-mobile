import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const createSaleDetailStyles = (colors: any) =>
  StyleSheet.create({
    // ScrollView
    saleModalScrollView: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // Hero Section
    saleModalHero: {
      padding: 20,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border || '#E5E7EB',
    },

    saleModalHeroTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },

    heroLeftContent: {
      flex: 1,
      marginRight: 12,
    },

    heroRightContent: {
      alignItems: 'flex-end',
    },

    saleModalSaleId: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
      fontFamily: 'System',
    },

    saleModalDate: {
      fontSize: 13,
      color: colors.textSecondary || '#6B7280',
      fontWeight: '500',
    },

    saleModalAmount: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 4,
    },

    pendingAmountBadge: {
      fontSize: 12,
      color: '#F59E0B',
      fontWeight: '600',
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },

    saleTagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },

    saleTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
    },

    saleTagText: {
      fontSize: 12,
      fontWeight: '600',
    },

    // Section Styling
    saleModalSection: {
      paddingHorizontal: 20,
      paddingVertical: 18,
      borderBottomWidth: 1,
      borderBottomColor: colors.border || '#E5E7EB',
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14,
    },

    saleModalSectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: 0.3,
    },

    sectionContent: {
      backgroundColor: colors.background,
      borderRadius: 10,
      overflow: 'hidden',
    },

    // Detail Rows
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border || '#F3F4F6',
    },

    detailRow_last: {
      borderBottomWidth: 0,
    },

    detailLabel: {
      fontSize: 13,
      color: colors.textSecondary || '#6B7280',
      fontWeight: '500',
    },

    detailValue: {
      fontSize: 13,
      color: colors.text,
      fontWeight: '600',
    },

    // Quantity & Value Grid
    saleMetricGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      justifyContent: 'space-between',
    },

    saleMetricCard: {
      width: (width - 60) / 2,
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border || '#E5E7EB',
    },

    metricIconBg: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },

    saleMetricLabel: {
      fontSize: 11,
      color: colors.textSecondary || '#6B7280',
      fontWeight: '500',
      marginBottom: 4,
      textAlign: 'center',
    },

    saleMetricValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },

    // Items Container
    itemsContainer: {
      gap: 12,
    },

    itemCard: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 4,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },

    itemCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
    },

    itemHeaderLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    itemIconBg: {
      width: 40,
      height: 40,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },

    itemHeaderInfo: {
      flex: 1,
    },

    itemProductName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      lineHeight: 16,
    },

    itemProductId: {
      fontSize: 11,
      color: colors.textSecondary || '#9CA3AF',
      fontWeight: '500',
      marginTop: 2,
    },

    itemHeaderRight: {
      alignItems: 'flex-end',
      gap: 8,
    },

    itemPrice: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
    },

    // Item Details (Expanded)
    itemDetailsContainer: {
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border || '#E5E7EB',
      paddingVertical: 12,
    },

    detailsGrid: {
      paddingHorizontal: 12,
      marginBottom: 12,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },

    detailGridItem: {
      width: (width - 68) / 2,
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border || '#E5E7EB',
    },

    gridLabel: {
      fontSize: 11,
      color: colors.textSecondary || '#6B7280',
      fontWeight: '500',
      marginBottom: 4,
    },

    gridValue: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },

    breakdownSection: {
      marginHorizontal: 12,
      marginBottom: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },

    breakdownTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      letterSpacing: 0.5,
    },

    breakdownRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: colors.border || '#F3F4F6',
    },

    breakdownRow_last: {
      borderBottomWidth: 0,
    },

    breakdownLabel: {
      fontSize: 12,
      color: colors.textSecondary || '#6B7280',
      fontWeight: '500',
    },

    breakdownValue: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
    },

    // Remarks Section
    remarksBox: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      padding: 12,
      minHeight: 80,
      justifyContent: 'flex-start',
    },

    remarksText: {
      fontSize: 13,
      color: colors.text,
      lineHeight: 18,
      fontWeight: '500',
    },

    // Spacing
    spacer: {
      height: 20,
    },
  });

export default createSaleDetailStyles;
