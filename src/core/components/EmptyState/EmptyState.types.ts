import { ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type EmptyStateVariant = 'default' | 'error' | 'warning' | 'success' | 'info' | 'loading';

export type EmptyStateSize = 'small' | 'medium' | 'large';

export interface EmptyStateProps {
  // Content
  /**
   * Icon name from Ionicons
   */
  icon?: keyof typeof Ionicons.glyphMap;

  /**
   * Custom icon component (overrides icon prop)
   */
  iconComponent?: React.ReactNode;

  /**
   * Main title text
   */
  title: string;

  /**
   * Optional description text
   */
  description?: string;

  /**
   * Primary action button label
   */
  actionLabel?: string;

  /**
   * Primary action handler
   */
  onAction?: () => void;

  /**
   * Secondary action button label
   */
  secondaryActionLabel?: string;

  /**
   * Secondary action handler
   */
  onSecondaryAction?: () => void;

  /**
   * Visual variant
   * @default 'default'
   */
  variant?: EmptyStateVariant;

  /**
   * Size variant
   * @default 'medium'
   */
  size?: EmptyStateSize;

  /**
   * Enable/disable animations
   * @default true
   */
  animated?: boolean;

  // Styling
  /**
   * Custom icon size (overrides size-based default)
   */
  iconSize?: number;

  /**
   * Custom icon color (overrides variant-based default)
   */
  iconColor?: string;

  /**
   * Background image component
   */
  backgroundImage?: React.ReactNode;

  /**
   * Show overlay on background image
   */
  overlay?: boolean;

  // Layout
  /**
   * Stack items vertically (true) or horizontally (false)
   * @default true
   */
  vertical?: boolean;

  /**
   * Reverse the order of icon and content
   * @default false
   */
  reverse?: boolean;

  // State
  /**
   * Show loading state
   */
  loading?: boolean;

  /**
   * Error state (automatically sets variant)
   */
  error?: boolean;

  // Accessibility
  /**
   * Test ID for testing
   */
  testID?: string;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;

  // Custom styling
  /**
   * Container style
   */
  style?: ViewStyle;

  /**
   * Icon container style
   */
  iconContainerStyle?: ViewStyle;

  /**
   * Title text style
   */
  titleStyle?: TextStyle;

  /**
   * Description text style
   */
  descriptionStyle?: TextStyle;

  /**
   * Primary button style
   */
  actionButtonStyle?: ViewStyle;

  /**
   * Secondary button style
   */
  secondaryButtonStyle?: ViewStyle;

  /**
   * Additional content (rendered between description and actions)
   */
  children?: React.ReactNode;
}
