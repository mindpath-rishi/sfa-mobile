import { StyleSheet } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export const useStatsOverviewSectionStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    container: {
      marginBottom: 0,
      width: '100%',
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 0,
      paddingVertical: 0,
      backgroundColor: 'transparent',
      minHeight: 32,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      lineHeight: 22,
    },
    refreshButton: {
      padding: 6,
      marginLeft: 8,
      minWidth: 32,
      minHeight: 32,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 16,
      backgroundColor: colors.backgroundTertiary,
    },
    cardsList: {
      paddingTop: 10,
      gap: 12,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
    },
    cardWrapper: {
      width: '100%',
    },
    halfCardWrapper: {
      flex: 1,
      minWidth: 0,
    },
    metricGraphic: {
      width: '100%',
      minHeight: 104,
      borderRadius: 8,
      padding: 10,
      overflow: 'hidden',
      justifyContent: 'space-between',
    },
    metricHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    metricIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.22)',
    },
    metricTitle: {
      flex: 1,
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    metricValue: {
      fontSize: 25,
      lineHeight: 29,
      fontWeight: '800',
      color: '#FFFFFF',
      marginTop: 6,
    },
    metricFooter: {
      gap: 6,
      marginTop: 6,
    },
    metricSubtitle: {
      fontSize: 11,
      lineHeight: 14,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.86)',
    },
    metricTrack: {
      height: 4,
      borderRadius: 999,
      overflow: 'hidden',
      backgroundColor: 'rgba(255,255,255,0.22)',
    },
    metricProgress: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: '#FFFFFF',
    },
    skeletonCard: {
      width: '100%',
      height: 104,
      borderRadius: 8,
      padding: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    skeletonCardContent: {
      flex: 1,
      gap: 8,
    },
    errorContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      minHeight: 180,
    },
    errorText: {
      fontSize: 14,
      color: colors.error,
      textAlign: 'center',
      paddingHorizontal: 24,
      marginTop: 12,
    },
    retryButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      backgroundColor: colors.primary,
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
