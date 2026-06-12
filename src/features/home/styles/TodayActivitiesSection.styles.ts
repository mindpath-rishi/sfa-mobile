import { TextStyle, ViewStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useTodayActivitiesSectionStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles(() => ({
    container: {
      width: '100%',
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingTop: 14,
      paddingBottom: 10,
    } as ViewStyle,

    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    } as ViewStyle,

    headerIcon: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary + '12',
    } as ViewStyle,

    headerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 28,
    } as ViewStyle,

    emptyStateIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      backgroundColor: colors.backgroundSecondary,
    } as ViewStyle,

    emptyStateTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textPrimary,
      marginBottom: 4,
    } as TextStyle,

    emptyStateSubtitle: {
      fontSize: 12,
      textAlign: 'center',
      color: colors.textSecondary,
    } as TextStyle,

    showMoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      marginTop: 8,
      borderRadius: 7,
      backgroundColor: colors.backgroundSecondary,
    } as ViewStyle,

    showMoreText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    } as TextStyle,

    showMoreIcon: {
      marginLeft: 4,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
