import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useCategoryCardStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      width: '30%',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    card: {
      alignItems: 'center',
      padding: utils.spacing[3],
    } as ViewStyle,

    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: utils.spacing[1.5],
    } as ViewStyle,

    categoryName: {
      color: colors.textPrimary,
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('medium'),
      textAlign: 'center',
    } as TextStyle,

    itemCount: {
      color: colors.textSecondary,
      fontSize: utils.fontSize.xs,
      marginTop: utils.spacing[0.5],
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
