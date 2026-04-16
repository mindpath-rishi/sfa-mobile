// StatusOverviewSection.styles.ts
import { StyleSheet } from 'react-native';

export const useStatsOverviewSectionStyles = () => {
  return StyleSheet.create({
    container: {
      marginBottom: 8,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    refreshButton: {
      padding: 4,
    },
    scrollContent: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      gap: 8, // Adds space between cards
    },
    cardWrapper: {
      // No extra margin, gap handles spacing
      width: 160, // Fixed width for consistency
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 32,
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      color: '#6B7280',
    },
    errorContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 32,
      gap: 12,
    },
    errorText: {
      fontSize: 14,
      color: '#EF4444',
      textAlign: 'center',
      paddingHorizontal: 16,
    },
    retryButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      backgroundColor: '#4158D0',
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
    },
  });
};