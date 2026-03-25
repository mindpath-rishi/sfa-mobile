// src/core/components/Accordion/Accordion.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { styleUtils } from '@/shared/theme';

export const useAccordionStyles = (
  variant: 'default' | 'bordered' | 'separated',
  style?: ViewStyle,
) => {
  const { colors } = useTheme();

  // Get variant styles
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'bordered':
        return {
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: styleUtils.borderRadius.lg,
        };
      case 'separated':
        return {
          gap: styleUtils.spacing[2] || 8,
        };
      default:
        return {};
    }
  };

  return {
    container: {
      width: '100%',
      ...getVariantStyles(),
      ...style,
    } as ViewStyle,
    itemContainer: {
      backgroundColor: colors.surface,
      overflow: 'hidden',
      ...(variant === 'separated' && {
        borderRadius: styleUtils.borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
      }),
    } as ViewStyle,
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: styleUtils.spacing[4] || 16,
      backgroundColor: colors.surface,
    } as ViewStyle,
    titleContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: styleUtils.spacing[2] || 8,
    } as ViewStyle,
    title: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.textPrimary,
      flex: 1,
    } as TextStyle,
    icon: {
      marginLeft: styleUtils.spacing[2] || 8,
    } as ViewStyle,
    content: {
      padding: styleUtils.spacing[4] || 16,
      paddingTop: 0,
      backgroundColor: colors.background,
    } as ViewStyle,
    divider: {
      height: 1,
      backgroundColor: colors.divider,
    } as ViewStyle,
  };
};
