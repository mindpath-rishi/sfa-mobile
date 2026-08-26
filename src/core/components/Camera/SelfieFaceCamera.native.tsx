import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Image, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { File } from 'expo-file-system';
import {
  useCameraDevice,
  usePhotoOutput,
  Camera as VisionCameraView,
} from 'react-native-vision-camera';
import type { CameraRef } from 'react-native-vision-camera';
import { useFaceDetectorOutput, type Face } from 'react-native-vision-camera-face-detector';
import { AppModal, AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { useCameraModalStyles } from './CameraModal.styles';

export interface SelfieFaceCameraProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (photoUri: string) => void | boolean | string | Promise<void | boolean | string>;
  title?: string;
}

const MIN_FACE_SIZE_RATIO = 0.15;
// Require several consecutive frames to agree before flipping detection state,
// so a single noisy/missed frame doesn't flicker the capture button or ring color.
const DETECTION_HYSTERESIS_FRAMES = 3;

export const SelfieFaceCamera: React.FC<SelfieFaceCameraProps> = ({
  visible,
  onClose,
  onCapture,
  title = 'Center your face and take a selfie',
}) => {
  const styles = useCameraModalStyles();
  const { colors } = useTheme();

  const device = useCameraDevice('front');
  const photoOutput = usePhotoOutput({ quality: 0.8 });
  const cameraRef = useRef<CameraRef>(null);

  const [faceDetected, setFaceDetected] = useState(false);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const previewAnim = useRef(new Animated.Value(0)).current;
  const consecutiveSingleFaceRef = useRef(0);
  const consecutiveOtherRef = useRef(0);
  const isCapturingRef = useRef(false);

  React.useEffect(() => {
    if (!visible || previewUri) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();

    return () => loop.stop();
  }, [visible, pulseAnim]);

  React.useEffect(() => {
    if (!visible) {
      setFaceDetected(false);
      setMultipleFaces(false);
      setCaptureError(null);
      setIsCapturing(false);
      setPreviewUri(null);
      setIsConfirming(false);
      consecutiveSingleFaceRef.current = 0;
      consecutiveOtherRef.current = 0;
      isCapturingRef.current = false;
    }
  }, [visible]);

  React.useEffect(() => {
    if (previewUri) {
      previewAnim.setValue(0);
      Animated.timing(previewAnim, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [previewUri, previewAnim]);

  const handleFacesDetected = useCallback((faces: Face[]) => {
    // Ignore frames that arrive while a photo capture is in flight — letting the
    // face state flip mid-shutter causes the vision-camera photo pipeline to
    // throw on some devices, surfacing as a "please retake" error.
    if (isCapturingRef.current) return;

    if (faces.length === 1) {
      consecutiveSingleFaceRef.current += 1;
      consecutiveOtherRef.current = 0;

      if (consecutiveSingleFaceRef.current >= DETECTION_HYSTERESIS_FRAMES) {
        setMultipleFaces(false);
        setFaceDetected(true);
      }
      return;
    }

    consecutiveOtherRef.current += 1;
    consecutiveSingleFaceRef.current = 0;

    if (consecutiveOtherRef.current >= DETECTION_HYSTERESIS_FRAMES) {
      setFaceDetected(false);
      setMultipleFaces(faces.length > 1);
    }
  }, []);

  const handleFaceDetectorError = useCallback((error: Error) => {
    console.error('Live face detection error:', error);
  }, []);

  // useFaceDetectorOutput memoizes on this options object's identity, which in turn
  // feeds the Camera component's `outputs` array. A fresh object/array every render
  // makes CameraX unbind and rebind the camera session, and if that lands mid-capture
  // it throws "Camera is closed" — so this must stay referentially stable.
  const faceDetectorOptions = useMemo(
    () => ({
      performanceMode: 'fast' as const,
      cameraFacing: 'front' as const,
      minFaceSize: MIN_FACE_SIZE_RATIO,
      onFacesDetected: handleFacesDetected,
      onError: handleFaceDetectorError,
    }),
    [handleFacesDetected, handleFaceDetectorError],
  );

  const faceDetectorOutput = useFaceDetectorOutput(faceDetectorOptions);

  const outputs = useMemo(
    () => [photoOutput, faceDetectorOutput],
    [photoOutput, faceDetectorOutput],
  );

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isCapturing || !faceDetected) return;

    isCapturingRef.current = true;
    setIsCapturing(true);
    setCaptureError(null);

    try {
      let photoFile;
      try {
        photoFile = await photoOutput.capturePhotoToFile({}, {});
      } catch (firstError) {
        // On some Android devices, CameraX briefly unbinds/rebinds the session
        // (triggered by the face detector's output being attached) right as capture
        // starts, throwing "Camera is closed". That rebind settles almost
        // immediately, so a single retry after a short delay recovers cleanly.
        const message = firstError instanceof Error ? firstError.message : String(firstError);
        if (!/camera is closed/i.test(message)) throw firstError;

        await new Promise((resolve) => setTimeout(resolve, 300));
        photoFile = await photoOutput.capturePhotoToFile({}, {});
      }

      const photoUri = photoFile.filePath.startsWith('file://')
        ? photoFile.filePath
        : `file://${photoFile.filePath}`;
      setPreviewUri(photoUri);
    } catch (error) {
      console.error('Error capturing selfie:', error);
      const message = error instanceof Error ? error.message : String(error);
      setCaptureError(`Capture failed: ${message}`);
    } finally {
      isCapturingRef.current = false;
      setIsCapturing(false);
    }
  }, [isCapturing, faceDetected, photoOutput]);

  const handleRetake = useCallback(() => {
    const uriToDelete = previewUri;
    setPreviewUri(null);
    setCaptureError(null);
    if (uriToDelete) {
      try {
        new File(uriToDelete).delete();
      } catch {
        // Best-effort cleanup; a leftover temp file is harmless.
      }
    }
  }, [previewUri]);

  const handleUsePhoto = useCallback(async () => {
    if (!previewUri || isConfirming) return;

    setIsConfirming(true);
    setCaptureError(null);

    try {
      const result = await onCapture(previewUri);

      if (result === false || typeof result === 'string') {
        setCaptureError(typeof result === 'string' ? result : 'Please retake the photo.');
        try {
          new File(previewUri).delete();
        } catch {
          // Best-effort cleanup; a leftover temp file is harmless.
        }
        setPreviewUri(null);
      }
    } catch (error) {
      console.error('Error confirming selfie:', error);
      const message = error instanceof Error ? error.message : String(error);
      setCaptureError(`Capture failed: ${message}`);
      setPreviewUri(null);
    } finally {
      setIsConfirming(false);
    }
  }, [previewUri, isConfirming, onCapture]);

  if (!visible) return null;

  if (previewUri) {
    const previewOpacity = previewAnim;
    const previewScale = previewAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] });

    return (
      <AppModal
        visible={visible}
        onClose={onClose}
        showBackdrop={false}
        animation="slide"
        position="center"
        size="full"
        contentStyle={styles.fullScreenContent}
        style={styles.fullScreenContainer}
        showHeader={false}
      >
        <View style={styles.cameraContainer}>
          <Animated.View
            style={[
              styles.previewContainer,
              { opacity: previewOpacity, transform: [{ scale: previewScale }] },
            ]}
          >
            <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="cover" />

            <View style={styles.previewHeader}>
              <BlurView intensity={35} tint="dark" style={styles.previewHeaderPill}>
                {isConfirming ? (
                  <ActivityIndicator size="small" color="white" style={styles.instructionIcon} />
                ) : (
                  <Ionicons name="image-outline" size={16} color="white" style={styles.instructionIcon} />
                )}
                <AppText style={styles.instructionText}>
                  {isConfirming ? 'Verifying face…' : 'Review your photo'}
                </AppText>
              </BlurView>
            </View>

            {captureError && (
              <View style={[styles.previewHeader, { top: undefined, marginTop: 60 }]}>
                <BlurView intensity={35} tint="dark" style={styles.errorPill}>
                  <Ionicons name="alert-circle" size={16} color="#FF6B6B" style={styles.instructionIcon} />
                  <AppText style={styles.errorPillText}>{captureError}</AppText>
                </BlurView>
              </View>
            )}

            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.75)']}
              style={styles.previewScrim}
              pointerEvents="box-none"
            >
              <View style={styles.previewActions}>
                <TouchableOpacity
                  style={[
                    styles.previewButton,
                    styles.retakeButton,
                    isConfirming && styles.captureButtonDisabled,
                  ]}
                  onPress={handleRetake}
                  disabled={isConfirming}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh" size={20} color="white" />
                  <AppText style={styles.previewButtonText}>Retake</AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.previewButton,
                    styles.usePhotoButton,
                    isConfirming && styles.captureButtonDisabled,
                  ]}
                  onPress={handleUsePhoto}
                  disabled={isConfirming}
                  activeOpacity={0.8}
                >
                  {isConfirming ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color="white" />
                      <AppText style={styles.previewButtonText}>Continue</AppText>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </AppModal>
    );
  }

  const ringColor = captureError
    ? '#FF6B6B'
    : faceDetected
      ? '#3DDC84'
      : multipleFaces
        ? '#FF6B6B'
        : colors.primary;

  const ringScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] });

  const statusMessage = captureError
    ? captureError
    : multipleFaces
      ? 'Multiple faces detected. Only one person should be visible.'
      : faceDetected
        ? 'Face detected — ready to capture'
        : title;

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      showBackdrop={false}
      animation="slide"
      position="center"
      size="full"
      contentStyle={styles.fullScreenContent}
      style={styles.fullScreenContainer}
      showHeader={false}
    >
      <View style={styles.cameraContainer}>
        {device ? (
          <VisionCameraView
            ref={cameraRef}
            style={styles.camera}
            device={device}
            isActive={visible}
            outputs={outputs}
          />
        ) : (
          <View style={[styles.camera, { alignItems: 'center', justifyContent: 'center' }]}>
            <ActivityIndicator size="large" color="white" />
          </View>
        )}

        <View style={styles.faceGuideContainer} pointerEvents="none">
          <View style={styles.faceGuideMaskTop} />
          <View style={styles.faceGuideMaskBottom} />
          <View style={styles.faceGuideMaskRow}>
            <View style={styles.faceGuideMaskSide} />
            <View style={styles.faceGuideCutout} />
            <View style={styles.faceGuideMaskSide} />
          </View>

          <Animated.View
            style={[
              styles.faceGuideOval,
              {
                borderColor: ringColor,
                transform: [{ scale: ringScale }],
              },
            ]}
          />
        </View>

        <View style={styles.cameraOverlay}>
          <View style={styles.topControls}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} accessibilityLabel="Close">
              <BlurView intensity={40} tint="dark" style={styles.roundGlassButton}>
                <Ionicons name="close" size={22} color="white" />
              </BlurView>
            </TouchableOpacity>
            <View />
          </View>

          <View style={styles.cameraInstruction}>
            <BlurView intensity={35} tint="dark" style={styles.instructionPill}>
              <Ionicons
                name={faceDetected ? 'checkmark-circle' : 'scan-outline'}
                size={16}
                color={faceDetected ? '#3DDC84' : 'white'}
                style={styles.instructionIcon}
              />
              <AppText style={styles.instructionText}>{statusMessage}</AppText>
            </BlurView>
          </View>

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.65)']}
            style={styles.bottomScrim}
            pointerEvents="box-none"
          >
            <View style={styles.captureContainer}>
              <TouchableOpacity
                style={[
                  styles.captureButton,
                  (!faceDetected || isCapturing) && styles.captureButtonDisabled,
                ]}
                onPress={handleCapture}
                disabled={!faceDetected || isCapturing}
                activeOpacity={0.8}
              >
                {isCapturing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <View style={styles.captureButtonInner} />
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </AppModal>
  );
};

SelfieFaceCamera.displayName = 'SelfieFaceCamera';
export default SelfieFaceCamera;
