// Camera.styles.ts
import { createStyles } from '@/shared/theme/styles';
import { ViewStyle, TextStyle, Platform } from 'react-native';
import { CameraStyleProps, CameraAnimation } from './Camera.types';
import { useTheme } from '@/shared/hooks/useTheme';

export const useCameraStyles = (props: CameraStyleProps) => {
  const { colors } = useTheme();
  const {
    isReady = false,
    disabled = false,
    isTakingPhoto = false,
    animation = 'fade',
    animationDuration = 300,
  } = props;

  const styleGenerator = createStyles((utils) => {
    // Get animation styles based on type
    const getAnimationStyles = (): ViewStyle => {
      if (!isReady) {
        switch (animation) {
          case 'fade':
            return { opacity: 0 };
          case 'slide':
            return { transform: [{ translateY: 20 }], opacity: 0 };
          case 'scale':
            return { transform: [{ scale: 0.95 }], opacity: 0 };
          default:
            return {};
        }
      }

      return {
        opacity: 1,
        transform: [{ translateY: 0 }, { scale: 1 }],
        // transition: `all ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      };
    };

    return {
      // Main container
      container: {
        flex: 1,
        backgroundColor: colors.background,
        overflow: 'hidden',
        ...getAnimationStyles(),
      } as ViewStyle,

      // Camera view
      camera: {
        flex: 1,
      } as ViewStyle,

      // Controls overlay
      controls: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between',
        padding: utils.spacing[4] || 16,
      } as ViewStyle,

      // Top controls container
      topControls: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: utils.spacing[3] || 12,
        paddingTop: Platform.OS === 'ios' ? utils.spacing[8] || 32 : utils.spacing[6] || 24,
      } as ViewStyle,

      // Bottom controls container
      bottomControls: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: utils.spacing[6] || 24,
      } as ViewStyle,

      // Left controls container
      leftControls: {
        position: 'absolute',
        left: utils.spacing[4] || 16,
        top: '50%',
        transform: [{ translateY: -50 }],
        gap: utils.spacing[3] || 12,
      } as ViewStyle,

      // Right controls container
      rightControls: {
        position: 'absolute',
        right: utils.spacing[4] || 16,
        top: '50%',
        transform: [{ translateY: -50 }],
        gap: utils.spacing[3] || 12,
      } as ViewStyle,

      // Control button
      controlButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: Platform.OS === 'web' ? 'blur(10px)' : undefined,
      } as ViewStyle,

      // Control button text
      controlButtonText: {
        color: colors.textInverse,
        fontSize: 12,
        marginTop: 4,
      } as TextStyle,

      // Capture button
      captureButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: colors.textInverse,
      } as ViewStyle,

      // Capture button inner circle
      captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.textInverse,
      } as ViewStyle,

      // Disabled capture button
      captureButtonDisabled: {
        opacity: 0.5,
      } as ViewStyle,

      // Permission container
      permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: utils.spacing[6] || 24,
        backgroundColor: colors.background,
      } as ViewStyle,

      // Permission title
      permissionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.textPrimary,
        marginTop: utils.spacing[4] || 16,
        marginBottom: utils.spacing[2] || 8,
        textAlign: 'center',
      } as TextStyle,

      // Permission text
      permissionText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: utils.spacing[6] || 24,
        lineHeight: 20,
      } as TextStyle,

      // Permission button
      permissionButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: utils.spacing[6] || 24,
        paddingVertical: utils.spacing[3] || 12,
        borderRadius: 8,
        minWidth: 200,
        alignItems: 'center',
      } as ViewStyle,

      // Permission button text
      permissionButtonText: {
        color: colors.textInverse,
        fontSize: 16,
        fontWeight: '600',
      } as TextStyle,

      // Loading container
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
      } as ViewStyle,

      // Loading text
      loadingText: {
        marginTop: utils.spacing[4] || 16,
        color: colors.textSecondary,
        fontSize: 14,
      } as TextStyle,

      // Error container
      errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: utils.spacing[6] || 24,
        backgroundColor: colors.background,
      } as ViewStyle,

      // Error title
      errorTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.error,
        marginTop: utils.spacing[4] || 16,
        marginBottom: utils.spacing[2] || 8,
      } as TextStyle,

      // Error text
      errorText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: utils.spacing[6] || 24,
      } as TextStyle,

      // Error button
      errorButton: {
        backgroundColor: colors.error,
        paddingHorizontal: utils.spacing[6] || 24,
        paddingVertical: utils.spacing[3] || 12,
        borderRadius: 8,
      } as ViewStyle,

      // Zoom slider container
      zoomSliderContainer: {
        position: 'absolute',
        bottom: utils.spacing[12] || 48,
        left: utils.spacing[4] || 16,
        right: utils.spacing[4] || 16,
      } as ViewStyle,

      // Zoom slider
      zoomSlider: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
      } as ViewStyle,

      // Zoom slider fill
      zoomSliderFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 2,
      } as ViewStyle,
    };
  });

  return styleGenerator(colors);
};
