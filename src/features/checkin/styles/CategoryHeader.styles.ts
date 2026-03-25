// components/CategoryHeader.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useCategoryHeaderStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: utils.spacing[4],
      padding: utils.spacing[3],
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.lg,
    } as ViewStyle,

    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: utils.spacing[3],
    } as ViewStyle,

    title: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('semibold'),
      flex: 1,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
