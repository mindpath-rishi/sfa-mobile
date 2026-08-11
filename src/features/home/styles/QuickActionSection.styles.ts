import { TextStyle, ViewStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useQuickActionsSectionStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      paddingHorizontal: 0,
      marginBottom: 0,
    } as ViewStyle,

    scrollContent: {
      gap: utils.spacing[3],
      paddingRight: 0,
    } as ViewStyle,

    sectionTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
