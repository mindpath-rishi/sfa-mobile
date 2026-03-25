import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

interface StatCardStyleProps {
  color: string;
  trend?: number;
}

export const useStatCardStyles = (props: StatCardStyleProps) => {
  const { colors } = useTheme();
  const { color, trend } = props;

  // Determine trend color based on trend value
  const trendColor = trend ? (trend > 0 ? colors.success : colors.error) : colors.textTertiary;

  // Get the appropriate semantic background for the trend
  const trendBgColor = trend
    ? trend > 0
      ? colors.successLight
      : colors.errorLight
    : colors.surface;

  const styleGenerator = createStyles((utils) => ({
    card: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      shadowColor: colors.textPrimary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,

    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    } as ViewStyle,

    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: color + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    } as ViewStyle,

    title: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '500',
      letterSpacing: 0.3,
    } as TextStyle,

    valueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    } as ViewStyle,

    value: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: '700',
      letterSpacing: -0.5,
    } as TextStyle,

    trendBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: trendBgColor,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 20,
      gap: 2,
    } as ViewStyle,

    trendIcon: {
      fontSize: 10,
      color: trendColor,
      fontWeight: '700',
    } as TextStyle,

    trendText: {
      fontSize: 10,
      color: trendColor,
      fontWeight: '700',
    } as TextStyle,

    footerLine: {
      height: 2,
      width: 40,
      backgroundColor: color + '25',
      borderRadius: 2,
      marginTop: 10,
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
