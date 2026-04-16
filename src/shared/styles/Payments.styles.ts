// shared/styles/Payments.styles.ts
import { ViewStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const usePaymentsScreenStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      flex: 1,
    } as ViewStyle,

    searchWrapper: {
      padding: utils.spacing[4],
      paddingBottom: utils.spacing[2],
    } as ViewStyle,

    listContent: {
      padding: utils.spacing[4],
      paddingBottom: utils.spacing[20],
      gap: utils.spacing[3],
    } as ViewStyle,

    footerLoader: {
      paddingVertical: utils.spacing[4],
      alignItems: 'center',
    } as ViewStyle,

    fab: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};