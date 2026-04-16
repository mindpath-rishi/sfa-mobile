// VanInventoryTopupDetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { useVanInventoryTopupDetailStyles } from '@/shared/styles/TopupDetail.styles';
import { vanService } from '@/shared/services/van.service';

interface TopupItem {
  _id: string;
  productId: string;
  productName: string;
  requestedCaseQty: number;
  requestedPieceQty: number;
  requestedQty: number;
  approvedCaseQty: number;
  approvedPieceQty: number;
  approvedQty: number;
  piecePrice: number;
  casePrice: number;
  pieceNetWeight: number;
  caseNetWeight: number;
  requestedWeight: number;
  requestedValue: number;
  approvedWeight: number;
  approvedValue: number;
  unitQtyInCase: number;
}

interface TopupDetail {
  _id: string;
  vanInventoryTopupId: string;
  vanId: string;
  vanName: string;
  employeeId: string;
  employeeName?: string;
  warehouseId: string;
  date: string;
  totalRequestedQty: number;
  totalRequestedWeight: number;
  totalRequestedValue: number;
  totalRequestedCases: number;
  totalRequestedPieces: number;
  totalApprovedCases: number;
  totalApprovedPieces: number;
  totalApprovedQty: number;
  totalApprovedWeight: number;
  totalApprovedValue: number;
  remark?: string;
  status: string;
  approvedByName?: string;
  approvedAt?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  items: TopupItem[];
}

