// TopupDetailHeader.tsx

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/core/components';
import { HeaderProps } from '../types/topupDetail.types';
import { createTopupDetailStyles } from '../styles/topupDetail.styles';
import { getStatusBgColor, getStatusColor, getStatusLabel } from '../utils/topup.utils';
import { TopupStatusType } from '../constants/topup.constants';
import { formatCurrency } from '@/shared/utils/currenty.utils';

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
        <View style={styles.heroTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={24} color={colors.primaryContrast} />
          </TouchableOpacity>

          <View style={styles.heroTitleWrap}>
            <AppText style={styles.heroLabel}>TOP-UP REQUEST</AppText>
            <AppText style={styles.heroSubtitle} numberOfLines={1}>
              #{detail.vanInventoryTopupId?.slice(-10)}
            </AppText>
          </View>

          <View style={[styles.heroStatus, { backgroundColor: statusBgColor }]}>
            <View style={[styles.heroStatusDot, { backgroundColor: statusColor }]} />
            <AppText style={[styles.heroStatusText, { color: statusColor }]}>{statusLabel}</AppText>
          </View>
        </View>
        <View style={styles.heroSummary}>
          <View style={styles.heroSummaryMain}>
            <AppText style={styles.heroSummaryLabel}>Requested value</AppText>
            <AppText style={styles.heroAmount}>
              {formatCurrency(detail.totalRequestedValue || 0)}
            </AppText>
            <View style={styles.heroVanRow}>
              <MaterialCommunityIcons
                name="truck-outline"
                size={15}
                color="rgba(255,255,255,0.8)"
              />
              <AppText style={styles.heroVanText}>{detail.vanName || detail.vanId}</AppText>
            </View>
          </View>
          <View style={styles.heroQtyCard}>
            <AppText style={styles.heroQtyValue}>{detail.items.length}</AppText>
            <AppText style={styles.heroQtyLabel}>Products</AppText>
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
