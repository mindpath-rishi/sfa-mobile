// core/components/Image/index.tsx
import React, { forwardRef } from 'react';
import { View, Image as RNImage, ImageStyle } from 'react-native';
import { CoreImageProps } from './Image.types';
import { useTheme } from '@/shared/hooks/useTheme';
import { useImageStyles } from './Image.styles';

const Image = forwardRef<View, CoreImageProps>(
  (
    {
      style,
      containerStyle,
      size = 'medium',
      variant = 'rounded',
      resizeMode = 'cover',
      loading = false,
      error = false,
      disabled = false,
      alt,
      ...props
    },
    ref,
  ) => {
    const { colors, mode } = useTheme();

    const styles = useImageStyles({
      size,
      variant,
      error,
      loading,
      disabled,
    });

    return (
      <View ref={ref} style={[styles.container, containerStyle]}>
        <RNImage
          {...props}
          style={[styles.image, style as ImageStyle]}
          resizeMode={resizeMode}
          accessibilityLabel={alt}
          fadeDuration={0} // Prevents flash on Android
        />
      </View>
    );
  },
);

Image.displayName = 'Image';

export default Image;
