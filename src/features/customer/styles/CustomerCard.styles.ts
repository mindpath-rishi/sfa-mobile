import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useCustomerCardStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    card: {
      // marginHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    header: {
      flexDirection: 'row',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    headerContent: {
      flex: 1,
    } as ViewStyle,

    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as ViewStyle,

    customerName: {
      color: colors.textPrimary,
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    customerInfo: {
      color: colors.textSecondary,
      fontSize: utils.fontSize.sm,
      marginTop: utils.spacing[0.5],
    } as TextStyle,

    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: utils.spacing[1],
    } as ViewStyle,

    locationText: {
      color: colors.textTertiary,
      fontSize: utils.fontSize.xs,
      marginLeft: utils.spacing[0.5],
      flex: 1,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
