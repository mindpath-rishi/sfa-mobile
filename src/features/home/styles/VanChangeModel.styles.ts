import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

interface VanChangeModalStyleProps {
  vanChangeReason?: string;
}

export const useVanChangeModalStyles = (props: VanChangeModalStyleProps = {}) => {
  const { colors } = useTheme();
  const { vanChangeReason } = props;

  const styleGenerator = createStyles((utils) => ({
    centeredModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    centeredModalContent: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: utils.spacing[5],
      width: '85%',
      maxWidth: 360,
    } as ViewStyle,

    titleMedium: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: utils.spacing[3],
    } as TextStyle,

    questionText: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: utils.spacing[3],
    } as TextStyle,

    selectLabel: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textSecondary,
      letterSpacing: 0.4,
      marginBottom: utils.spacing[2],
    } as TextStyle,

    optionsContainer: {
      borderWidth: 1,
      borderColor: colors.divider,
      borderRadius: utils.borderRadius.md,
      marginBottom: utils.spacing[3],
      backgroundColor: colors.surface,
      overflow: 'hidden',
    } as ViewStyle,

    optionItem: {
      padding: utils.spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,

    lastOptionItem: {
      padding: utils.spacing[4],
      borderBottomWidth: 0,
    } as ViewStyle,

    optionItemSelected: {
      backgroundColor: colors.primary + '10',
    } as ViewStyle,

    optionText: {
      fontSize: utils.fontSize.sm,
      color: colors.textPrimary,
    } as TextStyle,

    optionTextSelected: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.primary,
    } as TextStyle,

    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: utils.borderRadius.md,
      padding: utils.spacing[4],
      alignItems: 'center',
    } as ViewStyle,

    submitButtonText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textInverse,
    } as TextStyle,

    errorText: {
      fontSize: utils.fontSize.xs,
      color: colors.error,
      marginBottom: utils.spacing[3],
      fontStyle: 'italic',
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
