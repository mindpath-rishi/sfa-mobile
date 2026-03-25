import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useSearchBarStyles = () => {
  const { colors } = useTheme();
  const styleGenerator = createStyles((utils) => ({
    container: {
      // paddingHorizontal: utils.spacing[2],
    } as ViewStyle,

    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: utils.borderRadius.md,
      paddingHorizontal: utils.spacing[2.5],
      borderWidth: 1,
      height: 38,
    } as ViewStyle,

    input: {
      flex: 1,
      paddingVertical: utils.spacing[1.5],
      paddingHorizontal: utils.spacing[1.5],
      color: colors.textPrimary,
      fontSize: utils.fontSize.sm,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
