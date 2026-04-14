// TodayActivitiesSection.styles.ts
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

    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: utils.spacing[3],
      backgroundColor: colors.background,
    } as ViewStyle,

    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    } as ViewStyle,

    headerTitle: {
      fontSize: utils.fontSize.xs,
      fontWeight: '600',
      letterSpacing: 0.5,
    } as TextStyle,

    badge: {
      marginLeft: utils.spacing[2],
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[0.5],
      borderRadius: 12,
    } as ViewStyle,

    badgeText: {
      fontSize: utils.fontSize.xs,
      fontWeight: '700',
    } as TextStyle,

    statsContainer: {
      flexDirection: 'row',
      gap: utils.spacing[2],
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    statCard: {
      flex: 1,
      borderRadius: 10,
      padding: utils.spacing[2.5],
      borderWidth: 1,
    } as ViewStyle,

    statValue: {
      fontSize: utils.fontSize.md,
      fontWeight: '700',
      marginTop: utils.spacing[1],
    } as TextStyle,

    statLabel: {
      fontSize: utils.fontSize.xs,
      marginTop: utils.spacing[0.5],
    } as TextStyle,

    activitiesScrollView: {
      maxHeight: 400,
    } as ViewStyle,

    activitiesContent: {
      paddingVertical: utils.spacing[1],
    } as ViewStyle,

    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[12],
    } as ViewStyle,

    emptyStateIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    emptyStateTitle: {
      fontSize: utils.fontSize.sm,
      fontWeight: '500',
      marginBottom: utils.spacing[1],
    } as TextStyle,

    emptyStateSubtitle: {
      fontSize: utils.fontSize.xs,
      textAlign: 'center',
    } as TextStyle,

    showMoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[2.5],
      marginTop: utils.spacing[2],
      borderRadius: 8,
      borderWidth: 1,
    } as ViewStyle,

    showMoreText: {
      fontSize: utils.fontSize.xs,
      fontWeight: '600',
    } as TextStyle,

    showMoreIcon: {
      marginLeft: utils.spacing[1],
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
