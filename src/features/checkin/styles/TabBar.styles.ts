// components/TabBar.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useTabBarStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    } as ViewStyle,

    tab: {
      flex: 1,
      paddingVertical: utils.spacing[3],
      alignItems: 'center',
      position: 'relative',
    } as ViewStyle,

    activeTab: {
      // Active tab styling
    } as ViewStyle,

    tabText: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.textSecondary,
    } as TextStyle,

    activeTabText: {
      color: colors.primary,
    } as TextStyle,

    indicator: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: colors.primary,
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
