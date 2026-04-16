// DayEndSummaryModal.styles.ts
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export const useDayEndSummaryModalStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    // DayEndSummaryModal.styles.ts - Update these specific styles

    // Product Stats - Increased font sizes
    productStatLabel: {
      fontSize: 12, // Increased from 10
      marginBottom: 6, // Increased from 4
      color: colors.textSecondary,
      fontWeight: '500',
    } as TextStyle,

    productStatValue: {
      fontSize: 16, // Increased from 13
      fontWeight: '700',
    } as TextStyle,

    productStatSub: {
      fontSize: 11, // Increased from 9
      marginTop: 3, // Increased from 2
      color: colors.textTertiary,
    } as TextStyle,

    // Product Name - Increased size
    productName: {
      fontSize: 15, // Increased from 14
      fontWeight: '600',
      marginBottom: 3, // Increased from 2
      color: colors.textPrimary,
    } as TextStyle,

    // Product Code
    productCode: {
      fontSize: 12, // Increased from 11
      color: colors.textSecondary,
    } as TextStyle,

    // Product Index
    productIndexText: {
      fontSize: 15, // Increased from 14
      fontWeight: '700',
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
      width: 85,
      fontSize: 15, // Increased from 14
      fontWeight: '600',
      textAlign: 'center',
    } as TextStyle,

    financialItemsText: {
      width: 55,
      fontSize: 15, // Increased from 14
      fontWeight: '700',
      textAlign: 'center',
    } as TextStyle,

    financialValueText: {
      width: 75,
      fontSize: 15, // Increased from 14
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

    // ============================
    // Tab Bar
    // ============================
    tabBar: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
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
      borderRadius: 16,
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
      borderRadius: 16,
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
      gap: 12,
    } as ViewStyle,

    statsCardItem: {
      flex: 1,
      minWidth: '30%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 10,
      borderRadius: 10,
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
      width: 85,
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
      width: 75,
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
      padding: 16,
      paddingBottom: 24,
      gap: 10,
    } as ViewStyle,

    productCard: {
      padding: 14,
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
      justifyContent: 'space-between',
      marginBottom: 12,
    } as ViewStyle,

    productStat: {
      flex: 1,
      alignItems: 'center',
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
