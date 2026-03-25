import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useProductStatusBadgeStyles = () => {
  const { colors } = useTheme();
  const styleGenerator = createStyles((utils) => ({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[1.5],
      paddingVertical: 2,
      borderRadius: 10,
    } as ViewStyle,

    indicator: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: utils.spacing[1],
    } as ViewStyle,

    text: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
