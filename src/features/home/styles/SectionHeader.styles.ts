import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useSectionHeaderStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    text: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
      letterSpacing: 0.4,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
