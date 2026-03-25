import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useFilterChipStyles = () => {
  const { colors } = useTheme();
  const styleGenerator = createStyles((utils) => ({
    gradient: {
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[2],
      borderRadius: 20,
      borderWidth: 1,
      marginRight: utils.spacing[2],
    } as ViewStyle,

    label: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('normal'),
    } as TextStyle,

    activeLabel: {
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
