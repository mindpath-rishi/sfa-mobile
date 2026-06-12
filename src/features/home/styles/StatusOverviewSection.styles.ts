import { StyleSheet } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export const useStatsOverviewSectionStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    container: {
      width: '100%',
      paddingTop: 4,
      paddingBottom: 4,
    },
    headerContainer: {
      minHeight: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerIcon: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary + '12',
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    refreshButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundSecondary,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    tile: {
      flexBasis: '48%',
      flexGrow: 1,
      minHeight: 104,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tileHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 10,
    },
    tileIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tileTitle: {
      flex: 1,
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '400',
    },
    tileValue: {
      fontSize: 16,
      color: colors.textPrimary,
      fontWeight: '700',
      marginBottom: 4,
    },
    tileSubtitle: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    tileSubtitlePositive: {
      color: colors.textSecondary,
    },
    loadingContainer: {
      minHeight: 110,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 8,
    },
    errorContainer: {
      minHeight: 110,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    errorText: {
      fontSize: 12,
      color: colors.errorDark,
      textAlign: 'center',
    },
  });
};
