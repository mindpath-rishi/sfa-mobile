// styles/NonSaleFurtherReasonStep.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useNonSaleFurtherReasonStepStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    contentContainer: {
      padding: utils.spacing[4],
      paddingBottom: utils.spacing[4],
    } as ViewStyle,

    customerInfo: {
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    summaryCard: {
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    furtherReasonTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
      marginBottom: utils.spacing[3],
      marginTop: utils.spacing[2],
    } as TextStyle,

    reasonsList: {
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    // Footer styles
    footer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[3],
      paddingBottom: utils.spacing[3],
      gap: utils.spacing[3],
      // shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 4,
    } as ViewStyle,

    footerButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[3],
      paddingHorizontal: utils.spacing[4],
      borderRadius: utils.borderRadius.md,
      gap: utils.spacing[2],
    } as ViewStyle,

    // Back button styles
    backButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,

    backButtonText: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.textSecondary,
    } as TextStyle,

    // Next/Submit button styles
    nextButton: {
      backgroundColor: colors.primary,
    } as ViewStyle,

    nextButtonDisabled: {
      backgroundColor: colors.primary + '80', // 50% opacity
      opacity: 0.6,
    } as ViewStyle,

    nextButtonText: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
      color: '#FFFFFF',
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
