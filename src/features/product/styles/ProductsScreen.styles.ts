// ProductsScreen.styles.ts

import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useProductsScreenStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    // ============ Search Bar ============
    searchWrapper: {
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[2],
    } as ViewStyle,

    // ============ Stats Container ============
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[1],
      gap: utils.spacing[2],
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      backgroundColor: colors.background,
    } as ViewStyle,

    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[0.5],
    } as ViewStyle,

    statText: {
      fontSize: 10,
      color: colors.textSecondary,
    } as TextStyle,

    // ============ Main Content (Sidebar + Products) ============
    mainContent: {
      flex: 1,
      flexDirection: 'row',
    } as ViewStyle,

    // ============ Category Sidebar ============
    categoryContainer: {
      backgroundColor: colors.surface,
      borderRightWidth: 1,
      borderRightColor: colors.divider,
      width: 50, // Fixed width 50px
    } as ViewStyle,

    categoryList: {
      flex: 1,
    } as ViewStyle,

    categoryListContent: {
      paddingVertical: utils.spacing[1],
      paddingHorizontal: utils.spacing[0.5],
    } as ViewStyle,

    categoryItem: {
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 2,
      gap: 2,
      position: 'relative',
    } as ViewStyle,

    categoryItemActive: {
      backgroundColor: colors.primary + '08',
    } as ViewStyle,

    categoryItemAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.divider,
    } as ViewStyle,

    categoryItemAvatarActive: {
      backgroundColor: colors.primary + '15',
    } as ViewStyle,

    categoryItemInitials: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
    } as TextStyle,

    categoryItemInitialsActive: {
      color: colors.primary,
    } as TextStyle,

    categoryItemIcon: {
      fontSize: 16,
    } as TextStyle,

    categoryItemInfo: {
      alignItems: 'center',
      width: '100%',
    } as ViewStyle,

    categoryItemName: {
      fontSize: 8,
      fontWeight: '500',
      color: colors.textPrimary,
      textAlign: 'center',
      lineHeight: 10,
    } as TextStyle,

    categoryItemNameActive: {
      color: colors.primary,
      fontWeight: '600',
    } as TextStyle,

    categoryItemCount: {
      fontSize: 7,
      color: colors.textTertiary,
      textAlign: 'center',
    } as TextStyle,

    categoryItemIndicator: {
      position: 'absolute',
      right: 0,
      top: '15%',
      bottom: '15%',
      width: 2,
      borderTopLeftRadius: 2,
      borderBottomLeftRadius: 2,
    } as ViewStyle,

    // ============ Products Section ============
    productsSection: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    productsList: {
      paddingBottom: 80,
      paddingHorizontal: utils.spacing[2],
      gap: utils.spacing[2],
    } as ViewStyle,

    // ============ Empty State ============
    emptyStateWrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    // ============ Footer Loader ============
    footerLoader: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: utils.spacing[3],
      gap: utils.spacing[2],
    } as ViewStyle,

    loadingMoreText: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
    } as TextStyle,

    // ============ Cart Button ============
    cartButton: {
      position: 'absolute',
      bottom: 16,
      left: 16,
      right: 16,
      borderRadius: 30,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    } as ViewStyle,

    cartButtonGradient: {
      paddingVertical: utils.spacing[3],
      paddingHorizontal: utils.spacing[4],
    } as ViewStyle,

    cartButtonContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as ViewStyle,

    cartButtonLabel: {
      color: 'white',
      fontSize: utils.fontSize.sm,
      fontWeight: '500',
      opacity: 0.9,
      marginBottom: 2,
    } as TextStyle,

    cartButtonTotal: {
      color: 'white',
      fontSize: utils.fontSize.md,
      fontWeight: '700',
    } as TextStyle,

    cartButtonIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    // ============ Skeleton Styles ============
    skeletonContainer: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    skeletonMainContent: {
      flex: 1,
      flexDirection: 'row',
    } as ViewStyle,

    skeletonCategoryList: {
      backgroundColor: colors.surface,
      padding: utils.spacing[1],
      gap: utils.spacing[1],
      width: 50,
    } as ViewStyle,

    skeletonCategoryItem: {
      marginBottom: utils.spacing[1],
    } as ViewStyle,

    skeletonProductsList: {
      padding: utils.spacing[2],
      gap: utils.spacing[2],
    } as ViewStyle,

    skeletonProductItem: {
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    // Add these styles to your ProductsScreen.styles.ts

    // Quick Filters
    quickFiltersContainer: {
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[1.5],
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,

    quickFiltersContent: {
      gap: utils.spacing[2],
    } as ViewStyle,

    quickFilterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[1.5],
      borderRadius: 20,
      gap: utils.spacing[1.5],
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    quickFilterChipActive: {
      backgroundColor: colors.primary + '10',
      borderColor: colors.primary,
    } as ViewStyle,

    quickFilterText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
    } as TextStyle,

    quickFilterTextActive: {
      color: colors.primary,
    } as TextStyle,

    // Skeleton Quick Filters
    skeletonQuickFilters: {
      flexDirection: 'row',
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[1.5],
      gap: utils.spacing[2],
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
