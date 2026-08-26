import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { AppCard } from '@/core/components/Card';
import { api } from '@/core/network';
import { uploadFormData } from '@/core/network/upload';
import { useAuthStore } from '@/core/store/auth.store';
import { useThemeStore } from '@/core/store/theme.store';
import { authService } from '@/features/auth/services/auth.service';
import { getClientDeviceIdAsync } from '@/shared/services/device.service';
import {
  getPushNotificationTokenAsync,
  isPushNotificationsEnabledAsync,
  setPushNotificationsEnabledAsync,
} from '@/shared/services/push-notification.service';
import { isSalesman } from '@/core/navigation/role.utils';
import { saveOfflinePreference, useOfflineStore } from '@/core/offline/offline.store';
import { OfflineStatusBanner } from '@/core/offline/OfflineStatusBanner';
import { syncService } from '@/sync';
import {
  saveLocationTrackingPreference,
  startSalesmanBackgroundLocation,
  stopSalesmanBackgroundLocation,
  syncPendingLocationUploads,
} from '@/shared/services/location.service';
import { useTheme } from '@/shared/hooks/useTheme';
import { toast } from '@/core/utils';

const DEFAULT_PROFILE_DATA = {
  id: 'EMP001',
  name: 'Field User',
  email: 'Not available',
  phone: 'Not available',
  avatar: null as string | null,
  role: 'Sales Representative',
  territory: 'Not assigned',
  manager: 'Not assigned',
  employeeId: 'Not available',
  aadhar: 'XXXX-XXXX-1234',
  pan: 'ABCDE1234F',
  stats: {
    totalVisits: 1245,
    totalOrders: 892,
    totalCollections: 'K45,67,890',
    avgOrderValue: 'K5,123',
    customerSatisfaction: 4.8,
    incentivesEarned: 'K1,25,000',
    attendance: 98,
    targetAchievement: 87,
  },
  achievements: [
    { id: 1, title: 'Top Performer Q1 2024', date: 'Mar 2024', icon: 'trophy' },
    { id: 2, title: 'Best New Customer Acquisition', date: 'Feb 2024', icon: 'people' },
    { id: 3, title: '100% Collection Target', date: 'Jan 2024', icon: 'cash' },
    { id: 4, title: 'Employee of the Month', date: 'Dec 2023', icon: 'medal' },
  ],
  settings: {
    notifications: true,
    darkMode: false,
    biometricLogin: true,
    locationTracking: true,
    offlineMode: false,
  },
  recentActivity: [
    { id: 1, action: 'Updated profile picture', time: '2 hours ago' },
    { id: 2, action: 'Changed password', time: '1 day ago' },
    { id: 3, action: 'Updated bank details', time: '3 days ago' },
    { id: 4, action: 'Downloaded monthly report', time: '5 days ago' },
  ],
};

