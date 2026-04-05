// app/(drawer)/beats.tsx - SFA Sales Executive Active Routes (All Colors from Theme)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  LayoutAnimation,
  UIManager,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons, FontAwesome5, Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/shared/hooks/useTheme';
import { createStyles } from '@/shared/theme/styles';
import { AppModal } from '@/core/components';
import { useAuthStore } from '@/core/store/auth.store';
import { ApiResponse } from '@/core/network';
import { outletService } from '@/features/outlet/services/outlet.service';

const { width, height } = Dimensions.get('window');

// Currency configuration
const CURRENCY = {
  code: 'ZMW',
  symbol: 'K',
  name: 'Zambian Kwacha',
};

// Format currency function
const formatCurrency = (amount: number): string => {
  return `${CURRENCY.symbol} ${amount.toLocaleString()}`;
};

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Types
interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'completed' | 'current';
  visitPurpose: string;
  appointmentTime: string;
  orderValue?: number;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  distance?: any;
}

interface Route {
  id: string;
  routeName: string;
  date: string;
  totalClients: number;
  completedVisits: number;
  totalDistance: string;
  estimatedTime: string;
  startTime: string;
  endTime: string;
}

// Don't import react-native-maps at the top level
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
let PROVIDER_GOOGLE: any = null;

// Only load native maps on mobile
if (Platform.OS !== 'web') {
  const loadMaps = async () => {
    try {
      const Maps = require('react-native-maps');
      MapView = Maps.default;
      Marker = Maps.Marker;
      Polyline = Maps.Polyline;
      PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
    } catch (error) {
      console.log('Error loading maps:', error);
    }
  };
  loadMaps();
}

