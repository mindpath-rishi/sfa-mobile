import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/core/components';
import { isSalesman } from '@/core/navigation/role.utils';
import { useAuthStore } from '@/core/store/auth.store';

import { useOfflineStore } from './offline.store';
import { syncService } from '@/sync';

export function OfflineStatusBanner() {
  const user = useAuthStore((state) => state.user);
  const {
    isConnected,
    isInternetReachable,
    pendingCount,
    isSyncing,
    lastSyncTime,
    lastError,
    offlineEnabled,
  } = useOfflineStore();

  if (!isSalesman(user) || user?.offlineAccessAllowed !== true || !offlineEnabled) {
    return null;
  }

  const offline = !isConnected || !isInternetReachable;
  const isFirstSync = isSyncing && !lastSyncTime;
  const label = offline
    ? `Offline${pendingCount ? ` • ${pendingCount} pending` : ''}`
    : isFirstSync
      ? 'Preparing offline data for first use…'
      : isSyncing
        ? pendingCount
          ? `Online • ${pendingCount} change${pendingCount === 1 ? '' : 's'} syncing in background`
          : 'Online'
        : lastError
          ? `Sync failed • Tap to retry: ${lastError}`
          : pendingCount
            ? `${pendingCount} item${pendingCount === 1 ? '' : 's'} waiting to sync`
            : `Online${lastSyncTime ? ` • Last sync ${new Date(lastSyncTime).toLocaleTimeString()}` : ''}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} Tap to sync now when available.`}
      disabled={offline || isSyncing}
      onPress={() => void syncService.retryFailed()}
      style={[
        styles.banner,
        offline
          ? styles.offline
          : isFirstSync
            ? styles.syncing
            : lastError
              ? styles.error
              : styles.online,
      ]}
    >
      <AppText style={styles.text}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: { paddingHorizontal: 12, paddingVertical: 5, alignItems: 'center' },
  offline: { backgroundColor: '#9A3412' },
  syncing: { backgroundColor: '#1D4ED8' },
  error: { backgroundColor: '#B91C1C' },
  online: { backgroundColor: '#047857' },
  text: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
});
