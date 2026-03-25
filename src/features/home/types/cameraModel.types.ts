export interface CameraModalProps {
  visible: boolean;
  cameraRef: React.RefObject<any>;
  onClose: () => void;
  onCapture: () => void;
}
