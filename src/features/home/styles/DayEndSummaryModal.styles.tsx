// DayEndSummaryModal.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useDayEndSummaryModalStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    modalContent: {
      flex: 1,
      padding: 0,
    } as ViewStyle,

    container: {
      flex: 1,
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[2],
    } as ViewStyle,

    dateSection: {
      alignItems: 'center',
      marginBottom: utils.spacing[5],
      marginTop: utils.spacing[2],
    } as ViewStyle,

    dateBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: utils.spacing[2],
      paddingHorizontal: utils.spacing[4],
      borderRadius: 20,
      gap: utils.spacing[2],
    } as ViewStyle,

    dateText: {
      fontSize: utils.fontSize.sm,
      fontWeight: '500',
    } as TextStyle,

    summaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: utils.spacing[3],
      marginBottom: utils.spacing[5],
    } as ViewStyle,

    summaryCard: {
      width: '48%',
      borderRadius: 16,
      overflow: 'hidden',
    } as ViewStyle,

    summaryGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: utils.spacing[3],
      gap: utils.spacing[3],
    } as ViewStyle,

    summaryIcon: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    summaryContent: {
      flex: 1,
    } as ViewStyle,

    summaryValue: {
      fontSize: utils.fontSize.md,
      fontWeight: '700',
      marginBottom: utils.spacing[0.5],
    } as TextStyle,

    summaryLabel: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    productsSection: {
      flex: 1,
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    sectionTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: '600',
      flex: 1,
    } as TextStyle,

    productBadge: {
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[0.5],
      borderRadius: 12,
      minWidth: 32,
      alignItems: 'center',
    } as ViewStyle,

    productBadgeText: {
      fontSize: utils.fontSize.sm,
      fontWeight: '700',
    } as TextStyle,

    productsList: {
      gap: utils.spacing[2],
    } as ViewStyle,

    productItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: utils.spacing[3],
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,

    productHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: utils.spacing[2],
      gap: utils.spacing[2],
    } as ViewStyle,

    productNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary + '10',
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    productNumberText: {
      fontSize: utils.fontSize.sm,
      fontWeight: '700',
    } as TextStyle,

    productInfo: {
      flex: 1,
    } as ViewStyle,

    productName: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
      marginBottom: utils.spacing[0.5],
    } as TextStyle,

    productMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: utils.spacing[1],
    } as ViewStyle,

    productId: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    dot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: colors.textTertiary,
    } as ViewStyle,

    productUnit: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    productValue: {
      alignItems: 'flex-end',
    } as ViewStyle,

    productValueText: {
      fontSize: utils.fontSize.sm,
      fontWeight: '700',
    } as TextStyle,

    statsRow: {
      flexDirection: 'row',
      gap: utils.spacing[2],
      paddingTop: utils.spacing[2],
      borderTopWidth: 1,
      borderTopColor: colors.border,
    } as ViewStyle,

    statChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
      paddingVertical: utils.spacing[1.5],
      paddingHorizontal: utils.spacing[2],
      borderRadius: 8,
    } as ViewStyle,

    statChipLabel: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    statChipValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
      marginLeft: 'auto',
    } as TextStyle,

    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[8],
    } as ViewStyle,

    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    emptyTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: '500',
      marginBottom: utils.spacing[1],
    } as TextStyle,

    emptySubtitle: {
      fontSize: utils.fontSize.sm,
      textAlign: 'center',
    } as TextStyle,

    footer: {
      flexDirection: 'row',
      gap: utils.spacing[3],
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[4],
      borderTopWidth: 1,
    } as ViewStyle,

    closeButton: {
      flex: 1,
      paddingVertical: utils.spacing[3],
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      flexDirection: 'row',
      gap: utils.spacing[1],
    } as ViewStyle,

    closeButtonText: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
    } as TextStyle,

    confirmButton: {
      flex: 2,
      borderRadius: 12,
      overflow: 'hidden',
    } as ViewStyle,

    confirmGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: utils.spacing[2],
      paddingVertical: utils.spacing[3],
    } as ViewStyle,

    confirmButtonText: {
      color: '#FFFFFF',
      fontSize: utils.fontSize.sm,
      fontWeight: '700',
    } as TextStyle,
    // Add to DayEndSummaryModal.styles.ts

    valueRow: {
      flexDirection: 'row',
      gap: utils.spacing[2],
      marginTop: utils.spacing[2],
      paddingTop: utils.spacing[2],
      borderTopWidth: 1,
      borderTopColor: colors.border,
    } as ViewStyle,

    valueChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
      backgroundColor: colors.background,
      paddingVertical: utils.spacing[1.5],
      paddingHorizontal: utils.spacing[2],
      borderRadius: 8,
    } as ViewStyle,

    valueChipLabel: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    valueChipAmount: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
      marginLeft: 'auto',
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
