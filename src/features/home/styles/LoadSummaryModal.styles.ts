// LoadSummaryModal.styles.ts
import { StyleSheet, ViewStyle } from 'react-native';

export const useLoadSummaryModalStyles = () => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },

    // Stats Bar
    statsBar: {
      backgroundColor: '#FFFFFF',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    statsScrollContent: {
      paddingHorizontal: 16,
      gap: 16,
    },
    statsBarItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statsIconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statsValue: {
      fontSize: 16,
      fontWeight: '700',
      color: '#1F2937',
    },
    statsLabel: {
      fontSize: 10,
      color: '#6B7280',
      marginTop: 2,
    },
    statsDivider: {
      width: 1,
      height: 30,
      backgroundColor: '#E5E7EB',
    },

    // Content Container
    contentContainer: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
    },

    // Section Header
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
    },
    sectionSubtitle: {
      fontSize: 12,
      marginTop: 2,
    },
    totalBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      gap: 4,
    },
    totalBadgeText: {
      fontSize: 12,
      fontWeight: '500',
    },

    // List Container
    listContainer: {
      paddingBottom: 80,
    },

    // SKU Row
    skuRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
    },
    skuRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 12,
    },
    skuIndex: {
      width: 28,
      marginRight: 12,
    },
    skuIndexText: {
      fontSize: 13,
      fontWeight: '500',
    },
    skuInfo: {
      flex: 1,
    },
    skuName: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 2,
    },
    skuCode: {
      fontSize: 11,
    },
    skuRowRight: {
      alignItems: 'flex-end',
      gap: 4,
      minWidth: 100,
    },

    // Chips
    itemCountChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: '#E0E7FF',
    },
    itemCountText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#4F46E5',
    },
    stockChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: '#F0FDF4',
    },
    stockChipText: {
      fontSize: 11,
      fontWeight: '500',
    },
    outOfStockChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: '#FEF2F2',
    },
    outOfStockChipText: {
      fontSize: 11,
      fontWeight: '500',
    },

    // Value and Weight
    skuValue: {
      fontSize: 13,
      fontWeight: '700',
      marginTop: 2,
    },
    skuWeight: {
      fontSize: 11,
      fontWeight: '500',
      marginTop: 1,
    },

    // Footer with Summary Preview
    footer: {
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
    },
    footerSummary: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: '#F9FAFB',
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
      gap: 16,
    },
    footerSummaryItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    footerSummaryIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerSummaryLabel: {
      fontSize: 11,
      marginBottom: 2,
    },
    footerSummaryValue: {
      fontSize: 15,
      fontWeight: '700',
    },
    footerSummaryDivider: {
      width: 1,
      height: 36,
      backgroundColor: '#E5E7EB',
    },
    footerActions: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingBottom: 20,
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      flexDirection: 'row',
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    proceedButton: {
      flex: 1.5,
      flexDirection: 'row',
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    proceedButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },

    // Loading & Empty States
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 80,
      gap: 12,
    },
    emptyStateText: {
      fontSize: 16,
      fontWeight: '500',
      marginTop: 8,
    },
    emptyStateSubtext: {
      fontSize: 13,
      textAlign: 'center',
    },
    modalContainer: {
      flex: 1,
    } as ViewStyle,

    modalContent: {
      flex: 1,
      padding: 0,
    } as ViewStyle,
  });
};
