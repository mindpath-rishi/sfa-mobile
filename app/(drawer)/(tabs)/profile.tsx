import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppCard } from '@/core/components/Card';

import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
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
  isLocationTrackingEnabled,
  saveLocationTrackingPreference,
  startSalesmanBackgroundLocation,
  stopSalesmanBackgroundLocation,
} from '@/shared/services/location.service';

const DEFAULT_PROFILE_DATA = {
  id: 'EMP001',
  name: 'Field User',
  email: 'Not available',
  phone: 'Not available',
  avatar: null,
  role: 'Sales Representative',
  territory: 'Not assigned',
  manager: 'Not assigned',
  employeeId: 'Not available',
  aadhar: 'XXXX-XXXX-1234',
  pan: 'ABCDE1234F',
  // bankDetails: {
  //   account: 'XXXXXX1234',
  //   ifsc: 'SBIN0001234',
  //   bank: 'State Bank of India',
  // },
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
  // documents: [
  //   { id: 1, name: 'Employment Contract', type: 'pdf', size: '2.5 MB', verified: true },
  //   { id: 2, name: 'Aadhar Card', type: 'pdf', size: '1.2 MB', verified: true },
  //   { id: 3, name: 'PAN Card', type: 'pdf', size: '0.8 MB', verified: true },
  //   { id: 4, name: 'Bank Proof', type: 'pdf', size: '1.5 MB', verified: false },
  // ],
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

  return typeof value === 'string' ? value : undefined;
};

const buildProfileData = (authUser: any) => {
  const employeeId = getProfileValue(authUser?.employeeId, authUser?.userId, authUser?.id);
  const routeOrTerritory = getProfileValue(
    authUser?.territory,
    authUser?.routeName,
    authUser?.route,
    authUser?.vanId ? `Van ${authUser.vanId}` : undefined,
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
    avatar:
      getProfileValue(authUser?.avatar, authUser?.profileImage, authUser?.profileImageUrl) || null,
    role: humanizeRole(getProfileValue(authUser?.role, authUser?.roleId, authUser?.designation)),
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

// Profile Header Component
const ProfileHeader = ({ user, onEditPress }: any) => {
  const { colors } = useTheme();
  const logout = useAuthStore((s) => s.logout);

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
        <TouchableOpacity onPress={onEditPress} style={{ position: 'relative', marginBottom: 16 }}>
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
            }}
          >
            {user.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={{ width: 94, height: 94, borderRadius: 47 }}
              />
            ) : (
              <Text style={{ fontSize: 40, color: colors.primary }}>{user.name.charAt(0)}</Text>
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
            <Ionicons name="camera" size={16} color="white" />
          </View>
        </TouchableOpacity>

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

// Stat Card Component
const StatCard = ({ icon, label, value, color }: any) => {
  const { colors } = useTheme();

  return (
    <AppCard variant="outlined" padding="sm" style={{ flex: 1 }}>
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: color + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '700' }}>{value}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 11, textAlign: 'center' }}>
          {label}
        </Text>
      </View>
    </AppCard>
  );
};

// Info Row Component
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

// Setting Row Component
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
        <TouchableOpacity onPress={onPress}>
          <Text style={{ color: colors.primary, fontSize: 14 }}>Change</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Document Item Component
