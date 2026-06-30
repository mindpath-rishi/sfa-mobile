// Camera.types.ts
import { ViewStyle, TextStyle, StyleProp } from 'react-native';
import { CameraType, FlashMode } from 'expo-camera';

export type CameraRatio = '4:3' | '16:9' | '1:1' | '3:4' | '9:16';
export type CameraQuality = 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
export type CameraPictureSize = 'small' | 'medium' | 'large' | 'full';
export type CameraAnimation = 'none' | 'fade' | 'slide' | 'scale';

export interface CameraCapturedPhoto {
  /** Local URI of the captured photo */
  uri: string;
  /** Base64 encoded image data (optional) */
  base64?: string;
  /** Width of the captured image in pixels */
  width: number;
  /** Height of the captured image in pixels */
  height: number;
  /** EXIF data from the captured photo */
  exif?: any;
  /** Timestamp when photo was captured */
  timestamp: number;
}

export interface CameraError {
  /** Error code for identifying the error type */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Original error object from the camera API */
  originalError?: any;
}

export interface CameraState {
  /** Whether the camera is ready to take photos */
  isReady: boolean;
  /** Current camera facing direction */
  facing: CameraType;
  /** Current flash mode */
  flash: FlashMode;
  /** Whether camera permission is granted */
  hasPermission: boolean;
  /** Whether a photo is currently being taken */
  isTakingPhoto: boolean;
  /** Current zoom level (0-1) */
  zoom: number;
}

export interface CameraRef {
  /** Take a photo with current settings */
  takePhoto: () => Promise<CameraCapturedPhoto>;
  /** Switch between front and back cameras */
  switchCamera: () => void;
  /** Cycle through flash modes (off, on, auto) */
  toggleFlash: () => void;
  /** Set camera zoom level (0-1) */
  setZoom: (zoom: number) => void;
  /** Get current camera state */
  getState: () => CameraState;
  /** Check if camera is ready */
  isReady: () => boolean;
  /** Reset camera to initial state */
  reset: () => void;
  /** Pause camera preview */
  pause: () => void;
  /** Resume camera preview */
  resume: () => void;
}

export interface CameraProps {
  /** Controls camera visibility (mount/unmount) */
  visible?: boolean;
  /** Camera facing direction */
  facing?: CameraType;
  /** Flash mode */
  flash?: FlashMode;
  /** Camera aspect ratio */
  ratio?: CameraRatio;
  /** Photo quality (0-1, higher = better quality but larger file) */
  quality?: CameraQuality;
  /** Picture size preset */
  pictureSize?: CameraPictureSize;
  /** Enable autofocus */
  autofocus?: boolean;
  /** Enable pinch to zoom gesture */
  enableZoom?: boolean;
  /** Show default controls overlay */
  showControls?: boolean;
  /** Custom controls component (overrides default controls) */
  customControls?: React.ReactNode;
  /** Enable torch (back camera only) */
  enableTorch?: boolean;
  /** Mirror front camera preview (for selfies) */
  mirror?: boolean;
  /** Animation when camera loads */
  animation?: CameraAnimation;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Callback when photo is captured */
  onCapture?: (photo: CameraCapturedPhoto) => void;
  /** Callback when camera is ready to use */
  onReady?: () => void;
  /** Callback when camera error occurs */
  onError?: (error: CameraError) => void;
  /** Callback when camera facing changes */
  onFacingChange?: (facing: CameraType) => void;
  /** Callback when flash mode changes */
  onFlashChange?: (flash: FlashMode) => void;
  /** Callback when camera starts taking photo */
  onCaptureStart?: () => void;
  /** Callback when camera finishes taking photo */
  onCaptureEnd?: () => void;
  /** Custom styles for the container */
  style?: StyleProp<ViewStyle>;
  /** Custom styles for the camera container */
  containerStyle?: StyleProp<ViewStyle>;
  /** Custom styles for the controls overlay */
  overlayStyle?: StyleProp<ViewStyle>;
  /** Disable camera interaction */
  disabled?: boolean;
  /** Test ID for testing */
  testID?: string;
  /** Children to render as overlay (alternative to customControls) */
  children?: React.ReactNode;
}

export interface CameraStyleProps {
  /** Whether camera is ready */
  isReady?: boolean;
  /** Whether camera is disabled */
  disabled?: boolean;
  /** Whether photo is being taken */
  isTakingPhoto?: boolean;
  /** Animation type */
  animation?: CameraAnimation;
  /** Animation duration */
  animationDuration?: number;
}

export interface CameraModalProps {
  /** Controls modal visibility */
  visible: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when photo is captured */
  onCapture?: (photo: CameraCapturedPhoto) => void;
  /** Callback when camera error occurs */
  onError?: (error: CameraError) => void;
  /** Modal title */
  title?: string;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether to show header */
  showHeader?: boolean;
  /** Modal animation type */
  animation?: 'none' | 'slide' | 'fade' | 'scale';
  /** Whether to close modal after capture */
  closeOnCapture?: boolean;
  /** Whether to auto-focus camera when modal opens */
  autoFocusOnMount?: boolean;
  /** Camera ref for external control */
  cameraRef?: React.RefObject<CameraRef>;
  /** Camera component props */
  cameraProps?: Omit<CameraProps, 'onCapture' | 'onError' | 'visible'>;
  /** Modal component props */
  modalProps?: {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    position?: 'center' | 'top' | 'bottom';
    animation?: 'none' | 'slide' | 'fade' | 'scale';
    closeOnBackdropPress?: boolean;
    dismissible?: boolean;
    [key: string]: any;
  };
}

export interface GalleryPickerProps {
  /** Controls picker visibility */
  visible: boolean;
  /** Callback when images are selected */
  onSelect: (images: any[]) => void;
  /** Callback when picker is closed */
  onClose: () => void;
  /** Allow multiple image selection */
  multiple?: boolean;
  /** Maximum number of images to select */
  maxImages?: number;
  /** Allowed media types */
  mediaTypes?: 'images' | 'videos' | 'all';
  /** Whether to include base64 data */
  includeBase64?: boolean;
  /** Image quality (0-1) */
  quality?: number;
}

// Default props
export const DEFAULT_CAMERA_PROPS: Partial<CameraProps> = {
  facing: 'back',
  flash: 'off',
  ratio: '16:9',
  quality: 0.8,
  autofocus: true,
  enableZoom: true,
  showControls: true,
  mirror: false,
  animation: 'fade',
  animationDuration: 300,
  disabled: false,
};

// Default modal props
export const DEFAULT_CAMERA_MODAL_PROPS: Partial<CameraModalProps> = {
  showCloseButton: true,
  showHeader: true,
  animation: 'slide',
  closeOnCapture: true,
  autoFocusOnMount: true,
};
