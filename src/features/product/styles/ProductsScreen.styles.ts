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

    // ============ Quick Filters ============
    quickFiltersContainer: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 12,
      backgroundColor: colors.background,
    } as ViewStyle,

    quickFiltersContent: {
      gap: 10,
    } as ViewStyle,

    quickFilterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 6,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    quickFilterChipActive: {
      backgroundColor: colors.primary + '10',
      borderColor: colors.primary,
    } as ViewStyle,

    quickFilterText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
    } as TextStyle,

    quickFilterTextActive: {
      color: colors.primary,
    } as TextStyle,

    // ============ Main Content ============
    mainContent: {
      flex: 1,
      flexDirection: 'row',
    } as ViewStyle,

    // ============ Category Sidebar ============
    categoryContainer: {
      backgroundColor: colors.surface,
    } as ViewStyle,

    categoryList: {
      flex: 1,
    } as ViewStyle,

    categoryListContent: {
      paddingVertical: 8,
    } as ViewStyle,

    categoryItem: {
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 4,
      gap: 4,
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
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    categoryItemAvatarActive: {
      backgroundColor: colors.primary + '15',
      borderColor: colors.primary,
    } as ViewStyle,

    categoryItemInitials: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    } as TextStyle,

    categoryItemInitialsActive: {
      color: colors.primary,
    } as TextStyle,

    categoryItemName: {
      fontSize: 9,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 11,
    } as TextStyle,

    categoryItemNameActive: {
      color: colors.primary,
      fontWeight: '600',
    } as TextStyle,

    categoryItemCount: {
      fontSize: 8,
      fontWeight: '400',
      color: colors.textTertiary,
      textAlign: 'center',
    } as TextStyle,

    categoryItemIndicator: {
      position: 'absolute',
      right: 0,
      top: '20%',
      bottom: '20%',
      width: 3,
      borderTopLeftRadius: 2,
      borderBottomLeftRadius: 2,
    } as ViewStyle,

    // ============ Products Section ============
    productsSection: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    productsList: {
      paddingBottom: 90,
      paddingHorizontal: 12,
      gap: 12,
    } as ViewStyle,

    // ============ Empty State ============
    emptyStateWrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    } as ViewStyle,

    // ============ Footer Loader ============
    footerLoader: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
      gap: 12,
    } as ViewStyle,

    loadingMoreText: {
      fontSize: 12,
      fontWeight: '400',
      color: colors.textSecondary,
    } as TextStyle,

    // ============ Action Button ============
    cartButtonWrapper: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'transparent',
      paddingHorizontal: 16,
      paddingTop: 8,
      zIndex: 1000,
      elevation: 1000,
    } as ViewStyle,

    cartButton: {
      width: '100%',
      borderRadius: 12,
      overflow: 'hidden',
    } as ViewStyle,

    cartButtonGradient: {
      paddingVertical: 14,
      paddingHorizontal: 20,
    } as ViewStyle,

    cartButtonContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as ViewStyle,

    cartButtonLabel: {
      color: 'white',
      fontSize: 15,
      fontWeight: '600',
    } as TextStyle,

    // ============ Skeleton Styles ============
    skeletonContainer: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    skeletonQuickFilters: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 10,
    } as ViewStyle,

    skeletonMainContent: {
      flex: 1,
      flexDirection: 'row',
    } as ViewStyle,

    skeletonCategoryList: {
      backgroundColor: colors.surface,
      paddingVertical: 8,
      gap: 8,
      width: 60,
    } as ViewStyle,

    skeletonCategoryItem: {
      paddingHorizontal: 12,
      marginBottom: 8,
    } as ViewStyle,

    skeletonProductsList: {
      padding: 12,
      gap: 12,
      flex: 1,
    } as ViewStyle,

    skeletonProductItem: {
      marginBottom: 12,
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
