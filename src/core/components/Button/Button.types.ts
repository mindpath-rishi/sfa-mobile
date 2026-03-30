// src/core/components/Button/Button.types.ts
import { ViewStyle, TextStyle } from 'react-native';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'outline'
  | 'ghost';

export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  /** Button text */
  title?: string;
  /** Whether the button is in loading state */
  loading?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Callback when button is pressed */
  onPress?: () => void;
  /** Visual variant of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Whether the button should take full width */
  fullWidth?: boolean;
  /** Icon to display on the left */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right */
  rightIcon?: React.ReactNode;
  /** Whether the button is icon-only (no text) */
  iconOnly?: boolean;
  /** Additional styles for the button container */
  style?: ViewStyle;
  /** Additional styles for the button text */
  textStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
  /** Enable haptic feedback on press (mobile only) */
  hapticFeedback?: boolean;
  /** Enable press animation */
  animation?: boolean;
}
