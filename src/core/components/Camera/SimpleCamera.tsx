// SimpleCamera.tsx
import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Platform } from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

export interface SimpleCameraRef {
  takePicture: () => Promise<any>;
  switchCamera: () => void;
  isReady: () => boolean;
}

interface SimpleCameraProps {
  onCapture?: (photo: any) => void;
  onError?: (error: any) => void;
  facing?: CameraType;
  quality?: number;
}

export const SimpleCamera = forwardRef<SimpleCameraRef, SimpleCameraProps>((props, ref) => {
  const { onCapture, onError, facing: initialFacing = 'front', quality = 0.8 } = props;

  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const [facing, setFacing] = useState<CameraType>(initialFacing);
  const [isTaking, setIsTaking] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Request permission on mount
  React.useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const takePicture = async () => {
    if (!cameraRef.current || !isReady || isTaking) {
      console.log('Camera not ready:', { hasRef: !!cameraRef.current, isReady, isTaking });
      return;
    }

    setIsTaking(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality,
        base64: true,
        exif: true,
      });

      console.log('Photo taken:', photo.uri);
      onCapture?.(photo);
      return photo;
    } catch (error) {
      console.error('Error taking picture:', error);
      onError?.(error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      throw error;
    } finally {
      setIsTaking(false);
    }
  };

  const switchCamera = () => {
    setFacing((current) => (current === 'front' ? 'back' : 'front'));
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    takePicture,
    switchCamera,
    isReady: () => isReady,
  }));

  // Show permission denied UI
  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Ionicons size={64} color="#666" />
        <Text style={styles.text}>Camera permission required</Text>
        <Text style={styles.subText}>Please grant camera permission to take photos</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show loading state while camera initializes
  if (!isReady) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>Initializing camera...</Text>
        </View>
      </View>
    );
  }

  // Main camera view
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        onCameraReady={() => {
          console.log('✅ Camera ready!');
          setIsReady(true);
        }}
        onMountError={(error) => {
          console.error('❌ Camera mount error:', error);
          Alert.alert('Camera Error', error.message || 'Failed to start camera');
          onError?.(error);
        }}
      />

      {/* Camera Controls */}
      <View style={styles.controls}>
        {/* Capture Button */}
        <TouchableOpacity
          style={[styles.captureButton, isTaking && styles.captureButtonDisabled]}
          onPress={takePicture}
          disabled={isTaking}
          activeOpacity={0.8}
        >
          {isTaking ? (
            <View style={styles.captureButtonInnerLoading} />
          ) : (
            <View style={styles.captureButtonInner} />
          )}
        </TouchableOpacity>

        {/* Switch Camera Button */}
        <TouchableOpacity style={styles.switchButton} onPress={switchCamera} activeOpacity={0.7}>
          <Ionicons name="camera-reverse" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Instruction Text */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          {facing === 'front' ? 'Take a selfie' : 'Take a photo'}
        </Text>
      </View>
    </View>
  );
});

SimpleCamera.displayName = 'SimpleCamera';

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  captureButtonInnerLoading: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  switchButton: {
    position: 'absolute',
    right: 30,
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  instructionContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  subText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#007AFF',
    borderTopColor: 'transparent',
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 12,
  },
});

export default SimpleCamera;
