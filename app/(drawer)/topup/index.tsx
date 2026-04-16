// VanInventoryTopupListingPage.tsx - Improved Version
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { useVanInventoryTopupStyles } from '@/shared/styles/Topup.styles';
import { router, useFocusEffect } from 'expo-router';
import { vanService } from '@/shared/services/van.service';
import { useAuthStore } from '@/core/store/auth.store';
import { useOutletStore } from '@/core/store/outlet.store';
import { useRouteStore } from '@/core/store/route.store';

interface TopupItem {
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
  totalApprovedQty: number;
  totalApprovedWeight: number;
  totalApprovedValue: number;
  totalRequestedPieces: number;
  totalRequestedCases: number;
  totalApprovedPieces: number;
  totalApprovedCases: number;
  remark?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  approvedByName?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface FilterOptions {
  status?: string;
  vanId?: string;
  warehouseId?: string;
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
}

export const VanInventoryTopupListingPage: React.FC = () => {
  const styles = useVanInventoryTopupStyles();
  const { colors } = useTheme();

  const [topups, setTopups] = useState<TopupItem[]>([]);
  const [displayedItems, setDisplayedItems] = useState<TopupItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 15;
  const van = useRouteStore.getState().van;

  const flatListRef = useRef<FlatList>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const formatCurrency = useCallback((value: number) => {
    return `K ${value.toLocaleString('en-ZM', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, []);

  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return 'Invalid date';
    }
  }, []);

  const formatDateTime = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM, hh:mm a');
    } catch {
      return 'Invalid date';
    }
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { color: '#10B981', bg: '#10B98115', icon: 'checkmark-circle', label: 'Approved' };
      case 'SUBMITTED':
        return { color: '#3B82F6', bg: '#3B82F615', icon: 'time-outline', label: 'Submitted' };
      case 'REJECTED':
        return { color: '#EF4444', bg: '#EF444415', icon: 'close-circle', label: 'Rejected' };
      default:
        return { color: '#6B7280', bg: '#6B728015', icon: 'create-outline', label: 'Draft' };
    }
  };

  const fetchTopups = useCallback(
    async (
      page: number = 1,
      isRefresh: boolean = false,
      currentFilters: FilterOptions = filters,
      searchText: string = debouncedSearchQuery,
    ) => {
      try {
        if (isRefresh) setRefreshing(true);
        else if (page === 1) setIsLoading(true);
        else setIsLoadingMore(true);

        const params: any = {
          page,
          limit: itemsPerPage,
        };

        if (currentFilters.vanId) params.vanId = currentFilters.vanId;
        if (searchText) params.searchText = searchText;
        if (currentFilters.status) params.status = currentFilters.status;
        if (currentFilters.warehouseId) params.warehouseId = currentFilters.warehouseId;
        if (currentFilters.startDate) params.startDate = currentFilters.startDate.toISOString();
        if (currentFilters.endDate) params.endDate = currentFilters.endDate.toISOString();

        const response = await vanService.fetchInventoryTopupRequests(params);
        const apiData = response?.data;
        const list = apiData?.data || apiData?.items || apiData || [];
        const total = apiData?.meta?.total || apiData?.total || apiData?.count || list.length;

        if (page === 1) {
          setTopups(list);
          setDisplayedItems(list);
          setTotalItems(total);
          setHasMore(list.length === itemsPerPage && total > list.length);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        } else {
          setTopups((prev) => [...prev, ...list]);
          setDisplayedItems((prev) => [...prev, ...list]);
          setHasMore(list.length === itemsPerPage);
        }

        setCurrentPage(page);
      } catch (error) {
        console.log('Error fetching topups:', error);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [filters, debouncedSearchQuery, itemsPerPage],
  );

  const handleSearchInput = useCallback(
    (text: string) => {
      setSearchQuery(text);
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(() => {
        setDebouncedSearchQuery(text);
        fetchTopups(1, false, filters, text);
      }, 500);
    },
    [filters, fetchTopups],
  );

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTopups(1, false);
    }, [van?.vanId]),
  );

  const onRefresh = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchTopups(1, true);
  }, [fetchTopups]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      fetchTopups(currentPage + 1, false);
    }
  }, [isLoadingMore, hasMore, isLoading, currentPage, fetchTopups]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    fetchTopups(1, false, filters, '');
  }, [filters, fetchTopups]);

  const applyFilters = useCallback(
    (newFilters: FilterOptions) => {
      setFilters(newFilters);
      setShowFilters(false);
      fetchTopups(1, false, newFilters, debouncedSearchQuery);
    },
    [debouncedSearchQuery, fetchTopups],
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    setShowFilters(false);
    fetchTopups(1, false, {}, debouncedSearchQuery);
  }, [debouncedSearchQuery, fetchTopups]);

  const handleCreateTopup = () => {
    setShowCreateModal(false);
    router.push('/topup/create');
  };

  const renderTopupItem = ({ item, index }: { item: TopupItem; index: number }) => {
    const statusConfig = getStatusConfig(item.status);
    const totalRequestedItems = (item.totalRequestedCases || 0) + (item.totalRequestedPieces || 0);
    const totalApprovedItems = (item.totalApprovedCases || 0) + (item.totalApprovedPieces || 0);

    const animatedStyle = {
      opacity: fadeAnim,
      transform: [
        { translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
      ],
    };

    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={[
            styles.topupCard,
            { backgroundColor: colors.surface, borderColor: colors.divider },
          ]}
          activeOpacity={0.7}
          onPress={() => router.push(`/topup/detail?id=${item.vanInventoryTopupId}`)}
        >
          <LinearGradient
            colors={[statusConfig.color + '08', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          <View style={styles.topupCardHeader}>
            <View style={styles.topupCardLeft}>
              <View style={styles.topupCardDate}>
                <Ionicons name="calendar-outline" size={12} color={colors.textTertiary} />
                <AppText style={[styles.topupCardDateText, { color: colors.textTertiary }]}>
                  {formatDate(item.date)}
                </AppText>
              </View>
            </View>
            <View style={[styles.topupCardStatus, { backgroundColor: statusConfig.bg }]}>
              <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
              <AppText style={[styles.topupCardStatusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </AppText>
            </View>
          </View>

          <View style={styles.topupInfoGrid}>
            <View style={styles.topupInfoCard}>
              <View style={[styles.topupInfoIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="truck-outline" size={16} color={colors.primary} />
              </View>
              <View style={styles.topupInfoContent}>
                <AppText style={[styles.topupInfoLabel, { color: colors.textSecondary }]}>
                  Van
                </AppText>
                <AppText
                  style={[styles.topupInfoValue, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {item.vanName || item.vanId}
                </AppText>
              </View>
            </View>
            <View style={styles.topupInfoCard}>
              <View style={[styles.topupInfoIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="person-outline" size={16} color={colors.primary} />
              </View>
              <View style={styles.topupInfoContent}>
                <AppText style={[styles.topupInfoLabel, { color: colors.textSecondary }]}>
                  Employee
                </AppText>
                <AppText
                  style={[styles.topupInfoValue, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {item.employeeName || item.employeeId}
                </AppText>
              </View>
            </View>
          </View>

          <View style={styles.topupStatsRow}>
            <View style={styles.topupStat}>
              <AppText style={[styles.topupStatValue, { color: colors.primary }]}>
                {totalRequestedItems}
              </AppText>
              <AppText style={[styles.topupStatLabel, { color: colors.textSecondary }]}>
                Requested
              </AppText>
            </View>
            <View style={[styles.topupStatDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.topupStat}>
              <AppText style={[styles.topupStatValue, { color: colors.success }]}>
                {totalApprovedItems}
              </AppText>
              <AppText style={[styles.topupStatLabel, { color: colors.textSecondary }]}>
                Approved
              </AppText>
            </View>
            <View style={[styles.topupStatDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.topupStat}>
              <AppText style={[styles.topupStatValue, { color: colors.warning }]}>
                {formatCurrency(item.totalRequestedValue)}
              </AppText>
              <AppText style={[styles.topupStatLabel, { color: colors.textSecondary }]}>
                Value
              </AppText>
            </View>
          </View>

          {item.status === 'APPROVED' && item.approvedByName && (
            <View style={styles.topupApprovedRow}>
              <Ionicons name="shield-checkmark" size={14} color="#10B981" />
              <AppText style={[styles.topupApprovedLabel, { color: colors.textSecondary }]}>
                Approved by:
              </AppText>
              <AppText style={[styles.topupApprovedValue, { color: '#10B981' }]}>
                {item.approvedByName}
              </AppText>
              {item.approvedAt && (
                <>
                  <AppText style={[{ color: colors.textTertiary, fontSize: 10 }]}>•</AppText>
                  <AppText style={[styles.topupApprovedDate, { color: colors.textTertiary }]}>
                    {formatDateTime(item.approvedAt)}
                  </AppText>
                </>
              )}
            </View>
          )}

          <View style={[styles.topupCardFooter, { borderTopColor: colors.divider }]}>
            <Ionicons name="time-outline" size={12} color={colors.textTertiary} />
            <AppText style={[styles.topupCardFooterText, { color: colors.textTertiary }]}>
              Created {formatDateTime(item.createdAt)}
            </AppText>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <View style={styles.heroBackground}>
          <MaterialCommunityIcons
            name="truck-fast"
            size={140}
            color="rgba(255,255,255,0.08)"
            style={{ position: 'absolute', right: -20, top: -20 }}
          />
        </View>
        <View style={styles.heroContent}>
          <View>
            <AppText style={styles.heroTitle}>Top-ups</AppText>
            <AppText style={styles.heroSubtitle}>Manage inventory requests</AppText>
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
              style={styles.createButtonGradient}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
              <AppText style={styles.createButtonText}>New</AppText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search-outline" size={22} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search by van, employee or ID..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={handleSearchInput}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        {debouncedSearchQuery && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <AppText style={[styles.searchResultText, { color: colors.primary }]}>
              Found {totalItems} result{totalItems !== 1 ? 's' : ''}
            </AppText>
          </Animated.View>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
        <MaterialCommunityIcons
          name={searchQuery ? 'file-search-outline' : 'truck-fast'}
          size={56}
          color={colors.textTertiary}
        />
      </View>
      <AppText style={[styles.emptyStateText, { color: colors.textSecondary }]}>
        {searchQuery ? 'No top-ups found' : 'No inventory top-ups yet'}
      </AppText>
      <AppText style={[styles.emptyStateSubtext, { color: colors.textTertiary }]}>
        {searchQuery ? 'Try adjusting your search' : 'Tap the + button to create your first top-up'}
      </AppText>
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <AppText style={[styles.loadingFooterText, { color: colors.textSecondary }]}>
          Loading more...
        </AppText>
      </View>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <AppText style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Filter Top-ups
            </AppText>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.filterSection}>
              <AppText style={[styles.filterLabel, { color: colors.textPrimary }]}>Status</AppText>
              <View style={styles.statusFilterContainer}>
                {['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusFilterChip,
                      {
                        backgroundColor:
                          filters.status === status || (status === 'ALL' && !filters.status)
                            ? colors.primary + '15'
                            : colors.background,
                        borderColor:
                          filters.status === status || (status === 'ALL' && !filters.status)
                            ? colors.primary
                            : colors.border,
                      },
                    ]}
                    onPress={() => {
                      if (status === 'ALL') {
                        const { status: _, ...rest } = filters;
                        setFilters(rest);
                      } else {
                        setFilters({ ...filters, status });
                      }
                    }}
                  >
                    <AppText
                      style={[
                        styles.statusFilterText,
                        {
                          color:
                            filters.status === status || (status === 'ALL' && !filters.status)
                              ? colors.primary
                              : colors.textSecondary,
                        },
                      ]}
                    >
                      {status}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.filterActions}>
            <TouchableOpacity
              style={[styles.clearFilterButton, { borderColor: colors.border }]}
              onPress={clearFilters}
            >
              <AppText style={[styles.clearFilterText, { color: colors.textSecondary }]}>
                Clear All
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyFilterButton, { backgroundColor: colors.primary }]}
              onPress={() => applyFilters(filters)}
            >
              <AppText style={styles.applyFilterText}>Apply Filters</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.createModalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.createModalHeader}>
            <View style={[styles.createModalIcon, { backgroundColor: colors.primary + '15' }]}>
              <MaterialCommunityIcons name="truck-fast" size={36} color={colors.primary} />
            </View>
            <TouchableOpacity
              onPress={() => setShowCreateModal(false)}
              style={styles.createModalClose}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <AppText style={[styles.createModalTitle, { color: colors.textPrimary }]}>
            Request Top-up
          </AppText>
          <AppText style={[styles.createModalSubtitle, { color: colors.textSecondary }]}>
            Create a new inventory request for your van
          </AppText>

          <View style={styles.createModalButtons}>
            <TouchableOpacity
              style={[
                styles.createModalButton,
                styles.createModalCancelButton,
                { borderColor: colors.border },
              ]}
              onPress={() => setShowCreateModal(false)}
            >
              <AppText style={[styles.createModalCancelText, { color: colors.textSecondary }]}>
                Cancel
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.createModalButton,
                styles.createModalConfirmButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleCreateTopup}
            >
              <AppText style={styles.createModalConfirmText}>Continue</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.fullscreenContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <FlatList
        ref={flatListRef}
        data={displayedItems}
        renderItem={renderTopupItem}
        keyExtractor={(item) => item.vanInventoryTopupId}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressBackgroundColor={colors.surface}
          />
        }
        ListHeaderComponent={renderHeader()}
        ListFooterComponent={renderFooter()}
        ListEmptyComponent={!isLoading ? renderEmptyState() : null}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
      {renderFilterModal()}
      {renderCreateModal()}

      {isLoading && !refreshing && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading top-ups...
            </AppText>
          </View>
        </View>
      )}
    </View>
  );
};

export default VanInventoryTopupListingPage;
