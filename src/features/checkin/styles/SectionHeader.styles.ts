// styles/SectionHeader.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useSectionHeaderStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: utils.spacing[3],
      marginLeft: utils.spacing[1],
    } as ViewStyle,

    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
    } as ViewStyle,

    baseTitle: {
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    defaultTitle: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
    } as TextStyle,

    largeTitle: {
      fontSize: utils.fontSize.lg,
      color: colors.textPrimary,
      fontWeight: utils.getFontWeight('bold'),
    } as TextStyle,

    smallTitle: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
    } as TextStyle,

    countBadge: {
      backgroundColor: colors.primary + '20',
      borderRadius: utils.borderRadius.full,
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
      minWidth: 24,
      alignItems: 'center',
    } as ViewStyle,

    countText: {
      fontSize: utils.fontSize.xs,
      color: colors.primary,
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,

    viewAllText: {
      color: colors.primary,
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
