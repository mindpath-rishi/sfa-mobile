import { TextStyle, ViewStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useQuickActionsSectionStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      paddingHorizontal: 12,
      paddingTop: 4,
      paddingBottom: 4,
    } as ViewStyle,

    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
    } as ViewStyle,

    titleIcon: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary + '12',
    } as ViewStyle,

    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    actionsRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      flexWrap: 'wrap',
      columnGap: 14,
      rowGap: 8,
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
