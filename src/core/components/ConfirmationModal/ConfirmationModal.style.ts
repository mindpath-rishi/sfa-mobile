// ConfirmationModal.style.ts
import { StyleSheet, ViewStyle, TextStyle, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const createConfirmationModalStyles = (colors: any) => {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    } as ViewStyle,

    container: {
      borderRadius: 28,
      padding: 24,
      backgroundColor: colors.surface || colors.background,
      width: SCREEN_WIDTH - 48,
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: 1,
      borderColor: colors.border + '20',
    } as ViewStyle,

    iconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      width: 80,
      height: 80,
      borderRadius: 40,
      alignSelf: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    } as ViewStyle,

    title: {
      fontSize: 24,
      fontWeight: '800',
      marginBottom: 12,
      color: colors.textPrimary,
      textAlign: 'center',
      letterSpacing: -0.3,
    } as TextStyle,

    dangerTitle: {
      color: colors.error,
    } as TextStyle,

    successTitle: {
      color: colors.success,
    } as TextStyle,

    message: {
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 20,
      color: colors.textSecondary,
      textAlign: 'center',
      letterSpacing: -0.2,
    } as TextStyle,

    divider: {
      height: 1,
      backgroundColor: colors.border + '40',
      marginVertical: 8,
      marginHorizontal: -24,
    } as ViewStyle,

    actions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    } as ViewStyle,

    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
      letterSpacing: -0.2,
    } as TextStyle,

    confirmButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    } as ViewStyle,

    dangerButton: {
      backgroundColor: colors.error,
      shadowColor: colors.error,
    } as ViewStyle,

    successButton: {
      backgroundColor: colors.success,
      shadowColor: colors.success,
    } as ViewStyle,

    infoButton: {
      backgroundColor: colors.info,
      shadowColor: colors.info,
    } as ViewStyle,

    confirmButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: -0.2,
    } as TextStyle,

    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    } as ViewStyle,

    disabledButton: {
      opacity: 0.6,
    } as ViewStyle,

    footerNote: {
      fontSize: 11,
      color: colors.textTertiary,
      textAlign: 'center',
      marginTop: 16,
      marginBottom: -8,
      letterSpacing: -0.1,
    } as TextStyle,
  });
};
