// core/components/Image/Image.types.ts
import { ImageProps as RNImageProps, ImageStyle, ViewStyle } from 'react-native';

export type ImageResizeMode = 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
export type ImageVariant = 'circular' | 'rounded' | 'square';
export type ImageSize = 'xs' | 'small' | 'medium' | 'large' | 'xl';

export interface CoreImageProps extends Omit<RNImageProps, 'style'> {
  // Styling
  style?: ImageStyle;
  containerStyle?: ViewStyle;

  // Sizing and variants
  size?: ImageSize;
  variant?: ImageVariant;
  resizeMode?: ImageResizeMode;

  // States
  loading?: boolean;
  error?: boolean;
  disabled?: boolean;

  // Accessibility
  alt?: string;
}

export default CoreImageProps;
