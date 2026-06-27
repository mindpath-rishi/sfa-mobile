// VanChangeModel.styles.ts
import { StyleSheet } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export const useVanChangeModalStyles = (props: { vanChangeReason?: string } = {}) => {
  const { vanChangeReason } = props;
  const { colors } = useTheme();

  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },

    bottomModalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 24,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },

    // Drag Indicator
    dragIndicator: {
      alignItems: 'center',
      marginBottom: 20,
    },
    dragIndicatorBar: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
    },

    // Icon
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: 16,
    },

    // Title
    title: {
      fontSize: 22,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 8,
      color: colors.textPrimary,
    },

    questionText: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
      paddingHorizontal: 16,
      color: colors.textSecondary,
    },

    // Options Container
    optionsContainer: {
      gap: 12,
      marginBottom: 20,
    },

    optionItem: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      backgroundColor: colors.card,
    },

    optionItemSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '18',
    },

    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    optionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },

    optionTextContainer: {
      flex: 1,
    },

    optionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 2,
    },

    optionDescription: {
      fontSize: 12,
      color: colors.textSecondary,
    },

    optionTextSelected: {
      color: colors.primary,
    },

    // Error
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginBottom: 20,
      paddingVertical: 8,
      backgroundColor: colors.errorLight,
      borderRadius: 8,
    },

    errorText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.error,
    },

    // Buttons
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
    },

    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    cancelButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    },

    submitButton: {
      flex: 1.5,
      flexDirection: 'row',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },

    submitButtonDisabled: {
      opacity: 0.5,
    },

    submitButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primaryContrast,
    },
  });
};
