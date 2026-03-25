// components/ReasonListItem.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useReasonListItemStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.md,
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      marginBottom: utils.spacing[2],
      borderWidth: 1,
    } as ViewStyle,

    selectedContainer: {
      backgroundColor: colors.primary + '10',
    } as ViewStyle,

    text: {
      fontSize: utils.fontSize.md,
      color: colors.textPrimary,
      flex: 1,
    } as TextStyle,

    selectedText: {
      color: colors.primary,
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,

    checkIcon: {
      marginLeft: utils.spacing[2],
    },
  }));

  return styleGenerator(colors);
};
