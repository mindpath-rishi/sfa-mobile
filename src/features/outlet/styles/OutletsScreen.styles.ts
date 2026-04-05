// styles/CustomersScreen.styles.ts
import { ViewStyle, TextStyle, Platform } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useOutletsScreenStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    // ─── Layout ──────────────────────────────────────────────────────────────
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: utils.spacing[2],
    } as ViewStyle,

    // ─── Header ──────────────────────────────────────────────────────────────
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[4],
      paddingBottom: utils.spacing[2],
    } as ViewStyle,

    headerTitle: {
      fontSize: utils.fontSize['2xl'],
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
    } as TextStyle,

    // ─── Filter Button ───────────────────────────────────────────────────────
    filterButton: {
      width: 40,
      height: 40,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
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
      borderRadius: utils.borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[1],
      backgroundColor: colors.primary,
    } as ViewStyle,

    filterBadgeText: {
      color: colors.textInverse,
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('bold'),
    } as TextStyle,

    // ─── Search Bar ─────────────────────────────────────────────────────────
    searchWrapper: {
      paddingHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    // ─── Quick Filters ──────────────────────────────────────────────────────
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
      borderRadius: utils.borderRadius.full,
      gap: utils.spacing[1],
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.textInverse,
    } as TextStyle,

    // ─── Results Header ─────────────────────────────────────────────────────
    resultsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    resultsCount: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
    } as TextStyle,

    viewToggle: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.md,
      padding: utils.spacing[0.5],
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,

    viewToggleButton: {
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
      borderRadius: utils.borderRadius.sm,
    } as ViewStyle,

    viewToggleButtonActive: {
      backgroundColor: colors.primary,
    } as ViewStyle,

    // ─── Section Header ─────────────────────────────────────────────────────
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[2],
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,

    sectionTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
    } as TextStyle,

    sectionCount: {
      fontSize: utils.fontSize.sm,
      color: colors.textTertiary,
      backgroundColor: colors.border + '15',
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[0.5],
      borderRadius: utils.borderRadius.md,
      overflow: 'hidden',
    } as TextStyle,

    // ─── List Content ───────────────────────────────────────────────────────
    listContent: {
      paddingBottom: utils.spacing[4],
    } as ViewStyle,

    // ─── Loading Footer ─────────────────────────────────────────────────────
    footerLoader: {
      paddingVertical: utils.spacing[4],
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    // ─── Floating Action Button ─────────────────────────────────────────────
    fab: {
      position: 'absolute',
      bottom: utils.spacing[5],
      right: utils.spacing[5],
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primary,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        android: {
          elevation: 8,
        },
      }),
    } as ViewStyle,

    // ─── Empty State ────────────────────────────────────────────────────────
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
      fontWeight: utils.getFontWeight('semibold'),
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
    } as TextStyle,

    emptyStateButton: {
      paddingHorizontal: utils.spacing[5],
      paddingVertical: utils.spacing[2.5],
      backgroundColor: colors.primary + '10',
      borderRadius: utils.borderRadius.full,
      minWidth: 140,
      alignItems: 'center',
    } as ViewStyle,

    emptyStateButtonText: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.primary,
    } as TextStyle,

    // ─── Modal ──────────────────────────────────────────────────────────────
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
    } as ViewStyle,

    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: utils.borderRadius.xl,
      borderTopRightRadius: utils.borderRadius.xl,
      maxHeight: '80%',
    } as ViewStyle,

    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,

    modalTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
    } as TextStyle,

    modalCloseButton: {
      width: 32,
      height: 32,
      borderRadius: utils.borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.border + '20',
    } as ViewStyle,

    modalSection: {
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,

    modalSectionTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
      marginBottom: utils.spacing[2],
    } as TextStyle,

    modalFooter: {
      flexDirection: 'row',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      gap: utils.spacing[2],
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    } as ViewStyle,

    resetButton: {
      flex: 1,
      paddingVertical: utils.spacing[3],
      borderRadius: utils.borderRadius.full,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    } as ViewStyle,

    resetButtonText: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.textSecondary,
    } as TextStyle,

    doneButton: {
      flex: 2,
      paddingVertical: utils.spacing[3],
      borderRadius: utils.borderRadius.full,
      alignItems: 'center',
      backgroundColor: colors.primary,
    } as ViewStyle,

    doneButtonText: {
      color: colors.textInverse,
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
