import React, { useRef, useCallback, useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppModal, AppText } from '@/core/components';
import { Camera } from './Camera';
import { CameraModalProps, CameraRef } from './Camera.types';
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
  cameraProps = {},
  modalProps = {},
}) => {
  const styles = useCameraModalStyles();

  const internalCameraRef = useRef<CameraRef>(null);
  const cameraRef = externalCameraRef || internalCameraRef;

  const [isCapturing, setIsCapturing] = useState(false);
  const isCapturingRef = useRef(false); // 🔥 important fix
  const [cameraKey, setCameraKey] = useState(0);

  // Force remount when modal opens
  React.useEffect(() => {
    if (visible) {
      setCameraKey((prev) => prev + 1);
    }
  }, [visible]);

  const handleCapture = useCallback(async () => {
    // 🔥 Prevent double trigger + invalid ref
    if (!cameraRef.current || isCapturingRef.current) return;

    isCapturingRef.current = true;
    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePhoto();
      console.log('Photo captured:', photo);

      await onCapture?.(photo);

      // 🔥 Delay closing to avoid camera unmount race condition
      if (closeOnCapture) {
        setTimeout(() => {
          onClose();
        }, 100);
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      onError?.(error as any);
    } finally {
      isCapturingRef.current = false;
      setIsCapturing(false);
    }
  }, [cameraRef, onCapture, onClose, closeOnCapture, onError]);

  const renderCustomControls = () => {
    return (
      <View style={styles.cameraOverlay}>
        {/* Close Button */}
        {showCloseButton && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.flipButton}
          onPress={() => cameraRef.current?.switchCamera()}
          activeOpacity={0.7}
          accessibilityLabel="Switch camera"
        >
          <Ionicons name="camera-reverse-outline" size={24} color="white" />
        </TouchableOpacity>

        {/* Title */}
        {showHeader && title && (
          <View style={styles.cameraInstruction}>
            <AppText style={styles.instructionText}>{title}</AppText>
          </View>
        )}

        {/* Capture Button */}
        <View style={styles.captureContainer}>
          <TouchableOpacity
            style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
            onPress={handleCapture}
            disabled={isCapturing}
            activeOpacity={0.8}
          >
            {isCapturing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
        </View>
      </View>
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

        {renderCustomControls()}
      </View>
    </AppModal>
  );
};

CameraModal.displayName = 'CameraModal';
export default CameraModal;