export default function BeatsScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const activeRoute = useAuthStore((s) => s.selectedRoute);

  // // State for active route
  // const [activeRoute, setActiveRoute] = useState<Route>({
  //   id: 'RT-001',
  //   routeName: 'Downtown Sales Route',
  //   date: new Date().toLocaleDateString(),
  //   totalClients: 12,
  //   completedVisits: 4,
  //   totalDistance: '24.5 km',
  //   estimatedTime: '4.5 hours',
  //   startTime: '09:00 AM',
  //   endTime: '01:30 PM',
  // });

  const [outlets, setOutlets] = useState<Client[]>([
    {
      id: '1',
      name: 'ABC Corporation',
      phone: '+91 955 123456',
      email: 'contact@abccorp.com',
      address: 'Vijay Nagar, Indore',
      latitude: 22.7533,
      longitude: 75.8937,
      status: 'completed',
      visitPurpose: 'Quarterly Review',
      appointmentTime: '09:30 AM',
      orderValue: 25000,
      priority: 'high',
      notes: 'Discuss new product line',
    },
    {
      id: '2',
      name: 'Tech Solutions Ltd',
      phone: '+91 966 234567',
      email: 'sales@techsolutions.com',
      address: 'Palasia Square, Indore',
      latitude: 22.7198,
      longitude: 75.8577,
      status: 'current',
      visitPurpose: 'Product Demo',
      appointmentTime: '10:30 AM',
      orderValue: 15000,
      priority: 'high',
      notes: 'Bring demo units',
    },
    {
      id: '3',
      name: 'Global Retail Group',
      phone: '+91 977 345678',
      email: 'info@globalretail.com',
      address: 'Rajwada, Indore',
      latitude: 22.7177,
      longitude: 75.8545,
      status: 'pending',
      visitPurpose: 'Contract Negotiation',
      appointmentTime: '11:30 AM',
      orderValue: 50000,
      priority: 'high',
      notes: 'Finalize annual contract',
    },
    {
      id: '4',
      name: 'Innovation Labs',
      phone: '+91 988 456789',
      email: 'hello@innovationlabs.com',
      address: 'Bhawarkua, Indore',
      latitude: 22.6924,
      longitude: 75.8672,
      status: 'pending',
      visitPurpose: 'Technical Support',
      appointmentTime: '12:30 PM',
      orderValue: 5000,
      priority: 'medium',
      notes: 'Software update required',
    },
    {
      id: '5',
      name: 'Metro Enterprises',
      phone: '+91 955 567890',
      email: 'contact@metro.com',
      address: 'Scheme No. 54, Indore',
      latitude: 22.7443,
      longitude: 75.896,
      status: 'pending',
      visitPurpose: 'Initial Meeting',
      appointmentTime: '01:30 PM',
      orderValue: 10000,
      priority: 'medium',
      notes: 'New client acquisition',
    },
  ]);

  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set(['2']));
  const [currentLocation] = useState({
    latitude: 22.7443,
    longitude: 75.896,
  });
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [newClientAddress, setNewClientAddress] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState('clients');
  const [mapsLoaded, setMapsLoaded] = useState(Platform.OS === 'web');
  const [showEndRouteConfirm, setShowEndRouteConfirm] = useState(false);

  const mapRef = useRef<any>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const completedCount = outlets.filter((c) => c.status === 'completed').length;
  const progress = (completedCount / outlets.length) * 100;
  const totalOrderValue = outlets.reduce((sum, client) => sum + (client.orderValue || 0), 0);

  const clientsWithDistance = React.useMemo(() => {
    return outlets.map((c) => ({
      ...c,
      distance: getDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        c.latitude,
        c.longitude,
      ),
    }));
  }, [outlets, currentLocation]);

  // Load maps on mobile
  useEffect(() => {
    if (Platform.OS !== 'web' && !MapView && !mapsLoaded) {
      const loadMapsAsync = async () => {
        try {
          const Maps = await import('react-native-maps');
          MapView = Maps.default;
          Marker = Maps.Marker;
          Polyline = Maps.Polyline;
          PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
          setMapsLoaded(true);
        } catch (error) {
          console.log('Error loading maps:', error);
        }
      };
      loadMapsAsync();
    }
  }, [mapsLoaded]);

  const getRouteOutlets = async (pageNumber = 1, isRefresh = false) => {
    if (!activeRoute?.routeId) return;

    const payload: any = {
      routeId: activeRoute?.routeId,
      page: 1,
      limit: 50,
      filters: [],
      searchText: '',
    };

    const response: ApiResponse<any> = await outletService.getRouteOutlets(payload);

    if (response.statusCode === 200) {
      const newData = response.data || [];

      // setRouteOutlets((prev) => (isRefresh ? newData : [...prev, ...newData]));

      // setHasMore(newData.length === LIMIT);
      // setPage(pageNumber);
    }
  };

  const toggleExpand = (clientId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedClients(newExpanded);
  };

  // 📍 Distance helper (KM)
  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  const handleVisitAction = useCallback(
    (clientId: string, action: 'navigate' | 'complete') => {
      const client = outlets.find((c) => c.id === clientId);
      if (!client) return;

      if (action === 'navigate') {
        if (Platform.OS === 'web') {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${client.latitude},${client.longitude}`;
          window.open(url, '_blank');
        } else {
          setShowMapModal(true);
          setTimeout(() => {
            if (mapRef.current && mapRef.current.animateToRegion) {
              mapRef.current.animateToRegion({
                latitude: client.latitude,
                longitude: client.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
            }
          }, 100);
        }
      } else if (action === 'complete') {
        setOutlets((prev) =>
          prev.map((c) =>
            c.id === clientId
              ? { ...c, status: 'completed' }
              : c.id === String(parseInt(clientId) + 1)
                ? { ...c, status: 'current' }
                : c,
          ),
        );
        // setActiveRoute((prev) => ({
        //   ...prev,
        //   completedVisits: prev.completedVisits + 1,
        // }));
        const nextId = String(parseInt(clientId) + 1);
        setExpandedClients(new Set([nextId]));
        Alert.alert('Success', `Visit to ${client.name} marked as completed!`);
      }
    },
    [outlets],
  );

  const endRoute = () => {
    setShowEndRouteConfirm(false);
    Alert.alert(
      'Route Completed',
      `Great job! You have completed ${completedCount} out of ${outlets.length} visits.\nTotal Order Value: ${formatCurrency(totalOrderValue)}`,
      [{ text: 'OK', onPress: () => console.log('Route ended') }],
    );
  };

  // Web Map Component
  const WebMapComponent = ({ onMarkerClick }: { onMarkerClick?: (client: Client) => void }) => {
    const mapHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; overflow: hidden; }
          #map { height: 100vh; width: 100vw; }
          .custom-marker {
            width: 36px; height: 36px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-weight: bold; font-size: 14px; border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3); cursor: pointer;
          }
          .current-marker {
            background: #3B82F6; width: 16px; height: 16px;
            border-radius: 50%; border: 2px solid white;
            box-shadow: 0 0 0 3px rgba(59,130,246,0.3);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const centerLat = (${currentLocation.latitude} + ${outlets[outlets.length - 1].latitude}) / 2;
          const centerLng = (${currentLocation.longitude} + ${outlets[outlets.length - 1].longitude}) / 2;
          const map = L.map('map').setView([centerLat, centerLng], 12);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          
          L.marker([${currentLocation.latitude}, ${currentLocation.longitude}])
            .bindPopup('📍 Current Location').addTo(map);
          
          const clients = ${JSON.stringify(outlets)};
          clients.forEach((client, index) => {
            const color = client.status === 'completed' ? '#10B981' : 
                         client.status === 'current' ? '#8B5CF6' : '#F59E0B';
            const stopIcon = L.divIcon({
              html: '<div style="background: ' + color + '; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; border: 2px solid white;">' + (index + 1) + '</div>',
              iconSize: [36, 36]
            });
            const marker = L.marker([client.latitude, client.longitude], { icon: stopIcon })
              .bindPopup('<b>' + client.name + '</b><br/>' + client.address)
              .addTo(map);
            marker.on('click', () => {
              window.parent.postMessage(JSON.stringify({ type: 'markerClick', client: client }), '*');
            });
          });
          
          const routePoints = [
            [${currentLocation.latitude}, ${currentLocation.longitude}],
            ...clientsWithDistance.map(c => [c.latitude, c.longitude])
          ];
          L.polyline(routePoints, { color: '#8B5CF6', weight: 4 }).addTo(map);
          
          const bounds = L.latLngBounds(routePoints);
          map.fitBounds(bounds, { padding: [50, 50] });
        </script>
      </body>
      </html>
    `;

    React.useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'markerClick' && onMarkerClick) {
            onMarkerClick(data.client);
          }
        } catch (e) {}
      };
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, [onMarkerClick]);

    return (
      <iframe
        srcDoc={mapHTML}
        style={{ width: '100%', height: '100%', border: 0 }}
        title="Route Map"
      />
    );
  };

  // Native Map Component
  const NativeMapComponent = ({ onMarkerClick }: { onMarkerClick?: (client: Client) => void }) => {
    if (!MapView) {
      return (
        <View style={styles.fullScreenMap}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.fullScreenMapPlaceholder}
          >
            <Feather name="map" size={64} color={colors.surface} />
            <Text style={styles.fullScreenMapText}>Loading Map...</Text>
          </LinearGradient>
        </View>
      );
    }

    return (
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.fullScreenMap}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker coordinate={currentLocation}>
          <View style={styles.fullScreenCurrentMarker}>
            <View style={styles.fullScreenCurrentDot} />
          </View>
        </Marker>

        {clientsWithDistance.map((client: any, index: number) => (
          <Marker
            key={client.id}
            coordinate={{
              latitude: client.latitude,
              longitude: client.longitude,
            }}
            title={client.name}
            description={client.address}
            // onPress={() => onMarkerClick?.(client)}
          >
            <View
              style={[
                styles.fullScreenMarker,
                client.status === 'current' && styles.fullScreenMarkerCurrent,
                client.status === 'completed' && styles.fullScreenMarkerCompleted,
              ]}
            >
              <Text style={styles.fullScreenMarkerText}>{index + 1}</Text>
            </View>
          </Marker>
        ))}

        <Polyline
          coordinates={[
            currentLocation,
            ...clientsWithDistance.map((client: any) => ({
              latitude: client.latitude,
              longitude: client.longitude,
            })),
          ]}
          strokeColor={colors.primary}
          strokeWidth={5}
        />
      </MapView>
    );
  };

  const ExpandableClientCard = ({ client, index }: { client: Client; index: number }) => {
    const isExpanded = expandedClients.has(client.id);

    const getPriorityColor = () => {
      switch (client.priority) {
        case 'high':
          return colors.error;
        case 'medium':
          return colors.warning;
        default:
          return colors.info;
      }
    };

    return (
      <View
        style={[
          styles.expandableCard,
          client.status === 'current' && styles.expandableCardCurrent,
          client.status === 'completed' && styles.expandableCardCompleted,
        ]}
      >
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => toggleExpand(client.id)}
          activeOpacity={0.7}
        >
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.statusIndicator,
                client.status === 'completed' && styles.statusCompleted,
                client.status === 'current' && styles.statusCurrent,
              ]}
            >
              {client.status === 'completed' ? (
                <Ionicons name="checkmark" size={18} color={colors.surface} />
              ) : (
                <Text style={styles.statusNumber}>{index + 1}</Text>
              )}
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.customerName}>{client.name}</Text>
              <Text style={styles.stopAddress} numberOfLines={1}>
                {client.address}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                📍 {client.distance?.toFixed(2)} km away
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() + '20' }]}>
              <Text style={[styles.priorityText, { color: getPriorityColor() }]}>
                {client.priority.toUpperCase()}
              </Text>
            </View>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.primary}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.orderSummary}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <MaterialIcons name="attach-money" size={16} color={colors.primary} />
                  <Text style={styles.summaryLabel}>Order Value</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(client.orderValue || 0)}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Ionicons name="time-outline" size={16} color={colors.primary} />
                  <Text style={styles.summaryLabel}>Appointment</Text>
                  <Text style={styles.summaryValue}>{client.appointmentTime}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Ionicons name="call" size={16} color={colors.primary} />
                  <Text style={styles.summaryLabel}>Contact</Text>
                  <Text style={styles.summaryValue}>{client.phone}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <MaterialIcons name="work-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.infoText}>Purpose: {client.visitPurpose}</Text>
              </View>
              {client.notes && (
                <View style={styles.infoRow}>
                  <Ionicons name="document-text-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.infoText}>Notes: {client.notes}</Text>
                </View>
              )}
            </View>

            {client.status !== 'completed' && (
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => Alert.alert('Call', `Calling ${client.phone}`)}
                >
                  <Ionicons name="call-outline" size={18} color={colors.primary} />
                  <Text style={styles.callButtonText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.primaryActionButton,
                    client.status === 'current' && styles.primaryActionButtonCurrent,
                  ]}
                  onPress={() =>
                    handleVisitAction(
                      client.id,
                      client.status === 'current' ? 'complete' : 'navigate',
                    )
                  }
                >
                  <Text style={styles.primaryActionText}>
                    {client.status === 'current' ? 'Check-in' : 'Navigate'}
                  </Text>
                  <Ionicons
                    name={client.status === 'current' ? 'checkmark-circle' : 'map'}
                    size={18}
                    color={colors.surface}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const ClientDetailModal = () => (
    <Modal visible={!!selectedClient} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={() => setSelectedClient(null)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <ScrollView style={styles.detailModal} showsVerticalScrollIndicator={false}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.detailHeader}
              >
                <TouchableOpacity
                  style={styles.detailClose}
                  onPress={() => setSelectedClient(null)}
                >
                  <Ionicons name="close" size={24} color={colors.surface} />
                </TouchableOpacity>
                <View style={styles.detailAvatar}>
                  <FontAwesome5 name="building" size={32} color={colors.primary} />
                </View>
                <Text style={styles.detailName}>{selectedClient?.name}</Text>
                <Text style={styles.detailAddress}>{selectedClient?.address}</Text>
              </LinearGradient>

              <View style={styles.detailBody}>
                <View style={styles.detailInfoGrid}>
                  <View style={styles.detailInfoItem}>
                    <Ionicons name="call-outline" size={20} color={colors.primary} />
                    <Text style={styles.detailInfoLabel}>Phone</Text>
                    <Text style={styles.detailInfoValue}>{selectedClient?.phone}</Text>
                  </View>
                  <View style={styles.detailInfoItem}>
                    <MaterialIcons name="email" size={20} color={colors.primary} />
                    <Text style={styles.detailInfoLabel}>Email</Text>
                    <Text style={styles.detailInfoValue}>{selectedClient?.email}</Text>
                  </View>
                  <View style={styles.detailInfoItem}>
                    <MaterialIcons name="attach-money" size={20} color={colors.primary} />
                    <Text style={styles.detailInfoLabel}>Order Value</Text>
                    <Text style={styles.detailInfoValue}>
                      {formatCurrency(selectedClient?.orderValue || 0)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.detailCallButton}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.detailCallGradient}
                  >
                    <Ionicons name="call" size={20} color={colors.surface} />
                    <Text style={styles.detailCallButtonText}>Call Client</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar barStyle="light-content" backgroundColor={colors.primary} /> */}

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
          {/* <View style={styles.routeInfoContainer}>
            <Text style={styles.routeName}>{activeRoute.routeName}</Text>
            <Text style={styles.routeDate}>{activeRoute.date}</Text>
          </View> */}

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Today's Progress</Text>
              <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressStats}>
              {completedCount} of {outlets.length} visits completed
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Feather name="clock" size={18} color={colors.surface} />
              </View>
              <Text style={styles.statValue}>{24}</Text>
              <Text style={styles.statLabel}>Est. Time</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Feather name="map-pin" size={18} color={colors.surface} />
              </View>
              {/* <Text style={styles.statValue}>{activeRoute}</Text> */}
              <Text style={styles.statValue}>{10}</Text>

              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <MaterialIcons name="attach-money" size={18} color={colors.surface} />
              </View>
              <Text style={styles.statValue}>{formatCurrency(totalOrderValue)}</Text>
              <Text style={styles.statLabel}>Pipeline</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Map Preview Card */}
        <TouchableOpacity
          style={styles.mapPreviewCard}
          onPress={() => setShowMapModal(true)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.mapPreviewGradient}
          >
            <View style={styles.mapPreviewContent}>
              <View style={styles.mapPreviewIcon}>
                <Feather name="map" size={24} color={colors.surface} />
              </View>
              <View style={styles.mapPreviewText}>
                <Text style={styles.mapPreviewTitle}>View Route Map</Text>
                <Text style={styles.mapPreviewSubtitle}>
                  {outlets.length} clients • {10} • Tap to expand
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.surface} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'clients' && styles.tabActive]}
            onPress={() => setActiveTab('clients')}
          >
            <Text style={[styles.tabText, activeTab === 'clients' && styles.tabTextActive]}>
              Client Visits ({outlets.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'summary' && styles.tabActive]}
            onPress={() => setActiveTab('summary')}
          >
            <Text style={[styles.tabText, activeTab === 'summary' && styles.tabTextActive]}>
              Route Summary
            </Text>
          </TouchableOpacity>
        </View>

        {/* Client List */}
        {activeTab === 'clients' ? (
          <>
            {clientsWithDistance.map((client: any, index: number) => (
              <ExpandableClientCard key={client.id} client={client} index={index} />
            ))}
            <View style={{ height: 30 }} />
          </>
        ) : (
          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <Feather name="check-circle" size={32} color={colors.success} />
              <Text style={styles.infoCardTitle}>Route Summary</Text>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total Distance:</Text>
                <Text style={styles.infoValue}>{10}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estimated Time:</Text>
                <Text style={styles.infoValue}>{24}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total Clients:</Text>
                <Text style={styles.infoValue}>{outlets.length}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Completed:</Text>
                <Text style={styles.infoValue}>{completedCount}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Remaining:</Text>
                <Text style={styles.infoValue}>{outlets.length - completedCount}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Pipeline Value:</Text>
                <Text style={styles.infoValue}>{formatCurrency(totalOrderValue)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.endRouteButton}
              onPress={() => setShowEndRouteConfirm(true)}
            >
              <LinearGradient
                colors={[colors.error, colors.errorDark]}
                style={styles.endRouteGradient}
              >
                <Ionicons name="flag" size={20} color={colors.surface} />
                <Text style={styles.endRouteButtonText}>End Route</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </Animated.ScrollView>

      {/* End Route Confirmation Modal */}
      <Modal visible={showEndRouteConfirm} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowEndRouteConfirm(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModal}>
              <View style={[styles.confirmIcon, { backgroundColor: colors.error + '20' }]}>
                <Ionicons name="flag-outline" size={48} color={colors.error} />
              </View>
              <Text style={styles.confirmTitle}>End Route?</Text>
              <Text style={styles.confirmText}>
                You have completed {completedCount} out of {outlets.length} visits.
                {'\n'}Total pipeline value: {formatCurrency(totalOrderValue)}
              </Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={styles.confirmCancel}
                  onPress={() => setShowEndRouteConfirm(false)}
                >
                  <Text style={styles.confirmCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmEnd} onPress={endRoute}>
                  <Text style={styles.confirmEndText}>End Route</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <AppModal
        visible={showMapModal}
        onClose={() => setShowMapModal(false)}
        size="full"
        animation="slide"
        showHeader={false}
        showBackdrop={false}
        closeOnBackdropPress={false}
        dismissible={true}
        scrollable={false}
        style={{ flex: 1 }}
        showCloseButton={false}
        contentStyle={{
          flex: 1,
          padding: 0,
          margin: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <View
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            position: 'relative',
          }}
        >
          {/* Custom close button */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: Platform.OS === 'ios' ? 50 : 40,
              left: 16,
              zIndex: 10,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: 20,
              padding: 8,
            }}
            onPress={() => setShowMapModal(false)}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {Platform.OS === 'web' ? (
            <WebMapComponent
              onMarkerClick={(client) => {
                setSelectedClient(client);
                setShowMapModal(false);
              }}
            />
          ) : (
            <NativeMapComponent
              onMarkerClick={(client) => {
                setSelectedClient(client);
                setShowMapModal(false);
              }}
            />
          )}
        </View>
      </AppModal>

      <ClientDetailModal />
    </SafeAreaView>
  );
}

