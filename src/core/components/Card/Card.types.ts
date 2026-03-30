// Card.types.ts - Updated with proper type definitions
import { ViewStyle, TouchableOpacityProps, PressableProps, StyleProp } from 'react-native';

export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'ghost';
export type CardPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type CardRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type CardSelectedVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface CardProps extends TouchableOpacityProps {
  /** Card content */
  children: React.ReactNode;
  /** Visual variant of the card */
  variant?: CardVariant;
  /** Padding size inside the card */
  padding?: CardPadding;
  /** Border radius of the card */
  radius?: CardRadius;
  /** Whether the card is in selected state */
  selected?: boolean;
  /** Visual variant when card is selected */
  selectedVariant?: CardSelectedVariant;
  /** Callback when card is pressed */
  onPress?: () => void;
  /** Callback when card is long pressed */
  onLongPress?: () => void;
  /** Callback when press starts */
  onPressIn?: () => void;
  /** Callback when press ends */
  onPressOut?: () => void;
  /** Additional styles for the container */
  style?: StyleProp<ViewStyle>;
  /** Test ID for testing */
  testID?: string;
  /** Whether the card is disabled */
  disabled?: boolean;
  /** Enable haptic feedback on press (mobile only) */
  hapticFeedback?: boolean;
  /** Scale animation on press */
  scaleOnPress?: boolean;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
}

export interface CardStyleProps {
  variant: CardVariant | CardSelectedVariant;
  padding: CardPadding;
  radius: CardRadius;
  disabled?: boolean;
  pressed?: boolean;
  isHovered?: boolean;
  scaleOnPress?: boolean;
  selected?: boolean;
}

export interface CardSectionProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

// Define the Card component type with static properties
export interface CardComponentType extends React.NamedExoticComponent<CardProps> {
  Header: React.NamedExoticComponent<CardSectionProps>;
  Content: React.NamedExoticComponent<CardSectionProps>;
  Footer: React.NamedExoticComponent<CardSectionProps>;
  Media: React.NamedExoticComponent<CardSectionProps>;
  Actions: React.NamedExoticComponent<CardSectionProps>;
}
