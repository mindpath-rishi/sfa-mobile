import { ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { LoaderStyleProps } from './Loader.types';
import { createStyles, StyleUtils } from '@/shared/theme';

export const useLoaderStyles = (props: LoaderStyleProps = {}) => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils: StyleUtils) => {
    const {
      size = 'medium',
      fullScreen = false,
      overlay = false,
      disabled = false,
    } = props;

    // Size mapping (for spacing consistency)
    const sizeMap = {
      small: utils.spacing[4],
      medium: utils.spacing[6],
      large: utils.spacing[8],
    };

    const loaderSize = sizeMap[size];

    // Container
    const container: ViewStyle = {
      justifyContent: 'center',
      alignItems: 'center',
      padding: utils.spacing[3],
      opacity: disabled ? 0.5 : 1,
    };

    // Fullscreen
    const fullScreenStyle: ViewStyle = fullScreen
      ? {
          flex: 1,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          justifyContent: 'center',
          alignItems: 'center',
        }
      : {};

    // Overlay
    const overlayStyle: ViewStyle = overlay
      ? {
          backgroundColor: colors.surface || 'rgba(0,0,0,0.3)',
        }
      : {};

    // Text
    const text: TextStyle = {
      marginTop: utils.spacing[2],
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
    };

    return {
      container: {
        ...container,
        ...fullScreenStyle,
        ...overlayStyle,
      },
      indicator: {
        transform: [{ scale: loaderSize / 24 }], // normalize size
      },
      text,
    };
  });

  return styleGenerator(colors);
};