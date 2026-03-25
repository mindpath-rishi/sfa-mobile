// src/core/components/Rating/Rating.types.ts
import { ViewStyle } from 'react-native';

export type RatingSize = 'sm' | 'md' | 'lg';

export interface RatingProps {
  value: number;
  max?: number;
  size?: RatingSize;
  editable?: boolean;
  onChange?: (value: number) => void;
  showLabel?: boolean;
  labelFormat?: 'number' | 'percentage' | 'fraction';
  color?: string;
  emptyColor?: string;
  style?: ViewStyle;
  testID?: string;
}
