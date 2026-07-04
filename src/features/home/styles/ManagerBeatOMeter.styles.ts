import { Platform, StyleSheet } from 'react-native';
import type { AppColors } from '@/shared/theme/colors';

export const createManagerBeatOMeterStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    content: {
      flexGrow: 1,
      padding: 14,
      paddingBottom: 32,
      gap: 12,
    },
    skeletonLineGap: {
      marginTop: 8,
    },
    skeletonTitleBlock: {
      flex: 1,
      minWidth: 0,
    },
    skeletonOutletRow: {
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    skeletonStatsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: `${colors.error}14`,
      borderWidth: 1,
      borderColor: `${colors.error}35`,
    },
    errorBannerText: {
      flex: 1,
      color: colors.error,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '700',
    },
    summaryCard: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 14,
      ...cardShadow(colors),
    },
    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    summaryTitleBlock: {
      flex: 1,
      minWidth: 0,
    },
    summaryEyebrow: {
      color: colors.textTertiary,
      fontSize: 10,
      lineHeight: 13,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    summaryTitle: {
      color: colors.textPrimary,
      fontSize: 22,
      lineHeight: 27,
      fontWeight: '900',
      marginTop: 2,
    },
    totalBadge: {
      width: 64,
      minHeight: 58,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: `${colors.primary}10`,
      borderWidth: 1,
      borderColor: `${colors.primary}20`,
      paddingHorizontal: 6,
    },
    totalBadgeValue: {
      color: colors.primary,
      fontSize: 20,
      lineHeight: 24,
      fontWeight: '900',
      textAlign: 'center',
    },
    totalBadgeLabel: {
      color: colors.textTertiary,
      fontSize: 9,
      lineHeight: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      textAlign: 'center',
    },
    primaryMetricRow: {
      flexDirection: 'row',
      gap: 8,
    },
    primaryMetric: {
      flex: 1,
      minWidth: 0,
      minHeight: 72,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: 8,
      backgroundColor: colors.backgroundSecondary,
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    primaryMetricIcon: {
      width: 32,
      height: 32,
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
    },
    visitedMetricIcon: {
      backgroundColor: colors.successLight,
    },
    orderedMetricIcon: {
      backgroundColor: colors.infoLight,
    },
    primaryMetricTextBlock: {
      flex: 1,
      minWidth: 0,
    },
    primaryMetricValue: {
      color: colors.textPrimary,
      fontSize: 17,
      lineHeight: 21,
      fontWeight: '900',
    },
    primaryMetricLabel: {
      color: colors.textTertiary,
      fontSize: 10,
      lineHeight: 13,
      fontWeight: '700',
      marginTop: 1,
    },
    primaryMetricPercent: {
      flexShrink: 0,
      color: colors.textSecondary,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: '800',
      textAlign: 'right',
    },
    progressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: -8,
    },
    progressLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: '700',
    },
    progressValue: {
      color: colors.textPrimary,
      fontSize: 12,
      lineHeight: 15,
      fontWeight: '900',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.borderLight,
      padding: 12,
      ...cardShadow(colors),
    },
    progressTrack: {
      height: 10,
      borderRadius: 6,
      overflow: 'hidden',
      flexDirection: 'row',
      backgroundColor: colors.backgroundTertiary,
    },
    progressFill: {
      backgroundColor: colors.success,
    },
    progressTail: {
      backgroundColor: colors.error,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 12,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    legendDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    legendText: {
      color: colors.textTertiary,
      fontSize: 10,
      lineHeight: 13,
      fontWeight: '700',
    },
    tableHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    tableHeadText: {
      flex: 1,
      color: colors.primaryDark,
      fontSize: 11,
      fontWeight: '900',
      textAlign: 'right',
      textTransform: 'uppercase',
    },
    typeColumn: {
      flex: 1.35,
      textAlign: 'left',
    },
    tableRow: {
      minHeight: 32,
      flexDirection: 'row',
      alignItems: 'center',
    },
    colorBar: {
      width: 6,
      height: 24,
      borderRadius: 2,
      marginRight: 8,
    },
    cellText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: 11,
      textAlign: 'right',
    },
    emptyText: {
      paddingVertical: 14,
      color: colors.textTertiary,
      fontSize: 10,
      fontWeight: '800',
      textAlign: 'center',
    },
  });

const cardShadow = (colors: AppColors) =>
  Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    },
    android: {
      elevation: 1,
    },
    default: {
      boxShadow: `0 2px 8px ${colors.shadow}12`,
    },
  });
