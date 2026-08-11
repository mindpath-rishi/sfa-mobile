import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
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
    funText: 'Mapping your day like a smart field assistant.',
  },
  {
    icon: 'cube-outline',
    title: 'Products and stock on hand',
    message: 'Product details, prices, and van inventory are being stored securely on this device.',
    funText: 'Packing your digital van with products and prices.',
  },
  {
    icon: 'receipt-outline',
    title: 'Keep selling offline',
    message:
      'Sales, visits, payments, and activities can be captured even when the network disappears.',
    funText: 'Preparing your order book for no-network zones.',
  },
  {
    icon: 'sync-circle-outline',
    title: 'Automatic reconciliation',
    message: 'Offline work is queued safely and sent to the server after your connection returns.',
    funText: 'Setting up auto-sync so your work catches up later.',
  },
] as const;

const UPLOAD_SLIDES = [
  {
    icon: 'phone-portrait-outline',
    title: 'Collecting device data',
    message: 'Offline visits, sales, payments, photos, and activities are being prepared.',
    funText: 'Checking everything saved on this device.',
  },
  {
    icon: 'cloud-upload-outline',
    title: 'Uploading to server',
    message: 'Pending offline work is being uploaded safely from this device to the server.',
    funText: 'Sending your field work back to the system.',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Verifying upload',
    message: 'The app is checking that all pending items are uploaded before going online.',
    funText: 'Making sure nothing is left behind.',
  },
  {
    icon: 'checkmark-done-circle-outline',
    title: 'Almost done',
    message: 'Offline Mode will be disabled only after device data is fully synced.',
    funText: 'Final check before switching back online.',
  },
] as const;

const SYNC_TIPS = [
  'You can keep working even when internet drops.',
  'Your offline work will sync automatically when internet returns.',
  'Keep the app open during first sync for best results.',
  'Routes, outlets, products, and stock are saved securely on this device.',
  'Offline Mode helps you avoid losing field activity in weak network areas.',
] as const;

const UPLOAD_TIPS = [
  'Please keep the app open until upload is completed.',
  'Do not turn off internet while device data is uploading.',
  'Offline Mode will stay enabled if any item fails to upload.',
  'Photos and offline transactions may take extra time to upload.',
  'The app will go online only after pending items are cleared.',
] as const;

const SLIDE_INTERVAL_MS = 2800;
const TIP_INTERVAL_MS = 4200;

