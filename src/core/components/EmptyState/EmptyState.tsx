import React, { useMemo } from 'react';
import { View, TouchableOpacity, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { EmptyStateProps, EmptyStateVariant, EmptyStateSize } from './EmptyState.types';
import { useEmptyStateStyles } from './EmptyState.styles';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppButton, AppText } from '..';

/**
 * EmptyState component for displaying empty states, errors, loading states, etc.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <EmptyState
 *   title="No items found"
 *   description="Try adjusting your filters or add a new item"
 *   icon="folder-open-outline"
 * />
 *
 * // With action button
 * <EmptyState
 *   title="No connections"
 *   description="Connect with others to get started"
 *   actionLabel="Connect Now"
 *   onAction={() => {}}
 *   variant="compact"
 * />
 *
 * // Error state
 * <EmptyState
 *   variant="error"
 *   title="Something went wrong"
 *   description="Unable to load data. Please try again."
 *   actionLabel="Retry"
 *   onAction={() => {}}
 * />
 * ```
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  // Content
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,

  // Visual variants
  variant = 'default',
  size = 'medium',
  animated = true,

  // Styling
  iconSize,
  iconColor,
  iconComponent,
  backgroundImage,
  overlay = false,

  // Layout
  vertical = true,
  reverse = false,

  // State
  loading = false,
  error = false,

  // Accessibility
  testID = 'empty-state',
  accessibilityLabel,

  // Custom styling
  style,
  iconContainerStyle,
  titleStyle,
  descriptionStyle,
  actionButtonStyle,
  secondaryButtonStyle,

  // Children
  children,
}) => {
  const { colors } = useTheme();
  const styles = useEmptyStateStyles(variant, size, overlay, style);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
  const translateYAnim = React.useRef(new Animated.Value(20)).current;

  // Run animation on mount
  React.useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
      translateYAnim.setValue(0);
    }
  }, [animated]);

  // Get icon based on variant if not provided
  const defaultIcon = useMemo(() => {
    if (icon) return icon;

    switch (variant) {
      case 'error':
        return 'alert-circle-outline';
      case 'warning':
        return 'warning-outline';
      case 'success':
        return 'checkmark-circle-outline';
      case 'info':
        return 'information-circle-outline';
      case 'loading':
        return 'refresh-outline';
      default:
        return 'sad-outline';
    }
  }, [variant, icon]);

  // Get icon color based on variant if not provided
  const defaultIconColor = useMemo(() => {
    if (iconColor) return iconColor;

    switch (variant) {
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'success':
        return colors.success;
      case 'info':
        return colors.info;
      default:
        return colors.textTertiary;
    }
  }, [variant, iconColor, colors]);

  // Get default icon size if not provided
  const defaultIconSize = useMemo(() => {
    if (iconSize) return iconSize;

    switch (size) {
      case 'small':
        return 48;
      case 'large':
        return 96;
      default:
        return 64;
    }
  }, [size, iconSize]);

  // Get layout direction
  const layoutDirection = useMemo(() => {
    if (vertical) return 'column';
    return reverse ? 'row-reverse' : 'row';
  }, [vertical, reverse]);

  // Render icon
  const renderIcon = () => {
    if (loading) {
      return (
        <Animated.View
          style={[
            styles.iconContainer,
            iconContainerStyle,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Ionicons name="refresh-outline" size={defaultIconSize} color={defaultIconColor} />
        </Animated.View>
      );
    }

    if (iconComponent) {
      return (
        <Animated.View
          style={[
            styles.iconContainer,
            iconContainerStyle,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {iconComponent}
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={[
          styles.iconContainer,
          iconContainerStyle,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Ionicons name={defaultIcon} size={defaultIconSize} color={defaultIconColor} />
      </Animated.View>
    );
  };

  // Render title
  const renderTitle = () => {
    if (!title) return null;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        }}
      >
        <AppText
          variant={size === 'small' ? 'title' : size === 'large' ? 'heading' : 'body'}
          weight="semibold"
          align="center"
          style={[styles.title, titleStyle]}
        >
          {title}
        </AppText>
      </Animated.View>
    );
  };

  // Render description
  const renderDescription = () => {
    if (!description) return null;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        }}
      >
        <AppText variant="body" align="center" style={[styles.description, descriptionStyle]}>
          {description}
        </AppText>
      </Animated.View>
    );
  };

  // Render action buttons
  const renderActions = () => {
    if (!actionLabel && !secondaryActionLabel) return null;

    return (
      <Animated.View
        style={[
          styles.actionsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          },
        ]}
      >
        {actionLabel && onAction && (
          <AppButton
            title={actionLabel}
            onPress={onAction}
            variant={variant === 'error' ? 'error' : 'primary'}
            size={size === 'small' ? 'small' : 'medium'}
            style={
              actionButtonStyle
                ? { ...styles.actionButton, ...actionButtonStyle }
                : styles.actionButton
            }
            loading={loading}
          />
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <AppButton
            title={secondaryActionLabel}
            onPress={onSecondaryAction}
            variant="outline"
            size={size === 'small' ? 'small' : 'medium'}
            style={
              secondaryButtonStyle
                ? { ...styles.secondaryButton, ...secondaryButtonStyle }
                : styles.secondaryButton
            }
          />
        )}
      </Animated.View>
    );
  };

  // Render content
  const content = (
    <>
      {!reverse && renderIcon()}
      <View style={[styles.textContainer, { flexDirection: layoutDirection }]}>
        <View style={styles.textContent}>
          {renderTitle()}
          {renderDescription()}
          {children}
        </View>
        {renderActions()}
      </View>
      {reverse && renderIcon()}
    </>
  );

  // Wrapper with background image if provided
  if (backgroundImage) {
    return (
      <View style={[styles.container, style]} testID={testID}>
        <View style={styles.backgroundImageContainer}>{backgroundImage}</View>
        <View style={styles.contentOverlay}>{content}</View>
      </View>
    );
  }

  // Touchable wrapper if action provided
  if (onAction && !actionLabel) {
    return (
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={onAction}
        activeOpacity={0.7}
        testID={testID}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityRole="button"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[styles.container, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="none"
    >
      {content}
    </View>
  );
};

EmptyState.displayName = 'EmptyState';

export default EmptyState;
