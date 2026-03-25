// components/SubmitButton.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useSubmitButtonStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    button: {
      borderRadius: utils.borderRadius.md,
      paddingVertical: utils.spacing[3],
      paddingHorizontal: utils.spacing[4],
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: utils.spacing[4],
      minHeight: 48,
    } as ViewStyle,

    disabledButton: {
      opacity: 0.6,
    } as ViewStyle,

    text: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.surface,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
