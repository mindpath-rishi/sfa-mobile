import React from 'react';
import { Dimensions, Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/shared/hooks/useTheme';

const { width } = Dimensions.get('window');

export type ConfirmationVariant = 'primary' | 'error' | 'success';

type ConfirmationModalProps = {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ConfirmationVariant;
};

export function ConfirmationModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
}: ConfirmationModalProps) {
  const { colors } = useTheme();

  if (!visible) return null;

  const getConfirmButtonColor = () => {
    switch (confirmVariant) {
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      default:
        return colors.primary;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 24,
                width: width * 0.85,
                maxWidth: 320,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: getConfirmButtonColor() + '15',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Ionicons
                  name={confirmVariant === 'error' ? 'alert-circle' : 'checkmark-circle'}
                  size={32}
                  color={getConfirmButtonColor()}
                />
              </View>

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: colors.textPrimary,
                  marginBottom: 8,
                  textAlign: 'center',
                }}
              >
                {title}
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginBottom: 24,
                  textAlign: 'center',
                  lineHeight: 20,
                }}
              >
                {message}
              </Text>

              <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                <TouchableOpacity
                  onPress={onCancel}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: colors.divider,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: colors.textSecondary, fontWeight: '600', fontSize: 14 }}>
                    {cancelText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onConfirm}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: getConfirmButtonColor(),
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: colors.surface, fontWeight: '600', fontSize: 14 }}>
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

