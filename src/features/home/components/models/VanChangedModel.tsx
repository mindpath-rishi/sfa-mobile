import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { VanChangeModalProps } from '../../types/van.types';
import { useVanChangeModalStyles } from '../../styles/VanChangeModel.styles';

export const VanChangeModal: React.FC<VanChangeModalProps> = ({
  visible,
  vanChangeReason,
  onClose,
  onSelectReason,
  onSubmit,
}) => {
  const styles = useVanChangeModalStyles({ vanChangeReason });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.centeredModalOverlay}>
        <View style={styles.centeredModalContent}>
          <Text style={styles.titleMedium}>VAN DETAILS</Text>
          <Text style={styles.questionText}>Is your Van changed for retailing today?</Text>
          <Text style={styles.selectLabel}>SELECT</Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              onPress={() => onSelectReason('Yes, van changed')}
              style={[
                styles.optionItem,
                vanChangeReason === 'Yes, van changed' && styles.optionItemSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  vanChangeReason === 'Yes, van changed' && styles.optionTextSelected,
                ]}
              >
                Yes, van changed
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onSelectReason('No, same van')}
              style={[
                styles.optionItem,
                vanChangeReason === 'No, same van' && styles.optionItemSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  vanChangeReason === 'No, same van' && styles.optionTextSelected,
                ]}
              >
                No, same van
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onSelectReason('Van not available')}
              style={[
                styles.lastOptionItem,
                vanChangeReason === 'Van not available' && styles.optionItemSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  vanChangeReason === 'Van not available' && styles.optionTextSelected,
                ]}
              >
                Van not available
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.errorText}>* Please select an option</Text>

          <TouchableOpacity onPress={onSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>CONTINUE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
