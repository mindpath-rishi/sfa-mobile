// components/ReasonCategoryCard.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useReasonCategoryCardStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    card: {
      width: '48%',
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.lg,
      padding: utils.spacing[4],
      marginBottom: utils.spacing[3],
      alignItems: 'center',
      borderWidth: 1,
      // shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    } as ViewStyle,

    iconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    title: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.textPrimary,
      textAlign: 'center',
      lineHeight: utils.fontSize.md,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
