import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useStartDayButtonStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    button: {
      backgroundColor: colors.primary,
      borderRadius: utils.borderRadius.lg,
      padding: utils.spacing[4],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    } as ViewStyle,

    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,

    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    textContainer: {
      marginLeft: utils.spacing[3],
    } as ViewStyle,

    title: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textInverse,
      letterSpacing: 0.4,
    } as TextStyle,

    subtitle: {
      fontSize: utils.fontSize.sm,
      color: 'rgba(255,255,255,0.9)',
      marginTop: utils.spacing[1],
    } as TextStyle,

    arrowCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    arrowIcon: {
      color: colors.textInverse,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