const DocumentItem = ({ doc }: any) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          backgroundColor: doc.verified ? colors.success + '20' : colors.warning + '20',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}
      >
        <Ionicons
          name={doc.type === 'pdf' ? 'document-text' : 'image'}
          size={20}
          color={doc.verified ? colors.success : colors.warning}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '500' }}>
          {doc.name}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{doc.size}</Text>
      </View>
      {doc.verified ? (
        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
      ) : (
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 12,
            backgroundColor: colors.warning + '20',
          }}
        >
          <Text style={{ color: colors.warning, fontSize: 10 }}>Pending</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  const setThemeMode = useThemeStore((s) => s.setMode);
  const authUser = useAuthStore((s) => s.user);
  const activeWorkSessionId = useAuthStore((s) => s.workSessionId);
  const canConfigureOfflineMode = isSalesman(authUser) && authUser?.offlineAccessAllowed === true;
  const offlineEnabled = useOfflineStore((state) => state.offlineEnabled);
  const profileData = useMemo(() => buildProfileData(authUser), [authUser]);
  const [settings, setSettings] = useState(DEFAULT_PROFILE_DATA.settings);
  const userData = useMemo(
    () => ({
      ...profileData,
      settings,
    }),
    [profileData, settings],
  );
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'settings', 'docs'
  const logout = useAuthStore((s) => s.logout);
  const [notificationSyncing, setNotificationSyncing] = useState(false);

  useEffect(() => {
    setSettings((prev) => ({ ...prev, darkMode: isDark }));
  }, [isDark]);

  useEffect(() => {
    const ownerId = authUser?.userId || '';
    void isLocationTrackingEnabled(ownerId).then((enabled) =>
      setSettings((previous) => ({ ...previous, locationTracking: enabled })),
    );
  }, [authUser?.userId]);

  useEffect(() => {
    isPushNotificationsEnabledAsync()
      .then((enabled) => setSettings((prev) => ({ ...prev, notifications: enabled })))
      .catch((error) => console.warn('Failed to load push notification setting:', error));
  }, []);

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleCall = () => {
    if (userData.phone === DEFAULT_PROFILE_DATA.phone) return;
    Linking.openURL(`tel:${userData.phone}`);
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
          Alert.alert(
            'Push Notifications',
            'Permission was not granted or this device cannot receive push notifications.',
          );
          return;
        }

        const response = await authService.updatePushToken({ deviceId, fcmToken });

        if (!response.success) {
          throw new Error(response.message || 'Unable to enable push notifications');
        }

        Alert.alert('Push Notifications', 'Push notifications enabled.');
      } else {
        const response = await authService.updatePushToken({ deviceId, fcmToken: null });

        if (!response.success) {
          console.warn('Failed to clear push token:', response.message);
        }

        Alert.alert('Push Notifications', 'Push notifications disabled.');
      }
    } catch (error: any) {
      const shouldRollback = value;

      if (shouldRollback) {
        await setPushNotificationsEnabledAsync(previousValue);
        setSettings((prev) => ({ ...prev, notifications: previousValue }));
      }

      Alert.alert('Push Notifications', error?.message || 'Failed to update push notifications.');
    } finally {
      setNotificationSyncing(false);
    }
  };

  const handleMessage = () => {
    if (userData.phone === DEFAULT_PROFILE_DATA.phone) return;
    Linking.openURL(`sms:${userData.phone}`);
  };

  const handleEmail = () => {
    if (userData.email === DEFAULT_PROFILE_DATA.email) return;
    Linking.openURL(`mailto:${userData.email}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${userData.name}'s profile - ${userData.role} at our company`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)');
  };

  const handleComingSoon = (feature: string) => {
    Alert.alert('Coming soon', `${feature} will be available in a future update.`);
  };

  const handleOfflineModeToggle = async (enabled: boolean) => {
    const ownerId = authUser?.userId || '';
    if (enabled) {
      await saveOfflinePreference(ownerId, true);
      setSettings((previous) => ({ ...previous, offlineMode: true }));
      await syncService.sync();
      const syncState = useOfflineStore.getState();
      if (!syncState.lastSyncTime) {
        Alert.alert(
          'Offline setup incomplete',
          syncState.lastError ||
            'Offline data could not be prepared. Tap the sync banner to retry.',
        );
        return;
      }
      Alert.alert(
        'Offline enabled',
        syncState.lastError
          ? `Offline data is ready. ${syncState.lastError}`
          : 'Offline data is ready to use.',
      );
      return;
    }

    const offline = useOfflineStore.getState();
    if ((!offline.isConnected || !offline.isInternetReachable) && offline.pendingCount > 0) {
      Alert.alert(
        'Cannot disable offline',
        'Connect to the internet and synchronize pending work before disabling offline access.',
      );
      return;
    }

    if (offline.pendingCount > 0) {
      await syncService.sync();
      const afterSync = useOfflineStore.getState();
      if (afterSync.pendingCount > 0) {
        Alert.alert(
          'Cannot disable offline',
          afterSync.lastError ||
            `${afterSync.pendingCount} item(s) are still waiting to sync. Tap the sync banner to retry.`,
        );
        return;
      }
    }
    await saveOfflinePreference(ownerId, false);
    setSettings((previous) => ({ ...previous, offlineMode: false }));
  };

  const handleLocationTrackingToggle = async (enabled: boolean) => {
    const ownerId = authUser?.userId || '';
    await saveLocationTrackingPreference(ownerId, enabled);
    setSettings((previous) => ({ ...previous, locationTracking: enabled }));

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
        Alert.alert('Success', 'Document uploaded successfully');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderProfileTab = () => (
    <>
      {/* Personal Information */}
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

      {/* Bank Details */}
      {/* <AppCard variant="elevated" padding="md" style={{ marginHorizontal: 16, marginBottom: 16 }}>
        <Text
          style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}
        >
          Bank Details
        </Text>
        <InfoRow icon="card" label="Account Number" value={userData.bankDetails.account} />
        <InfoRow icon="code" label="IFSC Code" value={userData.bankDetails.ifsc} />
        <InfoRow icon="business" label="Bank Name" value={userData.bankDetails.bank} />
      </AppCard> */}

      {/* KYC Details */}
      {/* <AppCard variant="elevated" padding="md" style={{ marginHorizontal: 16, marginBottom: 30 }}>
        <Text
          style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}
        >
          KYC Details
        </Text>
        <InfoRow icon="id-card" label="Aadhar Number" value={userData.aadhar} />
        <InfoRow icon="document" label="PAN Number" value={userData.pan} />
      </AppCard> */}
    </>
  );

  const renderStatsTab = () => (
    <>
      {/* Performance Stats */}
      <AppCard variant="elevated" padding="md" style={{ margin: 16, marginTop: 0 }}>
        <Text
          style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}
        >
          Performance Overview
        </Text>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <StatCard
            icon="calendar"
            label="Total Visits"
            value={userData.stats.totalVisits}
            color="#4158D0"
          />
          <StatCard
            icon="cart"
            label="Total Orders"
            value={userData.stats.totalOrders}
            color="#C850C0"
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <StatCard
            icon="cash"
            label="Collections"
            value={userData.stats.totalCollections}
            color="#11998e"
          />
          <StatCard
            icon="trending-up"
            label="Avg Order"
            value={userData.stats.avgOrderValue}
            color="#F37335"
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <StatCard
            icon="star"
            label="CSAT"
            value={userData.stats.customerSatisfaction.toString()}
            color="#FF512F"
          />
          {/* <StatCard
            icon="gift"
            label="Incentives"
            value={userData.stats.incentivesEarned}
            color="#8E2DE2"
          /> */}
        </View>
      </AppCard>

      {/* Achievements */}
      <AppCard variant="elevated" padding="md" style={{ marginHorizontal: 16, marginBottom: 30 }}>
        <Text
          style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}
        >
          Achievements & Awards
        </Text>
        {userData.achievements.map((achievement: any) => (
          <View
            key={achievement.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.divider,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.warning + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Ionicons name={achievement.icon as any} size={20} color={colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '500' }}>
                {achievement.title}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{achievement.date}</Text>
            </View>
            <Ionicons name="ribbon" size={20} color={colors.warning} />
          </View>
        ))}
      </AppCard>
    </>
  );

  const renderSettingsTab = () => (
    <>
      {/* App Settings */}
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
        />
        <SettingRow icon="moon" label="Dark Mode" value={isDark} onPress={handleDarkModeToggle} />
        <SettingRow
          icon="finger-print"
          label="Biometric Login"
          value={userData.settings.biometricLogin}
          onPress={(val: boolean) => setSettings((prev) => ({ ...prev, biometricLogin: val }))}
        />
        {canConfigureOfflineMode && (
          <SettingRow
            icon="location"
            label="Location Tracking"
            value={userData.settings.locationTracking}
            onPress={handleLocationTrackingToggle}
          />
        )}
      </AppCard>

      {/* Offline mode is supported only for field salesmen. */}
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
            label="Offline Mode"
            value={offlineEnabled}
            onPress={handleOfflineModeToggle}
          />
          {offlineEnabled && (
            <View style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden' }}>
              <OfflineStatusBanner />
            </View>
          )}
        </AppCard>
      )}

      {/* Account Actions */}
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
            style={{ color: colors.error, fontSize: 14, textAlign: 'center', fontWeight: '600' }}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </AppCard>
    </>
  );

  const renderDocumentsTab = () => (
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
            My Documents
          </Text>
          <TouchableOpacity onPress={handleUploadDocument}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="cloud-upload" size={16} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 12, marginLeft: 4 }}>Upload</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* 
        {userData.documents.map((doc) => (
          <DocumentItem key={doc.id} doc={doc} />
        ))} */}
      </AppCard>

      {/* Recent Activity */}
      <AppCard variant="elevated" padding="md" style={{ marginHorizontal: 16, marginBottom: 30 }}>
        <Text
          style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}
        >
          Recent Activity
        </Text>
        {userData.recentActivity.map((activity: any) => (
          <View
            key={activity.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: colors.divider,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.info + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Ionicons name="time" size={16} color={colors.info} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 14 }}>{activity.action}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{activity.time}</Text>
            </View>
          </View>
        ))}
      </AppCard>
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* <Header
        title="Profile"
        showBack={false}
        showMenu
        rightIcon="share"
        secondRightIcon="call"
        onRightPress={handleShare}
        onSecondRightPress={handleCall}
        elevated
      /> */}

      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader user={userData} onEditPress={handleEditProfile} />

        {/* Tab Navigation */}
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
            // { key: 'docs', label: 'Documents', icon: 'document' },
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

        {/* Tab Content */}
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'settings' && renderSettingsTab()}
        {/* {activeTab === 'docs' && renderDocumentsTab()} */}
      </ScrollView>
    </View>
  );
}
