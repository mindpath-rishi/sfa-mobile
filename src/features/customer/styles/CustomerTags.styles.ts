import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useCustomerTagsStyles = () => {
  const { colors } = useTheme();
  const styleGenerator = createStyles((utils) => ({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    tag: {
      paddingHorizontal: utils.spacing[2],
      paddingVertical: 2,
      borderRadius: 12,
      marginRight: utils.spacing[1.5],
      marginBottom: utils.spacing[1],
    } as ViewStyle,

    tagText: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
