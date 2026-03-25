import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useProductTagsStyles = () => {
  const { colors } = useTheme();
  const styleGenerator = createStyles((utils) => ({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    } as ViewStyle,

    tag: {
      paddingHorizontal: utils.spacing[1],
      paddingVertical: 1,
      borderRadius: 8,
      marginRight: utils.spacing[1],
    } as ViewStyle,

    tagText: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
