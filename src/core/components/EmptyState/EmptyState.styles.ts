import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { styleUtils } from '@/shared/theme/styles';
import { EmptyStateSize, EmptyStateVariant } from './EmptyState.types';

export const useEmptyStateStyles = (
  variant: EmptyStateVariant = 'default',
  size: EmptyStateSize = 'medium',
  overlay: boolean = false,
  style?: ViewStyle,
) => {
  const { colors } = useTheme();

  // Size-based spacing
  const getSpacing = () => {
    switch (size) {
      case 'small':
        return {
          containerPadding: styleUtils.spacing[4] || 16,
          gap: styleUtils.spacing[2] || 8,
          iconMarginBottom: styleUtils.spacing[2] || 8,
          textMarginBottom: styleUtils.spacing[1] || 4,
          actionsMarginTop: styleUtils.spacing[2] || 8,
        };
      case 'large':
        return {
          containerPadding: styleUtils.spacing[12] || 48,
          gap: styleUtils.spacing[6] || 24,
          iconMarginBottom: styleUtils.spacing[6] || 24,
          textMarginBottom: styleUtils.spacing[4] || 16,
          actionsMarginTop: styleUtils.spacing[6] || 24,
        };
      default:
        return {
          containerPadding: styleUtils.spacing[8] || 32,
          gap: styleUtils.spacing[4] || 16,
          iconMarginBottom: styleUtils.spacing[4] || 16,
          textMarginBottom: styleUtils.spacing[2] || 8,
          actionsMarginTop: styleUtils.spacing[4] || 16,
        };
    }
  };

  const spacing = getSpacing();

  // Variant-based colors
  const getVariantColors = () => {
    switch (variant) {
      case 'error':
        return {
          titleColor: colors.error,
          descriptionColor: colors.errorLight,
          background: colors.error,
        };
      case 'warning':
        return {
          titleColor: colors.warning,
          descriptionColor: colors.warningLight,
          background: colors.warning,
        };
      case 'success':
        return {
          titleColor: colors.success,
          descriptionColor: colors.successLight,
          background: colors.success,
        };
      case 'info':
        return {
          titleColor: colors.info,
          descriptionColor: colors.infoLight,
          background: colors.info,
        };
      default:
        return {
          titleColor: colors.textPrimary,
          descriptionColor: colors.textSecondary,
          background: 'transparent',
        };
    }
  };

  const variantColors = getVariantColors();

  return {
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.containerPadding,
      backgroundColor: overlay ? 'rgba(0,0,0,0.5)' : variantColors.background,
      ...style,
    } as ViewStyle,

    backgroundImageContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    } as ViewStyle,

    contentOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: overlay ? 'rgba(0,0,0,0.5)' : 'transparent',
      padding: spacing.containerPadding,
    } as ViewStyle,

    textContainer: {
      alignItems: 'center',
      gap: spacing.gap,
    } as ViewStyle,

    textContent: {
      alignItems: 'center',
      gap: spacing.textMarginBottom,
    } as ViewStyle,

    iconContainer: {
      marginBottom: spacing.iconMarginBottom,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    title: {
      fontSize: size === 'small' ? 18 : size === 'large' ? 28 : 22,
      fontWeight: '600',
      color: variantColors.titleColor,
      textAlign: 'center',
      marginBottom: spacing.textMarginBottom,
    } as TextStyle,

    description: {
      fontSize: size === 'small' ? 13 : size === 'large' ? 16 : 14,
      color: variantColors.descriptionColor,
      textAlign: 'center',
      lineHeight: size === 'large' ? 24 : 20,
    } as TextStyle,

    actionsContainer: {
      flexDirection: size === 'small' ? 'column' : 'row',
      gap: spacing.actionsMarginTop,
      marginTop: spacing.actionsMarginTop,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    actionButton: {
      minWidth: size === 'small' ? 100 : size === 'large' ? 160 : 120,
    } as ViewStyle,

    secondaryButton: {
      minWidth: size === 'small' ? 100 : size === 'large' ? 160 : 120,
    } as ViewStyle,
  };
};
