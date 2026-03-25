import { ViewStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useProductQuickActionsStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      flexDirection: 'row',
      marginTop: utils.spacing[2],
      gap: utils.spacing[1.5],
      alignItems: 'flex-start',
    } as ViewStyle,

    selectorWrapper: {
      flex: 1,
    } as ViewStyle,

    favoriteButton: {
      width: 36,
      height: 36,
      borderWidth: 1,
      borderRadius: utils.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
