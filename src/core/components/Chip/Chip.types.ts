import { ViewStyle, TextStyle } from 'react-native';

export type ChipVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type ChipSize = 'sm' | 'md' | 'lg';

export interface ChipProps {
  label: string;
  variant?: ChipVariant;
  size?: ChipSize;
  outline?: boolean;
  closable?: boolean;
  onClose?: () => void;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  testID?: string;
}
