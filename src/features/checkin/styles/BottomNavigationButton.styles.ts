// components/BottomNavigationButton.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useBottomNavigationButtonStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.md,
      paddingVertical: utils.spacing[3],
      paddingHorizontal: utils.spacing[4],
      borderWidth: 1,
      gap: utils.spacing[2],
    } as ViewStyle,

    text: {
      fontSize: utils.fontSize.md,
      color: colors.textSecondary,
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
