import React from 'react';
import { View } from 'react-native';

import { AppModal, AppText } from '@/core/components';
import { useCameraModalStyles } from './CameraModal.styles';

export interface SelfieFaceCameraProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (photoUri: string) => void | boolean | string | Promise<void | boolean | string>;
  title?: string;
}

export const SelfieFaceCamera: React.FC<SelfieFaceCameraProps> = ({ visible, onClose }) => {
  const styles = useCameraModalStyles();

  if (!visible) return null;

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      showBackdrop
      animation="slide"
      position="center"
      size="full"
      contentStyle={styles.fullScreenContent}
      style={styles.fullScreenContainer}
      showHeader={false}
    >
      <View style={[styles.camera, { alignItems: 'center', justifyContent: 'center', padding: 24 }]}>
        <AppText style={{ textAlign: 'center' }}>
          Selfie capture is not available on web. Please use the mobile app.
        </AppText>
      </View>
    </AppModal>
  );
};

SelfieFaceCamera.displayName = 'SelfieFaceCamera';
export default SelfieFaceCamera;
