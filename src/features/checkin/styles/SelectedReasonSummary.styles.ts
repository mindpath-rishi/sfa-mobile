// components/SelectedReasonSummary.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useSelectedReasonSummaryStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.lg,
      padding: utils.spacing[4],
      marginBottom: utils.spacing[4],
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,

    label: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: utils.spacing[2],
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    } as TextStyle,

    valueContainer: {
      gap: utils.spacing[1],
    } as ViewStyle,

    value: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
    } as TextStyle,

    subValue: {
      fontSize: utils.fontSize.md,
      color: colors.textSecondary,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
