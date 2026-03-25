// Camera.tsx (Without isReady)
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Animated,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { CameraView, useCameraPermissions, CameraType, FlashMode } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/core/components';
import { useCameraStyles } from './Camera.styles';
import {
  CameraProps,
  CameraRef,
  CameraCapturedPhoto,
  CameraError,
  CameraState,
  DEFAULT_CAMERA_PROPS,
} from './Camera.types';

/**
 * Generic Camera Component for React Native
 * Supports both front and back cameras, flash, zoom, and custom controls
 */
export const Camera = forwardRef<CameraRef, CameraProps>((props, ref) => {
  const {
    visible = true,
    facing = DEFAULT_CAMERA_PROPS.facing,
    flash = DEFAULT_CAMERA_PROPS.flash,
    ratio = DEFAULT_CAMERA_PROPS.ratio as any,
    quality = DEFAULT_CAMERA_PROPS.quality,
    autofocus = DEFAULT_CAMERA_PROPS.autofocus,
    enableZoom = DEFAULT_CAMERA_PROPS.enableZoom,
    showControls = DEFAULT_CAMERA_PROPS.showControls,
    customControls,
    mirror = DEFAULT_CAMERA_PROPS.mirror,
    animation = DEFAULT_CAMERA_PROPS.animation,
    animationDuration = DEFAULT_CAMERA_PROPS.animationDuration,
    onCapture,
    onReady,
    onError,
    onFacingChange,
    onFlashChange,
    onCaptureStart,
    onCaptureEnd,
    style,
    containerStyle,
    overlayStyle,
    disabled = DEFAULT_CAMERA_PROPS.disabled,
    testID = 'camera',
  } = props;

  const [permission, requestPermission] = useCameraPermissions();
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [currentFacing, setCurrentFacing] = useState<CameraType>(facing as CameraType);
  const [currentFlash, setCurrentFlash] = useState<FlashMode>(flash as FlashMode);
  const [zoom, setZoom] = useState(0);
  const [error, setError] = useState<CameraError | null>(null);
  const [showZoomSlider, setShowZoomSlider] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const zoomTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const styles = useCameraStyles({
    isReady: true, // Always consider camera ready
    disabled,
    isTakingPhoto,
    animation,
    animationDuration,
  });

  // Request permissions when camera becomes visible
  useEffect(() => {
    if (visible && !permission?.granted && permission?.canAskAgain !== false) {
      requestPermission();
    }
  }, [visible, permission, requestPermission]);

  // Animation when camera is ready
  useEffect(() => {
    if (animation !== 'none') {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
      }).start();
    }
  }, [animation, animationDuration, fadeAnim]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (zoomTimeout.current) {
        clearTimeout(zoomTimeout.current);
      }
    };
  }, []);

  // Handle camera ready
  const handleCameraReady = useCallback(() => {
    setError(null);
    onReady?.();
  }, [onReady]);

  // Handle camera error
  const handleCameraError = useCallback(
    (err: any) => {
      const cameraError: CameraError = {
        code: 'CAMERA_ERROR',
        message: err.message || 'Failed to initialize camera',
        originalError: err,
      };
      setError(cameraError);
      onError?.(cameraError);
    },
    [onError],
  );

  // Take photo
  const takePhoto = useCallback(async (): Promise<CameraCapturedPhoto> => {
    if (!cameraRef.current || disabled || isTakingPhoto) {
      throw new Error('Camera not ready');
    }

    setIsTakingPhoto(true);
    onCaptureStart?.();

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality,
        base64: true,
        exif: true,
        skipProcessing: false,
      });

      const capturedPhoto: CameraCapturedPhoto = {
        uri: photo.uri,
        base64: photo.base64,
        width: photo.width,
        height: photo.height,
        exif: photo.exif,
        timestamp: Date.now(),
      };

      onCapture?.(capturedPhoto);
      return capturedPhoto;
    } catch (err: any) {
      const cameraError: CameraError = {
        code: 'CAPTURE_ERROR',
        message: err.message || 'Failed to capture photo',
        originalError: err,
      };
      setError(cameraError);
      0;
      onError?.(cameraError);
      throw cameraError;
    } finally {
      setIsTakingPhoto(false);
      onCaptureEnd?.();
    }
  }, [
    cameraRef,
    disabled,
    isTakingPhoto,
    quality,
    onCapture,
    onError,
    onCaptureStart,
    onCaptureEnd,
  ]);

  // Switch camera facing
  const switchCamera = useCallback(() => {
    if (disabled) return;

    const newFacing = currentFacing === 'front' ? 'back' : 'front';
    setCurrentFacing(newFacing);
    onFacingChange?.(newFacing);

    // Reset zoom when switching cameras
    setZoom(0);
  }, [currentFacing, disabled, onFacingChange]);

  // Toggle flash
  const toggleFlash = useCallback(() => {
    if (disabled || currentFacing === 'front') return;

    let newFlash: FlashMode;
    switch (currentFlash) {
      case 'off':
        newFlash = 'on';
        break;
      case 'on':
        newFlash = 'auto';
        break;
      default:
        newFlash = 'off';
    }

    setCurrentFlash(newFlash);
    onFlashChange?.(newFlash);
  }, [currentFlash, currentFacing, disabled, onFlashChange]);

  // Set zoom
  const setZoomValue = useCallback((value: number) => {
    const clampedZoom = Math.max(0, Math.min(1, value));
    setZoom(clampedZoom);

    // Show zoom slider temporarily
    setShowZoomSlider(true);
    if (zoomTimeout.current) {
      clearTimeout(zoomTimeout.current);
    }
    zoomTimeout.current = setTimeout(() => {
      setShowZoomSlider(false);
    }, 1000);
  }, []);

  // Check if pan responder should be enabled
  const shouldEnablePanResponder = useCallback((): boolean => {
    return (enableZoom ?? false) && currentFacing === 'back' && !disabled;
  }, [enableZoom, currentFacing, disabled]);

  // Pan responder callbacks
  const onStartShouldSetPanResponder = useCallback(
    (_event: GestureResponderEvent, _gestureState: PanResponderGestureState): boolean => {
      return shouldEnablePanResponder();
    },
    [shouldEnablePanResponder],
  );

  const onMoveShouldSetPanResponder = useCallback(
    (_event: GestureResponderEvent, _gestureState: PanResponderGestureState): boolean => {
      return shouldEnablePanResponder();
    },
    [shouldEnablePanResponder],
  );

  const onPanResponderGrant = useCallback(
    (_event: GestureResponderEvent, _gestureState: PanResponderGestureState): boolean => {
      return true;
    },
    [],
  );

  const onPanResponderMove = useCallback(
    (_event: GestureResponderEvent, gestureState: PanResponderGestureState): boolean => {
      if (shouldEnablePanResponder()) {
        const newZoom = Math.max(0, Math.min(1, zoom + gestureState.dy / -200));
        setZoomValue(newZoom);
      }
      return true;
    },
    [shouldEnablePanResponder, zoom, setZoomValue],
  );

  const onPanResponderRelease = useCallback(
    (_event: GestureResponderEvent, _gestureState: PanResponderGestureState): boolean => {
      return true;
    },
    [],
  );

  const onPanResponderTerminate = useCallback(
    (_event: GestureResponderEvent, _gestureState: PanResponderGestureState): boolean => {
      return true;
    },
    [],
  );

  // Pan responder configuration
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder,
      onMoveShouldSetPanResponder,
      onPanResponderGrant,
      onPanResponderMove,
      onPanResponderRelease,
      onPanResponderTerminate,
    }),
  ).current;

  // Get flash icon
  const getFlashIcon = useCallback(() => {
    switch (currentFlash) {
      case 'on':
        return 'flash';
      case 'auto':
        return 'flash-outline';
      default:
        return 'flash-off';
    }
  }, [currentFlash]);

  // Render permission denied
  const renderPermissionDenied = () => (
    <View style={styles.permissionContainer}>
      <Ionicons
        // name="camera-off"
        size={48}
        color={
          typeof styles.permissionText.color === 'string' ? styles.permissionText.color : '#666'
        }
      />
      <AppText style={styles.permissionTitle}>Camera Access Required</AppText>
      <AppText style={styles.permissionText}>Please grant camera permission to take photos</AppText>
      <TouchableOpacity
        style={styles.permissionButton}
        onPress={requestPermission}
        activeOpacity={0.7}
      >
        <AppText style={styles.permissionButtonText}>Grant Permission</AppText>
      </TouchableOpacity>
    </View>
  );

  // Render error
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons
        name="alert-circle"
        size={48}
        color={typeof styles.errorTitle.color === 'string' ? styles.errorTitle.color : '#EF4444'}
      />
      <AppText style={styles.errorTitle}>Camera Error</AppText>
      <AppText style={styles.errorText}>{error?.message}</AppText>
      <TouchableOpacity
        style={styles.errorButton}
        onPress={() => setError(null)}
        activeOpacity={0.7}
      >
        <AppText style={styles.permissionButtonText}>Try Again</AppText>
      </TouchableOpacity>
    </View>
  );

  // Render controls
  const renderControls = () => {
    if (!showControls) return null;
    if (customControls) return customControls;

    return (
      <Animated.View style={[styles.controls, overlayStyle, { opacity: fadeAnim }]}>
        {/* Top Controls */}
        <View style={styles.topControls}>
          {currentFacing === 'back' && (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleFlash}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Ionicons name={getFlashIcon()} size={24} color="white" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.controlButton}
            onPress={switchCamera}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Ionicons
              name={currentFacing === 'front' ? 'camera-reverse' : 'camera'}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {/* Zoom Slider */}
        {enableZoom && showZoomSlider && currentFacing === 'back' && (
          <View style={styles.zoomSliderContainer}>
            <View style={styles.zoomSlider}>
              <View style={[styles.zoomSliderFill, { width: `${zoom * 100}%` }]} />
            </View>
          </View>
        )}

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={[
              styles.captureButton,
              (disabled || isTakingPhoto) && styles.captureButtonDisabled,
            ]}
            onPress={takePhoto}
            disabled={disabled || isTakingPhoto}
            activeOpacity={0.8}
          >
            {isTakingPhoto ? (
              <ActivityIndicator
                size="small"
                color={
                  typeof styles.captureButtonInner.backgroundColor === 'string'
                    ? styles.captureButtonInner.backgroundColor
                    : 'white'
                }
              />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  // Expose methods via ref
  useImperativeHandle(
    ref,
    () => ({
      takePhoto,
      switchCamera,
      toggleFlash,
      setZoom: setZoomValue,
      getState: (): CameraState => ({
        isReady: true, // Always ready
        facing: currentFacing,
        flash: currentFlash,
        hasPermission: permission?.granted || false,
        isTakingPhoto,
        zoom,
      }),
      isReady: () => true, // Always return true
      reset: () => {
        setCurrentFacing(facing as CameraType);
        setCurrentFlash(flash as FlashMode);
        setZoom(0);
        setError(null);
        setIsTakingPhoto(false);
      },
      pause: () => {},
      resume: () => {},
    }),
    [
      takePhoto,
      switchCamera,
      toggleFlash,
      setZoomValue,
      currentFacing,
      currentFlash,
      permission,
      zoom,
      facing,
      flash,
      isTakingPhoto,
    ],
  );

  // Don't render if not visible
  if (!visible) return null;

  // Render based on state
  if (error) return renderError();
  if (!permission?.granted) return renderPermissionDenied();

  // Render camera - always render without loading state
  return (
    <Animated.View
      style={[styles.container, containerStyle, style]}
      testID={testID}
      {...panResponder.panHandlers}
    >
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={currentFacing}
        flash={currentFlash}
        autofocus={autofocus ? 'on' : 'off'}
        zoom={zoom}
        ratio={ratio}
        mirror={mirror}
        onCameraReady={handleCameraReady}
        onMountError={handleCameraError}
      />
      {renderControls()}
    </Animated.View>
  );
});

Camera.displayName = 'Camera';

export default Camera;
