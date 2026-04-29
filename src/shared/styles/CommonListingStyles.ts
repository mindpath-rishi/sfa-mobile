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

    fixedSearchContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100000,
      backgroundColor: colors.primary,
      padding: 10,
      elevation: 3,
      height: 35,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },

    listContent: {
      paddingHorizontal: utils.spacing[2],
    } as ViewStyle,

    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[6],
    } as ViewStyle,

    /* -------------------- Search -------------------- */
    searchContainer: {
      paddingHorizontal: utils.spacing[4],
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
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[2],
      gap: utils.spacing[2],
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    } as ViewStyle,

    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '15',
      borderRadius: utils.borderRadius.full,
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[1],
      gap: utils.spacing[1],
    } as ViewStyle,

    chipText: {
      fontSize: utils.fontSize.xs,
      color: colors.primary,
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,

    chipClear: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.error + '15',
      borderRadius: utils.borderRadius.full,
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[1],
      gap: utils.spacing[1],
    } as ViewStyle,

    chipClearText: {
      fontSize: utils.fontSize.xs,
      color: colors.error,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    /* -------------------- Empty State -------------------- */
    emptyTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
      marginBottom: utils.spacing[2],
      textAlign: 'center',
    } as TextStyle,

    emptyText: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    } as TextStyle,

    /* -------------------- Loading Skeleton -------------------- */
    skeletonContainer: {
      gap: utils.spacing[3],
      paddingHorizontal: utils.spacing[4],
    } as ViewStyle,

    skeletonItem: {
      height: 100,
      borderRadius: utils.borderRadius.lg,
      backgroundColor: colors.surface,
      opacity: 0.7,
    } as ViewStyle,

    /* -------------------- Header -------------------- */
    headerContainer: {
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    /* -------------------- Footer -------------------- */
    footerContainer: {
      paddingVertical: utils.spacing[4],
      alignItems: 'center',
    } as ViewStyle,
  }));

  return styles(colors);
};
