// StockCountListingPage.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { stockCountService } from '@/shared/services/stock-count.service';
import { useRouteStore } from '@/core/store/route.store';
import { useStockCountStyles } from '@/shared/styles/StockCount.styles';

interface StockCountItem {
  stockCountId: string;
  workSessionId: string;
  vanId: string;
  vanName?: string;
  employeeId: string;
  employeeName?: string;
  date: string;
  systemQty: number;
  systemCase: number;
  systemPiece: number;
  systemWeight: number;
  systemValue: number;
  countedQty: number;
  countedCase: number;
  countedPiece: number;
  countedWeight: number;
  countedValue: number;
  varianceQty: number;
  varianceCase: number;
  variancePiece: number;
  varianceWeight: number;
  varianceValue: number;
  remark?: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdById?: string;
  createdByName?: string;
  updatedById?: string;
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: string;
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface StockCountDetailItem {
  productId: string;
  productName: string;
  unitQtyInCase: number;
  systemQty: number;
  systemCases: number;
  systemPieces: number;
  countedQty: number;
  countedCases: number;
  countedPieces: number;
  varianceQty: number;
  varianceCases: number;
  variancePieces: number;
  systemValue: number;
  countedValue: number;
  varianceValue: number;
}

export const StockCountListingPage: React.FC = () => {
  const styles = useStockCountStyles();
  const { colors } = useTheme();

  const [stockCounts, setStockCounts] = useState<StockCountItem[]>([]);
  const [displayedItems, setDisplayedItems] = useState<StockCountItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedStockCount, setSelectedStockCount] = useState<StockCountItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailItems, setDetailItems] = useState<StockCountDetailItem[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailActiveTab, setDetailActiveTab] = useState<'overview' | 'products'>('overview');

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 15;
  const van = useRouteStore.getState().van;

  const flatListRef = useRef<FlatList>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  const formatCurrency = (value: number) => `K ${value.toLocaleString()}`;
  const formatWeight = (weight: number) => `${weight.toFixed(1)} kg`;
  const formatDate = (date: string) => format(new Date(date), 'dd MMM yyyy');
  const formatDateTime = (date: string) => format(new Date(date), 'dd MMM, hh:mm a');

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { color: '#10B981', bg: '#10B98110', label: 'Approved' };
      case 'SUBMITTED':
        return { color: '#3B82F6', bg: '#3B82F610', label: 'Submitted' };
      case 'IN_PROGRESS':
        return { color: '#F59E0B', bg: '#F59E0B10', label: 'In Progress' };
      case 'REJECTED':
        return { color: '#EF4444', bg: '#EF444410', label: 'Rejected' };
      default:
        return { color: '#6B7280', bg: '#6B728010', label: 'Draft' };
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return '#10B981';
    if (variance < 0) return '#EF4444';
    return '#6B7280';
  };

  const fetchStockCounts = useCallback(
    async (
      page: number = 1,
      isRefresh: boolean = false,
      searchText: string = debouncedSearchQuery,
    ) => {
      try {
        if (isRefresh) setRefreshing(true);
        else if (page === 1) setIsLoading(true);
        else setIsLoadingMore(true);

        const params: any = { page, limit: itemsPerPage };
        if (searchText) params.searchText = searchText;

        const response = await stockCountService.fetchStockCounts(params);
        const apiData = response?.data;
        const list = apiData?.data || apiData?.items || apiData || [];
        const total = apiData?.meta?.total || apiData?.total || list.length;

        if (page === 1) {
          setStockCounts(list);
          setDisplayedItems(list);
          setTotalItems(total);
          setHasMore(list.length === itemsPerPage && total > list.length);
        } else {
          setStockCounts((prev) => [...prev, ...list]);
          setDisplayedItems((prev) => [...prev, ...list]);
          setHasMore(list.length === itemsPerPage);
        }
        setCurrentPage(page);
      } catch (error) {
        console.log('Error fetching stock counts:', error);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [debouncedSearchQuery, itemsPerPage],
  );

  const handleSearchInput = useCallback(
    (text: string) => {
      setSearchQuery(text);
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(() => {
        setDebouncedSearchQuery(text);
        fetchStockCounts(1, false, text);
      }, 500);
    },
    [fetchStockCounts],
  );

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStockCounts(1, false);
    }, []),
  );

  const onRefresh = () => fetchStockCounts(1, true);
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !isLoading) fetchStockCounts(currentPage + 1, false);
  };
  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    fetchStockCounts(1, false, '');
  };

  const handleViewDetails = async (item: StockCountItem) => {
    setSelectedStockCount(item);
    setDetailActiveTab('overview');
    setDetailModalVisible(true);
    try {
      setIsLoadingDetail(true);
      const response = await stockCountService.fetchStockCountItems(item.stockCountId);
      const items = response?.data?.items || response?.data || [];
      setDetailItems(items);
    } catch (error) {
      console.log('Error fetching details:', error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Improved List Item - Shows Van Number and Employee Name
  const renderStockCountItem = ({ item, index }: { item: StockCountItem; index: number }) => {
    const statusConfig = getStatusConfig(item.status);
    const varianceColor = getVarianceColor(item.varianceQty);
    const varianceIcon =
      item.varianceQty > 0 ? 'trending-up' : item.varianceQty < 0 ? 'trending-down' : 'minus';

    return (
      <TouchableOpacity
        style={[styles.countCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}
        activeOpacity={0.7}
        onPress={() => handleViewDetails(item)}
      >
        {/* Top Row - ID and Status */}
        <View style={styles.countCardTop}>
          <View style={styles.countIdContainer}>
            {/* <View style={[styles.countBadge, { backgroundColor: colors.primary + '10' }]}>
              <AppText style={[styles.countBadgeText, { color: colors.primary }]}>
                {index + 1}
              </AppText>
            </View> */}
            <AppText style={[styles.countId, { color: colors.textPrimary }]}>
              {item.stockCountId}
            </AppText>
          </View>
          <View style={[styles.countStatus, { backgroundColor: statusConfig.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
            <AppText style={[styles.countStatusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </AppText>
          </View>
        </View>

        {/* Van and Employee Info */}
        <View style={styles.countInfoRow}>
          <View style={styles.countInfoItem}>
            <Ionicons name="truck-outline" size={12} color={colors.textTertiary} />
            <AppText
              style={[styles.countInfoText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.vanName || item.vanId}
            </AppText>
          </View>
          <View style={styles.countInfoItem}>
            <Ionicons name="person-outline" size={12} color={colors.textTertiary} />
            <AppText
              style={[styles.countInfoText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.employeeName || item.employeeId}
            </AppText>
          </View>
        </View>

        {/* Middle Row - Key Metrics */}
        <View style={styles.countMetrics}>
          <View style={styles.countMetric}>
            <AppText style={[styles.countMetricValue, { color: colors.primary }]}>
              {item.systemCase + item.systemPiece}
            </AppText>
            <AppText style={[styles.countMetricLabel, { color: colors.textSecondary }]}>
              Van Items
            </AppText>
          </View>
          <View style={styles.countMetricArrow}>
            <Ionicons name="arrow-forward" size={14} color={colors.textTertiary} />
          </View>
          <View style={styles.countMetric}>
            <AppText style={[styles.countMetricValue, { color: colors.warning }]}>
              {item.countedQty}
            </AppText>
            <AppText style={[styles.countMetricLabel, { color: colors.textSecondary }]}>
              Counted Items
            </AppText>
          </View>
          <View style={styles.countMetricDivider} />
          <View style={styles.countMetric}>
            <View style={styles.varianceRow}>
              <MaterialCommunityIcons name={varianceIcon} size={12} color={varianceColor} />
              <AppText style={[styles.countMetricValue, { color: varianceColor, fontSize: 14 }]}>
                {Math.abs(item.varianceQty)}
              </AppText>
            </View>
            <AppText style={[styles.countMetricLabel, { color: colors.textSecondary }]}>
              Var items
            </AppText>
          </View>
        </View>

        {/* Bottom Row - Date */}
        <View style={styles.countCardBottom}>
          <View style={styles.countDate}>
            <Ionicons name="calendar-outline" size={12} color={colors.textTertiary} />
            <AppText style={[styles.countDateText, { color: colors.textTertiary }]}>
              {formatDate(item.date)}
            </AppText>
          </View>
          <View style={styles.countTime}>
            <Ionicons name="time-outline" size={12} color={colors.textTertiary} />
            <AppText style={[styles.countTimeText, { color: colors.textTertiary }]}>
              {formatDateTime(item.createdAt)}
            </AppText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.heroSection}>
        <View style={styles.heroContent}>
          <View>
            <AppText style={styles.heroTitle}>Van Settlement</AppText>
            <AppText style={styles.heroSubtitle}>Manage inventory verification</AppText>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search by ID, van or employee..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={handleSearchInput}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* <View style={styles.statsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScrollContent}
        >
          <View style={styles.statItem}>
            <AppText style={[styles.statValue, { color: colors.primary }]}>{totalItems}</AppText>
            <AppText style={[styles.statLabel, { color: colors.textSecondary }]}>Total</AppText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.statItem}>
            <AppText style={[styles.statValue, { color: '#10B981' }]}>
              {stockCounts.filter((s) => s.status === 'APPROVED').length}
            </AppText>
            <AppText style={[styles.statLabel, { color: colors.textSecondary }]}>Approved</AppText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.statItem}>
            <AppText style={[styles.statValue, { color: '#F59E0B' }]}>
              {stockCounts.filter((s) => s.status === 'IN_PROGRESS').length}
            </AppText>
            <AppText style={[styles.statLabel, { color: colors.textSecondary }]}>
              In Progress
            </AppText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.statItem}>
            <AppText style={[styles.statValue, { color: '#EF4444' }]}>
              {stockCounts.filter((s) => s.status === 'REJECTED').length}
            </AppText>
            <AppText style={[styles.statLabel, { color: colors.textSecondary }]}>Rejected</AppText>
          </View>
        </ScrollView>
      </View> */}

      {/* <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="list-outline" size={18} color={colors.primary} />
          <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Recent Counts
          </AppText>
        </View>
        <AppText style={[styles.sectionCount, { color: colors.textTertiary }]}>
          {displayedItems.length} items
        </AppText>
      </View> */}
    </View>
  );

  // Detail Modal with Tabs - Shows Verified By Name and Date
  const renderDetailModal = () => (
    <Modal
      visible={detailModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setDetailModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <AppText style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Stock Count Details
            </AppText>
            <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tab Bar */}
          <View style={[styles.detailTabBar, { borderBottomColor: colors.divider }]}>
            <TouchableOpacity
              style={[styles.detailTab, detailActiveTab === 'overview' && styles.detailTabActive]}
              onPress={() => setDetailActiveTab('overview')}
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={detailActiveTab === 'overview' ? colors.primary : colors.textSecondary}
              />
              <AppText
                style={[
                  styles.detailTabText,
                  { color: detailActiveTab === 'overview' ? colors.primary : colors.textSecondary },
                ]}
              >
                Overview
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.detailTab, detailActiveTab === 'products' && styles.detailTabActive]}
              onPress={() => setDetailActiveTab('products')}
            >
              <Ionicons
                name="cube-outline"
                size={18}
                color={detailActiveTab === 'products' ? colors.primary : colors.textSecondary}
              />
              <AppText
                style={[
                  styles.detailTabText,
                  { color: detailActiveTab === 'products' ? colors.primary : colors.textSecondary },
                ]}
              >
                Products ({detailItems.length})
              </AppText>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            {selectedStockCount && (
              <>
                {detailActiveTab === 'overview' ? (
                  // Overview Tab Content
                  <View>
                    {/* Header Info */}
                    <View style={styles.detailHeader}>
                      <View style={styles.detailIdRow}>
                        <AppText style={[styles.detailId, { color: colors.textPrimary }]}>
                          {selectedStockCount.stockCountId}
                        </AppText>
                        <View
                          style={[
                            styles.detailStatus,
                            { backgroundColor: getStatusConfig(selectedStockCount.status).bg },
                          ]}
                        >
                          <View
                            style={[
                              styles.detailStatusDot,
                              { backgroundColor: getStatusConfig(selectedStockCount.status).color },
                            ]}
                          />
                          <AppText
                            style={[
                              styles.detailStatusText,
                              { color: getStatusConfig(selectedStockCount.status).color },
                            ]}
                          >
                            {getStatusConfig(selectedStockCount.status).label}
                          </AppText>
                        </View>
                      </View>
                    </View>

                    {/* Van & Employee Info */}
                    <View style={styles.detailInfoCard}>
                      <View style={styles.detailInfoRow}>
                        <View style={styles.detailInfoItem}>
                          <Ionicons name="truck-outline" size={18} color={colors.primary} />
                          <View>
                            <AppText
                              style={[styles.detailInfoLabel, { color: colors.textSecondary }]}
                            >
                              Van
                            </AppText>
                            <AppText
                              style={[styles.detailInfoValue, { color: colors.textPrimary }]}
                            >
                              {selectedStockCount.vanName || selectedStockCount.vanId}
                            </AppText>
                          </View>
                        </View>
                        <View style={styles.detailInfoItem}>
                          <Ionicons name="person-outline" size={18} color={colors.primary} />
                          <View>
                            <AppText
                              style={[styles.detailInfoLabel, { color: colors.textSecondary }]}
                            >
                              Employee
                            </AppText>
                            <AppText
                              style={[styles.detailInfoValue, { color: colors.textPrimary }]}
                            >
                              {selectedStockCount.employeeName || selectedStockCount.employeeId}
                            </AppText>
                          </View>
                        </View>
                      </View>

                      <View style={styles.detailInfoRow}>
                        <View style={styles.detailInfoItem}>
                          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                          <View>
                            <AppText
                              style={[styles.detailInfoLabel, { color: colors.textSecondary }]}
                            >
                              Count Date
                            </AppText>
                            <AppText
                              style={[styles.detailInfoValue, { color: colors.textPrimary }]}
                            >
                              {formatDate(selectedStockCount.date)}
                            </AppText>
                          </View>
                        </View>
                        <View style={styles.detailInfoItem}>
                          <Ionicons name="time-outline" size={18} color={colors.primary} />
                          <View>
                            <AppText
                              style={[styles.detailInfoLabel, { color: colors.textSecondary }]}
                            >
                              Created
                            </AppText>
                            <AppText
                              style={[styles.detailInfoValue, { color: colors.textPrimary }]}
                            >
                              {formatDateTime(selectedStockCount.createdAt)}
                            </AppText>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Verified By Section */}
                    {(selectedStockCount.status === 'APPROVED' ||
                      selectedStockCount.status === 'SUBMITTED') && (
                      <View style={styles.verifiedCard}>
                        <View style={styles.verifiedHeader}>
                          <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                          <AppText style={[styles.verifiedTitle, { color: colors.textPrimary }]}>
                            Verification Details
                          </AppText>
                        </View>

                        {selectedStockCount.approvedByName && (
                          <View style={styles.verifiedRow}>
                            <Ionicons
                              name="person-circle-outline"
                              size={16}
                              color={colors.textSecondary}
                            />
                            <View>
                              <AppText
                                style={[styles.verifiedLabel, { color: colors.textSecondary }]}
                              >
                                Verified By
                              </AppText>
                              <AppText
                                style={[styles.verifiedValue, { color: colors.textPrimary }]}
                              >
                                {selectedStockCount.approvedByName}
                              </AppText>
                            </View>
                          </View>
                        )}

                        {selectedStockCount.approvedAt && (
                          <View style={styles.verifiedRow}>
                            <Ionicons
                              name="calendar-outline"
                              size={16}
                              color={colors.textSecondary}
                            />
                            <View>
                              <AppText
                                style={[styles.verifiedLabel, { color: colors.textSecondary }]}
                              >
                                Verified Date
                              </AppText>
                              <AppText
                                style={[styles.verifiedValue, { color: colors.textPrimary }]}
                              >
                                {formatDateTime(selectedStockCount.approvedAt)}
                              </AppText>
                            </View>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Summary Stats */}
                    <View style={styles.summaryGrid}>
                      <View style={[styles.summaryCard, { backgroundColor: colors.background }]}>
                        <AppText style={[styles.summaryCardTitle, { color: colors.primary }]}>
                          Van Stock
                        </AppText>
                        <View style={styles.summaryCardStats}>
                          <View style={styles.summaryCardStat}>
                            <AppText
                              style={[styles.summaryCardStatValue, { color: colors.primary }]}
                            >
                              {selectedStockCount.systemCase + selectedStockCount?.systemPiece}
                            </AppText>
                            <AppText
                              style={[styles.summaryCardStatLabel, { color: colors.textSecondary }]}
                            >
                              Items
                            </AppText>
                          </View>
                          <View style={styles.summaryCardStat}>
                            <AppText style={[styles.summaryCardStatValue, { color: colors.info }]}>
                              {selectedStockCount.systemCase}
                            </AppText>
                            <AppText
                              style={[styles.summaryCardStatLabel, { color: colors.textSecondary }]}
                            >
                              Cases
                            </AppText>
                          </View>
                          <View style={styles.summaryCardStat}>
                            <AppText
                              style={[styles.summaryCardStatValue, { color: colors.success }]}
                            >
                              {selectedStockCount.systemPiece}
                            </AppText>
                            <AppText
                              style={[styles.summaryCardStatLabel, { color: colors.textSecondary }]}
                            >
                              Pieces
                            </AppText>
                          </View>
                        </View>
                        <AppText style={[styles.summaryCardSub, { color: colors.textTertiary }]}>
                          {formatWeight(selectedStockCount.systemWeight)} ·{' '}
                          {formatCurrency(selectedStockCount.systemValue)}
                        </AppText>
                      </View>

                      <View style={[styles.summaryCard, { backgroundColor: colors.background }]}>
                        <AppText style={[styles.summaryCardTitle, { color: colors.warning }]}>
                          Counted Stock
                        </AppText>
                        <View style={styles.summaryCardStats}>
                          <View style={styles.summaryCardStat}>
                            <AppText
                              style={[styles.summaryCardStatValue, { color: colors.warning }]}
                            >
                              {selectedStockCount?.countedCase + selectedStockCount.countedPiece}
                            </AppText>
                            <AppText
                              style={[styles.summaryCardStatLabel, { color: colors.textSecondary }]}
                            >
                              Items
                            </AppText>
                          </View>
                          <View style={styles.summaryCardStat}>
                            <AppText style={[styles.summaryCardStatValue, { color: colors.info }]}>
                              {selectedStockCount.countedCase}
                            </AppText>
                            <AppText
                              style={[styles.summaryCardStatLabel, { color: colors.textSecondary }]}
                            >
                              Cases
                            </AppText>
                          </View>
                          <View style={styles.summaryCardStat}>
                            <AppText
                              style={[styles.summaryCardStatValue, { color: colors.success }]}
                            >
                              {selectedStockCount.countedPiece}
                            </AppText>
                            <AppText
                              style={[styles.summaryCardStatLabel, { color: colors.textSecondary }]}
                            >
                              Pieces
                            </AppText>
                          </View>
                        </View>
                        <AppText style={[styles.summaryCardSub, { color: colors.textTertiary }]}>
                          {formatWeight(selectedStockCount.countedWeight)} ·{' '}
                          {formatCurrency(selectedStockCount.countedValue)}
                        </AppText>
                      </View>

                      <View style={[styles.summaryCard, { backgroundColor: colors.background }]}>
                        <AppText
                          style={[
                            styles.summaryCardTitle,
                            { color: getVarianceColor(selectedStockCount.varianceQty) },
                          ]}
                        >
                          Variance
                        </AppText>
                        <View style={styles.varianceRow}>
                          <MaterialCommunityIcons
                            name={
                              selectedStockCount.varianceQty > 0
                                ? 'trending-up'
                                : selectedStockCount.varianceQty < 0
                                  ? 'trending-down'
                                  : 'minus'
                            }
                            size={20}
                            color={getVarianceColor(selectedStockCount.varianceQty)}
                          />
                          <AppText
                            style={[
                              styles.summaryCardStatValue,
                              { color: getVarianceColor(selectedStockCount.varianceQty) },
                            ]}
                          >
                            {selectedStockCount.varianceQty > 0 ? '+' : ''}
                            {selectedStockCount.varianceQty} items
                          </AppText>
                        </View>
                        <AppText style={[styles.summaryCardSub, { color: colors.textTertiary }]}>
                          Cases: {selectedStockCount.varianceCase > 0 ? '+' : ''}
                          {selectedStockCount.varianceCase} · Pieces:{' '}
                          {selectedStockCount.variancePiece > 0 ? '+' : ''}
                          {selectedStockCount.variancePiece}
                        </AppText>
                      </View>
                    </View>

                    {/* Remark */}
                    {selectedStockCount.remark && (
                      <View style={styles.remarkCard}>
                        <Ionicons
                          name="chatbubble-outline"
                          size={16}
                          color={colors.textSecondary}
                        />
                        <AppText style={[styles.remarkText, { color: colors.textSecondary }]}>
                          {selectedStockCount.remark}
                        </AppText>
                      </View>
                    )}
                  </View>
                ) : (
                  // Items Tab Content
                  <View style={styles.itemsTabContent}>
                    <View style={styles.itemsHeader}>
                      <AppText style={[styles.itemsHeaderTitle, { color: colors.textPrimary }]}>
                        Products
                      </AppText>
                      <View
                        style={[
                          styles.itemsHeaderBadge,
                          { backgroundColor: colors.primary + '10' },
                        ]}
                      >
                        <AppText style={[styles.itemsHeaderBadgeText, { color: colors.primary }]}>
                          {detailItems.length} items
                        </AppText>
                      </View>
                    </View>

                    {isLoadingDetail ? (
                      <ActivityIndicator
                        size="large"
                        color={colors.primary}
                        style={{ marginTop: 40 }}
                      />
                    ) : (
                      detailItems.map((item, idx) => {
                        const varianceColor = getVarianceColor(item.varianceQty);
                        const varianceIcon =
                          item.varianceQty > 0
                            ? 'trending-up'
                            : item.varianceQty < 0
                              ? 'trending-down'
                              : 'minus';

                        return (
                          <View
                            key={idx}
                            style={[styles.productCard, { borderBottomColor: colors.divider }]}
                          >
                            <View style={styles.productCardHeader}>
                              {/* <View style={styles.productIndex}>
                                <AppText
                                  style={[styles.productIndexText, { color: colors.primary }]}
                                >
                                  {idx + 1}
                                </AppText>
                              </View> */}
                              <View style={styles.productInfo}>
                                <AppText
                                  style={[styles.productName, { color: colors.textPrimary }]}
                                  numberOfLines={1}
                                >
                                  {item.productName}
                                </AppText>
                                <AppText
                                  style={[styles.productCode, { color: colors.textTertiary }]}
                                >
                                  {item.productId}
                                </AppText>
                              </View>
                            </View>

                            <View style={styles.productStats}>
                              <View style={styles.productStat}>
                                <AppText
                                  style={[styles.productStatLabel, { color: colors.textSecondary }]}
                                >
                                  Van
                                </AppText>
                                <AppText
                                  style={[styles.productStatValue, { color: colors.primary }]}
                                >
                                  {item.systemCases + item?.systemPieces}
                                </AppText>
                                <AppText
                                  style={[styles.productStatSub, { color: colors.textTertiary }]}
                                >
                                  {item.systemCases}C / {item.systemPieces}P
                                </AppText>
                              </View>
                              <View style={styles.productStat}>
                                <AppText
                                  style={[styles.productStatLabel, { color: colors.textSecondary }]}
                                >
                                  Counted
                                </AppText>
                                <AppText
                                  style={[styles.productStatValue, { color: colors.warning }]}
                                >
                                  {item.countedQty}
                                </AppText>
                                <AppText
                                  style={[styles.productStatSub, { color: colors.textTertiary }]}
                                >
                                  {item.countedCases}C / {item.countedPieces}P
                                </AppText>
                              </View>
                              <View style={styles.productStat}>
                                <AppText
                                  style={[styles.productStatLabel, { color: colors.textSecondary }]}
                                >
                                  Variance
                                </AppText>
                                <View style={styles.varianceRow}>
                                  <MaterialCommunityIcons
                                    name={varianceIcon}
                                    size={12}
                                    color={varianceColor}
                                  />
                                  <AppText
                                    style={[styles.productStatValue, { color: varianceColor }]}
                                  >
                                    {item.varianceQty > 0 ? '+' : ''}
                                    {item.varianceQty}
                                  </AppText>
                                </View>
                              </View>
                            </View>
                          </View>
                        );
                      })
                    )}
                  </View>
                )}
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              onPress={() => setDetailModalVisible(false)}
              style={[styles.closeModalButton, { borderColor: colors.divider }]}
            >
              <AppText style={[styles.closeModalText, { color: colors.textSecondary }]}>
                Close
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={displayedItems}
        renderItem={renderStockCountItem}
        keyExtractor={(item) => item.stockCountId}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={renderHeader()}
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator style={{ padding: 20 }} color={colors.primary} />
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={48} color={colors.textTertiary} />
              <AppText style={[styles.emptyText, { color: colors.textSecondary }]}>
                No stock counts found
              </AppText>
            </View>
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
      />
      {renderDetailModal()}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/stock-count/create')}
      >
        <Ionicons name="add" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

export default StockCountListingPage;