// Styles using the theme format (all colors from theme)
const useStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    fullScreenContainer: {
      flex: 1,
      backgroundColor: 'black',
    } as ViewStyle,

    header: {
      paddingTop: utils.spacing[4],
      paddingBottom: utils.spacing[6],
      borderBottomLeftRadius: utils.borderRadius.xl,
      borderBottomRightRadius: utils.borderRadius.xl,
    } as ViewStyle,

    routeInfoContainer: {
      paddingHorizontal: utils.spacing[5],
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    routeName: {
      fontSize: utils.fontSize.xl,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.surface,
      marginBottom: utils.spacing[1],
    } as TextStyle,

    routeDate: {
      fontSize: utils.fontSize.sm,
      color: colors.surface + 'CC',
    } as TextStyle,

    progressContainer: {
      paddingHorizontal: utils.spacing[5],
      marginBottom: utils.spacing[6],
    } as ViewStyle,

    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    progressTitle: {
      fontSize: utils.fontSize.sm,
      color: colors.surface + 'CC',
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,

    progressPercent: {
      fontSize: utils.fontSize.xl,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.surface,
    } as TextStyle,

    progressBar: {
      height: 8,
      backgroundColor: colors.surface + '33',
      borderRadius: utils.borderRadius.full,
      overflow: 'hidden',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    progressFill: {
      height: '100%',
      backgroundColor: colors.warning,
      borderRadius: utils.borderRadius.full,
    } as ViewStyle,

    progressStats: {
      fontSize: utils.fontSize.xs,
      color: colors.surface + 'B3',
    } as TextStyle,

    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[5],
    } as ViewStyle,

    statItem: {
      alignItems: 'center',
      flex: 1,
    } as ViewStyle,

    statIcon: {
      width: 36,
      height: 36,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.surface + '33',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    statValue: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.surface,
      marginBottom: 2,
    } as TextStyle,

    statLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.surface + 'B3',
    } as TextStyle,

    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: colors.surface + '33',
    } as ViewStyle,

    mapPreviewCard: {
      marginHorizontal: utils.spacing[4],
      marginTop: -utils.spacing[4],
      marginBottom: utils.spacing[2],
      borderRadius: utils.borderRadius.lg,
      overflow: 'hidden',
      shadowColor: colors.textPrimary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    } as ViewStyle,

    mapPreviewGradient: {
      padding: utils.spacing[4],
    } as ViewStyle,

    mapPreviewContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[3],
    } as ViewStyle,

    mapPreviewIcon: {
      width: 48,
      height: 48,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.surface + '33',
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    mapPreviewText: {
      flex: 1,
    } as ViewStyle,

    mapPreviewTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.surface,
      marginBottom: 4,
    } as TextStyle,

    mapPreviewSubtitle: {
      fontSize: utils.fontSize.xs,
      color: colors.surface + 'CC',
    } as TextStyle,

    tabsContainer: {
      flexDirection: 'row',
      paddingHorizontal: utils.spacing[5],
      paddingTop: utils.spacing[5],
      backgroundColor: colors.surface,
      borderTopLeftRadius: utils.borderRadius.xl,
      borderTopRightRadius: utils.borderRadius.xl,
    } as ViewStyle,

    tab: {
      flex: 1,
      paddingVertical: utils.spacing[3],
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    } as ViewStyle,

    tabActive: {
      borderBottomColor: colors.primary,
    } as ViewStyle,

    tabText: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    tabTextActive: {
      color: colors.primary,
    } as TextStyle,

    expandableCard: {
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.lg,
      marginHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[4],
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.divider,
      shadowColor: colors.textPrimary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    } as ViewStyle,

    expandableCardCurrent: {
      borderWidth: 2,
      borderColor: colors.primary,
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    } as ViewStyle,

    expandableCardCompleted: {
      opacity: 0.75,
      backgroundColor: colors.primaryContrast,
    } as ViewStyle,

    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: utils.spacing[4],
    } as ViewStyle,

    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: utils.spacing[3],
    } as ViewStyle,

    statusIndicator: {
      width: 44,
      height: 44,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.divider,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    statusCompleted: {
      backgroundColor: colors.success,
    } as ViewStyle,

    statusCurrent: {
      backgroundColor: colors.primary,
      width: 48,
      height: 48,
      borderRadius: utils.borderRadius.full,
    } as ViewStyle,

    statusNumber: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.surface,
    } as TextStyle,

    headerInfo: {
      flex: 1,
    } as ViewStyle,

    customerName: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
      marginBottom: 4,
    } as TextStyle,

    stopAddress: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    headerRight: {
      alignItems: 'flex-end',
      gap: utils.spacing[2],
    } as ViewStyle,

    priorityBadge: {
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
      borderRadius: utils.borderRadius.sm,
      marginBottom: 4,
    } as ViewStyle,

    priorityText: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    expandedContent: {
      paddingHorizontal: utils.spacing[4],
      paddingBottom: utils.spacing[4],
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      backgroundColor: colors.primaryContrast,
    } as ViewStyle,

    orderSummary: {
      paddingVertical: utils.spacing[3],
    } as ViewStyle,

    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: utils.spacing[3],
    } as ViewStyle,

    summaryItem: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.surface,
      padding: utils.spacing[2],
      borderRadius: utils.borderRadius.md,
    } as ViewStyle,

    summaryLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    summaryValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
    } as TextStyle,

    infoSection: {
      marginTop: utils.spacing[2],
      paddingTop: utils.spacing[2],
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      gap: utils.spacing[1],
    } as ViewStyle,

    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
    } as ViewStyle,

    infoText: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      flex: 1,
    } as TextStyle,

    actionButtonsContainer: {
      marginTop: utils.spacing[4],
      flexDirection: 'row',
      gap: utils.spacing[2],
    } as ViewStyle,

    callButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: utils.spacing[1],
      paddingVertical: utils.spacing[3],
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    callButtonText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.primary,
    } as TextStyle,

    primaryActionButton: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: utils.spacing[1],
      paddingVertical: utils.spacing[3],
      backgroundColor: colors.divider,
      borderRadius: utils.borderRadius.md,
    } as ViewStyle,

    primaryActionButtonCurrent: {
      backgroundColor: colors.primary,
    } as ViewStyle,

    primaryActionText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.surface,
    } as TextStyle,

    infoContainer: {
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[6],
    } as ViewStyle,

    infoCard: {
      backgroundColor: colors.primaryContrast,
      padding: utils.spacing[6],
      borderRadius: utils.borderRadius.xl,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    infoCardTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
      marginTop: utils.spacing[4],
      marginBottom: utils.spacing[4],
    } as TextStyle,

    infoDivider: {
      width: 40,
      height: 2,
      backgroundColor: colors.divider,
      marginBottom: utils.spacing[5],
    } as ViewStyle,

    infoLabel: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
    } as TextStyle,

    infoValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
    } as TextStyle,

    endRouteButton: {
      marginTop: utils.spacing[6],
      borderRadius: utils.borderRadius.lg,
      overflow: 'hidden',
    } as ViewStyle,

    endRouteGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: utils.spacing[2],
      paddingVertical: utils.spacing[4],
    } as ViewStyle,

    endRouteButtonText: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.surface,
    } as TextStyle,

    confirmModal: {
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.xl,
      padding: utils.spacing[6],
      width: width * 0.85,
      alignItems: 'center',
    } as ViewStyle,

    confirmIcon: {
      width: 80,
      height: 80,
      borderRadius: utils.borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    confirmTitle: {
      fontSize: utils.fontSize.xl,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
      marginBottom: utils.spacing[2],
    } as TextStyle,

    confirmText: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: utils.spacing[6],
    } as TextStyle,

    confirmButtons: {
      flexDirection: 'row',
      gap: utils.spacing[3],
      width: '100%',
    } as ViewStyle,

    confirmCancel: {
      flex: 1,
      paddingVertical: utils.spacing[3],
      borderRadius: utils.borderRadius.md,
      backgroundColor: colors.divider,
      alignItems: 'center',
    } as ViewStyle,

    confirmCancelText: {
      fontSize: utils.fontSize.md,
      color: colors.textSecondary,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    confirmEnd: {
      flex: 1,
      paddingVertical: utils.spacing[3],
      borderRadius: utils.borderRadius.md,
      backgroundColor: colors.error,
      alignItems: 'center',
    } as ViewStyle,

    confirmEndText: {
      fontSize: utils.fontSize.md,
      color: colors.surface,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    fullScreenModalContainer: {
      flex: 1,
      backgroundColor: colors.surface,
    } as ViewStyle,

    fullScreenModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[5],
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingBottom: utils.spacing[4],
      backgroundColor: colors.primary,
    } as ViewStyle,

    fullScreenCloseButton: {
      width: 40,
      height: 40,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.surface + '33',
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    fullScreenModalTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.surface,
    } as TextStyle,

    fullScreenCenterButton: {
      width: 40,
      height: 40,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.surface + '33',
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    fullScreenMap: {
      flex: 1,
    } as ViewStyle,

    fullScreenMapPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    fullScreenMapText: {
      marginTop: utils.spacing[4],
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.surface,
    } as TextStyle,

    fullScreenMapSubtext: {
      marginTop: utils.spacing[2],
      fontSize: utils.fontSize.sm,
      color: colors.surface + 'CC',
    } as TextStyle,

    fullScreenCurrentMarker: {
      width: 24,
      height: 24,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.primary + '33',
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    fullScreenCurrentDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.surface,
    } as ViewStyle,

    fullScreenMarker: {
      width: 36,
      height: 36,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.primary,
      shadowColor: colors.textPrimary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    } as ViewStyle,

    fullScreenMarkerCurrent: {
      backgroundColor: colors.primary,
      borderColor: colors.surface,
      width: 44,
      height: 44,
    } as ViewStyle,

    fullScreenMarkerCompleted: {
      borderColor: colors.success,
      opacity: 0.7,
    } as ViewStyle,

    fullScreenMarkerText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.primary,
    } as TextStyle,

    fullScreenModalFooter: {
      padding: utils.spacing[5],
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    } as ViewStyle,

    fullScreenFooterText: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: utils.spacing[3],
    } as TextStyle,

    fullScreenFooterButton: {
      backgroundColor: colors.primary,
      paddingVertical: utils.spacing[3],
      borderRadius: utils.borderRadius.md,
      alignItems: 'center',
    } as ViewStyle,

    fullScreenFooterButtonText: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.surface,
    } as TextStyle,

    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.textPrimary + '80',
    } as ViewStyle,

    detailModal: {
      width: width * 0.9,
      maxHeight: height * 0.8,
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.xl,
      overflow: 'hidden',
    } as ViewStyle,

    detailHeader: {
      padding: utils.spacing[8],
      alignItems: 'center',
      position: 'relative',
    } as ViewStyle,

    detailClose: {
      position: 'absolute',
      top: 16,
      right: 16,
      width: 36,
      height: 36,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.surface + '33',
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    detailAvatar: {
      width: 80,
      height: 80,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    detailName: {
      fontSize: utils.fontSize.xl,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.surface,
      marginBottom: 4,
    } as TextStyle,

    detailAddress: {
      fontSize: utils.fontSize.sm,
      color: colors.surface + 'E6',
      textAlign: 'center',
    } as TextStyle,

    detailBody: {
      padding: utils.spacing[6],
    } as ViewStyle,

    detailInfoGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: utils.spacing[6],
      gap: utils.spacing[3],
    } as ViewStyle,

    detailInfoItem: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: colors.primaryContrast,
      padding: utils.spacing[4],
      borderRadius: utils.borderRadius.lg,
      gap: utils.spacing[2],
    } as ViewStyle,

    detailInfoLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    detailInfoValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
    } as TextStyle,

    detailCallButton: {
      borderRadius: utils.borderRadius.lg,
      overflow: 'hidden',
    } as ViewStyle,

    detailCallGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: utils.spacing[2],
      paddingVertical: utils.spacing[3],
    } as ViewStyle,

    detailCallButtonText: {
      fontSize: utils.fontSize.md,
      color: colors.surface,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
