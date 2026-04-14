import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { Header } from '@/core/components/Header';
import { AppCard } from '@/core/components/Card';

import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

// Mock salesman data
const SALESMAN_DATA = {
  id: 'EMP001',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@company.com',
  phone: '+91 98765 43210',
  avatar: null,
  role: 'Senior Sales Representative',
  territory: 'Mumbai - Western Suburbs',
  manager: 'Amit Patel',
  joinDate: '15 Jan 2022',
  employeeId: 'SFA-2022-001',
  aadhar: 'XXXX-XXXX-1234',
  pan: 'ABCDE1234F',
  bankDetails: {
    account: 'XXXXXX1234',
    ifsc: 'SBIN0001234',
    bank: 'State Bank of India',
  },
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
  documents: [
    { id: 1, name: 'Employment Contract', type: 'pdf', size: '2.5 MB', verified: true },
    { id: 2, name: 'Aadhar Card', type: 'pdf', size: '1.2 MB', verified: true },
    { id: 3, name: 'PAN Card', type: 'pdf', size: '0.8 MB', verified: true },
    { id: 4, name: 'Bank Proof', type: 'pdf', size: '1.5 MB', verified: false },
  ],
  settings: {
    notifications: true,
    darkMode: false,
    biometricLogin: true,
    locationTracking: true,
    emailUpdates: true,
    smsAlerts: false,
    autoCheckIn: true,
    offlineMode: false,
  },
  recentActivity: [
    { id: 1, action: 'Updated profile picture', time: '2 hours ago' },
    { id: 2, action: 'Changed password', time: '1 day ago' },
    { id: 3, action: 'Updated bank details', time: '3 days ago' },
    { id: 4, action: 'Downloaded monthly report', time: '5 days ago' },
  ],
};

