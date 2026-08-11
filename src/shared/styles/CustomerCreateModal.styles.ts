// styles/CustomerCreateModal.styles.ts
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useCustomerCreateStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    // Layout
    keyboardAvoidingView: {
      flex: 1,
    } as ViewStyle,

    // container: {
    //   flex: 1,
    //   display: 'flex',
    //   flexDirection: 'column',
    // } as ViewStyle,

    // Progress Bar
    progressContainer: {
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    } as ViewStyle,

    progressBar: {
      height: 4,
      backgroundColor: colors.divider,
      borderRadius: 2,
      overflow: 'hidden',
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 2,
    } as ViewStyle,

    progressText: {
      alignItems: 'center',
    } as ViewStyle,

    progressLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
      fontWeight: '500',
    } as TextStyle,

    // Scroll Content
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[4],
    } as ViewStyle,

    // Section Header
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: utils.spacing[3],
      marginBottom: utils.spacing[6],
    } as ViewStyle,

    sectionTitleContainer: {
      flex: 1,
    } as ViewStyle,

    sectionTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: utils.spacing[1],
    } as TextStyle,

    sectionDescription: {
      fontSize: utils.fontSize.sm,
      color: colors.textTertiary,
      fontWeight: '400',
    } as TextStyle,

    // Fields Container
    fieldsContainer: {
      gap: utils.spacing[4],
      marginBottom: utils.spacing[6],
    } as ViewStyle,

    // Field
    fieldContainer: {
      gap: utils.spacing[2],
    } as ViewStyle,

    fieldHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as ViewStyle,

    fieldLabel: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    requiredBadge: {
      fontSize: utils.fontSize.sm,
      color: colors.error,
      marginLeft: utils.spacing[1],
    } as TextStyle,

    // Input Field
    inputField: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: utils.borderRadius.lg,
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[2.5],
      gap: utils.spacing[2],
      transition: 'all 200ms ease-in-out',
    } as ViewStyle,

    textInput: {
      flex: 1,
      fontSize: utils.fontSize.md,
      color: colors.textPrimary,
      fontWeight: '400',
      padding: 0,
    } as TextStyle,

    // Dropdown Field
    dropdownField: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: utils.borderRadius.lg,
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[2.5],
      gap: utils.spacing[2],
      justifyContent: 'space-between',
    } as ViewStyle,

    dropdownFieldText: {
      flex: 1,
      fontSize: utils.fontSize.md,
      color: colors.textPrimary,
      fontWeight: '400',
    } as TextStyle,

    placeholderText: {
      color: colors.textTertiary,
      fontWeight: '400',
    } as TextStyle,

    chevronIcon: {
      marginLeft: utils.spacing[1],
    } as ViewStyle,

    // Field States
    fieldFocused: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    } as ViewStyle,

    fieldError: {
      borderColor: colors.error,
      backgroundColor: `${colors.error}08`,
    } as ViewStyle,

    // Error Message
    errorMessage: {
      fontSize: utils.fontSize.xs,
      color: colors.error,
      fontWeight: '500',
      marginTop: utils.spacing[1],
    } as TextStyle,

    // Photo Section
    photoSectionContainer: {
      marginBottom: utils.spacing[6],
    } as ViewStyle,

    photoSourceActions: {
      flexDirection: 'row',
      gap: utils.spacing[2],
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    photoSourceButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: utils.spacing[2],
      paddingVertical: utils.spacing[3],
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: utils.borderRadius.lg,
      backgroundColor: `${colors.primary}08`,
    } as ViewStyle,

    photoSourceButtonText: {
      color: colors.primary,
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
    } as TextStyle,

    photoGrid: {
      gap: utils.spacing[3],
    } as ViewStyle,

    photoCard: {
      borderRadius: utils.borderRadius.xl,
      overflow: 'hidden',
      backgroundColor: `${colors.primary}08`,
      borderWidth: 2,
      borderColor: `${colors.primary}20`,
      borderStyle: 'dashed',
    } as ViewStyle,

    photoCardFilled: {
      borderStyle: 'solid',
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    } as ViewStyle,

    photoPreviewContainer: {
      position: 'relative',
      alignItems: 'center',
      paddingVertical: utils.spacing[6],
    } as ViewStyle,

    photoPreview: {
      width: 140,
      height: 140,
      borderRadius: 70,
      borderWidth: 3,
      borderColor: colors.primary,
    } as ImageStyle,

    photoActions: {
      flexDirection: 'row',
      gap: utils.spacing[2],
      marginTop: utils.spacing[4],
    } as ViewStyle,

    photoActionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      bottom: utils.spacing[2],
    } as ViewStyle,

    photoRetakeButton: {
      backgroundColor: colors.primary,
      right: utils.spacing[4],
    } as ViewStyle,

    photoRemoveButton: {
      backgroundColor: colors.error,
      left: utils.spacing[4],
    } as ViewStyle,

    photoPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[8],
      gap: utils.spacing[2],
    } as ViewStyle,

    photoPlaceholderIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: `${colors.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    photoPlaceholderTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    photoPlaceholderText: {
      fontSize: utils.fontSize.sm,
      color: colors.textTertiary,
    } as TextStyle,

    // Summary Section
    summaryContainer: {
      backgroundColor: `${colors.primary}08`,
      borderRadius: utils.borderRadius.lg,
      padding: utils.spacing[4],
      marginBottom: utils.spacing[4],
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    } as ViewStyle,

    summaryTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: utils.spacing[3],
    } as TextStyle,

    summaryGrid: {
      gap: utils.spacing[3],
    } as ViewStyle,

    summaryItem: {
      backgroundColor: colors.surface,
      padding: utils.spacing[3],
      borderRadius: utils.borderRadius.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    } as ViewStyle,

    summaryLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
      fontWeight: '600',
      textTransform: 'uppercase',
      marginBottom: utils.spacing[1],
    } as TextStyle,

    summaryValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    // Footer
    footerContainer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      paddingBottom: utils.spacing[4],
    } as ViewStyle,

    footerActions: {
      flexDirection: 'row',
      gap: utils.spacing[3],
      alignItems: 'center',
    } as ViewStyle,

    // Buttons
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: utils.spacing[2],
      paddingVertical: utils.spacing[3],
      borderRadius: utils.borderRadius.lg,
      paddingHorizontal: utils.spacing[4],
      minHeight: 48,
    } as ViewStyle,

    fullWidthButton: {
      flex: 1,
    } as ViewStyle,

    primaryButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderWidth: 0,
    } as ViewStyle,

    primaryButtonText: {
      fontSize: utils.fontSize.sm,
      fontWeight: '700',
      color: '#FFFFFF',
    } as TextStyle,

    secondaryButton: {
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    } as ViewStyle,

    secondaryButtonText: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
      color: colors.primary,
    } as TextStyle,

    buttonLoading: {
      opacity: 0.7,
    } as ViewStyle,

    // Add these missing styles to CustomerCreateModal.styles.ts

    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    photoSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    photoSectionTitleContainer: {
      flex: 1,
    } as ViewStyle,

    photoSectionTitle: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    photoSectionDescription: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
    } as TextStyle,
    // Add to CustomerCreateModal.styles.ts

    dropdownOptionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      backgroundColor: colors.surface,
    } as ViewStyle,

    dropdownOptionSelected: {
      backgroundColor: colors.primary + '10',
    } as ViewStyle,

    dropdownOptionText: {
      fontSize: utils.fontSize.md,
      color: colors.textPrimary,
      fontWeight: '400',
    } as TextStyle,

    dropdownOptionTextSelected: {
      color: colors.primary,
      fontWeight: '600',
    } as TextStyle,

    dropdownSeparator: {
      height: 0.5,
      marginHorizontal: utils.spacing[4],
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
