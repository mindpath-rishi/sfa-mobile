import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useProductsScreenStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: utils.spacing[2],
    } as ViewStyle,

    // Header Styles
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[4],
      paddingBottom: utils.spacing[2],
    } as ViewStyle,

    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.textPrimary,
    } as TextStyle,

    filterButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    } as ViewStyle,

    filterButtonActive: {
      backgroundColor: colors.primary + '10',
    } as ViewStyle,

    filterBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
    } as ViewStyle,

    filterBadgeText: {
      color: 'white',
      fontSize: 10,
      fontWeight: '700',
    } as TextStyle,

    // Search Bar
    searchWrapper: {
      paddingHorizontal: utils.spacing[2],
      marginBottom: utils.spacing[2],
      marginTop: utils.spacing[2],
    } as ViewStyle,

    // Quick Filters
    quickFiltersContainer: {
      maxHeight: 44,
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    quickFiltersContent: {
      paddingHorizontal: utils.spacing[4],
      gap: utils.spacing[2],
    } as ViewStyle,

    quickFilterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[1.5],
      backgroundColor: colors.surface,
      borderRadius: 20,
      gap: utils.spacing[1],
      borderWidth: 1,
      borderColor: colors.border + '30',
    } as ViewStyle,

    quickFilterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    } as ViewStyle,

    quickFilterText: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
    } as TextStyle,

    quickFilterTextActive: {
      color: 'white',
    } as TextStyle,

    // Results Header
    resultsHeader: {
      paddingHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    resultsCount: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
    } as TextStyle,

    // List View
    listContent: {
      paddingBottom: 80,
      gap: utils.spacing[2],
    } as ViewStyle,

    // Loading Footer
    footerLoader: {
      paddingVertical: utils.spacing[4],
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    // Empty State
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[6],
      marginTop: -100,
    } as ViewStyle,

    emptyStateIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.border + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    emptyStateTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: utils.spacing[2],
      textAlign: 'center',
    } as TextStyle,

    emptyStateText: {
      fontSize: utils.fontSize.md,
      color: colors.textTertiary,
      textAlign: 'center',
      marginBottom: utils.spacing[4],
      lineHeight: 22,
      paddingHorizontal: utils.spacing[4],
    } as TextStyle,

    clearFiltersButton: {
      paddingHorizontal: utils.spacing[5],
      paddingVertical: utils.spacing[2.5],
      backgroundColor: colors.primary + '10',
      borderRadius: 20,
      minWidth: 140,
      alignItems: 'center',
    } as ViewStyle,

    clearFiltersText: {
      fontSize: utils.fontSize.md,
      fontWeight: '600',
      color: colors.primary,
    } as TextStyle,

    // Cart Button
    cartButton: {
      position: 'absolute',
      bottom: 16,
      left: 16,
      right: 16,
      borderRadius: 30,
      paddingVertical: utils.spacing[3],
      paddingHorizontal: utils.spacing[4],
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    } as ViewStyle,

    cartButtonContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as ViewStyle,

    cartButtonLabel: {
      color: 'white',
      fontSize: utils.fontSize.sm,
      opacity: 0.9,
      marginBottom: 2,
    } as TextStyle,

    cartButtonTotal: {
      color: 'white',
      fontSize: utils.fontSize.md,
      fontWeight: '700',
    } as TextStyle,

    // Modal styles (kept for backward compatibility)
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    } as ViewStyle,

    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
    } as ViewStyle,

    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '30',
    } as ViewStyle,

    modalTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    modalSection: {
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '20',
    } as ViewStyle,

    modalSectionTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: utils.spacing[2],
    } as TextStyle,

    modalFooter: {
      flexDirection: 'row',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      gap: utils.spacing[2],
      borderTopWidth: 1,
      borderTopColor: colors.border + '30',
    } as ViewStyle,

    resetButton: {
      flex: 1,
      paddingVertical: utils.spacing[3],
      borderRadius: 25,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border + '30',
    } as ViewStyle,

    resetButtonText: {
      fontSize: utils.fontSize.md,
      fontWeight: '500',
      color: colors.textSecondary,
    } as TextStyle,

    doneButton: {
      flex: 2,
      paddingVertical: utils.spacing[3],
      borderRadius: 25,
      alignItems: 'center',
    } as ViewStyle,

    doneButtonText: {
      color: 'white',
      fontSize: utils.fontSize.md,
      fontWeight: '600',
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