export function OfflineSyncGate() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const autoSyncStartedRef = useRef(false);

  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);

  const {
    isConnected,
    isInternetReachable,
    isSyncing,
    lastSyncTime,
    lastError,
    offlineEnabled,
    offlineSetupInProgress,
    pendingCount,
    deviceServerUploadVisible,
    deviceServerUploadMessage,
  } = useOfflineStore();

  const isOfflineUser = isSalesman(user) && user?.offlineAccessAllowed === true;
  const offline = !isConnected || !isInternetReachable;

  /**
   * =====================================================
   * OFFLINE SETUP / DOWNLOAD CASES
   * =====================================================
   */

  /**
   * Case 1:
   * Offline Mode is already enabled, but first dataset is not ready.
   */
  const initialSyncRequired = isOfflineUser && offlineEnabled && !lastSyncTime;

  /**
   * Case 2:
   * User tapped Enable Offline Mode.
   * Do not check !lastSyncTime here, because user may already have old synced data.
   */
  const userEnabledOfflineSetup =
    isOfflineUser && offlineSetupInProgress && !deviceServerUploadVisible;

  /**
   * Case 3:
   * Fallback while sync is running during offline setup.
   */
  const initialSetupSyncing =
    isOfflineUser && isSyncing && offlineSetupInProgress && !deviceServerUploadVisible;

  const shouldShowOfflineSetupGate =
    initialSyncRequired || userEnabledOfflineSetup || initialSetupSyncing;

  /**
   * =====================================================
   * DEVICE → SERVER UPLOAD CASE
   * =====================================================
   *
   * This is shown when user disables Offline Mode.
   * Device data is uploaded first. Offline Mode should not turn off
   * until pendingCount becomes 0.
   */
  const shouldShowDeviceServerUploadGate = isOfflineUser && deviceServerUploadVisible;

  const shouldShowGate = shouldShowDeviceServerUploadGate || shouldShowOfflineSetupGate;

  const isUploadMode = shouldShowDeviceServerUploadGate;

  const activeSlides = isUploadMode ? UPLOAD_SLIDES : SYNC_SLIDES;
  const activeTips = isUploadMode ? UPLOAD_TIPS : SYNC_TIPS;

  const safeSlideIndex = slideIndex % activeSlides.length;
  const safeTipIndex = tipIndex % activeTips.length;

  const slide = activeSlides[safeSlideIndex];
  const tip = activeTips[safeTipIndex];

  const showSyncEntertainment = isUploadMode || isSyncing || offlineSetupInProgress;

  // --- animation values -----------------------------------------------
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!shouldShowGate) {
      setSlideIndex(0);
      setTipIndex(0);
    }
  }, [shouldShowGate]);

  useEffect(() => {
    setSlideIndex(0);
    setTipIndex(0);
  }, [isUploadMode]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (safeSlideIndex + 1) / activeSlides.length,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [safeSlideIndex, activeSlides.length, progressAnim]);

  useEffect(() => {
    if (!shouldShowGate || !showSyncEntertainment) return;

    const timer = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();

      setSlideIndex((current) => (current + 1) % activeSlides.length);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [shouldShowGate, showSyncEntertainment, fadeAnim, activeSlides.length]);

  useEffect(() => {
    if (!shouldShowGate || !showSyncEntertainment) return;

    const timer = setInterval(() => {
      setTipIndex((current) => (current + 1) % activeTips.length);
    }, TIP_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [shouldShowGate, showSyncEntertainment, activeTips.length]);

  /**
   * If Offline Mode was enabled earlier but first sync was not completed,
   * automatically start setup sync when internet is available.
   */
  useEffect(() => {
    if (!initialSyncRequired) return;
    if (offline || isSyncing || autoSyncStartedRef.current) return;
    if (deviceServerUploadVisible) return;

    autoSyncStartedRef.current = true;

    void syncService.sync().finally(() => {
      autoSyncStartedRef.current = false;
    });
  }, [initialSyncRequired, offline, isSyncing, deviceServerUploadVisible]);

  if (!shouldShowGate) return null;

  const title = isUploadMode
    ? slide.title
    : showSyncEntertainment
      ? slide.title
      : offline
        ? 'Internet required for setup'
        : lastError
          ? 'Offline setup needs attention'
          : 'Offline data setup required';

  const message = isUploadMode
    ? deviceServerUploadMessage || slide.message
    : showSyncEntertainment
      ? slide.message
      : offline
        ? 'Connect to the internet, then tap Sync now. The app will unlock after its first offline dataset is ready.'
        : lastError || 'Tap Sync now to prepare the app for offline use.';

  const handleSyncNow = () => {
    if (offline || isSyncing || offlineSetupInProgress || deviceServerUploadVisible) return;

    void syncService.retryFailed();
  };

  const buttonDisabled =
    offline || isSyncing || offlineSetupInProgress || deviceServerUploadVisible;

  const statusText = isUploadMode
    ? 'Uploading device data — please keep the app open'
    : 'Syncing data — please keep the app open';

  const footerText = isUploadMode
    ? 'App actions are temporarily disabled until device data upload completes.'
    : 'App actions are temporarily disabled until offline setup completes.';

  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={() => undefined}>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.topAccent, { backgroundColor: colors.primary }]} />

        <View style={styles.content}>
          <View
            style={[
              styles.iconOuter,
              { backgroundColor: colors.primary + '12', borderColor: colors.primary + '22' },
            ]}
          >
            <View style={[styles.iconInner, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons
                name={
                  showSyncEntertainment
                    ? slide.icon
                    : offline
                      ? 'cloud-offline-outline'
                      : 'cloud-download-outline'
                }
                size={46}
                color={colors.primary}
              />
            </View>
          </View>

          <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>
            <AppText style={[styles.title, { color: colors.textPrimary }]}>{title}</AppText>

            <AppText style={[styles.message, { color: colors.textSecondary }]}>{message}</AppText>
          </Animated.View>

          {showSyncEntertainment && (
            <>
              <View style={styles.progressRow}>
                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: colors.primary,
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>

                <AppText style={[styles.progressLabel, { color: colors.textSecondary }]}>
                  {safeSlideIndex + 1} / {activeSlides.length}
                </AppText>
              </View>

              {isUploadMode && (
                <View
                  style={[
                    styles.deviceServerCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.deviceServerRow}>
                    <Ionicons
                      name="phone-portrait-outline"
                      size={22}
                      color={colors.textSecondary}
                    />

                    <View
                      style={[
                        styles.deviceServerLine,
                        {
                          backgroundColor: colors.border,
                        },
                      ]}
                    />

                    <Ionicons name="cloud-done-outline" size={24} color={colors.primary} />
                  </View>

                  <AppText style={[styles.deviceServerTitle, { color: colors.textPrimary }]}>
                    Device → Server
                  </AppText>

                  <AppText
                    style={[
                      styles.pendingText,
                      {
                        color: pendingCount > 0 ? colors.warning : colors.success,
                      },
                    ]}
                  >
                    Pending items: {pendingCount}
                  </AppText>
                </View>
              )}

              <View
                style={[
                  styles.card,
                  { backgroundColor: colors.primary + '0D', borderColor: colors.primary + '1E' },
                ]}
              >
                <View style={[styles.cardIconBadge, { backgroundColor: colors.primary + '1A' }]}>
                  <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
                </View>

                <AppText style={[styles.cardText, { color: colors.primary }]}>
                  {slide.funText}
                </AppText>
              </View>

              <View style={[styles.card, styles.cardOutlined, { borderColor: colors.border }]}>
                <View
                  style={[styles.cardIconBadge, { backgroundColor: colors.textSecondary + '14' }]}
                >
                  <Ionicons name="bulb-outline" size={16} color={colors.textSecondary} />
                </View>

                <AppText style={[styles.cardText, { color: colors.textSecondary }]}>{tip}</AppText>
              </View>

              <View style={[styles.statusPill, { backgroundColor: colors.primary + '14' }]}>
                <ActivityIndicator size="small" color={colors.primary} />

                <AppText style={[styles.statusPillText, { color: colors.primary }]}>
                  {statusText}
                </AppText>
              </View>
            </>
          )}

          {!showSyncEntertainment && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sync offline data now"
              disabled={buttonDisabled}
              onPress={handleSyncNow}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: colors.primary },
                buttonDisabled && styles.buttonDisabled,
                pressed && !buttonDisabled && styles.buttonPressed,
              ]}
            >
              <Ionicons name="sync" size={18} color="#FFFFFF" />
              <AppText style={styles.buttonText}>{lastError ? 'Retry sync' : 'Sync now'}</AppText>
            </Pressable>
          )}
        </View>

        <View style={styles.footer}>
          <View style={[styles.footerDivider, { backgroundColor: colors.border }]} />
          <Ionicons name="lock-closed-outline" size={13} color={colors.textSecondary} />

          <AppText style={[styles.note, { color: colors.textSecondary }]}>{footerText}</AppText>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 0,
    paddingBottom: 36,
  },
  topAccent: {
    height: 4,
    width: 56,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 64,
    marginBottom: 8,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  iconOuter: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
    borderWidth: 1,
  },
  iconInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.1,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 400,
  },
  progressRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 28,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    minWidth: 34,
    textAlign: 'right',
  },
  deviceServerCard: {
    width: '100%',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  deviceServerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceServerLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 12,
  },
  deviceServerTitle: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  pendingText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '700',
  },
  card: {
    width: '100%',
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  cardOutlined: {
    backgroundColor: 'transparent',
  },
  cardIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '600',
  },
  statusPill: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  button: {
    minWidth: 180,
    marginTop: 32,
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  footerDivider: {
    position: 'absolute',
    top: -16,
    left: '20%',
    right: '20%',
    height: 1,
  },
  note: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
});
