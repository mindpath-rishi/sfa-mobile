import { StyleSheet } from 'react-native';
import type { AppColors } from '@/shared/theme/colors';

export const createManagerTeamCoverageStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    content: {
      padding: 14,
      paddingBottom: 32,
    },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    toolbarLabel: {
      color: colors.textTertiary,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    linkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    linkText: {
      color: colors.info,
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      shadowColor: colors.shadow,
      shadowOpacity: 1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    position: {
      color: colors.textTertiary,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    title: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '900',
      marginTop: 3,
    },
    subtitle: {
      color: colors.textTertiary,
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
    },
    badge: {
      backgroundColor: colors.infoLight,
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    badgeText: {
      color: colors.info,
      fontSize: 10,
      fontWeight: '900',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: 16,
    },
    stat: {
      width: '33.333%',
      alignItems: 'center',
      gap: 5,
    },
    statValue: {
      color: colors.textPrimary,
      fontSize: 17,
      fontWeight: '900',
    },
    statLabel: {
      color: colors.textTertiary,
      fontSize: 10,
      fontWeight: '700',
      textAlign: 'center',
    },
  });
