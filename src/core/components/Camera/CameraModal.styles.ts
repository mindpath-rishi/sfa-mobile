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

    // Face guide overlay (circle/oval frame for selfies)
    faceGuideContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 5,
    } as ViewStyle,

    // Darkened mask around the oval cut-out, built from 3 stacked rows
    faceGuideMaskTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: height / 2 - (width * 0.72 * 1.3) / 2,
      backgroundColor: 'rgba(0,0,0,0.45)',
    } as ViewStyle,

    faceGuideMaskBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: height / 2 - (width * 0.72 * 1.3) / 2,
      backgroundColor: 'rgba(0,0,0,0.45)',
    } as ViewStyle,

    faceGuideMaskRow: {
      flexDirection: 'row',
      height: width * 0.72 * 1.3,
    } as ViewStyle,

    faceGuideMaskSide: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
    } as ViewStyle,

    faceGuideCutout: {
      width: width * 0.72,
      height: width * 0.72 * 1.3,
      borderRadius: (width * 0.72) / 2,
      backgroundColor: 'transparent',
    } as ViewStyle,

    faceGuideOval: {
      position: 'absolute',
      width: width * 0.72,
      height: width * 0.72 * 1.3,
      borderRadius: (width * 0.72) / 2,
      borderWidth: 3,
      borderColor: colors.primary,
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

    // Round glass (blurred) icon button used for close / flip
    roundGlassButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
    } as ViewStyle,

    // Bottom controls container
    bottomControls: {
      alignItems: 'center',
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    // Camera instruction pill
    cameraInstruction: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: utils.spacing[4],
    } as ViewStyle,

    instructionPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[5],
      paddingVertical: utils.spacing[2],
      borderRadius: 999,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
    } as ViewStyle,

    instructionIcon: {
      marginRight: utils.spacing[2],
    } as ViewStyle,

    instructionText: {
      color: 'white',
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('600'),
      letterSpacing: 0.3,
    } as TextStyle,

    errorPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[5],
      paddingVertical: utils.spacing[2],
      borderRadius: 999,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,107,107,0.5)',
      maxWidth: width * 0.85,
    } as ViewStyle,

    errorPillText: {
      color: '#FF6B6B',
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('600'),
      flexShrink: 1,
    } as TextStyle,

    // Bottom gradient scrim behind the capture button
    bottomScrim: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingTop: utils.spacing[16],
      paddingBottom: utils.spacing[8],
      alignItems: 'center',
      justifyContent: 'flex-end',
    } as ViewStyle,

    // Capture button
    captureContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    captureButton: {
      width: 78,
      height: 78,
      borderRadius: 39,
      backgroundColor: 'rgba(255,255,255,0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: 'white',
    } as ViewStyle,

    captureButtonInner: {
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: 'white',
    } as ViewStyle,

    captureButtonDisabled: {
      opacity: 0.5,
      transform: [{ scale: 0.95 }],
    } as ViewStyle,

    captureButtonPressed: {
      transform: [{ scale: 0.92 }],
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

    // Photo preview (retake / use photo)
    previewContainer: {
      flex: 1,
      backgroundColor: 'black',
    } as ViewStyle,

    previewImage: {
      flex: 1,
      width: '100%',
      height: '100%',
    } as ViewStyle,

    previewHeader: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? utils.spacing[12] : utils.spacing[8],
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
    } as ViewStyle,

    previewHeaderPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[5],
      paddingVertical: utils.spacing[2],
      borderRadius: 999,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
    } as ViewStyle,

    previewScrim: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingTop: utils.spacing[16],
      paddingBottom: utils.spacing[10],
      paddingHorizontal: utils.spacing[6],
    } as ViewStyle,

    previewActions: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: utils.spacing[4],
    } as ViewStyle,

    previewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: utils.spacing[6],
      paddingVertical: utils.spacing[3],
      borderRadius: 30,
      gap: utils.spacing[2],
      minWidth: 140,
    } as ViewStyle,

    retakeButton: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.6)',
    } as ViewStyle,

    usePhotoButton: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOpacity: 0.4,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    } as ViewStyle,

    previewButtonText: {
      color: 'white',
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('600'),
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
