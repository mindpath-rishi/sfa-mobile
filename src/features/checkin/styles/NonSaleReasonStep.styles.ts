// components/NonSaleReasonStep.styles.ts
import { ViewStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useNonSaleReasonStepStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      flex: 1,
    } as ViewStyle,

    contentContainer: {
      padding: utils.spacing[4],
    } as ViewStyle,

    customerInfo: {
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    categoryHeader: {
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    reasonsList: {
      marginTop: utils.spacing[2],
    } as ViewStyle,

    bottomButtonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: utils.spacing[4],
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
