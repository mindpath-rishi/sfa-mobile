import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useTopupListStyles = () => {
  const { colors } = useTheme();

  const styles = createStyles((utils) => ({
    listContent: {
      padding: utils.spacing[3],
      gap: utils.spacing[2],
    } as ViewStyle,

    filterChipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: utils.spacing[3],
      gap: utils.spacing[2],
    } as ViewStyle,

    filterChip: {
      backgroundColor: colors.primary + '10',
      paddingHorizontal: utils.spacing[2.5],
      paddingVertical: utils.spacing[1.25],
      borderRadius: 20,
    } as ViewStyle,

    filterChipText: {
      fontSize: utils.fontSize.xs,
      color: colors.primary,
      fontWeight: '500',
    } as TextStyle,

    clearAllChip: {
      backgroundColor: colors.surface,
      paddingHorizontal: utils.spacing[2.5],
      paddingVertical: utils.spacing[1.25],
      borderRadius: 20,
      borderWidth: 0.5,
      borderColor: colors.border,
    } as ViewStyle,

    clearAllText: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      fontWeight: '500',
    } as TextStyle,

    itemContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: utils.spacing[3],
      marginBottom: utils.spacing[2],
      borderWidth: 0.5,
      borderColor: colors.divider,
    } as ViewStyle,

    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    title: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 2,
    } as TextStyle,

    reference: {
      fontSize: utils.fontSize.xs - 1,
      color: colors.textTertiary,
    } as TextStyle,

    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[0.75],
      borderRadius: 20,
      gap: utils.spacing[0.75],
    } as ViewStyle,

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    } as ViewStyle,

    statusText: {
      fontSize: utils.fontSize.xs - 1,
      fontWeight: '500',
    } as TextStyle,

    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    metaText: {
      fontSize: utils.fontSize.xs - 1,
      color: colors.textTertiary,
    } as TextStyle,

    amountSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: utils.spacing[2],
      marginBottom: utils.spacing[2],
      paddingTop: utils.spacing[2],
      // borderTopWidth: 0.5,
      borderTopColor: colors.divider,
    } as ViewStyle,

    amountBlock: { flex: 1 } as ViewStyle,

    amountLabel: {
      fontSize: utils.fontSize.xs - 1,
      fontWeight: '500',
      color: colors.textTertiary,
      marginBottom: 4,
    } as TextStyle,

    amountValue: {
      fontSize: utils.fontSize.md,
      fontWeight: '700',
      marginBottom: 4,
    } as TextStyle,

    quantityText: {
      fontSize: utils.fontSize.xs - 1,
      color: colors.textSecondary,
    } as TextStyle,

    infoRow: {
      paddingVertical: utils.spacing[1],
      paddingHorizontal: utils.spacing[2],
      backgroundColor: colors.background,
      borderRadius: 8,
      marginTop: utils.spacing[1],
    } as ViewStyle,

    infoText: {
      fontSize: utils.fontSize.xs - 1,
      color: colors.success,
    } as TextStyle,

    errorRow: { backgroundColor: colors.error + '08' } as ViewStyle,

    errorText: {
      fontSize: utils.fontSize.xs - 1,
      color: colors.error,
    } as TextStyle,

    pendingRow: { backgroundColor: colors.warning + '08' } as ViewStyle,

    pendingInfoText: {
      fontSize: utils.fontSize.xs - 1,
      color: colors.warning,
    } as TextStyle,

    skeletonContainer: { gap: utils.spacing[2] } as ViewStyle,

    skeletonItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: utils.spacing[3],
      gap: utils.spacing[2],
      borderWidth: 0.5,
      borderColor: colors.divider,
    } as ViewStyle,

    skeletonHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as ViewStyle,

    skeletonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: utils.spacing[2],
    } as ViewStyle,

    emptyContainer: {
      alignItems: 'center',
      padding: utils.spacing[4],
      gap: utils.spacing[2],
    } as ViewStyle,

    emptyTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    emptyDescription: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    } as TextStyle,

    emptyAction: {
      fontSize: utils.fontSize.sm,
      color: colors.primary,
      fontWeight: '500',
      marginTop: utils.spacing[2],
    } as TextStyle,
  }));

  return styles(colors);
};
