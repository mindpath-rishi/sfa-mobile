import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useOutletVisitInfoStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as ViewStyle,

    visitItem: {
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,

    lastVisitText: {
      color: colors.textSecondary,
      fontSize: utils.fontSize.xs,
      marginLeft: utils.spacing[1],
    } as TextStyle,

    nextVisitText: {
      color: colors.primary,
      fontSize: utils.fontSize.xs,
      marginLeft: utils.spacing[1],
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
