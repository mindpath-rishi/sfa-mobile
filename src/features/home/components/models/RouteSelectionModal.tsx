import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouteSelectionModalStyles } from '../../styles/RouteSelectionModel.styles';
import { RouteSelectionModalProps } from '../../types/route.types';

export const RouteSelectionModal: React.FC<RouteSelectionModalProps> = ({
  visible,
  routes,
  assignedVan,
  vanChangeReason,
  onClose,
  onSelectRoute,
}) => {
  const styles = useRouteSelectionModalStyles();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.titleSmall}>SELECT YOUR ROUTE</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} style={styles.closeIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.vanInfoCard}>
            <Text style={styles.textXSmallBold}>YOUR VAN STATUS</Text>
            <Text style={[styles.textXSmall, { marginTop: 2 }]}>
              {vanChangeReason || 'No change selected'}
            </Text>
            <Text style={[styles.textXSmall, { marginTop: 2 }]}>
              {assignedVan.name} • {assignedVan.type}
            </Text>
          </View>

          <FlatList
            data={routes}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }: { item: any }) => (
              <TouchableOpacity onPress={() => onSelectRoute(item)} style={styles.routeItem}>
                <LinearGradient colors={['#4158D0', '#C850C0']} style={styles.routeIcon}>
                  <Ionicons name="map" size={22} color="white" />
                </LinearGradient>
                <View style={styles.routeContent}>
                  <Text style={styles.textSmallBold}>{item.name}</Text>
                  <Text style={styles.routeDetails}>
                    {item.stops} stops • {item.distance}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} style={styles.chevronIcon} />
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};
