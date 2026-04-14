import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useMonthlyBudgetSectionStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      paddingHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[5],
    } as ViewStyle,

    targetCard: {
      backgroundColor: colors.surface,
    } as ViewStyle,

    targetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    progressLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    viewDetailsButton: {
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,

    viewDetailsText: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.primary,
      letterSpacing: 0.4,
    } as TextStyle,

    arrowIcon: {
      marginLeft: utils.spacing[1],
      color: colors.primary,
    } as TextStyle,

    progressWrapper: {
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    targetStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: utils.spacing[3],
    } as ViewStyle,

    statItem: {
      flex: 1,
    } as ViewStyle,

    statItemRight: {
      flex: 1,
      alignItems: 'flex-end',
    } as ViewStyle,

    statLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
      marginBottom: utils.spacing[1],
    } as TextStyle,

    statValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
      letterSpacing: 0.4,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
