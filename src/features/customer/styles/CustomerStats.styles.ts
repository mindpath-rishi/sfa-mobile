import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useCustomerStatsStyles = () => {
  const { colors } = useTheme();
  const styleGenerator = createStyles((utils) => ({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    statItem: {
      alignItems: 'center',
    } as ViewStyle,

    statValue: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
    } as TextStyle,

    statLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    divider: {
      width: 1,
      height: 30,
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
