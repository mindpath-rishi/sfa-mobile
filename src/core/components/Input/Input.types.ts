import { TextInputProps, ViewStyle, TextStyle } from 'react-native';

export type InputVariant = 'outlined' | 'filled' | 'underlined' | 'ghost';
export type InputSize = 'small' | 'medium' | 'large';

export interface CoreInputProps extends Omit<TextInputProps, 'style'> {
  // Styling
  style?: TextStyle;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  helperStyle?: TextStyle;

  // Labels and text
  label?: string;
  error?: boolean;
  helperText?: string;
  success?: boolean;
  successMessage?: string;

  // Icons
  leftIcon?: React.ReactNode | string;
  rightIcon?: React.ReactNode | string;
  onLeftIconPress?: () => void;
  onRightIconPress?: () => void;

  // States
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;

  // Sizes and variants
  size?: InputSize;
  variant?: InputVariant;

  // Events
  onClear?: () => void;
}

// Default export for the type
export default CoreInputProps;
