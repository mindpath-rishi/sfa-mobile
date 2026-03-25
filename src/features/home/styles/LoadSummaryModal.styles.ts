import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useLoadSummaryModalStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    header: {
      paddingTop: utils.spacing[8],
      paddingBottom: utils.spacing[3],
      paddingHorizontal: utils.spacing[4],
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,

    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    headerTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
    } as TextStyle,

    closeButton: {
      padding: utils.spacing[1],
    } as ViewStyle,

    loadNumberBadge: {
      backgroundColor: colors.primary + '10',
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
      borderRadius: utils.borderRadius.sm,
      alignSelf: 'flex-start',
    } as ViewStyle,

    loadNumberText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.primary,
    } as TextStyle,

    content: {
      flex: 1,
      padding: utils.spacing[3],
    } as ViewStyle,

    summaryCard: {
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.md,
      padding: utils.spacing[3],
      marginBottom: utils.spacing[3],
      borderWidth: 1,
      borderColor: colors.divider,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as ViewStyle,

    summaryItem: {
      flex: 1,
      alignItems: 'flex-start',
    } as ViewStyle,

    summaryItemRight: {
      flex: 1,
      alignItems: 'flex-end',
    } as ViewStyle,

    summaryLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      marginBottom: utils.spacing[1],
    } as TextStyle,

    summaryValue: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
    } as TextStyle,

    summaryDivider: {
      width: 1,
      height: '80%',
      backgroundColor: colors.divider,
      marginHorizontal: utils.spacing[2],
    } as ViewStyle,

    sectionTitle: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
      marginBottom: utils.spacing[2],
      paddingHorizontal: utils.spacing[1],
    } as TextStyle,

    skuList: {
      paddingHorizontal: utils.spacing[1],
      paddingBottom: utils.spacing[2],
    } as ViewStyle,

    skuCard: {
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.md,
      padding: utils.spacing[3],
      marginBottom: utils.spacing[2],
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    skuHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    skuName: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.textPrimary,
      flex: 1,
    } as TextStyle,

    skuCode: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
      marginLeft: utils.spacing[2],
    } as TextStyle,

    stockRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: utils.spacing[1],
    } as ViewStyle,

    stockLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
    } as TextStyle,

    stockValue: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.textPrimary,
    } as TextStyle,

    footer: {
      padding: utils.spacing[3],
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    } as ViewStyle,

    proceedButton: {
      backgroundColor: colors.primary,
      borderRadius: utils.borderRadius.md,
      padding: utils.spacing[3],
      alignItems: 'center',
    } as ViewStyle,

    proceedButtonText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textInverse,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
