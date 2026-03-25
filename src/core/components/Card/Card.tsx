// Card.tsx
import React, { useState, useCallback, useMemo, memo } from 'react';
import { View, TouchableOpacity, ViewStyle, Pressable, Platform, StyleProp } from 'react-native';
import { CardProps, CardSectionProps } from './Card.types';
import { useCardStyles } from './Card.styles';

// Memoized section components for better performance
const CardSection: React.FC<CardSectionProps> = memo(({ children, style, testID }) => (
  <View style={style} testID={testID}>
    {children}
  </View>
));

CardSection.displayName = 'CardSection';

// Subcomponents with proper typing and memoization
const Header = memo<CardSectionProps>(({ children, style, testID }) => {
  const styles = useCardStyles({ variant: 'elevated', padding: 'md', radius: 'lg' });
  return (
    <CardSection style={[styles.header, style]} testID={testID}>
      {children}
    </CardSection>
  );
});
Header.displayName = 'Card.Header';

const Content = memo<CardSectionProps>(({ children, style, testID }) => {
  const styles = useCardStyles({ variant: 'elevated', padding: 'md', radius: 'lg' });
  return (
    <CardSection style={[styles.content, style]} testID={testID}>
      {children}
    </CardSection>
  );
});
Content.displayName = 'Card.Content';

const Footer = memo<CardSectionProps>(({ children, style, testID }) => {
  const styles = useCardStyles({ variant: 'elevated', padding: 'md', radius: 'lg' });
  return (
    <CardSection style={[styles.footer, style]} testID={testID}>
      {children}
    </CardSection>
  );
});
Footer.displayName = 'Card.Footer';

const Media = memo<CardSectionProps>(({ children, style, testID }) => {
  const styles = useCardStyles({ variant: 'elevated', padding: 'md', radius: 'lg' });
  return (
    <CardSection style={[styles.media, style]} testID={testID}>
      {children}
    </CardSection>
  );
});
Media.displayName = 'Card.Media';

const Actions = memo<CardSectionProps>(({ children, style, testID }) => {
  const styles = useCardStyles({ variant: 'elevated', padding: 'md', radius: 'lg' });
  return (
    <CardSection style={[styles.actions, style]} testID={testID}>
      {children}
    </CardSection>
  );
});
Actions.displayName = 'Card.Actions';

/**
 * AppCard component for containing content with consistent styling
 *
 * @example
 * ```tsx
 * // Basic card
 * <AppCard variant="elevated" padding="md">
 *   <Text>Card Content</Text>
 * </AppCard>
 *
 * // Pressable card
 * <AppCard
 *   variant="outlined"
 *   padding="lg"
 *   radius="lg"
 *   onPress={() => console.log('pressed')}
 * >
 *   <Text>Pressable Card</Text>
 * </AppCard>
 *
 * // Card with all sections
 * <AppCard variant="filled" padding="md">
 *   <AppCard.Header>
 *     <Text variant="h4">Header</Text>
 *   </AppCard.Header>
 *   <AppCard.Content>
 *     <Text>Main Content</Text>
 *   </AppCard.Content>
 *   <AppCard.Footer>
 *     <Text variant="caption">Footer</Text>
 *   </AppCard.Footer>
 * </AppCard>
 * ```
 */
