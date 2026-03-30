// Card.styles.ts - Ensure styles are properly typed
import { createStyles, StyleUtils } from '@/shared/theme/styles';
import { ViewStyle, StyleProp, Platform } from 'react-native';
import { CardStyleProps } from './Card.types';
import { useTheme } from '@/shared/hooks/useTheme';

export const useCardStyles = (props: CardStyleProps) => {
  const {
    variant,
    padding,
    radius,
    disabled = false,
    pressed = false,
    isHovered = false,
    scaleOnPress = true,
    selected = false,
  } = props;
  const { colors } = useTheme();

  // Helper to get color based on selected variant
  const getSelectedColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'success':
        return colors.success || '#4CAF50';
      case 'warning':
        return colors.warning || '#FF9800';
      case 'danger':
        return colors.error || '#F44336';
      case 'info':
        return colors.info || '#2196F3';
      default:
        return colors.primary;
    }
  };

  const styleGenerator = createStyles((utils: StyleUtils) => {
    // Get background color based on variant and state
    const getBackgroundColor = (): string => {
      if (disabled) return colors.border + '50';

      // Selected state styles
      if (selected) {
        const selectedColor = getSelectedColor();
        return selectedColor + '10';
      }

      if (pressed) {
        switch (variant) {
          case 'elevated':
            return colors.surface;
          case 'outlined':
            return colors.surface + '80';
          case 'filled':
            return colors.surface;
          case 'ghost':
            return colors.overlay + '20';
          default:
            return colors.card;
        }
      }

      if (isHovered && variant === 'ghost') {
        return colors.overlay + '10';
      }

      switch (variant) {
        case 'elevated':
          return colors.card;
        case 'outlined':
          return 'transparent';
        case 'filled':
          return colors.surface;
        case 'ghost':
          return 'transparent';
        default:
          return colors.card;
      }
    };

    // Get border color based on variant and state
    const getBorderColor = (): string => {
      if (disabled) return colors.border + '50';

      // Selected state styles
      if (selected) {
        return getSelectedColor();
      }

      if (pressed && variant === 'outlined') return colors.primary;

      switch (variant) {
        case 'outlined':
          return colors.border;
        default:
          return 'transparent';
      }
    };

    // Get border width based on variant and state
    const getBorderWidth = (): number => {
      if (selected) return 2;
      if (variant === 'outlined') return 1;
      return 0;
    };

    // Get shadow/elevation based on variant and state
    const getShadow = (): ViewStyle => {
      if (disabled) return {};

      // Selected state shadow
      if (selected) {
        const selectedColor = getSelectedColor();
        return {
          shadowColor: selectedColor,
          shadowOffset: { width: 0, height: pressed ? 4 : 2 },
          shadowOpacity: 0.25,
          shadowRadius: pressed ? 8 : 6,
          elevation: pressed ? 6 : 4,
        };
      }

      if (variant !== 'elevated') return {};

      const baseElevation = pressed ? 4 : 2;
      const baseOpacity = pressed ? 0.15 : 0.1;

      return {
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: pressed ? 3 : 2 },
        shadowOpacity: baseOpacity,
        shadowRadius: pressed ? 6 : 4,
        elevation: baseElevation,
      };
    };

    // Get padding based on size
    const getPadding = (): number => {
      const spacingMap: Record<string, number> = {
        none: 0,
        xs: utils.spacing[1] || 4,
        sm: utils.spacing[2] || 8,
        md: utils.spacing[4] || 16,
        lg: utils.spacing[6] || 24,
        xl: utils.spacing[8] || 32,
      };
      return spacingMap[padding] || utils.spacing[4] || 16;
    };

    // Get border radius based on size
    const getBorderRadius = (): number => {
      const radiusMap: Record<string, number> = {
        none: 0,
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999,
      };
      return radiusMap[radius] || 12;
    };

    const paddingValue = getPadding();
    const borderRadius = getBorderRadius();

    return {
      container: {
        backgroundColor: getBackgroundColor(),
        borderColor: getBorderColor(),
        borderWidth: getBorderWidth(),
        borderRadius,
        padding: paddingValue,
        overflow: 'hidden',
        ...getShadow(),
        transition: 'all 0.2s ease-in-out',
      } as ViewStyle,

      selectedContainer: {
        borderWidth: 2,
        ...(variant === 'elevated' && {
          shadowOpacity: 0.25,
          shadowRadius: 6,
          elevation: 5,
        }),
      } as ViewStyle,

      pressedScale: {
        transform: [{ scale: 0.98 }],
      } as ViewStyle,

      webPressed: {
        transform: [{ scale: scaleOnPress ? 0.98 : 1 }],
        transition: `transform ${150}ms ease-in-out`,
      } as ViewStyle,

      webHovered: {
        transform: [{ scale: 1.01 }],
        transition: `transform ${150}ms ease-in-out`,
      } as ViewStyle,

      touchableOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: pressed ? colors.primary + '20' : 'transparent',
        borderRadius,
      } as ViewStyle,

      header: {
        paddingBottom: paddingValue ? paddingValue / 2 : 0,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        marginBottom: paddingValue ? paddingValue / 2 : 0,
      } as ViewStyle,

      footer: {
        paddingTop: paddingValue ? paddingValue / 2 : 0,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
        marginTop: paddingValue ? paddingValue / 2 : 0,
      } as ViewStyle,

      content: {
        flex: 1,
      } as ViewStyle,

      media: {
        marginHorizontal: -paddingValue,
        marginTop: -paddingValue,
        marginBottom: paddingValue,
      } as ViewStyle,

      actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: utils.spacing[2] || 8,
        marginTop: paddingValue,
      } as ViewStyle,
    };
  });

  return styleGenerator(colors);
};
