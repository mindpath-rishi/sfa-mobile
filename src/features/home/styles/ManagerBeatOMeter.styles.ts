import { StyleSheet } from 'react-native';
import type { AppColors } from '@/shared/theme/colors';

export const createManagerBeatOMeterStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    content: {
      padding: 12,
      paddingBottom: 32,
      gap: 12,
    },
    listCard: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    beatRow: {
      minHeight: 62,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    beatRowActive: {
      backgroundColor: colors.infoLight,
    },
    beatTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '800',
    },
    beatSubtitle: {
      color: colors.textTertiary,
      fontSize: 12,
      marginTop: 2,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.borderLight,
      padding: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    eyebrow: {
      color: colors.textTertiary,
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '800',
    },
    subtitle: {
      color: colors.textTertiary,
      fontSize: 12,
      marginTop: 2,
    },
    shareButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.infoLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
    },
    totalLabel: {
      color: colors.textTertiary,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    totalValue: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '900',
    },
    progressTrack: {
      height: 18,
      borderRadius: 4,
      overflow: 'hidden',
      flexDirection: 'row',
      marginTop: 6,
      marginBottom: 18,
    },
    progressFill: {
      backgroundColor: colors.success,
    },
    progressTail: {
      backgroundColor: colors.error,
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
