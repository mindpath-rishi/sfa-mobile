// components/NonSaleMainStep.styles.ts
import { ViewStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useNonSaleMainStepStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    contentContainer: {
      padding: utils.spacing[4],
    } as ViewStyle,

    customerInfo: {
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    reasonsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
