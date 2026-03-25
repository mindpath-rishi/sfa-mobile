import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useStartDayModalStyles } from '../../styles/StartDayModel.styles';
import { StartDayModalProps } from '../../types/startDay.types';

export const StartDayModal: React.FC<StartDayModalProps> = ({
  visible,
  showOtherOptions,
  activityTypes,
  otherWorkOptions,
  onClose,
  onActivitySelect,
  onOtherWorkSelect,
  onBackToOptions,
}) => {
  const styles = useStartDayModalStyles({ showOtherOptions });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.titleSmall}>
              {showOtherOptions ? 'SELECT WORK TYPE' : 'HOW WILL YOU START YOUR DAY?'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} style={styles.closeIcon} />
            </TouchableOpacity>
          </View>

          {!showOtherOptions ? (
            <FlatList
              data={activityTypes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => onActivitySelect(item)} style={styles.modalItem}>
                  <LinearGradient
                    colors={[item.color, item.color + 'CC']}
                    style={styles.modalItemIcon}
                  >
                    <Ionicons name={item.icon as any} size={22} color="white" />
                  </LinearGradient>
                  <View style={styles.itemContent}>
                    <Text style={styles.textSmallBold}>{item.name}</Text>
                    {item.name === 'Retailing' && (
                      <Text style={styles.textXSmall}>Select route after van confirmation</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={18} style={styles.chevronIcon} />
                </TouchableOpacity>
              )}
            />
          ) : (
            <FlatList
              data={otherWorkOptions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => onOtherWorkSelect(item)} style={styles.modalItem}>
                  <LinearGradient
                    colors={[item.color, item.color + 'CC']}
                    style={styles.modalItemIcon}
                  >
                    <Ionicons name={item.icon as any} size={22} color="white" />
                  </LinearGradient>
                  <View style={styles.itemContent}>
                    <Text style={styles.textSmallBold}>{item.name}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} style={styles.chevronIcon} />
                </TouchableOpacity>
              )}
            />
          )}

          {showOtherOptions && (
            <TouchableOpacity onPress={onBackToOptions} style={styles.backButton}>
              <Ionicons name="arrow-back" size={18} style={styles.backIcon} />
              <Text style={styles.backButtonText}>BACK TO OPTIONS</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};
