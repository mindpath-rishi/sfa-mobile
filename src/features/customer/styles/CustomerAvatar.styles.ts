import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useCustomerAvatarStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: utils.spacing[3],
    } as ViewStyle,

    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
    } as ImageStyle,

    initials: {
      fontSize: utils.fontSize.xl,
      color: colors.primary,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
