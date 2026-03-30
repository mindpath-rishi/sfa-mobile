import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useTodayActivitiesSectionStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      paddingHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[5],
    } as ViewStyle,

    activitiesCard: {
      backgroundColor: colors.surface,
    } as ViewStyle,

    emptyState: {
      alignItems: 'center',
      padding: utils.spacing[6],
    } as ViewStyle,

    emptyStateIcon: {
      color: colors.textTertiary,
    } as TextStyle,

    emptyStateText: {
      fontSize: utils.fontSize.sm,
      color: colors.textTertiary,
      marginTop: utils.spacing[2],
    } as TextStyle,
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    badge: {
      marginLeft: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 12,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '600',
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    statCard: {
      flex: 1,
      borderRadius: 10,
      padding: 10,
      borderWidth: 1,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '700',
      marginTop: 4,
    },
    statLabel: {
      fontSize: 9,
      marginTop: 2,
    },
    activitiesScrollView: {
      maxHeight: 400,
    },
    activitiesContent: {
      paddingVertical: 4,
    },
    emptyStateIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    emptyStateTitle: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 4,
    },
    emptyStateSubtitle: {
      fontSize: 11,
      textAlign: 'center',
    },
    showMoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      marginTop: 8,
      borderRadius: 8,
      borderWidth: 1,
    },
    showMoreText: {
      fontSize: 12,
      fontWeight: '500',
    },
    showMoreIcon: {
      marginLeft: 4,
    },
  }));

  return styleGenerator(colors);
};
