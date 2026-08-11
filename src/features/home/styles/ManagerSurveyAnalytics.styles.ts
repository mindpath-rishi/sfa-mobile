import { StyleSheet } from 'react-native';
import type { AppColors } from '@/shared/theme/colors';

export const createManagerSurveyAnalyticsStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    content: {
      padding: 12,
      paddingBottom: 32,
    },
    tabs: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 6,
      overflow: 'hidden',
      marginBottom: 14,
      backgroundColor: colors.surface,
    },
    tab: {
      flex: 1,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: '900',
    },
    tabTextActive: {
      color: colors.primaryContrast,
    },
    surveyCard: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.borderLight,
      padding: 14,
    },
    surveyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '800',
    },
    statusPill: {
      backgroundColor: colors.successLight,
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    statusText: {
      color: colors.successDark,
      fontSize: 11,
      fontWeight: '800',
    },
    dateRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    dateText: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: '800',
    },
    dateLabel: {
      color: colors.textTertiary,
      fontSize: 11,
      marginTop: 2,
    },
    detailCard: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.borderLight,
      padding: 12,
    },
    questionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    questionText: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: '800',
      flex: 1,
    },
    closeButton: {
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mediaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    thumbnail: {
      width: 46,
      height: 46,
      borderRadius: 4,
      backgroundColor: colors.backgroundTertiary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    viewAllText: {
      color: colors.info,
      fontSize: 12,
      fontWeight: '900',
      textTransform: 'uppercase',
      marginLeft: 8,
    },
  });
