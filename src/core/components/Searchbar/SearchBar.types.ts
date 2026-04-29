import { TextStyle, ViewStyle } from 'react-native';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;

  placeholder?: string;
  debounceDelay?: number;

  disabled?: boolean;
  loading?: boolean;

  /** Show clear (X) button */
  clearable?: boolean;

  /** Left icon (default: search) */
  leftIcon?: React.ReactNode;

  /** Right icon (custom action) */
  rightIcon?: React.ReactNode;

  /** Callback when clear pressed */
  onClear?: () => void;

  /** Full width */
  fullWidth?: boolean;

  /** Container style */
  style?: ViewStyle;

  /** Input style */
  inputStyle?: TextStyle;

  testID?: string;

  /** Enable animation like button */
  animation?: boolean;
}
