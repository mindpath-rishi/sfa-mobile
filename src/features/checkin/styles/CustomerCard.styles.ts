// components/CustomerInfoCard.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useCustomerInfoCardStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      padding: utils.spacing[4],
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.lg,
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    customerId: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
      marginBottom: utils.spacing[2],
    } as TextStyle,

    customerAddress: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: utils.spacing[1],
    } as TextStyle,

    customerPhone: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: utils.spacing[1],
    } as TextStyle,

    customerRoute: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: utils.spacing[1],
    } as TextStyle,

    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: utils.spacing[3],
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
