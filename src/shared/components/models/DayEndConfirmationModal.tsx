import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppModal } from '@/core/components';
import { useDayEndModalStyles } from '@/shared/styles/DayEndModal.styles';

interface DayEndModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (carryForwardStock: boolean) => Promise<void>;
  vanName?: string;
  date?: string;
  isLoading?: boolean;
}

export const DayEndConfirmationModal: React.FC<DayEndModalProps> = ({
  visible,
  onClose,
  onConfirm,
  vanName = 'Van #001',
  date = new Date().toLocaleDateString(),
  isLoading = false,
}) => {
  const { colors } = useTheme();
  const styles = useDayEndModalStyles();
  const [carryForwardStock, setCarryForwardStock] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      await onConfirm(carryForwardStock);
      setShowSuccessMessage(true);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        setCarryForwardStock(false);
        setProcessing(false);
        onClose();
      }, 3000);
    } catch (error) {
      setProcessing(false);
      Alert.alert('Error', 'Failed to process day end. Please try again.');
    }
  };

  const handleClose = () => {
    setShowSuccessMessage(false);
    setCarryForwardStock(false);
    setProcessing(false);
    onClose();
  };

  return (
    <AppModal
      visible={visible}
      onClose={handleClose}
      position="center"
      animation="fade"
      closeOnBackdropPress={!processing && !showSuccessMessage}
      dismissible={!processing && !showSuccessMessage}
      showHeader={false}
      hideCloseButton={true}
    >
      <View style={styles.container}>
        {showSuccessMessage ? (
          // Success Message View
          <View style={styles.successContainer}>
            <LinearGradient
              colors={[colors.success, colors.success + 'CC']}
              style={styles.successGradient}
            >
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={64} color={colors.surface} />
              </View>
              <Text style={styles.successTitle}>Day End Completed!</Text>
              <Text style={styles.successSubtitle}>
                Based on physical stock, ERP order has been created
              </Text>
            </LinearGradient>

            <View style={styles.messageCard}>
              <MaterialIcons name="assignment" size={32} color={colors.primary} />
              <Text style={styles.messageText}>
                Your ERP order has been successfully created based on the physical stock count.
                The warehouse team will process your order shortly.
              </Text>
            </View>

            <View style={styles.nextStepsCard}>
              <Text style={styles.nextStepsTitle}>What happens next?</Text>
              <View style={styles.nextStepItem}>
                <View style={styles.stepDot} />
                <Text style={styles.nextStepText}>
                  ERP order will be processed within 24 hours
                </Text>
              </View>
              <View style={styles.nextStepItem}>
                <View style={styles.stepDot} />
                <Text style={styles.nextStepText}>
                  You will receive confirmation via notification
                </Text>
              </View>
              <View style={styles.nextStepItem}>
                <View style={styles.stepDot} />
                <Text style={styles.nextStepText}>
                  Stock adjustment report will be generated
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={[styles.closeButtonText, { color: colors.primary }]}>Done</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Confirmation View
          <>
            <LinearGradient
              colors={[colors.warning, colors.warning + 'CC']}
              style={styles.headerGradient}
            >
              <View style={styles.headerIcon}>
                <MaterialIcons name="storefront" size={48} color={colors.surface} />
              </View>
              <Text style={styles.title}>End Day</Text>
              <Text style={styles.subtitle}>
                {vanName} • {date}
              </Text>
            </LinearGradient>

            <View style={styles.content}>
              {/* Information Message */}
              <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={28} color={colors.primary} />
                <Text style={styles.infoText}>
                  Completing day end will create an ERP order based on your physical stock count.
                  This action cannot be undone.
                </Text>
              </View>

              {/* Checkbox - Carry Forward Van Stock */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setCarryForwardStock(!carryForwardStock)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    carryForwardStock && styles.checkboxChecked,
                    { borderColor: colors.primary },
                  ]}
                >
                  {carryForwardStock && (
                    <Ionicons name="checkmark" size={16} color={colors.surface} />
                  )}
                </View>
                <View style={styles.checkboxContent}>
                  <Text style={styles.checkboxTitle}>Carry Forward Van Stock</Text>
                  <Text style={styles.checkboxDescription}>
                    Keep remaining stock in van for next day. Unchecked will return all stock to warehouse.
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Preview Card */}
              {/* <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <MaterialIcons name="receipt" size={20} color={colors.primary} />
                  <Text style={styles.previewTitle}>ERP Order Preview</Text>
                </View>
                
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Order Type:</Text>
                  <Text style={styles.previewValue}>
                    {carryForwardStock ? '📦 Stock Adjustment' : '🏭 Full Return Order'}
                  </Text>
                </View>
                
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Based on:</Text>
                  <Text style={styles.previewValue}>Physical Stock Count</Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.previewFooter}>
                  <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.previewFooterText}>
                    Order will be processed within 24 hours
                  </Text>
                </View>
              </View> */}
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={processing}
              >
                <Text style={[styles.buttonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.confirmButton, { backgroundColor: colors.primary }]}
                onPress={handleConfirm}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color={colors.surface} size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color={colors.surface} />
                    <Text style={[styles.buttonText, { color: colors.surface }]}>
                      Submit
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </AppModal>
  );
};