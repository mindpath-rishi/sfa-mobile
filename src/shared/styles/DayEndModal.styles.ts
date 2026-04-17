import { TextStyle, ViewStyle } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { createStyles } from '@/shared/theme/styles';

export const useDayEndModalStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.xl,
      width: '90%',
      maxWidth: 420,
      overflow: 'hidden',
    } as ViewStyle,

    // Header Styles
    headerGradient: {
      alignItems: 'center',
      paddingTop: utils.spacing[6],
      paddingBottom: utils.spacing[5],
      paddingHorizontal: utils.spacing[4],
    } as ViewStyle,

    headerIcon: {
      width: 72,
      height: 72,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.surface + '33',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    title: {
      fontSize: utils.fontSize.xl,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.surface,
      marginBottom: utils.spacing[1],
    } as TextStyle,

    subtitle: {
      fontSize: utils.fontSize.sm,
      color: colors.surface + 'CC',
    } as TextStyle,

    // Content Styles
    content: {
      padding: utils.spacing[5],
    } as ViewStyle,

    infoCard: {
      flexDirection: 'row',
      backgroundColor: colors.info + '10',
      borderRadius: utils.borderRadius.lg,
      padding: utils.spacing[4],
      marginBottom: utils.spacing[5],
      gap: utils.spacing[3],
      borderWidth: 1,
      borderColor: colors.info + '20',
    } as ViewStyle,

    infoText: {
      flex: 1,
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      lineHeight: 20,
    } as TextStyle,

    // Checkbox Styles
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: utils.spacing[3],
      marginBottom: utils.spacing[5],
      padding: utils.spacing[4],
      backgroundColor: colors.background,
      borderRadius: utils.borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 8,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
    } as ViewStyle,

    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    } as ViewStyle,

    checkboxContent: {
      flex: 1,
    } as ViewStyle,

    checkboxTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
      marginBottom: 4,
    } as TextStyle,

    checkboxDescription: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      lineHeight: 18,
    } as TextStyle,

    // Preview Card Styles
    previewCard: {
      backgroundColor: colors.primary + '05',
      borderRadius: utils.borderRadius.lg,
      padding: utils.spacing[4],
      borderWidth: 1,
      borderColor: colors.primary + '15',
    } as ViewStyle,

    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    previewTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.primary,
    } as TextStyle,

    previewRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: utils.spacing[2],
    } as ViewStyle,

    previewLabel: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
    } as TextStyle,

    previewValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.textPrimary,
    } as TextStyle,

    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: utils.spacing[3],
    } as ViewStyle,

    previewFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
      paddingTop: utils.spacing[1],
    } as ViewStyle,

    previewFooterText: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    // Footer Styles
    footer: {
      flexDirection: 'row',
      gap: utils.spacing[3],
      padding: utils.spacing[5],
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    } as ViewStyle,

    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[3],
      borderRadius: utils.borderRadius.md,
      gap: utils.spacing[2],
    } as ViewStyle,

    cancelButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    confirmButton: {
      backgroundColor: colors.primary,
    } as ViewStyle,

    buttonText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    // Success View Styles
    successContainer: {
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.xl,
      overflow: 'hidden',
    } as ViewStyle,

    successGradient: {
      alignItems: 'center',
      paddingVertical: utils.spacing[8],
      paddingHorizontal: utils.spacing[5],
    } as ViewStyle,

    successIcon: {
      width: 88,
      height: 88,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.surface + '33',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    successTitle: {
      fontSize: utils.fontSize.xl,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.surface,
      marginBottom: utils.spacing[2],
    } as TextStyle,

    successSubtitle: {
      fontSize: utils.fontSize.sm,
      color: colors.surface + 'CC',
      textAlign: 'center',
    } as TextStyle,

    messageCard: {
      backgroundColor: colors.background,
      margin: utils.spacing[5],
      marginBottom: utils.spacing[4],
      padding: utils.spacing[5],
      borderRadius: utils.borderRadius.lg,
      alignItems: 'center',
      gap: utils.spacing[3],
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    messageText: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    } as TextStyle,

    nextStepsCard: {
      backgroundColor: colors.info + '05',
      marginHorizontal: utils.spacing[5],
      marginBottom: utils.spacing[5],
      padding: utils.spacing[5],
      borderRadius: utils.borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.info + '20',
    } as ViewStyle,

    nextStepsTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
      marginBottom: utils.spacing[4],
    } as TextStyle,

    nextStepItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[3],
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    stepDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
    } as ViewStyle,

    nextStepText: {
      flex: 1,
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      lineHeight: 18,
    } as TextStyle,

    closeButton: {
      alignItems: 'center',
      paddingVertical: utils.spacing[4],
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    closeButtonText: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,
  }));
  return styleGenerator(colors);
};