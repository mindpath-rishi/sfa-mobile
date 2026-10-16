import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppModal, AppText } from '@/core/components';
import { useCameraModalStyles } from './CameraModal.styles';

export interface SelfieFaceCameraProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (photoUri: string) => void | boolean | string | Promise<void | boolean | string>;
  title?: string;
}

export const SelfieFaceCamera: React.FC<SelfieFaceCameraProps> = ({
  visible,
  onClose,
  onCapture,
  title = 'Center your face and take a selfie',
}) => {
  const styles = useCameraModalStyles();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is unavailable. Open this page over HTTPS in a supported browser.');
      return;
    }

    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
    } catch (cameraError) {
      const name = cameraError instanceof Error ? cameraError.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setError('Camera permission was blocked. Allow camera access in your browser settings, then retry.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setError('No camera was found on this device.');
      } else if (!window.isSecureContext) {
        setError('Camera access requires a secure connection (HTTPS or localhost).');
      } else {
        setError(cameraError instanceof Error ? cameraError.message : 'Unable to start the camera.');
      }
    }
  }, [stopCamera]);

  useEffect(() => {
    if (visible && !photoUri) void startCamera();
    if (!visible) {
      stopCamera();
      setPhotoUri(null);
      setError(null);
    }
    return () => stopCamera();
  }, [visible, photoUri, startCamera, stopCamera]);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setError('The camera is still starting. Please wait a moment and try again.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      setError('Could not capture the photo. Please try again.');
      return;
    }
    // Mirror the saved selfie to match the front-camera preview.
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhotoUri(canvas.toDataURL('image/jpeg', 0.88));
    stopCamera();
  };

  const retakePhoto = () => {
    setPhotoUri(null);
    void startCamera();
  };

  const usePhoto = async () => {
    if (!photoUri || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await onCapture(photoUri);
      if (result === false || typeof result === 'string') {
        setError(typeof result === 'string' ? result : 'Please retake the photo.');
        setPhotoUri(null);
        void startCamera();
      }
    } catch (captureError) {
      setError(captureError instanceof Error ? captureError.message : 'Unable to use this photo.');
      setPhotoUri(null);
      void startCamera();
    } finally {
      setBusy(false);
    }
  };

  if (!visible) return null;

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
      <View style={[styles.cameraContainer, { overflow: 'hidden' }]}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} resizeMode="cover" style={styles.camera} />
        ) : (
          React.createElement('video', {
            ref: videoRef,
            autoPlay: true,
            muted: true,
            playsInline: true,
            style: {
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
              backgroundColor: 'black',
            },
          })
        )}

        <View pointerEvents="box-none" style={{ position: 'absolute', inset: 0, justifyContent: 'space-between', alignItems: 'center', padding: 24 }}>
          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="Close camera"
              style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.55)' }}
            >
              <Ionicons name="close" size={26} color="white" />
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={{ maxWidth: 440, padding: 16, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.7)' }}>
              <AppText style={{ color: 'white', textAlign: 'center' }}>{error}</AppText>
              <TouchableOpacity onPress={() => void startCamera()} style={{ marginTop: 14, alignSelf: 'center', padding: 10 }}>
                <AppText style={{ color: 'white', fontWeight: '700' }}>Retry camera</AppText>
              </TouchableOpacity>
            </View>
          ) : !photoUri ? (
            <View pointerEvents="none" style={{ width: 260, height: 340, borderWidth: 3, borderColor: 'white', borderRadius: 140, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 20 }}>
              <AppText style={{ color: 'white', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 5 }}>{title}</AppText>
            </View>
          ) : (
            <AppText style={{ color: 'white', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.55)' }}>Review your photo</AppText>
          )}

          <View style={{ width: '100%', minHeight: 64, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 24 }}>
            {photoUri ? (
              <>
                <TouchableOpacity onPress={retakePhoto} disabled={busy} style={{ minWidth: 120, height: 48, borderRadius: 24, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.65)' }}>
                  <Ionicons name="refresh" size={20} color="white" />
                  <AppText style={{ color: 'white' }}>Retake</AppText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => void usePhoto()} disabled={busy} style={{ minWidth: 140, height: 48, borderRadius: 24, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#16865a' }}>
                  {busy ? <ActivityIndicator color="white" /> : <Ionicons name="checkmark" size={20} color="white" />}
                  <AppText style={{ color: 'white' }}>Use photo</AppText>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={capturePhoto}
                disabled={Boolean(error)}
                accessibilityLabel="Capture selfie"
                style={{ width: 72, height: 72, borderRadius: 36, borderWidth: 5, borderColor: 'white', alignItems: 'center', justifyContent: 'center', opacity: error ? 0.5 : 1 }}
              >
                <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: 'white' }} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </AppModal>
  );
};

SelfieFaceCamera.displayName = 'SelfieFaceCamera';
export default SelfieFaceCamera;
