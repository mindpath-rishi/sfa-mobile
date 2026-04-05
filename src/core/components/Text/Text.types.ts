import { TextProps as RNTextProps } from 'react-native';

export type TextVariant = 'body' | 'caption' | 'subtitle' | 'title' | 'heading';

export type TextWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold';

export interface CoreTextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
}