export const VanInventoryTopupDetailPage: React.FC = () => {
  const styles = useVanInventoryTopupDetailStyles();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: string };

  const [detail, setDetail] = useState<TopupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products'>('overview');

  const formatCurrency = (value: number) => `K ${value.toLocaleString()}`;
  const formatWeight = (weight: number) => `${weight.toFixed(2)} kg`;
  const formatDate = (date: string) => format(new Date(date), 'dd MMM yyyy');
  const formatDateTime = (date: string) => format(new Date(date), 'dd MMM yyyy, hh:mm a');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#10B981';
      case 'SUBMITTED':
        return '#3B82F6';
      case 'REJECTED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const fetchDetail = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setIsLoading(true);

      const response = await vanService.fetchInventoryTopupRequest(id);

      if (response?.success && response?.data) {
        setDetail(response.data);
      } else {
        Alert.alert('Error', response?.message || 'Failed to load details');
      }
    } catch (error) {
      console.error('Error fetching topup detail:', error);
      Alert.alert('Error', 'Failed to load top-up details');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const renderProductItem = ({ item, index }: { item: TopupItem; index: number }) => {
    const cases = item.requestedCaseQty;
    const pieces = item.requestedPieceQty;
    const value = item.requestedValue;
    const weight = item.requestedWeight;

    return (
      <View style={[styles.productRow, { borderBottomColor: colors.divider }]}>
        <View style={styles.productLeft}>
          <View style={[styles.productIndex, { backgroundColor: colors.primary + '10' }]}>
            <AppText style={[styles.productIndexText, { color: colors.primary }]}>
              {index + 1}
            </AppText>
          </View>
        </View>
        <View style={styles.productCenter}>
          <AppText style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>
            {item.productName}
          </AppText>
          <View style={styles.productDetails}>
            {cases > 0 && (
              <View style={styles.productDetail}>
                <MaterialCommunityIcons name="cube-outline" size={12} color={colors.textTertiary} />
                <AppText style={[styles.productDetailText, { color: colors.textSecondary }]}>
                  {cases} cases
                </AppText>
              </View>
            )}
            {pieces > 0 && (
              <View style={styles.productDetail}>
                <MaterialCommunityIcons
                  name="layers-outline"
                  size={12}
                  color={colors.textTertiary}
                />
                <AppText style={[styles.productDetailText, { color: colors.textSecondary }]}>
                  {pieces} pcs
                </AppText>
              </View>
            )}
          </View>
        </View>
        <View style={styles.productRight}>
          <AppText style={[styles.productValue, { color: colors.warning }]}>
            {formatCurrency(value)}
          </AppText>
          <AppText style={[styles.productWeight, { color: colors.textTertiary }]}>
            {formatWeight(weight)}
          </AppText>
        </View>
      </View>
    );
  };

  const renderOverview = () => {
    if (!detail) return null;

    const totalCases = detail.totalRequestedCases;
    const totalPieces = detail.totalRequestedPieces;
    const totalQty = detail.totalRequestedQty;
    const totalWeight = detail.totalRequestedWeight;
    const totalValue = detail.totalRequestedValue;

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.overviewContent}
      >
        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Ionicons name="truck-outline" size={20} color={colors.primary} />
              <View>
                <AppText style={styles.infoLabel}>Van</AppText>
                <AppText style={styles.infoValue}>{detail.vanName}</AppText>
              </View>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="business-outline" size={20} color={colors.primary} />
              <View>
                <AppText style={styles.infoLabel}>Warehouse</AppText>
                <AppText style={styles.infoValue}>{detail.warehouseId}</AppText>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
              <View>
                <AppText style={styles.infoLabel}>Employee</AppText>
                <AppText style={styles.infoValue}>
                  {detail.employeeName || detail.employeeId}
                </AppText>
              </View>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <View>
                <AppText style={styles.infoLabel}>Request Date</AppText>
                <AppText style={styles.infoValue}>{formatDate(detail.date)}</AppText>
              </View>
            </View>
          </View>

          {/* <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <View>
                <AppText style={styles.infoLabel}>Created</AppText>
                <AppText style={styles.infoValue}>{formatDateTime(detail.createdAt)}</AppText>
              </View>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="refresh-outline" size={20} color={colors.primary} />
              <View>
                <AppText style={styles.infoLabel}>Updated</AppText>
                <AppText style={styles.infoValue}>{formatDateTime(detail.updatedAt)}</AppText>
              </View>
            </View>
          </View> */}
        </View>

        {/* Approved By Section */}
        {detail.status === 'APPROVED' && (
          <View style={styles.approvedSection}>
            <LinearGradient
              colors={['#10B98115', '#10B98105']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.approvedCard}
            >
              <View style={styles.approvedHeader}>
                <View style={[styles.approvedIcon, { backgroundColor: '#10B98115' }]}>
                  <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                </View>
                <AppText style={[styles.approvedTitle, { color: colors.textPrimary }]}>
                  Approval Details
                </AppText>
              </View>
              <View style={styles.approvedRow}>
                <View style={styles.approvedItem}>
                  <Ionicons name="person-circle-outline" size={16} color="#10B981" />
                  <View>
                    <AppText style={[styles.approvedLabel, { color: colors.textSecondary }]}>
                      Approved By
                    </AppText>
                    <AppText style={[styles.approvedValue, { color: '#10B981' }]}>
                      {detail.approvedByName || 'Rahul Sharma'}
                    </AppText>
                  </View>
                </View>
                <View style={styles.approvedItem}>
                  <Ionicons name="calendar-outline" size={16} color="#10B981" />
                  <View>
                    <AppText style={[styles.approvedLabel, { color: colors.textSecondary }]}>
                      Approved Date
                    </AppText>
                    <AppText style={[styles.approvedValue, { color: '#10B981' }]}>
                      {detail.approvedAt
                        ? formatDateTime(detail.approvedAt)
                        : formatDateTime(detail.updatedAt)}
                    </AppText>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <AppText style={styles.statsTitle}>Summary</AppText>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <AppText style={[styles.statValue, { color: colors.primary }]}>{totalQty}</AppText>
              <AppText style={styles.statLabel}>Total Items</AppText>
            </View>
            <View style={styles.statCard}>
              <AppText style={[styles.statValue, { color: colors.info }]}>{totalCases}</AppText>
              <AppText style={styles.statLabel}>Cases</AppText>
            </View>
            <View style={styles.statCard}>
              <AppText style={[styles.statValue, { color: colors.success }]}>{totalPieces}</AppText>
              <AppText style={styles.statLabel}>Pieces</AppText>
            </View>
            <View style={styles.statCard}>
              <AppText style={[styles.statValue, { color: colors.warning }]}>
                {formatCurrency(totalValue)}
              </AppText>
              <AppText style={styles.statLabel}>Value</AppText>
            </View>
            <View style={styles.statCard}>
              <AppText style={[styles.statValue, { color: colors.info }]}>
                {formatWeight(totalWeight)}
              </AppText>
              <AppText style={styles.statLabel}>Weight</AppText>
            </View>
          </View>
        </View>

        {/* Remark */}
        {detail.remark && (
          <View style={styles.remarkCard}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
            <AppText style={[styles.remarkText, { color: colors.textSecondary }]}>
              {detail.remark}
            </AppText>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderHeader = () => {
    if (!detail) return null;

    return (
      <View>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroHeader}
        >
          <View style={styles.heroTopRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.heroPlaceholder} />
          </View>

          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              <AppText style={styles.heroLabel}>Top-up Request</AppText>
              <AppText style={styles.heroSubtitle}>{detail.vanInventoryTopupId}</AppText>
            </View>
            <View
              style={[styles.heroStatus, { backgroundColor: getStatusColor(detail.status) + '20' }]}
            >
              <View style={[styles.heroStatusDot, { backgroundColor: '#FFF' }]} />
              <AppText style={styles.heroStatusText}>{detail.status}</AppText>
            </View>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={[styles.tabsContainer, { borderBottomColor: colors.divider }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
            onPress={() => setActiveTab('overview')}
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
            onPress={() => setActiveTab('products')}
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading details...
        </AppText>
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="document-text-outline" size={64} color={colors.textTertiary} />
        <AppText style={[styles.emptyText, { color: colors.textSecondary }]}>No data found</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={activeTab === 'products' ? detail.items : []}
        renderItem={renderProductItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchDetail(true)}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={
          activeTab === 'products' && detail.items.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={48} color={colors.textTertiary} />
              <AppText style={[styles.emptyText, { color: colors.textSecondary }]}>
                No items found
              </AppText>
            </View>
          ) : null
        }
      />
      {activeTab === 'overview' && renderOverview()}
    </View>
  );
};

export default VanInventoryTopupDetailPage;
