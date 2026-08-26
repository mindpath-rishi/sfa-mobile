import React, { useRef, useCallback, useState, useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Image, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { AppModal, AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { Camera } from './Camera';
import { CameraModalProps, CameraRef, CameraCapturedPhoto } from './Camera.types';
import { useCameraModalStyles } from './CameraModal.styles';

export const CameraModal: React.FC<CameraModalProps> = ({
  visible,
  cameraRef: externalCameraRef,
  onClose,
  onCapture,
  onError,
  title = 'TAKE A PHOTO',
  showCloseButton = true,
  showHeader = true,
  animation = 'slide',
  closeOnCapture = true,
  autoFocusOnMount = true,
  allowCameraSwitch = true,
  showFaceGuide = false,
  showPreview = false,
  validateBeforePreview,
  cameraProps = {},
  modalProps = {},
}) => {
  const styles = useCameraModalStyles();
  const { colors } = useTheme();

  const internalCameraRef = useRef<CameraRef>(null);
  const cameraRef = externalCameraRef || internalCameraRef;

  const [isCapturing, setIsCapturing] = useState(false);
  const [isValidatingCapture, setIsValidatingCapture] = useState(false);
  const isCapturingRef = useRef(false); // 🔥 important fix
  const [cameraKey, setCameraKey] = useState(0);
  const [previewPhoto, setPreviewPhoto] = useState<CameraCapturedPhoto | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const previewAnim = useRef(new Animated.Value(0)).current;
  const errorShakeAnim = useRef(new Animated.Value(0)).current;

  // Force remount when modal opens
  React.useEffect(() => {
    if (visible) {
      setCameraKey((prev) => prev + 1);
      setPreviewPhoto(null);
      setIsConfirming(false);
      setCaptureError(null);
    }
  }, [visible]);

  // Gentle pulsing animation for the face guide ring
  useEffect(() => {
    if (!showFaceGuide || previewPhoto) return;

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
  }, [showFaceGuide, previewPhoto, pulseAnim]);

  // Shake the error pill whenever a new validation error appears
  useEffect(() => {
    if (!captureError) return;

    errorShakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(errorShakeAnim, {
        toValue: 1,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(errorShakeAnim, {
        toValue: -1,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(errorShakeAnim, {
        toValue: 1,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(errorShakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [captureError, errorShakeAnim]);

  // Fade/scale-in animation when the preview appears
  useEffect(() => {
    if (previewPhoto) {
      previewAnim.setValue(0);
      Animated.timing(previewAnim, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [previewPhoto, previewAnim]);

  const confirmPhoto = useCallback(
    async (photo: CameraCapturedPhoto) => {
      setIsConfirming(true);
      setCaptureError(null);
      try {
        const result = await onCapture?.(photo);

        if (result === false || typeof result === 'string') {
          // Rejected by caller (e.g. failed validation) — let the user retake.
          setCaptureError(typeof result === 'string' ? result : 'Please retake the photo.');
          setPreviewPhoto(null);
          setCameraKey((prev) => prev + 1);
          return;
        }

        if (closeOnCapture) {
          setTimeout(() => {
            onClose();
          }, 100);
        }
      } catch (error) {
        console.error('Error confirming photo:', error);
        onError?.(error as any);
        setCaptureError('Something went wrong. Please retake the photo.');
        setPreviewPhoto(null);
        setCameraKey((prev) => prev + 1);
      } finally {
        setIsConfirming(false);
      }
    },
    [onCapture, onClose, closeOnCapture, onError],
  );

  const handleCapture = useCallback(async () => {
    // 🔥 Prevent double trigger + invalid ref
    if (!cameraRef.current || isCapturingRef.current) return;

    isCapturingRef.current = true;
    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePhoto();
      console.log('Photo captured:', photo);
      setCaptureError(null);

      if (validateBeforePreview) {
        setIsValidatingCapture(true);
        let validation: void | boolean | string;
        try {
          validation = await validateBeforePreview(photo);
        } finally {
          setIsValidatingCapture(false);
        }

        if (validation === false || typeof validation === 'string') {
          setCaptureError(typeof validation === 'string' ? validation : 'Please retake the photo.');
          setCameraKey((prev) => prev + 1);
          return;
        }
      }

      if (showPreview) {
        setPreviewPhoto(photo);
      } else {
        await confirmPhoto(photo);
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      onError?.(error as any);
    } finally {
      isCapturingRef.current = false;
      setIsCapturing(false);
    }
  }, [cameraRef, showPreview, validateBeforePreview, confirmPhoto, onError]);

  const handleRetake = useCallback(() => {
    setPreviewPhoto(null);
    setCameraKey((prev) => prev + 1);
  }, []);

  const handleUsePhoto = useCallback(() => {
    if (!previewPhoto) return;
    void confirmPhoto(previewPhoto);
  }, [previewPhoto, confirmPhoto]);

  const renderFaceGuide = () => {
    if (!showFaceGuide) return null;

    const ringScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] });
    const ringOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
    const ringColor = captureError ? '#FF6B6B' : colors.primary;

    return (
      <View style={styles.faceGuideContainer} pointerEvents="none">
        {/* Darkened mask with a transparent oval cut-out to spotlight the face area */}
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
              opacity: ringOpacity,
            },
          ]}
        />
      </View>
    );
  };

  const renderCustomControls = () => {
    return (
      <View style={styles.cameraOverlay}>
        <View style={styles.topControls}>
          {/* Close Button */}
          {showCloseButton && (
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} accessibilityLabel="Close">
              <BlurView intensity={40} tint="dark" style={styles.roundGlassButton}>
                <Ionicons name="close" size={22} color="white" />
              </BlurView>
            </TouchableOpacity>
          )}

          {allowCameraSwitch && (
            <TouchableOpacity
              onPress={() => cameraRef.current?.switchCamera()}
              activeOpacity={0.7}
              accessibilityLabel="Switch camera"
            >
              <BlurView intensity={40} tint="dark" style={styles.roundGlassButton}>
                <Ionicons name="camera-reverse-outline" size={22} color="white" />
              </BlurView>
            </TouchableOpacity>
          )}
        </View>

        {/* Title / verifying state */}
        {showHeader && !captureError && (isValidatingCapture || title) && (
          <View style={styles.cameraInstruction}>
            <BlurView intensity={35} tint="dark" style={styles.instructionPill}>
              {isValidatingCapture ? (
                <ActivityIndicator size="small" color="white" style={styles.instructionIcon} />
              ) : (
                <Ionicons name="scan-outline" size={16} color="white" style={styles.instructionIcon} />
              )}
              <AppText style={styles.instructionText}>
                {isValidatingCapture ? 'Verifying face…' : title}
              </AppText>
            </BlurView>
          </View>
        )}

        {/* Inline capture/validation error */}
        {captureError && (
          <Animated.View
            style={[
              styles.cameraInstruction,
              {
                transform: [
                  {
                    translateX: errorShakeAnim.interpolate({
                      inputRange: [-1, 1],
                      outputRange: [-8, 8],
                    }),
                  },
                ],
              },
            ]}
          >
            <BlurView intensity={35} tint="dark" style={styles.errorPill}>
              <Ionicons name="alert-circle" size={16} color="#FF6B6B" style={styles.instructionIcon} />
              <AppText style={styles.errorPillText}>{captureError}</AppText>
            </BlurView>
          </Animated.View>
        )}

        {/* Bottom scrim + capture button */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.65)']}
          style={styles.bottomScrim}
          pointerEvents="box-none"
        >
          <View style={styles.captureContainer}>
            <TouchableOpacity
              style={[
                styles.captureButton,
                (isCapturing || isValidatingCapture) && styles.captureButtonDisabled,
              ]}
              onPress={handleCapture}
              disabled={isCapturing || isValidatingCapture}
              activeOpacity={0.8}
            >
              {isCapturing || isValidatingCapture ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderPreview = () => {
    if (!previewPhoto) return null;

    const previewOpacity = previewAnim;
    const previewScale = previewAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] });

    return (
      <Animated.View
        style={[
          styles.previewContainer,
          { opacity: previewOpacity, transform: [{ scale: previewScale }] },
        ]}
      >
        <Image source={{ uri: previewPhoto.uri }} style={styles.previewImage} resizeMode="cover" />

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
                  <AppText style={styles.previewButtonText}>Use Photo</AppText>
                </>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      showBackdrop={false}
      animation={animation}
      position="center"
      size="full"
      contentStyle={styles.fullScreenContent}
      style={styles.fullScreenContainer}
      showHeader={false}
      {...modalProps}
    >
      <View style={styles.cameraContainer}>
        {previewPhoto ? (
          renderPreview()
        ) : (
          <>
            <Camera
              key={cameraKey}
              ref={cameraRef}
              facing="back"
              autofocus={true}
              ratio="16:9"
              showControls={false}
              onCapture={handleCapture}
              onError={onError}
              style={styles.camera}
              {...cameraProps}
            />

            {renderFaceGuide()}
            {renderCustomControls()}
          </>
        )}
      </View>
    </AppModal>
  );
};

CameraModal.displayName = 'CameraModal';
export default CameraModal;