// Profile Header Component
const ProfileHeader = ({ user, onEditPress }: any) => {
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
        <View style={{ flexDirection: 'row', marginTop: 16, gap: 16 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
              {user.stats.attendance}%
            </Text>
            <Text style={{ color: 'white', fontSize: 11, opacity: 0.9 }}>Attendance</Text>
          </View>
          <View style={{ width: 1, height: 30, backgroundColor: 'white', opacity: 0.3 }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
              {user.stats.totalVisits}
            </Text>
            <Text style={{ color: 'white', fontSize: 11, opacity: 0.9 }}>Visits</Text>
          </View>
          <View style={{ width: 1, height: 30, backgroundColor: 'white', opacity: 0.3 }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
              {user.stats.targetAchievement}%
            </Text>
            <Text style={{ color: 'white', fontSize: 11, opacity: 0.9 }}>Target</Text>
          </View>
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
const SettingRow = ({ icon, label, value, type = 'toggle', onPress }: any) => {
  const { colors } = useTheme();
  const [enabled, setEnabled] = useState(value);

  const handleToggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    onPress?.(newValue);
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
        <Switch
          value={enabled}
          onValueChange={handleToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="white"
        />
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
  const [userData, setUserData] = useState(SALESMAN_DATA);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'stats', 'settings', 'docs'

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleCall = () => {
    Linking.openURL(`tel:${userData.phone}`);
  };

  const handleMessage = () => {
    Linking.openURL(`sms:${userData.phone}`);
  };

  const handleEmail = () => {
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

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => router.replace('/(auth)'),
        style: 'destructive',
      },
    ]);
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
        <InfoRow icon="calendar" label="Join Date" value={userData.joinDate} />
        <InfoRow icon="people" label="Manager" value={userData.manager} />
      </AppCard>

      {/* Bank Details */}
      <AppCard variant="elevated" padding="md" style={{ marginHorizontal: 16, marginBottom: 16 }}>
        <Text
          style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}
        >
          Bank Details
        </Text>
        <InfoRow icon="card" label="Account Number" value={userData.bankDetails.account} />
        <InfoRow icon="code" label="IFSC Code" value={userData.bankDetails.ifsc} />
        <InfoRow icon="business" label="Bank Name" value={userData.bankDetails.bank} />
      </AppCard>

      {/* KYC Details */}
      <AppCard variant="elevated" padding="md" style={{ marginHorizontal: 16, marginBottom: 30 }}>
        <Text
          style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}
        >
          KYC Details
        </Text>
        <InfoRow icon="id-card" label="Aadhar Number" value={userData.aadhar} />
        <InfoRow icon="document" label="PAN Number" value={userData.pan} />
      </AppCard>
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
          <StatCard
            icon="gift"
            label="Incentives"
            value={userData.stats.incentivesEarned}
            color="#8E2DE2"
          />
        </View>
      </AppCard>

      {/* Achievements */}
      <AppCard variant="elevated" padding="md" style={{ marginHorizontal: 16, marginBottom: 30 }}>
        <Text
          style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}
        >
          Achievements & Awards
        </Text>
        {userData.achievements.map((achievement) => (
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
          onPress={(val: boolean) =>
            setUserData({
              ...userData,
              settings: { ...userData.settings, notifications: val },
            })
          }
        />
        <SettingRow icon="moon" label="Dark Mode" value={isDark} />
        <SettingRow
          icon="finger-print"
          label="Biometric Login"
          value={userData.settings.biometricLogin}
          onPress={(val: boolean) =>
            setUserData({
              ...userData,
              settings: { ...userData.settings, biometricLogin: val },
            })
          }
        />
        <SettingRow
          icon="location"
          label="Location Tracking"
          value={userData.settings.locationTracking}
          onPress={(val: boolean) =>
            setUserData({
              ...userData,
              settings: { ...userData.settings, locationTracking: val },
            })
          }
        />
      </AppCard>

      {/* Communication Preferences */}
      <AppCard variant="elevated" padding="md" style={{ marginHorizontal: 16 }}>
        <Text
          style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}
        >
          Communication
        </Text>
        <SettingRow
          icon="mail"
          label="Email Updates"
          value={userData.settings.emailUpdates}
          onPress={(val: boolean) =>
            setUserData({
              ...userData,
              settings: { ...userData.settings, emailUpdates: val },
            })
          }
        />
        <SettingRow
          icon="chatbubbles"
          label="SMS Alerts"
          value={userData.settings.smsAlerts}
          onPress={(val: boolean) =>
            setUserData({
              ...userData,
              settings: { ...userData.settings, smsAlerts: val },
            })
          }
        />
      </AppCard>

      {/* Work Preferences */}
      <AppCard variant="elevated" padding="md" style={{ marginHorizontal: 16, marginVertical: 16 }}>
        <Text
          style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}
        >
          Work Preferences
        </Text>
        <SettingRow
          icon="log-in"
          label="Auto Check-in"
          value={userData.settings.autoCheckIn}
          onPress={(val: boolean) =>
            setUserData({
              ...userData,
              settings: { ...userData.settings, autoCheckIn: val },
            })
          }
        />
        <SettingRow
          icon="cloud-offline"
          label="Offline Mode"
          value={userData.settings.offlineMode}
          onPress={(val: boolean) =>
            setUserData({
              ...userData,
              settings: { ...userData.settings, offlineMode: val },
            })
          }
        />
      </AppCard>

      {/* Account Actions */}
      <AppCard variant="elevated" padding="md" style={{ marginHorizontal: 16, marginBottom: 30 }}>
        <Text
          style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}
        >
          Account
        </Text>
        <TouchableOpacity onPress={() => router.push('/profile/change-password')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
            <Ionicons name="key" size={20} color={colors.textSecondary} />
            <Text style={{ flex: 1, marginLeft: 12, color: colors.textPrimary, fontSize: 14 }}>
              Change Password
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/profile/privacy')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
            <Ionicons name="shield" size={20} color={colors.textSecondary} />
            <Text style={{ flex: 1, marginLeft: 12, color: colors.textPrimary, fontSize: 14 }}>
              Privacy Policy
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/profile/terms')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
            <Ionicons name="document-text" size={20} color={colors.textSecondary} />
            <Text style={{ flex: 1, marginLeft: 12, color: colors.textPrimary, fontSize: 14 }}>
              Terms & Conditions
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/profile/help')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
            <Ionicons name="help-circle" size={20} color={colors.textSecondary} />
            <Text style={{ flex: 1, marginLeft: 12, color: colors.textPrimary, fontSize: 14 }}>
              Help & Support
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
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

        {userData.documents.map((doc) => (
          <DocumentItem key={doc.id} doc={doc} />
        ))}
      </AppCard>

      {/* Recent Activity */}
      <AppCard variant="elevated" padding="md" style={{ marginHorizontal: 16, marginBottom: 30 }}>
        <Text
          style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}
        >
          Recent Activity
        </Text>
        {userData.recentActivity.map((activity) => (
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
            { key: 'stats', label: 'Stats', icon: 'stats-chart' },
            { key: 'settings', label: 'Settings', icon: 'settings' },
            { key: 'docs', label: 'Documents', icon: 'document' },
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
        {activeTab === 'stats' && renderStatsTab()}
        {activeTab === 'settings' && renderSettingsTab()}
        {activeTab === 'docs' && renderDocumentsTab()}
      </ScrollView>
    </View>
  );
}
