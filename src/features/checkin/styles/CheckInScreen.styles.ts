// styles/CheckInScreen.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useCheckInScreenStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    content: {
      flex: 1,
    } as ViewStyle,

    placeholderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: utils.spacing[4],
    } as ViewStyle,

    placeholderTitle: {
      fontSize: utils.fontSize.xl,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
      marginTop: utils.spacing[4],
      marginBottom: utils.spacing[2],
    } as TextStyle,

    placeholderText: {
      fontSize: utils.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
