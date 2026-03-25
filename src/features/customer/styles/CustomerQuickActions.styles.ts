import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useCustomerQuickActionsStyles = () => {
  const { colors } = useTheme();
  const styleGenerator = createStyles((utils) => ({
    container: {
      flexDirection: 'row',
      marginTop: utils.spacing[3],
      gap: utils.spacing[2],
    } as ViewStyle,

    checkInButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[2],
      borderRadius: utils.borderRadius.md,
    } as ViewStyle,

    orderButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[2],
      borderRadius: utils.borderRadius.md,
    } as ViewStyle,

    callButton: {
      width: 40,
      height: 36,
      borderWidth: 1,
      borderRadius: utils.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    buttonText: {
      color: 'white',
      fontSize: utils.fontSize.sm,
      marginLeft: utils.spacing[1],
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
