import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

interface CurrentActivityCardStyleProps {
  selectedActivity?: string | null;
}

export const useCurrentActivityCardStyles = (props: CurrentActivityCardStyleProps = {}) => {
  const { colors } = useTheme();
  const { selectedActivity } = props;

  const styleGenerator = createStyles((utils) => ({
    activeCard: {
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.lg,
      padding: utils.spacing[4],
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    activityHighlightCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface || '#F8FAFC',
      borderRadius: utils.borderRadius.lg,
      padding: utils.spacing[3],
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    activityIconLarge: {
      width: 48,
      height: 48,
      borderRadius: utils.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    activityContent: {
      flex: 1,
      marginLeft: utils.spacing[3],
    } as ViewStyle,

    textXSmall: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    textXSmallBold: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textSecondary,
      letterSpacing: 0.4,
    } as TextStyle,

    textSmall: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
    } as TextStyle,

    textAccent: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.primary,
    } as TextStyle,

    titleSmall: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
      letterSpacing: 0.4,
    } as TextStyle,

    titleMedium: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
    } as TextStyle,

    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: utils.spacing[1],
    } as ViewStyle,

    activeBadge: {
      backgroundColor: colors.success + '20',
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
      borderRadius: utils.borderRadius.full,
      alignSelf: 'flex-start',
    } as ViewStyle,

    activeBadgeText: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.success,
      letterSpacing: 0.4,
    } as TextStyle,

    infoHighlightCard: {
      backgroundColor: colors.surface || '#F8FAFC',
      borderRadius: utils.borderRadius.lg,
      padding: utils.spacing[4],
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    infoRow: {
      flexDirection: 'row',
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    infoIconContainer: {
      width: 32,
      height: 32,
      borderRadius: utils.borderRadius.sm,
      backgroundColor: colors.primary + '10',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: utils.spacing[3],
    } as ViewStyle,

    infoContent: {
      flex: 1,
    } as ViewStyle,

    actionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: utils.spacing[2],
      marginTop: utils.spacing[2],
    } as ViewStyle,

    smallActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface || '#F1F5F9',
      paddingVertical: utils.spacing[2],
      paddingHorizontal: utils.spacing[3],
      borderRadius: utils.borderRadius.md,
      gap: utils.spacing[1],
      minWidth: 80,
    } as ViewStyle,

    changeActionText: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.primary,
      letterSpacing: 0.3,
    } as TextStyle,

    endActionText: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.error,
      letterSpacing: 0.3,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
