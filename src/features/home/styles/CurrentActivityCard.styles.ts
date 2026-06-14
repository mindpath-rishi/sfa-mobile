// CurrentActivityCard.styles.ts
import { StyleSheet, ViewStyle, TextStyle, Dimensions, Platform } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

const { width } = Dimensions.get('window');

export const useCurrentActivityCardStyles = ({
  selectedActivity,
}: {
  selectedActivity: string;
}) => {
  const { colors } = useTheme();

  return StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
      borderRadius: 0,
      padding: 0,
      // marginHorizontal: 16,
      // marginVertical: 8,
      // shadowColor: '#000',
      // shadowOffset: { width: 0, height: 2 },
      // shadowOpacity: 0.05,
      // shadowRadius: 8,
      // elevation: 2,
      // borderWidth: 1,
      // borderColor: colors.divider,
    } as ViewStyle,

    // Activity Header
    activityHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    } as ViewStyle,

    activityIcon: {
      width: 48,
      height: 48,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    activityInfo: {
      flex: 1,
      marginLeft: 12,
    } as ViewStyle,

    activityTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    } as ViewStyle,

    activityTypeText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    } as TextStyle,

    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
    } as ViewStyle,

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 4,
    } as ViewStyle,

    statusText: {
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 0.5,
    } as TextStyle,

    timerSection: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginTop: 4,
    } as ViewStyle,

    timerText: {
      fontSize: 24,
      fontWeight: '700',
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    } as TextStyle,

    startTimeText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 8,
    } as TextStyle,

    // Info Grid
    infoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 0,
    } as ViewStyle,

    infoCard: {
      flex: 1,
      minWidth: (width - 56) / 2 - 12,
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    otherWorkCard: {
      backgroundColor: colors.warning + '08',
      borderColor: colors.warning + '20',
    } as ViewStyle,

    infoCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
      gap: 6,
    } as ViewStyle,

    infoCardTitle: {
      fontSize: 12,
      fontWeight: '400',
      color: colors.textSecondary,
    } as TextStyle,

    routeName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    } as TextStyle,

    routeStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    } as ViewStyle,

    routeStatsText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    } as TextStyle,

    vanName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    } as TextStyle,

    otherWorkDurationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 2,
    } as ViewStyle,

    otherWorkDuration: {
      fontSize: 18,
      fontWeight: '700',
    } as TextStyle,

    // Warning Section
    warningCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FF6B6B10',
      borderRadius: 10,
      padding: 10,
      marginTop: 4,
      gap: 8,
      borderWidth: 1,
      borderColor: '#FF6B6B30',
    } as ViewStyle,

    warningText: {
      flex: 1,
      fontSize: 12,
      color: '#FF6B6B',
      lineHeight: 16,
    } as TextStyle,
  });
};
