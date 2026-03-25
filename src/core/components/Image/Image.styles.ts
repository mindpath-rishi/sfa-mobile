// core/components/Image/Image.styles.ts
import { createStyles, StyleUtils } from '@/shared/theme/styles';
import { ImageStyle, ViewStyle } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { ImageVariant, ImageSize } from './Image.types';

export interface ImageStyleProps {
  size?: ImageSize;
  variant?: ImageVariant;
  error?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export const useImageStyles = (props: ImageStyleProps = {}) => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils: StyleUtils) => {
    const {
      size = 'medium',
      variant = 'rounded',
      error = false,
      loading = false,
      disabled = false,
    } = props;

    // Size mappings
    const sizeMap = {
      xs: utils.spacing[8], // 32px
      small: utils.spacing[12], // 48px
      medium: utils.spacing[16], // 64px
      large: utils.spacing[20], // 80px
      xl: utils.spacing[24], // 96px
    };

    const dimension = sizeMap[size];

    // Get border radius based on variant
    const getBorderRadius = (): number => {
      switch (variant) {
        case 'circular':
          return dimension / 2; // Perfect circle
        case 'rounded':
          return utils.borderRadius.lg;
        case 'square':
          return 0;
        default:
          return utils.borderRadius.md;
      }
    };

    // Container styles
    const container: ViewStyle = {
      width: dimension,
      height: dimension,
      borderRadius: getBorderRadius(),
      backgroundColor: loading ? colors.surface : error ? colors.error + '10' : 'transparent',
      borderWidth: error ? 1 : 0,
      borderColor: error ? colors.error : undefined,
      opacity: disabled ? 0.5 : 1,
      overflow: 'hidden',
    };

    // Image styles
    const image: ImageStyle = {
      width: '100%',
      height: '100%',
      borderRadius: getBorderRadius(),
    };

    return {
      container,
      image,
    };
  });

  return styleGenerator(colors);
};
