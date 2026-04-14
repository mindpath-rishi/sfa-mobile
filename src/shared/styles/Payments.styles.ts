// styles/PaymentsScreen.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const usePaymentsScreenStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      flex: 1,
    } as ViewStyle,

    searchWrapper: {
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[4],
      paddingBottom: utils.spacing[2],
    } as ViewStyle,

    listContent: {
      paddingHorizontal: utils.spacing[4],
      paddingBottom: utils.spacing[20],
    } as ViewStyle,

    footerLoader: {
      paddingVertical: utils.spacing[4],
      alignItems: 'center',
    } as ViewStyle,

    fab: {
      position: 'absolute',
      bottom: utils.spacing[4],
      right: utils.spacing[4],
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
