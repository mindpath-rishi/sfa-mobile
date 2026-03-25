import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useInvoiceSharingStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      flex: 1,
    } as ViewStyle,

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: utils.spacing[4],
      paddingBottom: utils.spacing[3],
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '20',
    } as ViewStyle,

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    headerTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('600'),
      color: colors.textPrimary,
    } as TextStyle,

    headerRight: {
      width: 40,
    } as ViewStyle,

    // Scroll Content
    scrollContent: {
      padding: utils.spacing[4],
      paddingBottom: utils.spacing[24],
    } as ViewStyle,

    // Instruction
    instruction: {
      fontSize: utils.fontSize.md,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: utils.spacing[4],
      textAlign: 'center',
    } as TextStyle,

    // Options Card
    optionsCard: {
      marginBottom: utils.spacing[4],
      borderRadius: utils.borderRadius.lg,
    } as ViewStyle,

    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: utils.spacing[3],
      paddingHorizontal: utils.spacing[2],
      borderRadius: utils.borderRadius.md,
    } as ViewStyle,

    optionSelected: {
      backgroundColor: colors.primary + '08',
    } as ViewStyle,

    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[3],
    } as ViewStyle,

    optionIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    optionTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('600'),
      color: colors.textPrimary,
      marginBottom: 2,
    } as TextStyle,

    optionDescription: {
      fontSize: utils.fontSize.sm,
      color: colors.textTertiary,
    } as TextStyle,

    divider: {
      height: 1,
      marginVertical: utils.spacing[2],
    } as ViewStyle,

    // Preview Card
    previewCard: {
      borderRadius: utils.borderRadius.lg,
    } as ViewStyle,

    previewTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('600'),
      color: colors.textPrimary,
      marginBottom: utils.spacing[3],
    } as TextStyle,

    previewRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: utils.spacing[1.5],
    } as ViewStyle,

    previewLabel: {
      fontSize: utils.fontSize.sm,
      color: colors.textTertiary,
    } as TextStyle,

    previewValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('500'),
      color: colors.textPrimary,
    } as TextStyle,

    previewAmount: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('700'),
      color: colors.primary,
    } as TextStyle,

    // Bottom Bar
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[3],
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border + '20',
    } as ViewStyle,

    proceedButton: {
      paddingVertical: utils.spacing[3.5],
      borderRadius: utils.borderRadius.lg,
      alignItems: 'center',
    } as ViewStyle,

    proceedButtonText: {
      color: 'white',
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('600'),
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