const humanizeRole = (value?: string) => {
  if (!value) return DEFAULT_PROFILE_DATA.role;

  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getProfileValue = (...values: unknown[]) => {
  const value = values.find((item) => typeof item === 'string' && item.trim().length > 0);
  return typeof value === 'string' ? value.trim() : undefined;
};

const normalizeMediaUrl = (value?: string | null) => {
  if (!value) return null;

  const url = value.trim();

  if (!url) return null;

  const isAlreadyValid =
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('file://') ||
    url.startsWith('content://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:');

  if (isAlreadyValid) {
    return encodeURI(url);
  }

  const baseUrl = (api as any)?.defaults?.baseURL;

  if (!baseUrl) {
    return encodeURI(url);
  }

  try {
    return encodeURI(new URL(url, baseUrl).toString());
  } catch {
    const cleanBase = String(baseUrl).replace(/\/+$/, '');
    const cleanPath = url.replace(/^\/+/, '');

    return encodeURI(`${cleanBase}/${cleanPath}`);
  }
};

const formatLastSyncTime = (value?: string | number | Date | null) => {
  if (!value) return 'Not synced yet';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not synced yet';
  }

  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const buildProfileData = (authUser: any) => {
  const employeeId = getProfileValue(authUser?.employeeId, authUser?.userId, authUser?.id);

  const routeOrTerritory = getProfileValue(
    authUser?.territory,
    authUser?.routeName,
    authUser?.route,
    authUser?.vanId ? `Van ${authUser.vanId}` : undefined,
  );

  const avatar = normalizeMediaUrl(
    getProfileValue(
      authUser?.avatar,
      authUser?.profileImage,
      authUser?.profileImageUrl,
      authUser?.mediaUrls?.profileImage,
      authUser?.media?.profileImage,
      authUser?.image,
    ) || null,
  );

  return {
    ...DEFAULT_PROFILE_DATA,
    id: employeeId || DEFAULT_PROFILE_DATA.id,
    name:
      getProfileValue(authUser?.name, authUser?.employeeName, authUser?.fullName) ||
      DEFAULT_PROFILE_DATA.name,
    email: getProfileValue(authUser?.email) || DEFAULT_PROFILE_DATA.email,
    phone:
      getProfileValue(authUser?.mobile, authUser?.phone, authUser?.phoneNumber) ||
      DEFAULT_PROFILE_DATA.phone,
    avatar,
    role: humanizeRole(getProfileValue(authUser?.role, authUser?.roleId, authUser?.position)),
    territory: routeOrTerritory || DEFAULT_PROFILE_DATA.territory,
    manager:
      getProfileValue(
        authUser?.managerName,
        authUser?.manager,
        authUser?.reportingEmployeeName,
        authUser?.reportingManagerName,
      ) || DEFAULT_PROFILE_DATA.manager,
    employeeId: employeeId || DEFAULT_PROFILE_DATA.employeeId,
    stats: {
      ...DEFAULT_PROFILE_DATA.stats,
      ...(authUser?.stats || {}),
    },
    achievements: authUser?.achievements?.length
      ? authUser.achievements
      : DEFAULT_PROFILE_DATA.achievements,
    recentActivity: authUser?.recentActivity?.length
      ? authUser.recentActivity
      : DEFAULT_PROFILE_DATA.recentActivity,
  };
};

const ProfileHeader = ({
  user,
  onCameraPress,
  onGalleryPress,
  uploading,
}: {
  user: any;
  onCameraPress: () => void;
  onGalleryPress: () => void;
  uploading: boolean;
}) => {
  const { colors } = useTheme();

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark || colors.primary + 'CC']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        padding: 24,
        paddingTop: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
      }}
    >
      <View style={{ alignItems: 'center' }}>
        <View style={{ position: 'relative', marginBottom: 12, opacity: uploading ? 0.65 : 1 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: colors.surface,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 3,
              borderColor: 'white',
              overflow: 'hidden',
            }}
          >
            {user.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                resizeMode="cover"
                style={{ width: 94, height: 94, borderRadius: 47 }}
                onError={() => {
                  console.warn('Profile image failed to load:', user.avatar);
                }}
              />
            ) : (
              <Text style={{ fontSize: 40, color: colors.primary }}>
                {String(user.name || 'U').charAt(0)}
              </Text>
            )}
          </View>

          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: colors.success,
              width: 30,
              height: 30,
              borderRadius: 15,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: 'white',
            }}
          >
            <Ionicons name={uploading ? 'cloud-upload' : 'camera'} size={16} color="white" />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={onCameraPress}
            disabled={uploading}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.18)',
              opacity: uploading ? 0.6 : 1,
            }}
          >
            <Ionicons name="camera" size={14} color="white" />
            <Text style={{ color: 'white', fontSize: 12, marginLeft: 5 }}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onGalleryPress}
            disabled={uploading}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.18)',
              opacity: uploading ? 0.6 : 1,
            }}
          >
            <Ionicons name="image" size={14} color="white" />
            <Text style={{ color: 'white', fontSize: 12, marginLeft: 5 }}>Gallery</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: 'white', fontSize: 24, fontWeight: '700', marginBottom: 4 }}>
          {user.name}
        </Text>

        <Text style={{ color: 'white', fontSize: 14, opacity: 0.9, marginBottom: 4 }}>
          {user.role}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Ionicons name="location" size={14} color="white" />
          <Text style={{ color: 'white', fontSize: 12, opacity: 0.9, marginLeft: 4 }}>
            {user.territory}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const InfoRow = ({ icon, label, value, onPress }: any) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.divider,
        }}
      >
        <View style={{ width: 32, alignItems: 'center' }}>
          <Ionicons name={icon} size={20} color={colors.textSecondary} />
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{label}</Text>
          <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '500' }}>
            {value}
          </Text>
        </View>

        {onPress && <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />}
      </View>
    </TouchableOpacity>
  );
};

