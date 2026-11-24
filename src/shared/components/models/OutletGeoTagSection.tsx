// Geo tag capture for a new outlet: captures the current location and shows it on a map.
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { captureCurrentLocation } from '@/shared/services/location.service';

let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;
if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  } catch (error) {
    console.log('Error loading maps:', error);
  }
}

export type OutletGeoTag = { lat: number; lng: number; accuracy?: number };

interface Props {
  visible: boolean;
  value?: OutletGeoTag;
  error?: string;
  onChange: (value?: OutletGeoTag) => void;
}

export const OutletGeoTagSection: React.FC<Props> = ({ visible, value, error, onChange }) => {
  const { colors } = useTheme();
  const [capturing, setCapturing] = useState(false);
  const [failed, setFailed] = useState(false);

  const capture = useCallback(async () => {
    setCapturing(true);
    setFailed(false);
    try {
      const location = await captureCurrentLocation({ preferCached: false });
      if (location) {
        onChange({
          lat: location.latitude,
          lng: location.longitude,
          accuracy: location.accuracy ?? undefined,
        });
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    } finally {
      setCapturing(false);
    }
  }, [onChange]);

  // Capture automatically the first time the form opens.
  useEffect(() => {
    if (visible && !value && !capturing) void capture();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const openExternalMap = () => {
    if (!value) return;
    void Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${value.lat},${value.lng}`,
    );
  };

  const borderColor = error ? colors.error : colors.border;

  return (
    <View style={{ marginTop: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Ionicons name="navigate-circle" size={22} color={colors.primary} />
        <AppText style={{ marginLeft: 8, fontWeight: '600', color: colors.textPrimary, flex: 1 }}>
          Geo Tag <AppText style={{ color: colors.error }}>*</AppText>
        </AppText>
        <TouchableOpacity
          onPress={() => void capture()}
          disabled={capturing}
          style={{ flexDirection: 'row', alignItems: 'center', padding: 6 }}
        >
          {capturing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="refresh" size={16} color={colors.primary} />
          )}
          <AppText style={{ marginLeft: 4, color: colors.primary }}>
            {value ? 'Recapture' : 'Capture'}
          </AppText>
        </TouchableOpacity>
      </View>

      <View
        style={{
          height: 180,
          borderRadius: 12,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {value && MapView ? (
          <MapView
            key={`${value.lat},${value.lng}`}
            provider={PROVIDER_GOOGLE}
            style={{ width: '100%', height: '100%' }}
            initialRegion={{
              latitude: value.lat,
              longitude: value.lng,
              latitudeDelta: 0.004,
              longitudeDelta: 0.004,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            toolbarEnabled={false}
          >
            <Marker
              coordinate={{ latitude: value.lat, longitude: value.lng }}
              title="Outlet location"
              pinColor={colors.primary}
            />
          </MapView>
        ) : value ? (
          <TouchableOpacity onPress={openExternalMap} style={{ alignItems: 'center' }}>
            <Ionicons name="map-outline" size={32} color={colors.primary} />
            <AppText style={{ color: colors.primary, marginTop: 6 }}>View on map</AppText>
          </TouchableOpacity>
        ) : capturing ? (
          <>
            <ActivityIndicator color={colors.primary} />
            <AppText style={{ color: colors.textSecondary, marginTop: 8 }}>
              Getting current location…
            </AppText>
          </>
        ) : (
          <TouchableOpacity onPress={() => void capture()} style={{ alignItems: 'center' }}>
            <Ionicons name="location-outline" size={32} color={colors.textSecondary} />
            <AppText style={{ color: colors.textSecondary, marginTop: 6, textAlign: 'center' }}>
              {failed
                ? 'Could not get location. Turn on GPS and tap to retry.'
                : 'Tap to capture outlet location'}
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      {value && (
        <AppText style={{ color: colors.textSecondary, marginTop: 6, fontSize: 12 }}>
          {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
          {value.accuracy ? `  (±${Math.round(value.accuracy)} m)` : ''}
        </AppText>
      )}
      {error ? (
        <AppText style={{ color: colors.error, marginTop: 4, fontSize: 12 }}>{error}</AppText>
      ) : null}
    </View>
  );
};
