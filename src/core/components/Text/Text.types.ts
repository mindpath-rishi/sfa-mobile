import { TextProps as RNTextProps } from 'react-native';

export type TextVariant = 'body' | 'caption' | 'title' | 'subtitle' | 'heading';

export interface CoreTextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
}
