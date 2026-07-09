import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/shared/hooks/useTheme';
import { useOfflineStore } from '@/core/offline/offline.store';

export const DeviceToServerSyncOverlay = () => {
  const { colors } = useTheme();

  const visible = useOfflineStore((state) => state.deviceServerUploadVisible);
  const message = useOfflineStore((state) => state.deviceServerUploadMessage);
  const pendingCount = useOfflineStore((state) => state.pendingCount);

  if (!visible) return null;

  return (
    <View
      pointerEvents="auto"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        elevation: 99999,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
      }}
    >
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: colors.primary + '18',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <Ionicons name="cloud-upload-outline" size={50} color={colors.primary} />
      </View>

      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 22,
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        Uploading Device Data
      </Text>

      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 14,
          textAlign: 'center',
          lineHeight: 21,
          marginBottom: 22,
        }}
      >
        {message || 'Please wait while offline data is uploaded from this device to the server.'}
      </Text>

      <View
        style={{
          width: '100%',
          borderRadius: 16,
          padding: 18,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.divider,
          marginBottom: 18,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <Ionicons name="phone-portrait-outline" size={22} color={colors.textSecondary} />

          <View
            style={{
              flex: 1,
              height: 2,
              backgroundColor: colors.divider,
              marginHorizontal: 12,
            }}
          />

          <Ionicons name="cloud-done-outline" size={24} color={colors.primary} />
        </View>

        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 14,
            fontWeight: '700',
            textAlign: 'center',
          }}
        >
          Device → Server
        </Text>

        <Text
          style={{
            color: pendingCount > 0 ? colors.warning : colors.success,
            fontSize: 12,
            textAlign: 'center',
            marginTop: 6,
            fontWeight: '600',
          }}
        >
          Pending items: {pendingCount}
        </Text>

        <ActivityIndicator color={colors.primary} size="small" style={{ marginTop: 14 }} />
      </View>

      <Text
        style={{
          color: colors.textTertiary,
          fontSize: 12,
          textAlign: 'center',
          lineHeight: 18,
        }}
      >
        Do not close the app or turn off internet during upload.
      </Text>
    </View>
  );
};
