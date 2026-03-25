import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useFilterChipStyles = () => {
  const { colors } = useTheme();
  const styleGenerator = createStyles((utils) => ({
    gradient: {
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[1.5],
      borderRadius: 16,
      borderWidth: 1,
      marginRight: utils.spacing[1.5],
    } as ViewStyle,

    label: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('normal'),
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
