import { ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { styleUtils } from '@/shared/theme/styles';

export const useEmptyStateStyles = (style?: ViewStyle) => {
  const { colors } = useTheme();

  return {
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: styleUtils.spacing[8] || 32,
      ...style,
    } as ViewStyle,
    iconContainer: {
      marginBottom: styleUtils.spacing[4] || 16,
    } as ViewStyle,
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: styleUtils.spacing[2] || 8,
    } as TextStyle,
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: styleUtils.spacing[4] || 16,
    } as TextStyle,
    actionButton: {
      minWidth: 120,
    } as ViewStyle,
  };
};