const SettingRow = ({ icon, label, value, type = 'toggle', onPress, disabled }: any) => {
  const { colors } = useTheme();

  const handleToggle = (nextValue: boolean) => {
    if (disabled) return;
    onPress?.(nextValue);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
      }}
    >
      <View style={{ width: 32, alignItems: 'center' }}>
        <Ionicons name={icon} size={20} color={colors.textSecondary} />
      </View>

      <Text style={{ flex: 1, marginLeft: 12, color: colors.textPrimary, fontSize: 14 }}>
        {label}
      </Text>

      {type === 'toggle' ? (
        <TouchableOpacity
          activeOpacity={0.8}
          accessibilityRole="switch"
          accessibilityState={{ checked: Boolean(value), disabled: Boolean(disabled) }}
          onPress={() => handleToggle(!value)}
          style={{
            width: 48,
            height: 28,
            borderRadius: 14,
            padding: 3,
            justifyContent: 'center',
            backgroundColor: value ? colors.primary : colors.borderLight || colors.border,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: colors.surface,
              alignSelf: value ? 'flex-end' : 'flex-start',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.18,
              shadowRadius: 2,
              elevation: 2,
            }}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onPress} disabled={disabled}>
          <Text style={{ color: disabled ? colors.textTertiary : colors.primary, fontSize: 14 }}>
            Change
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();

  const setThemeMode = useThemeStore((s) => s.setMode);

  const authUser = useAuthStore((s) => s.user);
  const activeWorkSessionId = useAuthStore((s) => s.workSessionId);
  const logout = useAuthStore((s) => s.logout);
  const updateAuthUser = useAuthStore((s) => s.updateUser);

  const offlineEnabled = useOfflineStore((state) => state.offlineEnabled);
  const offlineIsConnected = useOfflineStore((state) => state.isConnected);
  const offlineInternetReachable = useOfflineStore((state) => state.isInternetReachable);
  const offlineLastSyncTime = useOfflineStore((state) => state.lastSyncTime);
  const offlinePendingCount = useOfflineStore((state) => state.pendingCount);
  const offlineSetupInProgress = useOfflineStore((state) => state.offlineSetupInProgress);
  const deviceServerUploadVisible = useOfflineStore((state) => state.deviceServerUploadVisible);

  const canConfigureOfflineMode = isSalesman(authUser) && authUser?.offlineAccessAllowed === true;

  const automaticOfflineMode = Boolean(
    !offlineEnabled && offlineLastSyncTime && (!offlineIsConnected || !offlineInternetReachable),
  );

  const effectiveOfflineMode =
    offlineEnabled || automaticOfflineMode || offlineSetupInProgress || deviceServerUploadVisible;

  const offlineLastUpdatedLabel = useMemo(
    () => formatLastSyncTime(offlineLastSyncTime),
    [offlineLastSyncTime],
  );

  const profileData = useMemo(() => buildProfileData(authUser), [authUser]);

  const [settings, setSettings] = useState(DEFAULT_PROFILE_DATA.settings);
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationSyncing, setNotificationSyncing] = useState(false);
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const [offlineSyncing, setOfflineSyncing] = useState(false);

  const userData = useMemo(
    () => ({
      ...profileData,
      settings,
    }),
    [profileData, settings],
  );

  useEffect(() => {
    setSettings((prev) => ({ ...prev, darkMode: isDark }));
  }, [isDark]);

  useEffect(() => {
    isPushNotificationsEnabledAsync()
      .then((enabled) => setSettings((prev) => ({ ...prev, notifications: enabled })))
      .catch((error) => console.warn('Failed to load push notification setting:', error));
  }, []);

  useEffect(() => {
    setSettings((previous) => ({
      ...previous,
      offlineMode: effectiveOfflineMode,
    }));
  }, [effectiveOfflineMode]);

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const uploadProfileImage = async (uri: string) => {
    const employeeId = authUser?.employeeId || authUser?.userId;

    if (!employeeId || profileImageUploading) return;

    setProfileImageUploading(true);

    try {
      const cleanUri = uri.split('?')[0];
      const extension = cleanUri.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
      const fileName = `profile-${employeeId}-${Date.now()}.${extension}`;
      const formData = new FormData();

      if (Platform.OS === 'web') {
        const blob = await fetch(uri).then((response) => response.blob());
        formData.append('file', blob, fileName);
      } else {
        formData.append('file', {
          uri,
          name: fileName,
          type: mimeType,
        } as any);
      }

      formData.append('ownerType', 'EMPLOYEE');
      formData.append('ownerId', employeeId);
      formData.append('mediaType', 'IMAGE');
      formData.append('purpose', 'PROFILE');
      formData.append('title', 'Profile Image');
      formData.append('isPrimary', 'true');

      const mediaResponse = await uploadFormData<any>('/media/upload', formData);
      const media = mediaResponse?.data;

      if (!mediaResponse?.success || !media?.mediaId || !media?.url) {
        throw new Error(mediaResponse?.message || 'Profile image upload failed');
      }

      const normalizedImageUrl = normalizeMediaUrl(media.url);

      const employeeResponse = await api.patch<any>(`/employee/${employeeId}`, {
        profileImageMediaId: media.mediaId,
        profileImageUrl: media.url,
      });

      if (!employeeResponse?.success) {
        throw new Error(employeeResponse?.message || 'Could not update employee profile');
      }

      await updateAuthUser({
        avatar: normalizedImageUrl || media.url,
        profileImage: normalizedImageUrl || media.url,
        profileImageUrl: normalizedImageUrl || media.url,
        profileImageMediaId: media.mediaId,
      });

      toast.success('Profile updated', 'Your profile image was uploaded successfully.');
    } catch (error: any) {
      toast.error('Upload failed', error?.message || 'Unable to upload profile image.');
    } finally {
      setProfileImageUploading(false);
    }
  };

  const handleCameraPress = async () => {
    if (profileImageUploading) return;

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      toast.error('Permission required', 'Camera permission is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      await uploadProfileImage(result.assets[0].uri);
    }
  };

  const handleGalleryPress = async () => {
    if (profileImageUploading) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      await uploadProfileImage(result.assets[0].uri);
    }
  };

  const handleCall = () => {
    if (userData.phone === DEFAULT_PROFILE_DATA.phone) return;
    Linking.openURL(`tel:${userData.phone}`);
  };

  const handleEmail = () => {
    if (userData.email === DEFAULT_PROFILE_DATA.email) return;
    Linking.openURL(`mailto:${userData.email}`);
  };

  const handleDarkModeToggle = (value: boolean) => {
    setSettings((prev) => ({ ...prev, darkMode: value }));
    setThemeMode(value ? 'dark' : 'light');
  };

  const handlePushNotificationsToggle = async (value: boolean) => {
    if (notificationSyncing) return;

    const previousValue = userData.settings.notifications;

    setSettings((prev) => ({ ...prev, notifications: value }));
    setNotificationSyncing(true);

    try {
      await setPushNotificationsEnabledAsync(value);

      const deviceId = await getClientDeviceIdAsync();

      if (value) {
        const fcmToken = await getPushNotificationTokenAsync();

        if (!fcmToken) {
          await setPushNotificationsEnabledAsync(false);
          setSettings((prev) => ({ ...prev, notifications: false }));

          toast.error(
            'Push Notifications',
            'Permission was not granted or this device cannot receive push notifications.',
          );
          return;
        }

        const response = await authService.updatePushToken({ deviceId, fcmToken });

        if (!response.success) {
          throw new Error(response.message || 'Unable to enable push notifications');
        }

        toast.success('Push Notifications', 'Push notifications enabled.');
      } else {
        const response = await authService.updatePushToken({ deviceId, fcmToken: null });

        if (!response.success) {
          console.warn('Failed to clear push token:', response.message);
        }

        toast.success('Push Notifications', 'Push notifications disabled.');
      }
    } catch (error: any) {
      if (value) {
        await setPushNotificationsEnabledAsync(previousValue);
        setSettings((prev) => ({ ...prev, notifications: previousValue }));
      }

      toast.error('Push Notifications', error?.message || 'Failed to update push notifications.');
    } finally {
      setNotificationSyncing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)');
  };

  const handleComingSoon = (feature: string) => {
    toast.info('Coming soon', `${feature} will be available in a future update.`);
  };

  const handleOfflineModeToggle = async (enabled: boolean) => {
    const ownerId = authUser?.userId || '';

    if (offlineSyncing || offlineSetupInProgress || deviceServerUploadVisible) return;

    /**
     * =====================================================
     * ENABLE OFFLINE MODE
     * =====================================================
     */
    if (enabled) {
      const beforeSyncState = useOfflineStore.getState();

      if (!beforeSyncState.isConnected || !beforeSyncState.isInternetReachable) {
        toast.error(
          'Internet required',
          'Please connect to the internet. Offline Mode can be enabled only after data sync.',
        );
        return;
      }

      setOfflineSyncing(true);
      beforeSyncState.setOfflineSetupInProgress(true);

      try {
        toast.info('Sync started', 'Preparing offline data. Please wait...');

        await syncService.sync();

        const afterSyncState = useOfflineStore.getState();

        if (!afterSyncState.lastSyncTime) {
          await saveOfflinePreference(ownerId, false);

          setSettings((previous) => ({
            ...previous,
            offlineMode: false,
          }));

          toast.error(
            'Sync required',
            afterSyncState.lastError ||
              'Offline data sync was not completed. Offline Mode was not enabled.',
          );

          return;
        }

        await saveOfflinePreference(ownerId, true);

        setSettings((previous) => ({
          ...previous,
          offlineMode: true,
        }));

        toast.success(
          'Offline enabled',
          `Data synced successfully. Last updated: ${formatLastSyncTime(
            afterSyncState.lastSyncTime,
          )}`,
        );
      } catch (error: any) {
        await saveOfflinePreference(ownerId, false);

        setSettings((previous) => ({
          ...previous,
          offlineMode: false,
        }));

        toast.error(
          'Sync failed',
          error?.message || 'Unable to sync offline data. Offline Mode was not enabled.',
        );
      } finally {
        setOfflineSyncing(false);
        useOfflineStore.getState().setOfflineSetupInProgress(false);
      }

      return;
    }

    /**
     * =====================================================
     * DISABLE OFFLINE MODE
     * =====================================================
     *
     * New flow:
     * 1. Immediately disable Offline Mode
     * 2. Show Device → Server upload screen
     * 3. Upload pending offline data
     * 4. Upload pending location data
     * 5. If upload fails or pending data remains, enable Offline Mode again
     */
    const offlineBeforeDisable = useOfflineStore.getState();

    if (!offlineBeforeDisable.isConnected || !offlineBeforeDisable.isInternetReachable) {
      toast.error(
        'Internet required',
        'Please connect to the internet. Device data must be uploaded before disabling Offline Mode.',
      );
      return;
    }

    setOfflineSyncing(true);

    /**
     * Immediately disable offline mode first.
     * This prevents HTTP guard from blocking sync/upload APIs.
     */
    await saveOfflinePreference(ownerId, false);

    useOfflineStore.getState().setOfflineEnabled(false);

    setSettings((previous) => ({
      ...previous,
      offlineMode: false,
    }));

    try {
      toast.info(
        'Uploading device data',
        'Offline Mode is disabled. Uploading pending device data to server...',
      );

      /**
       * This method should show Device → Server screen using OfflineSyncGate.
       */
      await syncService.uploadDeviceDataBeforeDisableOffline();

      /**
       * Upload pending location data also.
       */
      await syncPendingLocationUploads();

      const remaining = await syncService.getPendingCount();

      if (remaining > 0) {
        throw new Error(`${remaining} item(s) are still pending. Offline Mode enabled again.`);
      }

      toast.success(
        'Offline disabled',
        'Device data uploaded successfully. Offline Mode is now disabled.',
      );
    } catch (error: any) {
      /**
       * Upload failed, so enable Offline Mode again.
       */
      await saveOfflinePreference(ownerId, true);

      useOfflineStore.getState().setOfflineEnabled(true);

      setSettings((previous) => ({
        ...previous,
        offlineMode: true,
      }));

      toast.error(
        'Upload failed',
        error?.message || 'Device data could not be uploaded. Offline Mode enabled again.',
      );
    } finally {
      setOfflineSyncing(false);
    }
  };

  const handleLocationTrackingToggle = async (enabled: boolean) => {
    const ownerId = authUser?.userId || '';

    await saveLocationTrackingPreference(ownerId, enabled);

    setSettings((previous) => ({
      ...previous,
      locationTracking: enabled,
    }));

    if (!isSalesman(authUser)) return;

    if (enabled && activeWorkSessionId) {
      await startSalesmanBackgroundLocation(authUser);
    } else {
      await stopSalesmanBackgroundLocation();
    }
  };

  const handleUploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
      });

      if (result.canceled === false) {
        toast.success('Success', 'Document uploaded successfully.');
      }
    } catch (error: any) {
      toast.error('Upload failed', error?.message || 'Unable to upload document.');
    }
  };

  const renderProfileTab = () => (
    <>
      <AppCard variant="elevated" padding="md" style={{ margin: 16, marginTop: 0 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
            Personal Information
          </Text>

          <TouchableOpacity onPress={handleEditProfile}>
            <Text style={{ color: colors.primary, fontSize: 12 }}>Edit</Text>
          </TouchableOpacity>
        </View>

        <InfoRow icon="person" label="Full Name" value={userData.name} />
        <InfoRow icon="mail" label="Email" value={userData.email} onPress={handleEmail} />
        <InfoRow icon="call" label="Phone" value={userData.phone} onPress={handleCall} />
        <InfoRow icon="business" label="Employee ID" value={userData.employeeId} />
        <InfoRow icon="people" label="Manager" value={userData.manager} />
      </AppCard>
    </>
  );

  const renderSettingsTab = () => (
    <>
      <AppCard variant="elevated" padding="md" style={{ margin: 16, marginTop: 0 }}>
        <Text
          style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}
        >
          App Settings
        </Text>

        <SettingRow
          icon="notifications"
          label="Push Notifications"
          value={userData.settings.notifications}
          onPress={handlePushNotificationsToggle}
          disabled={notificationSyncing}
        />

        <SettingRow icon="moon" label="Dark Mode" value={isDark} onPress={handleDarkModeToggle} />
      </AppCard>

      {canConfigureOfflineMode && (
        <AppCard
          variant="elevated"
          padding="md"
          style={{ marginHorizontal: 16, marginVertical: 16 }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 16,
            }}
          >
            Work Preferences
          </Text>

          <SettingRow
            icon="cloud-offline"
            label={
              offlineSyncing || offlineSetupInProgress || deviceServerUploadVisible
                ? deviceServerUploadVisible
                  ? 'Uploading Device Data...'
                  : 'Syncing Offline Data...'
                : 'Offline Mode'
            }
            value={effectiveOfflineMode}
            onPress={handleOfflineModeToggle}
            disabled={
              automaticOfflineMode ||
              offlineSyncing ||
              offlineSetupInProgress ||
              deviceServerUploadVisible
            }
          />

          <View style={{ marginTop: 10 }}>
            <Text
              style={{
                color: offlineLastSyncTime ? colors.textSecondary : colors.error,
                fontSize: 12,
                fontWeight: '500',
              }}
            >
              Last updated: {offlineLastUpdatedLabel}
            </Text>

            {!offlineLastSyncTime && (
              <Text
                style={{
                  color: colors.error,
                  fontSize: 11,
                  marginTop: 4,
                  lineHeight: 16,
                }}
              >
                Please sync data first. Offline Mode cannot be used without synced data.
              </Text>
            )}

            {offlinePendingCount > 0 && (
              <Text
                style={{
                  color: colors.warning,
                  fontSize: 11,
                  marginTop: 4,
                  lineHeight: 16,
                }}
              >
                Pending sync: {offlinePendingCount} item(s)
              </Text>
            )}

            {(offlineSyncing || offlineSetupInProgress || deviceServerUploadVisible) && (
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 11,
                  marginTop: 4,
                  lineHeight: 16,
                }}
              >
                {deviceServerUploadVisible
                  ? 'Uploading device data. Offline Mode will disable only after upload succeeds.'
                  : 'Sync is running. Offline Mode will change only after successful sync.'}
              </Text>
            )}
          </View>

          {offlineEnabled && (
            <View style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden' }}>
              <OfflineStatusBanner />
            </View>
          )}
        </AppCard>
      )}

      <AppCard variant="elevated" padding="md" style={{ marginHorizontal: 16, marginBottom: 30 }}>
        <Text
          style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}
        >
          Account
        </Text>

        <TouchableOpacity onPress={() => router.push('/change-password')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
            <Ionicons name="key" size={20} color={colors.textSecondary} />

            <Text style={{ flex: 1, marginLeft: 12, color: colors.textPrimary, fontSize: 14 }}>
              Change Password
            </Text>

            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleComingSoon('Privacy Policy')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
            <Ionicons name="shield" size={20} color={colors.textSecondary} />

            <Text style={{ flex: 1, marginLeft: 12, color: colors.textPrimary, fontSize: 14 }}>
              Privacy Policy
            </Text>

            <Text style={{ color: colors.textTertiary, fontSize: 11, fontWeight: '600' }}>
              Coming soon
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleComingSoon('Terms & Conditions')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
            <Ionicons name="document-text" size={20} color={colors.textSecondary} />

            <Text style={{ flex: 1, marginLeft: 12, color: colors.textPrimary, fontSize: 14 }}>
              Terms & Conditions
            </Text>

            <Text style={{ color: colors.textTertiary, fontSize: 11, fontWeight: '600' }}>
              Coming soon
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleComingSoon('Help Center')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
            <Ionicons name="help-circle" size={20} color={colors.textSecondary} />

            <Text style={{ flex: 1, marginLeft: 12, color: colors.textPrimary, fontSize: 14 }}>
              Help Center
            </Text>

            <Text style={{ color: colors.textTertiary, fontSize: 11, fontWeight: '600' }}>
              Coming soon
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={{ marginTop: 8 }}>
          <Text
            style={{
              color: colors.error,
              fontSize: 14,
              textAlign: 'center',
              fontWeight: '600',
            }}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </AppCard>
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader
          user={userData}
          onCameraPress={handleCameraPress}
          onGalleryPress={handleGalleryPress}
          uploading={profileImageUploading}
        />

        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.surface,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.divider,
          }}
        >
          {[
            { key: 'profile', label: 'Profile', icon: 'person' },
            { key: 'settings', label: 'Settings', icon: 'settings' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{ flex: 1, alignItems: 'center' }}
            >
              <Ionicons
                name={activeTab === tab.key ? (tab.icon as any) : (`${tab.icon}-outline` as any)}
                size={20}
                color={activeTab === tab.key ? colors.primary : colors.textTertiary}
              />

              <Text
                style={{
                  color: activeTab === tab.key ? colors.primary : colors.textTertiary,
                  fontSize: 11,
                  marginTop: 4,
                  fontWeight: activeTab === tab.key ? '500' : '400',
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </ScrollView>
    </View>
  );
}
