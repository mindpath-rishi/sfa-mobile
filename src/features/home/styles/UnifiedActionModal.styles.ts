// UnifiedActionModal.styles.ts
import { StyleSheet } from 'react-native';

export const useUnifiedActionModalStyles = () => {
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },

    bottomModalContent: {
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 28,
      maxHeight: '85%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 10,
    },

    // Drag Indicator
    dragIndicator: {
      alignItems: 'center',
      marginBottom: 16,
    },
    dragIndicatorBar: {
      width: 48,
      height: 5,
      borderRadius: 3,
      backgroundColor: '#E5E7EB',
    },

    // Icon
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: 12,
    },

    // Title
    title: {
      fontSize: 20,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 4,
      letterSpacing: -0.3,
    },
    titleSmall: {
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: -0.3,
    },

    questionText: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 20,
      paddingHorizontal: 20,
      opacity: 0.7,
    },

    // Options Container
    optionsContainer: {
      gap: 10,
      marginBottom: 20,
    },
    optionItem: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      padding: 14,
      backgroundColor: '#FFFFFF',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    optionItemSelected: {
      borderColor: '#3B82F6',
      backgroundColor: '#EFF6FF',
      borderWidth: 1.5,
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    optionIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    optionTextContainer: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: '#1F2937',
      marginBottom: 2,
    },
    optionDescription: {
      fontSize: 12,
      opacity: 0.6,
    },
    optionTextSelected: {
      color: '#3B82F6',
    },

    // Error
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginBottom: 16,
      paddingVertical: 8,
      backgroundColor: '#FEF2F2',
      borderRadius: 10,
    },
    errorText: {
      fontSize: 12,
      fontWeight: '500',
      color: '#EF4444',
    },

    // Buttons
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 4,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    submitButton: {
      flex: 1.5,
      flexDirection: 'row',
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    submitButtonDisabled: {
      opacity: 0.5,
    },
    submitButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },

    // Add these to UnifiedActionModal.styles.ts
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    // Route Header
    routeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
      paddingHorizontal: 4,
    },
    routeHeaderTitle: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 4,
    },
    routeHeaderSubtitle: {
      fontSize: 13,
      lineHeight: 18,
    },
    routeCloseButton: {
      padding: 4,
    },

    // Van Info Card Improved
    vanInfoCardImproved: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderRadius: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: 'transparent',
      borderLeftWidth: 4,
    },
    vanInfoIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    vanInfoContent: {
      flex: 1,
    },
    vanInfoLabel: {
      fontSize: 11,
      fontWeight: '600',
      marginBottom: 2,
      textTransform: 'uppercase',
    },
    vanInfoValue: {
      fontSize: 14,
      fontWeight: '500',
    },
    vanChangeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },
    vanChangeText: {
      fontSize: 11,
      fontWeight: '500',
    },

    // Van Selection
    reasonContainer: {
      marginBottom: 16,
    },
    reasonLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 8,
    },
    reasonInput: {
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      minHeight: 46,
      textAlignVertical: 'top',
      fontSize: 14,
    },
    vanListContainer: {
      paddingBottom: 8,
    },
    vanItem: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
      backgroundColor: '#FFFFFF',
    },
    vanItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
      paddingRight: 10,
    },
    vanAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    vanName: {
      fontSize: 14,
      fontWeight: '600',
    },
    vanNumber: {
      fontSize: 12,
      marginTop: 2,
      opacity: 0.8,
    },

    // Route List Header
    routeListHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    routeListTitle: {
      fontSize: 15,
      fontWeight: '600',
    },
    routeListCount: {
      fontSize: 12,
    },
    routeListContainer: {
      paddingBottom: 20,
    },

    // Route Item Improved
    routeItemImproved: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    routeNumberBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    routeNumberText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#6B7280',
    },
    routeIconImproved: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    routeContentImproved: {
      flex: 1,
    },
    routeNameImproved: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 6,
    },
    routeMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    routeMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    routeMetaText: {
      fontSize: 12,
    },
    routeMetaDot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: '#D1D5DB',
      marginHorizontal: 8,
    },
    routeSelectIndicator: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyRoutesContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      gap: 12,
    },
    emptyRoutesText: {
      fontSize: 16,
      fontWeight: '500',
      marginTop: 8,
    },
    emptyRoutesSubtext: {
      fontSize: 13,
      textAlign: 'center',
    },

    // Activity Change Styles - Modern Card Design
    currentActivityInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 14,
      marginBottom: 20,
      gap: 10,
      backgroundColor: '#F0FDF4',
    },
    infoText: {
      fontSize: 13,
      flex: 1,
    },
    infoHighlight: {
      fontWeight: '700',
    },
    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
    },
    modalItemIcon: {
      width: 52,
      height: 52,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    itemContent: {
      flex: 1,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    itemSubtitle: {
      fontSize: 12,
      opacity: 0.6,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      marginTop: 12,
      gap: 8,
      backgroundColor: '#F3F4F6',
      borderRadius: 14,
    },
    backButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },

    dayStartSubtitle: {
      marginBottom: 16,
      paddingHorizontal: 8,
    },
    dayStartSubtitleText: {
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
      opacity: 0.6,
    },

    scrollContentContainer: {
      paddingBottom: 8,
    },

    otherWorkHeader: {
      paddingVertical: 12,
      paddingHorizontal: 8,
      marginBottom: 8,
    },
    otherWorkHeaderText: {
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 0.5,
      opacity: 0.7,
    },
  });
};
