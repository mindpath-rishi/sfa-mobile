// StatusOverviewSection.styles.ts
import { StyleSheet } from 'react-native';

export const useStatsOverviewSectionStyles = () => {
  return StyleSheet.create({
    container: {
      marginBottom: 16,
      width: '100%',
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: 'transparent',
      minHeight: 44,
    },
    headerTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: '#6B7280',
      letterSpacing: 0.5,
      lineHeight: 18,
    },
    refreshButton: {
      padding: 6,
      marginLeft: 8,
      minWidth: 32,
      minHeight: 32,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 16,
      backgroundColor: '#F3F4F6',
    },
    scrollContent: {
      paddingLeft: 16,
      paddingRight: 16, // Changed from 8 to 16 for equal padding
      flexDirection: 'row',
    },
    cardWrapper: {
      marginRight: 16, // Remove margin between cards
      // Add a small separator line or shadow if needed
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      minHeight: 180,
    },
    loadingText: {
      fontSize: 14,
      color: '#9CA3AF',
      marginTop: 12,
    },
    errorContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      minHeight: 180,
    },
    errorText: {
      fontSize: 14,
      color: '#EF4444',
      textAlign: 'center',
      paddingHorizontal: 24,
      marginTop: 12,
    },
    retryButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      backgroundColor: '#4158D0',
      borderRadius: 8,
      marginTop: 16,
    },
    retryButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });
};
