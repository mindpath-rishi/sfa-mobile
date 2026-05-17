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

  // Size-based spacing (reduced for consistency)
  const getSpacing = () => {
    switch (size) {
      case 'small':
        return {
          containerPadding: styleUtils.spacing[3] || 12,
          gap: styleUtils.spacing[1.5] || 6,
          iconMarginBottom: styleUtils.spacing[1.5] || 6,
          textMarginBottom: styleUtils.spacing[1] || 4,
          actionsMarginTop: styleUtils.spacing[1.5] || 6,
        };
      case 'large':
        return {
          containerPadding: styleUtils.spacing[8] || 32,
          gap: styleUtils.spacing[4] || 16,
          iconMarginBottom: styleUtils.spacing[4] || 16,
          textMarginBottom: styleUtils.spacing[2] || 8,
          actionsMarginTop: styleUtils.spacing[4] || 16,
        };
      default:
        return {
          containerPadding: styleUtils.spacing[6] || 24,
          gap: styleUtils.spacing[3] || 12,
          iconMarginBottom: styleUtils.spacing[2] || 8,
          textMarginBottom: styleUtils.spacing[1.5] || 6,
          actionsMarginTop: styleUtils.spacing[3] || 12,
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
          titleColor: colors.textSecondary,
          descriptionColor: colors.textTertiary,
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
      fontSize: size === 'small' ? 15 : size === 'large' ? 20 : 17, // Reduced from 18/28/22
      fontWeight: '600',
      color: variantColors.titleColor,
      textAlign: 'center',
      marginBottom: spacing.textMarginBottom,
      lineHeight: size === 'large' ? 26 : 22,
    } as TextStyle,

    description: {
      fontSize: size === 'small' ? 12 : size === 'large' ? 14 : 13, // Reduced from 13/16/14
      fontWeight: '400',
      color: variantColors.descriptionColor,
      textAlign: 'center',
      lineHeight: size === 'large' ? 20 : 18,
    } as TextStyle,

    actionsContainer: {
      flexDirection: size === 'small' ? 'column' : 'row',
      gap: spacing.actionsMarginTop,
      marginTop: spacing.actionsMarginTop,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    actionButton: {
      minWidth: size === 'small' ? 90 : size === 'large' ? 140 : 110, // Reduced min widths
    } as ViewStyle,

    secondaryButton: {
      minWidth: size === 'small' ? 90 : size === 'large' ? 140 : 110,
    } as ViewStyle,
  };
};
