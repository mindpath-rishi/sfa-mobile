// src/components/camera/CameraModal/styles/CameraModel.style.ts
import { createStyles, StyleUtils } from '@/shared/theme/styles';
import { ViewStyle, TextStyle, Dimensions, Platform } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

const { width, height } = Dimensions.get('window');

export const useCameraModalStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils: StyleUtils) => ({
    fullScreenContainer: {
      flex: 1,
      backgroundColor: 'black',
    } as ViewStyle,

    fullScreenContent: {
      flex: 1,
      padding: 0,
      margin: 0,
    } as ViewStyle,

    cameraContainer: {
      flex: 1,
      backgroundColor: 'black',
      position: 'relative',
    } as ViewStyle,

    camera: {
      flex: 1,
      width: '100%',
      height: '100%',
    } as ViewStyle,

    // Overlay for custom controls
    cameraOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'space-between',
      paddingTop: Platform.OS === 'ios' ? utils.spacing[12] : utils.spacing[8],
      paddingBottom: utils.spacing[8],
      paddingHorizontal: utils.spacing[4],
    } as ViewStyle,

    // Top controls container
    topControls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 10,
    } as ViewStyle,

    // Bottom controls container
    bottomControls: {
      alignItems: 'center',
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    // Camera instruction text
    cameraInstruction: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: utils.spacing[4],
    } as ViewStyle,

    instructionText: {
      color: 'white',
      fontSize: utils.fontSize.xl,
      fontWeight: utils.getFontWeight('600'),
      letterSpacing: 2,
      textShadowColor: 'rgba(0,0,0,0.5)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
      backgroundColor: 'rgba(0,0,0,0.4)',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[2],
      // borderRadius: utils.radius.lg,
      overflow: 'hidden',
    } as TextStyle,

    // Capture button
    captureContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    captureButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255,255,255,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: 'white',
    } as ViewStyle,

    captureButtonInner: {
      width: 65,
      height: 65,
      borderRadius: 32.5,
      backgroundColor: 'white',
      borderWidth: 2,
      borderColor: colors.primary,
    } as ViewStyle,

    captureButtonDisabled: {
      opacity: 0.5,
      transform: [{ scale: 0.95 }],
    } as ViewStyle,

    captureButtonPressed: {
      transform: [{ scale: 0.92 }],
    } as ViewStyle,

    // Close button
    closeButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? utils.spacing[12] : utils.spacing[8],
      left: utils.spacing[4],
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    } as ViewStyle,

    // Flip camera button
    flipButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? utils.spacing[12] : utils.spacing[8],
      right: utils.spacing[4],
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    } as ViewStyle,

    // Flash button
    flashButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? utils.spacing[12] : utils.spacing[8],
      right: utils.spacing[12],
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    } as ViewStyle,

    // Loading overlay
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 20,
    } as ViewStyle,

    loadingText: {
      marginTop: utils.spacing[4],
      fontSize: utils.fontSize.md,
      color: 'white',
      fontWeight: utils.getFontWeight('500'),
    } as TextStyle,

    // Error overlay
    errorOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: utils.spacing[6],
      zIndex: 20,
    } as ViewStyle,

    errorIcon: {
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    errorTitle: {
      fontSize: utils.fontSize.xl,
      fontWeight: utils.getFontWeight('600'),
      color: colors.error,
      marginBottom: utils.spacing[2],
    } as TextStyle,

    errorText: {
      fontSize: utils.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: utils.spacing[6],
    } as TextStyle,

    errorButton: {
      backgroundColor: colors.error,
      paddingHorizontal: utils.spacing[6],
      paddingVertical: utils.spacing[3],
      // borderRadius: utils.md,
      minWidth: 120,
      alignItems: 'center',
    } as ViewStyle,

    errorButtonText: {
      color: 'white',
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('600'),
    } as TextStyle,

    // Permission denied overlay
    permissionOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.95)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: utils.spacing[6],
      zIndex: 20,
    } as ViewStyle,

    permissionIcon: {
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    permissionTitle: {
      fontSize: utils.fontSize.xl,
      fontWeight: utils.getFontWeight('600'),
      color: 'white',
      marginBottom: utils.spacing[2],
    } as TextStyle,

    permissionText: {
      fontSize: utils.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: utils.spacing[6],
    } as TextStyle,

    permissionButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: utils.spacing[6],
      paddingVertical: utils.spacing[3],
      // borderRadius: utils.radius.md,
      minWidth: 120,
      alignItems: 'center',
    } as ViewStyle,

    permissionButtonText: {
      color: 'white',
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('600'),
    } as TextStyle,

    // Status badge
    statusBadge: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? utils.spacing[12] : utils.spacing[8],
      alignSelf: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[1],
      // borderRadius: utils.radius.full,
      zIndex: 10,
    } as ViewStyle,

    statusText: {
      fontSize: utils.fontSize.xs,
      color: 'white',
    } as TextStyle,

    // Zoom slider
    zoomSliderContainer: {
      position: 'absolute',
      bottom: utils.spacing[16],
      left: utils.spacing[8],
      right: utils.spacing[8],
      zIndex: 10,
    } as ViewStyle,

    zoomSlider: {
      width: '100%',
      height: 4,
      backgroundColor: 'rgba(255,255,255,0.3)',
      borderRadius: 2,
      overflow: 'hidden',
    } as ViewStyle,

    zoomSliderFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 2,
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
