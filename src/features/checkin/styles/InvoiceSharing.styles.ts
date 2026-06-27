// Updated styles for InvoiceSharing.styles.ts
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export const useInvoiceSharingStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    scrollContent: {
      padding: 16,
      gap: 16,
    } as ViewStyle,

    instruction: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    } as TextStyle,

    optionsCard: {
      borderRadius: 16,
      backgroundColor: colors.card,
    } as ViewStyle,

    optionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
    } as ViewStyle,

    optionSelected: {
      backgroundColor: colors.active,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginHorizontal: -12,
    } as ViewStyle,

    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      flex: 1,
      minWidth: 0,
    } as ViewStyle,

    optionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    optionTextBlock: {
      flex: 1,
      minWidth: 0,
    } as ViewStyle,

    optionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 4,
    } as TextStyle,

    optionDescription: {
      fontSize: 12,
      color: colors.textTertiary,
    } as TextStyle,

    divider: {
      height: 1,
      marginVertical: 8,
      backgroundColor: colors.divider,
    } as ViewStyle,

    submenuCard: {
      borderRadius: 16,
      marginTop: 8,
      backgroundColor: colors.card,
    } as ViewStyle,

    submenuTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 12,
    } as TextStyle,

    submenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,

    submenuText: {
      fontSize: 15,
      color: colors.textPrimary,
    } as TextStyle,

    previewCard: {
      borderRadius: 16,
      backgroundColor: colors.card,
    } as ViewStyle,

    previewTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 16,
    } as TextStyle,

    previewRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 12,
    } as ViewStyle,

    previewLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      flexShrink: 0,
    } as TextStyle,

    previewValue: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textPrimary,
      flex: 1,
      textAlign: 'right',
    } as TextStyle,

    previewAmount: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.success,
    } as TextStyle,

    itemsContainer: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    } as ViewStyle,

    itemsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 12,
    } as TextStyle,

    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    } as ViewStyle,

    itemName: {
      flex: 2,
      fontSize: 13,
      color: colors.textPrimary,
    } as TextStyle,

    itemQuantity: {
      flex: 1,
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
    } as TextStyle,

    itemPrice: {
      flex: 1,
      fontSize: 13,
      fontWeight: '500',
      color: colors.textPrimary,
      textAlign: 'right',
    } as TextStyle,

    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    } as ViewStyle,

    proceedButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    disabledButton: {
      opacity: 0.6,
    } as ViewStyle,

    proceedButtonText: {
      color: colors.primaryContrast,
      fontSize: 16,
      fontWeight: '600',
    } as TextStyle,
    // Add these to your InvoiceSharing.styles.ts
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 10,
      borderBottomWidth: 1,
    } as ViewStyle,

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: -6,
    } as ViewStyle,

    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      flex: 1,
      textAlign: 'center',
    } as TextStyle,
    // Add to your InvoiceSharing.styles.ts
    shareActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      gap: 12,
    } as ViewStyle,

    shareActionTextContainer: {
      flex: 1,
    } as ViewStyle,

    shareActionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 4,
    } as TextStyle,

    shareActionDescription: {
      fontSize: 12,
      color: colors.textSecondary,
    } as TextStyle,
  });
};
