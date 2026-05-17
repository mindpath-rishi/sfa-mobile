import { type TextStyle, type ViewStyle } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { createStyles } from '@/shared/theme/styles';

export const useCommonListingStyles = () => {
  const { colors } = useTheme();

  const styles = createStyles((utils) => ({
    /* -------------------- Container -------------------- */
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    /* -------------------- Fixed Search Container -------------------- */
    fixedSearchContainer: {
      backgroundColor: colors.background,
      paddingHorizontal: utils.spacing[3],
      paddingTop: utils.spacing[2],
      paddingBottom: utils.spacing[2],
      borderBottomWidth: 0.5,
      borderBottomColor: colors.divider,
      zIndex: 10,
    } as ViewStyle,

    /* -------------------- List Content -------------------- */
    listContent: {
      paddingHorizontal: utils.spacing[2],
      paddingBottom: utils.spacing[4],
    } as ViewStyle,

    /* -------------------- Empty State Container -------------------- */
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[8],
    } as ViewStyle,

    /* -------------------- Search Container (Deprecated - use fixedSearchContainer) -------------------- */
    searchContainer: {
      paddingHorizontal: utils.spacing[3],
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    searchInput: {
      flex: 1,
      fontSize: utils.fontSize.sm,
      color: colors.textPrimary,
      paddingVertical: 0,
    } as TextStyle,

    /* -------------------- Filter Chips -------------------- */
    filterContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[2],
      gap: utils.spacing[2],
      borderBottomWidth: 0.5,
      borderBottomColor: colors.divider,
      backgroundColor: colors.background,
    } as ViewStyle,

    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '10',
      borderRadius: 14,
      paddingHorizontal: utils.spacing[2.5],
      paddingVertical: utils.spacing[1.25],
      gap: utils.spacing[1.5],
    } as ViewStyle,

    chipText: {
      fontSize: utils.fontSize.xs,
      color: colors.primary,
      fontWeight: '500',
    } as TextStyle,

    chipClear: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingHorizontal: utils.spacing[2.5],
      paddingVertical: utils.spacing[1.25],
      gap: utils.spacing[1.5],
      borderWidth: 0.5,
      borderColor: colors.border,
    } as ViewStyle,

    chipClearText: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      fontWeight: '500',
    } as TextStyle,

    /* -------------------- Header Container -------------------- */
    headerContainer: {
      marginBottom: utils.spacing[1],
    } as ViewStyle,

    /* -------------------- Footer Container -------------------- */
    footerContainer: {
      paddingVertical: utils.spacing[3],
      alignItems: 'center',
    } as ViewStyle,

    /* -------------------- Loading Skeleton -------------------- */
    skeletonContainer: {
      gap: utils.spacing[3],
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[2],
    } as ViewStyle,

    skeletonItem: {
      height: 100,
      borderRadius: utils.borderRadius.lg,
      backgroundColor: colors.surface,
    } as ViewStyle,
  }));

  return styles(colors);
};
