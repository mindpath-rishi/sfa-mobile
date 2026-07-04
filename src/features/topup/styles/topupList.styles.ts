import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useTopupListStyles = () => {
  const { colors } = useTheme();

  const styles = createStyles((utils) => ({
    listContent: {
      paddingHorizontal: utils.spacing[3],
      paddingTop: utils.spacing[2],
      paddingBottom: 32,
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
      paddingVertical: 5,
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
      paddingVertical: 5,
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
      borderRadius: 18,
      padding: 16,
      marginBottom: utils.spacing[2],
      borderWidth: 1,
      borderColor: colors.borderLight,
      overflow: 'hidden',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 3,
    } as ViewStyle,

    cardAccent: {
      position: 'absolute',
      left: 0,
      top: 16,
      bottom: 16,
      width: 3,
      borderTopRightRadius: 4,
      borderBottomRightRadius: 4,
    } as ViewStyle,

    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    } as ViewStyle,

    titleGroup: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 } as ViewStyle,
    titleCopy: { flex: 1 } as ViewStyle,
    vanIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary + '10',
    } as ViewStyle,

    title: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 2,
    } as TextStyle,

    reference: {
      fontSize: 11,
      color: colors.textTertiary,
    } as TextStyle,

    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[2],
      paddingVertical: 3,
      borderRadius: 20,
      gap: 3,
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
      marginBottom: 12,
      paddingHorizontal: 2,
    } as ViewStyle,

    metaItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 } as ViewStyle,

    metaText: {
      fontSize: utils.fontSize.xs - 1,
      color: colors.textTertiary,
    } as TextStyle,

    amountSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: utils.spacing[2],
      marginBottom: 10,
    } as ViewStyle,

    amountBlock: { flex: 1, padding: 12, borderRadius: 12 } as ViewStyle,
    requestedBlock: { backgroundColor: colors.backgroundTertiary } as ViewStyle,
    approvedBlock: { backgroundColor: colors.success + '0D' } as ViewStyle,

    amountLabel: {
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: colors.textTertiary,
      marginBottom: 4,
    } as TextStyle,

    amountValue: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: 4,
    } as TextStyle,

    quantityText: {
      fontSize: 10,
      color: colors.textSecondary,
    } as TextStyle,

    quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 6 } as ViewStyle,
    quantityDot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: colors.textTertiary,
    } as ViewStyle,

    infoRow: {
      paddingVertical: utils.spacing[1],
      paddingHorizontal: utils.spacing[2],
      backgroundColor: colors.background,
      borderRadius: 8,
      marginTop: utils.spacing[1],
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
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
      borderRadius: 18,
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
