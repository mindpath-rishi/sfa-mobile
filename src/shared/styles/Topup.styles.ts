// VanInventoryTopupListingPage.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useVanInventoryTopupStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    // Container
    pageContainer: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    // Header
    pageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[12],
      paddingBottom: utils.spacing[4],
      borderBottomWidth: 1,
    } as ViewStyle,

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    pageTitle: {
      fontSize: utils.fontSize.xl,
      fontWeight: '700',
    } as TextStyle,

    refreshButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    // Search and Filter
    searchFilterContainer: {
      flexDirection: 'row',
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[4],
      paddingBottom: utils.spacing[2],
      gap: utils.spacing[2],
    } as ViewStyle,

    searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[2],
      borderRadius: 12,
      borderWidth: 1,
      gap: utils.spacing[2],
    } as ViewStyle,

    searchInput: {
      flex: 1,
      fontSize: utils.fontSize.md,
      paddingVertical: utils.spacing[1],
    } as TextStyle,

    filterButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    } as ViewStyle,

    filterBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: colors.primary,
      borderRadius: 10,
      minWidth: 18,
      height: 18,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    } as ViewStyle,

    filterBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    } as TextStyle,

    // Active Filters
    activeFiltersContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[2],
      gap: utils.spacing[2],
    } as ViewStyle,

    activeFilterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
      borderRadius: 16,
      gap: utils.spacing[1],
    } as ViewStyle,

    activeFilterText: {
      fontSize: utils.fontSize.xs,
      fontWeight: '500',
    } as TextStyle,

    // Stats Summary
    statsSummary: {
      flexDirection: 'row',
      marginHorizontal: utils.spacing[4],
      marginTop: utils.spacing[2],
      marginBottom: utils.spacing[3],
      padding: utils.spacing[3],
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,

    statSummaryItem: {
      flex: 1,
      alignItems: 'center',
    } as ViewStyle,

    statSummaryValue: {
      fontSize: utils.fontSize.xl,
      fontWeight: '700',
      marginBottom: utils.spacing[0.5],
    } as TextStyle,

    statSummaryLabel: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    statSummaryDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginHorizontal: utils.spacing[2],
    } as ViewStyle,

    // List
    listContainer: {
      paddingHorizontal: utils.spacing[4],
      paddingBottom: utils.spacing[4],
      gap: utils.spacing[3],
    } as ViewStyle,

    // Top-up Card
    topupCard: {
      borderRadius: 12,
      borderWidth: 1,
      overflow: 'hidden',
    } as ViewStyle,

    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: utils.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    } as ViewStyle,

    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
    } as ViewStyle,

    headerInfo: {
      gap: utils.spacing[0.5],
    } as ViewStyle,

    topupId: {
      fontSize: utils.fontSize.md,
      fontWeight: '600',
    } as TextStyle,

    vanName: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
      borderRadius: 12,
      gap: utils.spacing[0.5],
    } as ViewStyle,

    statusText: {
      fontSize: utils.fontSize.xs,
      fontWeight: '600',
    } as TextStyle,

    cardDetails: {
      padding: utils.spacing[3],
      gap: utils.spacing[2],
    } as ViewStyle,

    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    } as ViewStyle,

    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
    } as ViewStyle,

    detailText: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingVertical: utils.spacing[2],
    } as ViewStyle,

    statItem: {
      flex: 1,
      alignItems: 'center',
    } as ViewStyle,

    statValue: {
      fontSize: utils.fontSize.md,
      fontWeight: '700',
      marginBottom: utils.spacing[0.5],
    } as TextStyle,

    statLabel: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    statDivider: {
      width: 1,
      height: 30,
      backgroundColor: colors.border,
    } as ViewStyle,

    approvedStats: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      paddingTop: utils.spacing[2],
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: utils.spacing[1],
    } as ViewStyle,

    approvedLabel: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    approvedValue: {
      fontSize: utils.fontSize.xs,
      fontWeight: '500',
    } as TextStyle,

    remarkContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: utils.spacing[1],
      gap: utils.spacing[1],
    } as ViewStyle,

    remarkText: {
      flex: 1,
      fontSize: utils.fontSize.xs,
      fontStyle: 'italic',
    } as TextStyle,

    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: utils.spacing[2],
      paddingHorizontal: utils.spacing[3],
      borderTopWidth: 1,
      gap: utils.spacing[1],
    } as ViewStyle,

    footerText: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    } as ViewStyle,

    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: utils.spacing[4],
      maxHeight: '80%',
    } as ViewStyle,

    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    modalTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: '600',
    } as TextStyle,

    filterSection: {
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    filterLabel: {
      fontSize: utils.fontSize.sm,
      fontWeight: '500',
      marginBottom: utils.spacing[2],
    } as TextStyle,

    statusFilterContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: utils.spacing[2],
    } as ViewStyle,

    statusFilterChip: {
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[1.5],
      borderRadius: 20,
      borderWidth: 1,
    } as ViewStyle,

    statusFilterText: {
      fontSize: utils.fontSize.sm,
    } as TextStyle,

    filterActions: {
      flexDirection: 'row',
      gap: utils.spacing[3],
      marginTop: utils.spacing[4],
    } as ViewStyle,

    clearFilterButton: {
      flex: 1,
      paddingVertical: utils.spacing[3],
      borderRadius: 10,
      borderWidth: 1,
      alignItems: 'center',
    } as ViewStyle,

    clearFilterText: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
    } as TextStyle,

    applyFilterButton: {
      flex: 2,
      paddingVertical: utils.spacing[3],
      borderRadius: 10,
      alignItems: 'center',
    } as ViewStyle,

    applyFilterText: {
      color: '#FFFFFF',
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
    } as TextStyle,

    // Loading States
    loadingFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[4],
      gap: utils.spacing[2],
    } as ViewStyle,

    loadingFooterText: {
      fontSize: utils.fontSize.sm,
    } as TextStyle,

    // Empty State
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[12],
    } as ViewStyle,

    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    emptyStateText: {
      fontSize: utils.fontSize.md,
      fontWeight: '500',
      marginBottom: utils.spacing[1],
    } as TextStyle,

    emptyStateSubtext: {
      fontSize: utils.fontSize.sm,
      textAlign: 'center',
    } as TextStyle,
    // Add to your Topup.styles.ts

    fabContainer: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      zIndex: 999, // 🔥 important
      elevation: 5, // Android
    },

    fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
