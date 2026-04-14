// StockPage.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useStockPageStyles = () => {
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

    // Load Number
    loadNumberContainer: {
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[4],
      paddingBottom: utils.spacing[2],
    } as ViewStyle,

    loadNumberBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[1.5],
      borderRadius: 20,
      gap: utils.spacing[1.5],
    } as ViewStyle,

    loadNumberText: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
    } as TextStyle,

    // Stock Overview Card
    stockOverviewCard: {
      margin: utils.spacing[4],
      padding: utils.spacing[4],
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    } as ViewStyle,

    overviewTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: '600',
      marginBottom: utils.spacing[3],
    } as TextStyle,

    stockStatsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    } as ViewStyle,

    stockStatItem: {
      alignItems: 'center',
    } as ViewStyle,

    stockStatValue: {
      fontSize: utils.fontSize.xl,
      fontWeight: '700',
      marginBottom: utils.spacing[1],
    } as TextStyle,

    stockStatLabel: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    // Summary Section
    summarySection: {
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[2],
      paddingBottom: utils.spacing[2],
    } as ViewStyle,

    sectionTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: '600',
      marginBottom: utils.spacing[3],
    } as TextStyle,

    statsContainer: {
      paddingBottom: utils.spacing[2],
    } as ViewStyle,

    statsGrid: {
      justifyContent: 'space-between',
      gap: utils.spacing[3],
    } as ViewStyle,

    statCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: utils.spacing[3],
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: utils.spacing[3],
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    } as ViewStyle,

    statIconContainer: {
      marginRight: utils.spacing[3],
    } as ViewStyle,

    statIconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    statContent: {
      flex: 1,
    } as ViewStyle,

    statLabel: {
      fontSize: utils.fontSize.xs,
      marginBottom: utils.spacing[0.5],
    } as TextStyle,

    statValue: {
      fontSize: utils.fontSize.lg,
      fontWeight: '700',
    } as TextStyle,

    // SKU Section
    skuSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[2],
      paddingBottom: utils.spacing[3],
    } as ViewStyle,

    skuTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
    } as ViewStyle,

    skuCountBadge: {
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
      borderRadius: 12,
    } as ViewStyle,

    skuCountText: {
      fontSize: utils.fontSize.xs,
      fontWeight: '600',
    } as TextStyle,

    // Search Bar
    searchContainer: {
      paddingHorizontal: utils.spacing[4],
      paddingBottom: utils.spacing[3],
    } as ViewStyle,

    searchBar: {
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

    searchResultsText: {
      fontSize: utils.fontSize.xs,
      marginTop: utils.spacing[1],
      marginLeft: utils.spacing[1],
    } as TextStyle,

    // SKU List
    skuListContainer: {
      paddingHorizontal: utils.spacing[4],
      paddingBottom: utils.spacing[4],
      gap: utils.spacing[3],
    } as ViewStyle,

    skuCard: {
      borderRadius: 12,
      padding: utils.spacing[3],
      borderWidth: 1,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    } as ViewStyle,

    skuHeaderCompact: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    skuLeftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: utils.spacing[2],
    } as ViewStyle,

    skuIndexBadgeCompact: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    } as ViewStyle,

    skuIndexTextCompact: {
      fontSize: utils.fontSize.sm,
      fontWeight: '700',
    } as TextStyle,

    skuProductInfo: {
      flex: 1,
    } as ViewStyle,

    skuNameCompact: {
      fontSize: utils.fontSize.md,
      fontWeight: '600',
      marginBottom: utils.spacing[0.5],
    } as TextStyle,

    skuCodeCompact: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    skuStatusBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    skuDetailsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: utils.spacing[2],
      borderTopWidth: 1,
      borderTopColor: colors.border,
    } as ViewStyle,

    skuDetailItem: {
      flex: 1,
    } as ViewStyle,

    skuDetailLabel: {
      fontSize: utils.fontSize.xs,
      marginBottom: utils.spacing[0.5],
    } as TextStyle,

    skuDetailValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: '500',
    } as TextStyle,

    outOfStockBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
    } as ViewStyle,

    outOfStockText: {
      fontSize: utils.fontSize.sm,
      fontWeight: '500',
    } as TextStyle,

    outOfStockOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 12,
      pointerEvents: 'none',
    } as ViewStyle,

    // Loading States
    loadingContainer: {
      paddingVertical: utils.spacing[8],
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    loadingText: {
      marginTop: utils.spacing[3],
      fontSize: utils.fontSize.sm,
    } as TextStyle,

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
  }));

  return styleGenerator(colors);
};
