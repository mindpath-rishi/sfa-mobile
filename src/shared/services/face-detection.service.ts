import { Platform } from 'react-native';
import type { RNMLKitFaceDetector as FaceDetector } from '@infinitered/react-native-mlkit-face-detection';

export type SelfieFaceValidation =
  | { valid: true; faceCount: 1 }
  | {
      valid: false;
      faceCount: number;
      reason: 'no-face' | 'multiple-faces' | 'unavailable' | 'module-missing';
    };

let detectorPromise: Promise<FaceDetector> | null = null;

const getFaceDetector = async () => {
  if (Platform.OS === 'web') return null;

  if (!detectorPromise) {
    detectorPromise = (async () => {
      const { RNMLKitFaceDetector } =
        require('@infinitered/react-native-mlkit-face-detection') as typeof import('@infinitered/react-native-mlkit-face-detection');
      const options = {
        performanceMode: 'accurate',
        landmarkMode: true,
        minFaceSize: 0.15,
      };
      const detector = new RNMLKitFaceDetector(options, true);

      await detector.initialize(options);
      return detector;
    })();
  }

  return detectorPromise;
};

export const validateSelfieFace = async (imageUri: string): Promise<SelfieFaceValidation> => {
  // Face detection has no web implementation (native ML Kit module only).
  // Skip validation on web and accept the photo as-is.
  if (Platform.OS === 'web') {
    return { valid: true, faceCount: 1 };
  }

  try {
    const detector = await getFaceDetector();
    if (!detector) {
      return { valid: false, faceCount: 0, reason: 'unavailable' };
    }

    const result = await detector.detectFaces(imageUri);
    if (!result?.success) {
      return { valid: false, faceCount: 0, reason: 'unavailable' };
    }

    const faceCount = result.faces.length;

    if (faceCount === 0) {
      return { valid: false, faceCount, reason: 'no-face' };
    }

    if (faceCount > 1) {
      return { valid: false, faceCount, reason: 'multiple-faces' };
    }

    return { valid: true, faceCount: 1 };
  } catch (error) {
    detectorPromise = null;
    console.error('Selfie face detection failed:', error);

    const message = error instanceof Error ? error.message : String(error);
    const isNativeModuleMissing = /native module|cannot find module|NativeModule/i.test(message);

    return {
      valid: false,
      faceCount: 0,
      reason: isNativeModuleMissing ? 'module-missing' : 'unavailable',
    };
  }
};
