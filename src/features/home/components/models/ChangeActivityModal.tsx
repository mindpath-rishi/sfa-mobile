import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useChangeActivityModalStyles } from '../../styles/ChangeActivityModal.styles';
import { ChangeActivityModalProps } from '../../types/activity.types';

export const ChangeActivityModal: React.FC<ChangeActivityModalProps> = ({
  visible,
  showChangeOtherOptions,
  selectedActivity,
  activityTypes,
  otherWorkOptions,
  onClose,
  onActivitySelect,
  onOtherWorkSelect,
  onBackToOptions,
}) => {
  const styles = useChangeActivityModalStyles({ showChangeOtherOptions });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.titleSmall}>
              {showChangeOtherOptions ? 'SELECT WORK TYPE' : 'CHANGE ACTIVITY'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} style={styles.closeIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.currentActivityInfo}>
            <Ionicons name="information-circle" size={20} />
            <Text style={styles.infoText}>
              Currently working on: <Text style={styles.infoHighlight}>{selectedActivity}</Text>
            </Text>
          </View>

          {!showChangeOtherOptions ? (
            <FlatList
              data={activityTypes.filter((a: any) => a.name !== selectedActivity)}
              keyExtractor={(item: any) => item.id}
              renderItem={({ item }: { item: any }) => (
                <TouchableOpacity onPress={() => onActivitySelect(item)} style={styles.modalItem}>
                  <LinearGradient
                    colors={[item.color, item.color + 'CC']}
                    style={styles.modalItemIcon}
                  >
                    <Ionicons name={item.icon as any} size={24} color="white" />
                  </LinearGradient>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{item.name}</Text>
                    {item.name === 'Retailing' && (
                      <Text style={styles.itemSubtitle}>
                        Select new route (Van confirmation required)
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} style={styles.chevronIcon} />
                </TouchableOpacity>
              )}
            />
          ) : (
            <FlatList
              data={otherWorkOptions.filter((o) => o.name !== selectedActivity)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => onOtherWorkSelect(item)} style={styles.modalItem}>
                  <LinearGradient
                    colors={[item.color, item.color + 'CC']}
                    style={styles.modalItemIcon}
                  >
                    <Ionicons name={item.icon as any} size={24} color="white" />
                  </LinearGradient>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{item.name}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} style={styles.chevronIcon} />
                </TouchableOpacity>
              )}
            />
          )}

          {showChangeOtherOptions && (
            <TouchableOpacity onPress={onBackToOptions} style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color={styles.backButtonText.color} />
              <Text style={styles.backButtonText}>BACK TO OPTIONS</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};
