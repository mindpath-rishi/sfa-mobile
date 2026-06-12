// CurrentActivityCard.styles.ts
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export const useCurrentActivityCardStyles = ({
  selectedActivity,
}: {
  selectedActivity: string | null;
}) => {
  const { colors } = useTheme();

  return StyleSheet.create({
    container: {
      paddingTop: 4,
      paddingBottom: 4,
    } as ViewStyle,

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    } as ViewStyle,

    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    } as ViewStyle,

    headerIcon: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    sectionTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    } as TextStyle,

    startTimeText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '400',
    } as TextStyle,

    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 5,
    } as ViewStyle,

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    } as ViewStyle,

    statusPillText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    } as TextStyle,

    activityTimerCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 12,
    } as ViewStyle,

    activityPanel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingBottom: 10,
    } as ViewStyle,

    activityIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    activityInfo: {
      flex: 1,
    } as ViewStyle,

    activityTypeText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textPrimary,
      marginBottom: 2,
    } as TextStyle,

    activityMeta: {
      fontSize: 12,
      color: colors.textSecondary,
    } as TextStyle,

    timerDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: 50,
    } as ViewStyle,

    timerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingTop: 10,
    } as ViewStyle,

    timerIconBubble: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    timerTextBlock: {
      flex: 1,
    } as ViewStyle,

    timerLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '600',
      marginBottom: 2,
    } as TextStyle,

    timerValue: {
      fontSize: 16,
      fontWeight: '700',
    } as TextStyle,

    timerMeta: {
      alignItems: 'flex-end',
    } as ViewStyle,

    timerMetaLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      fontWeight: '600',
      textTransform: 'uppercase',
    } as TextStyle,

    timerMetaValue: {
      fontSize: 14,
      color: colors.textPrimary,
      fontWeight: '500',
      marginTop: 2,
    } as TextStyle,

    infoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    } as ViewStyle,

    infoCard: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 10,
      marginTop: 10,
    } as ViewStyle,

    otherWorkCard: {
      backgroundColor: 'transparent',
    } as ViewStyle,

    infoCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    } as ViewStyle,

    infoCardTitle: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.5,
    } as TextStyle,

    routeName: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textPrimary,
      marginBottom: 4,
    } as TextStyle,

    routeStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    } as ViewStyle,

    routeStatsText: {
      fontSize: 11,
      color: colors.textSecondary,
    } as TextStyle,

    vanName: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textPrimary,
    } as TextStyle,

    otherWorkDurationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    } as ViewStyle,

    otherWorkDuration: {
      fontSize: 16,
      fontWeight: '600',
    } as TextStyle,

    // Warning Section
    warningCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.error + '10',
      borderRadius: 10,
      padding: 10,
      marginTop: 4,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.error + '30',
    } as ViewStyle,

    warningText: {
      flex: 1,
      fontSize: 12,
      color: colors.error,
      lineHeight: 16,
    } as TextStyle,
  });
};