const AppCardComponent = memo<CardProps>(
  ({
    children,
    variant = 'elevated',
    padding = 'md',
    radius = 'lg',
    onPress,
    onLongPress,
    onPressIn,
    onPressOut,
    style,
    testID = 'card',
    disabled = false,
    hapticFeedback = false,
    scaleOnPress = true,
    animationDuration = 150,
    accessibilityLabel,
    accessibilityHint,
    ...restProps
  }) => {
    const [pressed, setPressed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const isPressable = !!onPress || !!onLongPress;

    const styles = useCardStyles({
      variant,
      padding,
      radius,
      disabled,
      pressed,
      isHovered,
      scaleOnPress,
    });

    // Memoized handlers
    const handlePressIn = useCallback(
      (event: any) => {
        if (disabled) return;

        setPressed(true);

        if (hapticFeedback && Platform.OS !== 'web') {
          // You can implement haptic feedback here
          // Example: Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        onPressIn?.(event);
      },
      [disabled, hapticFeedback, onPressIn],
    );

    const handlePressOut = useCallback(
      (event: any) => {
        if (disabled) return;

        setPressed(false);
        onPressOut?.(event);
      },
      [disabled, onPressOut],
    );

    const handleHoverIn = useCallback(() => {
      if (!disabled && Platform.OS === 'web') {
        setIsHovered(true);
      }
    }, [disabled]);

    const handleHoverOut = useCallback(() => {
      if (!disabled && Platform.OS === 'web') {
        setIsHovered(false);
      }
    }, [disabled]);

    const containerStyle = useMemo<StyleProp<ViewStyle>>(
      () => [styles.container, scaleOnPress && pressed && styles.pressedScale, style],
      [styles.container, styles.pressedScale, pressed, scaleOnPress, style],
    );

    // Choose appropriate container component based on pressability and platform
    const Container = useMemo(() => {
      if (!isPressable) return View;
      if (Platform.OS === 'web') return Pressable;
      return TouchableOpacity;
    }, [isPressable]);

    const pressableProps = useMemo(() => {
      if (!isPressable) return {};

      const commonProps = {
        onPress: disabled ? undefined : onPress,
        onLongPress: disabled ? undefined : onLongPress,
        onPressIn: handlePressIn,
        onPressOut: handlePressOut,
        disabled,
        accessibilityRole: 'button' as const,
        accessibilityLabel: accessibilityLabel || 'Card',
        accessibilityHint,
        accessibilityState: { disabled, pressed },
      };

      if (Platform.OS === 'web') {
        return {
          ...commonProps,
          onHoverIn: handleHoverIn,
          onHoverOut: handleHoverOut,
          style: ({ pressed: webPressed, hovered }: any): StyleProp<ViewStyle> => [
            styles.container,
            scaleOnPress && pressed && styles.pressedScale,
            style,
            webPressed && styles.webPressed,
            hovered && styles.webHovered,
          ],
        };
      }

      return {
        ...commonProps,
        activeOpacity: 0.7,
        style: containerStyle,
      };
    }, [
      isPressable,
      disabled,
      onPress,
      onLongPress,
      handlePressIn,
      handlePressOut,
      accessibilityLabel,
      accessibilityHint,
      pressed,
      containerStyle,
      styles.container,
      styles.pressedScale,
      styles.webPressed,
      styles.webHovered,
      style,
      scaleOnPress,
      handleHoverIn,
      handleHoverOut,
    ]);

    // Render appropriate container
    if (Platform.OS === 'web' && isPressable) {
      return (
        <Pressable testID={testID} {...pressableProps} {...restProps}>
          {children}
          {isPressable && <View style={styles.touchableOverlay} pointerEvents="none" />}
        </Pressable>
      );
    }

    return (
      <Container
        testID={testID}
        {...pressableProps}
        {...restProps}
        style={!isPressable || Platform.OS !== 'web' ? containerStyle : undefined}
      >
        {children}
        {isPressable && <View style={styles.touchableOverlay} pointerEvents="none" />}
      </Container>
    );
  },
);

// Attach subcomponents with proper typing
export const AppCard = AppCardComponent as typeof AppCardComponent & {
  Header: typeof Header;
  Content: typeof Content;
  Footer: typeof Footer;
  Media: typeof Media;
  Actions: typeof Actions;
};

AppCard.Header = Header;
AppCard.Content = Content;
AppCard.Footer = Footer;
AppCard.Media = Media;
AppCard.Actions = Actions;
AppCard.displayName = 'AppCard';
export default AppCard;
