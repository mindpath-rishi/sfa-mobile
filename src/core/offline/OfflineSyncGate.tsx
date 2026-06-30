import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/core/components';
import { isSalesman } from '@/core/navigation/role.utils';
import { useAuthStore } from '@/core/store/auth.store';
import { useTheme } from '@/shared/hooks/useTheme';
import { syncService } from '@/sync';

import { useOfflineStore } from './offline.store';

const SYNC_SLIDES = [
  {
    icon: 'map-outline',
    title: 'Your routes, ready anywhere',
    message:
      'Assigned routes and outlets are being prepared for reliable field work without internet.',
  },
  {
    icon: 'cube-outline',
    title: 'Products and stock on hand',
    message: 'Product details, prices, and van inventory are being stored securely on this device.',
  },
  {
    icon: 'receipt-outline',
    title: 'Keep selling offline',
    message:
      'Sales, visits, payments, and activities can be captured even when the network disappears.',
  },
  {
    icon: 'sync-circle-outline',
    title: 'Automatic reconciliation',
    message: 'Offline work is queued safely and sent to the server after your connection returns.',
  },
] as const;

export function OfflineSyncGate() {
  const [slideIndex, setSlideIndex] = useState(0);
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const { isConnected, isInternetReachable, isSyncing, lastSyncTime, lastError } =
    useOfflineStore();

  const initialSyncRequired = isSalesman(user) && !lastSyncTime;

  useEffect(() => {
    if (!initialSyncRequired || !isSyncing) return;
    const timer = setInterval(
      () => setSlideIndex((current) => (current + 1) % SYNC_SLIDES.length),
      2800,
    );
    return () => clearInterval(timer);
  }, [initialSyncRequired, isSyncing]);

  if (!initialSyncRequired) return null;

  const offline = !isConnected || !isInternetReachable;
  const title = isSyncing
    ? 'Preparing offline data'
    : offline
      ? 'Internet required for setup'
      : lastError
        ? 'Offline setup needs attention'
        : 'Offline data setup required';
  const message = isSyncing
    ? 'Syncing your van, routes, outlets, products, stock, and current work data. Please keep the app open.'
    : offline
      ? 'Connect to the internet, then tap Sync now. The app will unlock after its first offline dataset is ready.'
      : lastError || 'Tap Sync now to prepare the app for offline use.';
  const slide = SYNC_SLIDES[slideIndex];

  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={() => undefined}>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.icon, { backgroundColor: colors.primary + '18' }]}>
          {isSyncing ? (
            <Ionicons name={slide.icon} size={46} color={colors.primary} />
          ) : (
            <Ionicons
              name={offline ? 'cloud-offline-outline' : 'cloud-download-outline'}
              size={44}
              color={colors.primary}
            />
          )}
        </View>

        <AppText style={[styles.title, { color: colors.textPrimary }]}>
          {isSyncing ? slide.title : title}
        </AppText>
        <AppText style={[styles.message, { color: colors.textSecondary }]}>
          {isSyncing ? slide.message : message}
        </AppText>

        {isSyncing && (
          <>
            <View style={styles.dots}>
              {SYNC_SLIDES.map((item, index) => (
                <View
                  key={item.title}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: index === slideIndex ? colors.primary : colors.border,
                    },
                  ]}
                />
              ))}
            </View>
            <View style={[styles.syncStatus, { backgroundColor: colors.primary + '12' }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <AppText style={[styles.syncStatusText, { color: colors.primary }]}>
                Preparing offline data…
              </AppText>
            </View>
          </>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sync offline data now"
          disabled={offline || isSyncing}
          onPress={() => void syncService.retryFailed()}
          style={[
            styles.button,
            { backgroundColor: colors.primary },
            (offline || isSyncing) && styles.buttonDisabled,
          ]}
        >
          <Ionicons name="sync" size={19} color="#FFFFFF" />
          <AppText style={styles.buttonText}>{isSyncing ? 'Syncing…' : 'Sync now'}</AppText>
        </Pressable>

        <AppText style={[styles.note, { color: colors.textSecondary }]}>
          App actions are temporarily disabled until setup completes.
        </AppText>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  icon: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 23, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  message: { fontSize: 15, lineHeight: 22, textAlign: 'center', maxWidth: 420 },
  dots: { flexDirection: 'row', gap: 7, marginTop: 22 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  syncStatus: {
    marginTop: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncStatusText: { fontSize: 13, fontWeight: '700' },
  button: {
    minWidth: 170,
    marginTop: 28,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  note: { marginTop: 16, fontSize: 12, textAlign: 'center' },
});
