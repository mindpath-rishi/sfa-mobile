import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useTodayActivitiesSectionStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      paddingHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[5],
    } as ViewStyle,

    activitiesCard: {
      backgroundColor: colors.surface,
    } as ViewStyle,

    emptyState: {
      alignItems: 'center',
      padding: utils.spacing[6],
    } as ViewStyle,

    emptyStateIcon: {
      color: colors.textTertiary,
    } as TextStyle,

    emptyStateText: {
      fontSize: utils.fontSize.sm,
      color: colors.textTertiary,
      marginTop: utils.spacing[2],
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
