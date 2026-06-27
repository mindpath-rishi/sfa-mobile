// TopupDetailHeader.tsx

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/core/components';
import { HeaderProps } from '../types/topupDetail.types';
import { createTopupDetailStyles } from '../styles/topupDetail.styles';
import { getStatusBgColor, getStatusColor, getStatusLabel } from '../utils/topup.utils';
import { TopupStatusType } from '../constants/topup.constants';

export const TopupDetailHeader: React.FC<HeaderProps> = ({
  detail,
  colors,
  activeTab,
  onTabChange,
}) => {
  const styles = createTopupDetailStyles(colors);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Get status configuration
  const statusLabel = getStatusLabel(detail.status as TopupStatusType);
  const statusColor = getStatusColor(detail.status as TopupStatusType);
  const statusBgColor = getStatusBgColor(detail.status as TopupStatusType);

  return (
    <View>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroHeader, { paddingTop: insets.top + 16 }]}
      >
        {/* Single row with back button and content */}
        <View style={styles.heroContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={24} color={colors.primaryContrast} />
          </TouchableOpacity>

          <View>
            <AppText style={styles.heroLabel}>Top-up Request</AppText>
            <AppText style={styles.heroSubtitle}>{detail.vanInventoryTopupId}</AppText>
          </View>

          <View
            style={[
              styles.heroStatus, 
              { backgroundColor: statusBgColor }
            ]}
          >
            <View 
              style={[
                styles.heroStatusDot, 
                { backgroundColor: statusColor }
              ]} 
            />
            <AppText 
              style={[
                styles.heroStatusText, 
                { color: statusColor }
              ]}
            >
              {statusLabel}
            </AppText>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => onTabChange('overview')}
        >
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={activeTab === 'overview' ? colors.primary : colors.textSecondary}
          />
          <AppText
            style={[
              styles.tabText,
              { color: activeTab === 'overview' ? colors.primary : colors.textSecondary },
            ]}
          >
            Overview
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.tabActive]}
          onPress={() => onTabChange('products')}
        >
          <Ionicons
            name="cube-outline"
            size={18}
            color={activeTab === 'products' ? colors.primary : colors.textSecondary}
          />
          <AppText
            style={[
              styles.tabText,
              { color: activeTab === 'products' ? colors.primary : colors.textSecondary },
            ]}
          >
            Products ({detail.items.length})
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};
