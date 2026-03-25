import { ViewStyle } from 'react-native';

export type ProgressBarVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type ProgressBarSize = 'sm' | 'md' | 'lg';

export interface ProgressBarProps {
  progress: number; // 0 to 100
  variant?: ProgressBarVariant;
  size?: ProgressBarSize;
  showLabel?: boolean;
  labelPosition?: 'top' | 'bottom' | 'inside' | 'none';
  indeterminate?: boolean;
  animated?: boolean;
  style?: ViewStyle;
  testID?: string;
}
