// VanChangeModal.tsx
import React from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VanChangeModalProps } from '../../types/van.types';
import { useVanChangeModalStyles } from '../../styles/VanChangeModel.styles';
import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';

export const VanChangeModal: React.FC<VanChangeModalProps> = ({
  visible,
  vanChangeReason,
  onClose,
  onSelectReason,
  onSubmit,
}) => {
  const styles = useVanChangeModalStyles({ vanChangeReason });
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.bottomModalContent, { backgroundColor: colors.surface }]}>
          {/* Drag Indicator */}
          <View style={styles.dragIndicator}>
            <View style={[styles.dragIndicatorBar, { backgroundColor: colors.border }]} />
          </View>

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '10' }]}>
            <MaterialCommunityIcons name="truck" size={32} color={colors.primary} />
          </View>

          {/* Title */}
          <AppText style={[styles.title, { color: colors.textPrimary }]}>
            Change Van?
          </AppText>

          {/* Question */}
          <AppText style={[styles.questionText, { color: colors.textSecondary }]}>
            Do you want to continue with the mapped van or change to a different one?
          </AppText>

          {/* Options */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              onPress={() => onSelectReason('Yes, Same Van')}
              style={[
                styles.optionItem,
                vanChangeReason === 'Yes, Same Van' && styles.optionItemSelected,
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View style={[styles.optionIcon, { backgroundColor: colors.success + '10' }]}>
                  <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
                </View>
                <View style={styles.optionTextContainer}>
                  <AppText style={[
                    styles.optionTitle,
                    vanChangeReason === 'Yes, Same Van' && styles.optionTextSelected
                  ]}>
                    Yes, Same Van
                  </AppText>
                  <AppText style={[styles.optionDescription, { color: colors.textTertiary }]}>
                    Continue with currently mapped van
                  </AppText>
                </View>
                {vanChangeReason === 'Yes, Same Van' && (
                  <MaterialCommunityIcons name="check" size={20} color={colors.primary} />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onSelectReason('No, Change Van')}
              style={[
                styles.optionItem,
                vanChangeReason === 'No, Change Van' && styles.optionItemSelected,
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View style={[styles.optionIcon, { backgroundColor: colors.warning + '10' }]}>
                  <MaterialCommunityIcons name="truck-fast" size={20} color={colors.warning} />
                </View>
                <View style={styles.optionTextContainer}>
                  <AppText style={[
                    styles.optionTitle,
                    vanChangeReason === 'No, Change Van' && styles.optionTextSelected
                  ]}>
                    No, Change Van
                  </AppText>
                  <AppText style={[styles.optionDescription, { color: colors.textTertiary }]}>
                    Select a different van for this route
                  </AppText>
                </View>
                {vanChangeReason === 'No, Change Van' && (
                  <MaterialCommunityIcons name="check" size={20} color={colors.primary} />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {!vanChangeReason && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={14} color={colors.error} />
              <AppText style={[styles.errorText, { color: colors.error }]}>
                Please select an option to continue
              </AppText>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.cancelButton, { borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <AppText style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                Cancel
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSubmit}
              style={[
                styles.submitButton,
                { backgroundColor: colors.primary },
                !vanChangeReason && styles.submitButtonDisabled
              ]}
              activeOpacity={0.85}
              disabled={!vanChangeReason}
            >
              <AppText style={styles.submitButtonText}>Continue</AppText>
              <MaterialCommunityIcons name="arrow-right" size={18} color={colors.primaryContrast} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
