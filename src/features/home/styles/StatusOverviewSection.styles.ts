import { ViewStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useStatsOverviewSectionStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      paddingHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[5],
    } as ViewStyle,

    scrollContent: {
      gap: utils.spacing[3],
      paddingRight: utils.spacing[4],
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
