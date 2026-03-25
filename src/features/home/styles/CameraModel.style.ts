// src/components/camera/CameraModal/styles/CameraModel.style.ts
import { createStyles, StyleUtils } from '@/shared/theme/styles';
import { ViewStyle, TextStyle, Dimensions } from 'react-native';
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
    } as ViewStyle,

    camera: {
      flex: 1,
      width: '100%',
      height: '100%',
    } as ViewStyle,

    cameraOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.2)',
      justifyContent: 'space-between',
      paddingTop: utils.spacing[8],
      paddingBottom: utils.spacing[8],
    } as ViewStyle,

    cameraInstruction: {
      alignItems: 'center',
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
    } as TextStyle,

    captureContainer: {
      alignItems: 'center',
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    captureButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255,255,255,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    captureButtonInner: {
      width: 65,
      height: 65,
      borderRadius: 32.5,
      backgroundColor: 'white',
      borderWidth: 2,
      borderColor: colors.primary,
    } as ViewStyle,

    closeButton: {
      position: 'absolute',
      top: utils.spacing[4],
      right: utils.spacing[4],
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
