// VanInventoryTopupListingPage.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { FAB, Portal, Provider } from 'react-native-paper';

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
  warehouseId: string;
  date: string;
  totalRequestedQty: number;
  totalRequestedWeight: number;
  totalRequestedValue: number;
  totalApprovedQty: number;
  totalApprovedWeight: number;
  totalApprovedValue: number;
  remark?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
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
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [fabOpen, setFabOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 15;
  const van = useRouteStore.getState().van;

  const flatListRef = useRef<FlatList>(null);

  /* ============================
   * HELPERS
   * ============================ */

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW', // Zambian Kwacha
      minimumFractionDigits: 2,
    }).format(value);
  }, []);

  const formatWeight = useCallback((weight: number) => {
    return `${weight.toFixed(2)} kg`;
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
      return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
    } catch {
      return 'Invalid date';
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#10B981';
      case 'SUBMITTED':
        return '#3B82F6';
      case 'REJECTED':
        return '#EF4444';
      case 'DRAFT':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'check-circle';
      case 'SUBMITTED':
        return 'clock-outline';
      case 'REJECTED':
        return 'close-circle';
      case 'DRAFT':
        return 'file-document-outline';
      default:
        return 'help-circle';
    }
  }, []);

  const getStatusBackgroundColor = useCallback((status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#10B981';
      case 'SUBMITTED':
        return '#3B82F6';
      case 'REJECTED':
        return '#EF4444';
      case 'DRAFT':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  }, []);

  /* ============================
   * API CALLS
   * ============================ */

  const fetchTopups = useCallback(
    async (
      page: number = 1,
      isRefresh: boolean = false,
      currentFilters: FilterOptions = filters,
      search: string = searchQuery,
    ) => {
      try {
        if (isRefresh) setRefreshing(true);
        else if (page === 1) setIsLoading(true);
        else setIsLoadingMore(true);

        const params: any = {
          page,
          limit: itemsPerPage,
          vanId: van?.vanId,
        };

        if (search) params.search = search;
        if (currentFilters.status) params.status = currentFilters.status;
        if (currentFilters.vanId) params.vanId = currentFilters.vanId;
        if (currentFilters.warehouseId) params.warehouseId = currentFilters.warehouseId;
        if (currentFilters.startDate) params.startDate = currentFilters.startDate.toISOString();
        if (currentFilters.endDate) params.endDate = currentFilters.endDate.toISOString();

        const response = await vanService.fetchInventoryTopupRequest(params);

        const apiData = response?.data;

        const list =
          apiData?.data || // case 1
          apiData?.items || // case 2
          apiData || // case 3 (direct array)
          [];

        const total = apiData?.total || apiData?.count || list.length;

        if (page === 1) {
          setTopups(list);
          setDisplayedItems(list);
          setTotalItems(total);
          setHasMore(list.length === itemsPerPage && total > list.length);
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
    [],
  );

  useFocusEffect(
    useCallback(() => {
      fetchTopups(1, false);

      return () => {
        // optional cleanup
      };
    }, [van?.vanId]),
  );

  const onRefresh = useCallback(() => {
    fetchTopups(1, true);
  }, [fetchTopups]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      fetchTopups(currentPage + 1, false);
    }
  }, [isLoadingMore, hasMore, isLoading, currentPage, fetchTopups]);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      fetchTopups(1, false, filters, text);
    },
    [filters, fetchTopups],
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    fetchTopups(1, false, filters, '');
  }, [filters, fetchTopups]);

  const applyFilters = useCallback(
    (newFilters: FilterOptions) => {
      setFilters(newFilters);
      setShowFilters(false);
      fetchTopups(1, false, newFilters, searchQuery);
    },
    [searchQuery, fetchTopups],
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    setShowFilters(false);
    fetchTopups(1, false, {}, searchQuery);
  }, [searchQuery, fetchTopups]);

  /* ============================
   * RENDER FILTER MODAL
   * ============================ */

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
              <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

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
                          ? colors.primary + '20'
                          : colors.surface,
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

  /* ============================
   * RENDER TOP-UP CARD
   * ============================ */

  const renderTopupItem = ({ item, index }: { item: TopupItem; index: number }) => (
    <TouchableOpacity
      style={[
        styles.topupCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      activeOpacity={0.7}
      onPress={() => router.push(`/topup/detail?id=${item.vanInventoryTopupId}`)}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="truck-fast" size={20} color={colors.primary} />
          <View style={styles.headerInfo}>
            <AppText style={[styles.topupId, { color: colors.textPrimary }]}>
              #{item.vanInventoryTopupId}
            </AppText>
            <AppText style={[styles.vanName, { color: colors.textSecondary }]}>
              {item.vanName}
            </AppText>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusBackgroundColor(item.status) + '15' },
          ]}
        >
          <MaterialCommunityIcons
            name={getStatusIcon(item.status) as any}
            size={12}
            color={getStatusColor(item.status)}
          />
          <AppText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </AppText>
        </View>
      </View>

      {/* Details */}
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="calendar" size={14} color={colors.textSecondary} />
            <AppText style={[styles.detailText, { color: colors.textSecondary }]}>
              {formatDate(item.date)}
            </AppText>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="warehouse" size={14} color={colors.textSecondary} />
            <AppText style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.warehouseId}
            </AppText>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <AppText style={[styles.statValue, { color: colors.primary }]}>
              {item.totalRequestedQty}
            </AppText>
            <AppText style={[styles.statLabel, { color: colors.textSecondary }]}>Qty</AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <AppText style={[styles.statValue, { color: colors.warning }]}>
              {formatWeight(item.totalRequestedWeight)}
            </AppText>
            <AppText style={[styles.statLabel, { color: colors.textSecondary }]}>Weight</AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <AppText style={[styles.statValue, { color: colors.success }]}>
              {formatCurrency(item.totalRequestedValue)}
            </AppText>
            <AppText style={[styles.statLabel, { color: colors.textSecondary }]}>Value</AppText>
          </View>
        </View>

        {item.status === 'APPROVED' && (
          <View style={styles.approvedStats}>
            <AppText style={[styles.approvedLabel, { color: colors.textSecondary }]}>
              Approved:
            </AppText>
            <AppText style={[styles.approvedValue, { color: colors.success }]}>
              {item.totalApprovedQty} Qty | {formatWeight(item.totalApprovedWeight)} |{' '}
              {formatCurrency(item.totalApprovedValue)}
            </AppText>
          </View>
        )}

        {item.remark && (
          <View style={styles.remarkContainer}>
            <MaterialCommunityIcons
              name="note-text-outline"
              size={14}
              color={colors.textSecondary}
            />
            <AppText style={[styles.remarkText, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.remark}
            </AppText>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <MaterialCommunityIcons name="clock-outline" size={12} color={colors.textSecondary} />
        <AppText style={[styles.footerText, { color: colors.textSecondary }]}>
          {formatDateTime(item.createdAt)}
        </AppText>
      </View>
    </TouchableOpacity>
  );

  /* ============================
   * RENDER HEADER
   * ============================ */

  const renderHeader = () => (
    <>
      {/* Search and Filter Bar */}
      <View style={styles.searchFilterContainer}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search by ID, van or warehouse..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => setShowFilters(true)}
        >
          <MaterialCommunityIcons name="filter-variant" size={20} color={colors.primary} />
          {Object.keys(filters).length > 0 && (
            <View style={styles.filterBadge}>
              <AppText style={styles.filterBadgeText}>{Object.keys(filters).length}</AppText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Active Filters */}
      {Object.keys(filters).length > 0 && (
        <View style={styles.activeFiltersContainer}>
          {filters.status && (
            <View style={[styles.activeFilterChip, { backgroundColor: colors.primary + '15' }]}>
              <AppText style={[styles.activeFilterText, { color: colors.primary }]}>
                Status: {filters.status}
              </AppText>
              <TouchableOpacity
                onPress={() => {
                  const { status, ...rest } = filters;
                  setFilters(rest);
                  fetchTopups(1, false, rest, searchQuery);
                }}
              >
                <MaterialCommunityIcons name="close" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Stats Summary */}
      <View style={styles.statsSummary}>
        <View style={styles.statSummaryItem}>
          <AppText style={[styles.statSummaryValue, { color: colors.primary }]}>
            {totalItems}
          </AppText>
          <AppText style={[styles.statSummaryLabel, { color: colors.textSecondary }]}>
            Total Top-ups
          </AppText>
        </View>
        <View style={styles.statSummaryDivider} />
        <View style={styles.statSummaryItem}>
          <AppText style={[styles.statSummaryValue, { color: colors.success }]}>
            {topups.filter((t) => t.status === 'APPROVED').length}
          </AppText>
          <AppText style={[styles.statSummaryLabel, { color: colors.textSecondary }]}>
            Approved
          </AppText>
        </View>
        <View style={styles.statSummaryDivider} />
        <View style={styles.statSummaryItem}>
          <AppText style={[styles.statSummaryValue, { color: colors.warning }]}>
            {topups.filter((t) => t.status === 'SUBMITTED').length}
          </AppText>
          <AppText style={[styles.statSummaryLabel, { color: colors.textSecondary }]}>
            Pending
          </AppText>
        </View>
      </View>
    </>
  );

  /* ============================
   * RENDER LOADING FOOTER
   * ============================ */

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <AppText style={[styles.loadingFooterText, { color: colors.textSecondary }]}>
          Loading more top-ups...
        </AppText>
      </View>
    );
  };

  /* ============================
   * RENDER EMPTY STATE
   * ============================ */

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
        <MaterialCommunityIcons
          name={searchQuery ? 'file-search-outline' : 'truck-fast'}
          size={60}
          color={colors.textSecondary}
        />
      </View>
      <AppText style={[styles.emptyStateText, { color: colors.textSecondary }]}>
        {searchQuery ? 'No matching top-ups found' : 'No inventory top-ups'}
      </AppText>
      <AppText style={[styles.emptyStateSubtext, { color: colors.textTertiary }]}>
        {searchQuery ? 'Try a different search term' : 'Pull to refresh or create a new top-up'}
      </AppText>
    </View>
  );

  /* ============================
   * MAIN RENDER
   * ============================ */

  return (
    <Provider>
      <View style={styles.pageContainer}>
        <FlatList
          ref={flatListRef}
          data={displayedItems}
          renderItem={renderTopupItem}
          keyExtractor={(item) => item.vanInventoryTopupId}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
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
          removeClippedSubviews={true}
        />
        {renderFilterModal()}

        {/* FAB Button */}
        <Portal>
          <FAB.Group
            visible={true}
            open={fabOpen}
            icon={fabOpen ? 'close' : 'plus'}
            actions={[
              {
                icon: 'plus',
                label: 'Create Top-up',
                onPress: () => {
                  setFabOpen(false);
                  router.push('/topup/create');
                },
              },
              {
                icon: 'file-import',
                label: 'Import from Excel',
                onPress: () => {
                  setFabOpen(false);
                  console.log('Import from Excel');
                },
              },
            ]}
            onStateChange={({ open }) => setFabOpen(open)}
            onPress={() => {
              if (fabOpen) {
                // Do nothing if open
              }
            }}
            fabStyle={[styles.fab, { backgroundColor: colors.primary }]}
            color="#FFFFFF"
            backdropColor="rgba(0, 0, 0, 0.5)"
          />
        </Portal>
      </View>
    </Provider>
  );
};

// Mock API function (replace with actual service call)
const mockGetTopups = async (params: any) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const mockData: TopupItem[] = [
    {
      vanInventoryTopupId: 'TOP-001',
      vanId: 'VAN-001',
      vanName: 'Van 1 - North Zone',
      employeeId: 'EMP-001',
      warehouseId: 'WH-001',
      date: new Date().toISOString(),
      totalRequestedQty: 150,
      totalRequestedWeight: 1250.5,
      totalRequestedValue: 125000,
      totalApprovedQty: 150,
      totalApprovedWeight: 1250.5,
      totalApprovedValue: 125000,
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      vanInventoryTopupId: 'TOP-002',
      vanId: 'VAN-002',
      vanName: 'Van 2 - South Zone',
      employeeId: 'EMP-002',
      warehouseId: 'WH-002',
      date: new Date().toISOString(),
      totalRequestedQty: 200,
      totalRequestedWeight: 1800.75,
      totalRequestedValue: 250000,
      totalApprovedQty: 0,
      totalApprovedWeight: 0,
      totalApprovedValue: 0,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      vanInventoryTopupId: 'TOP-003',
      vanId: 'VAN-003',
      vanName: 'Van 3 - East Zone',
      employeeId: 'EMP-003',
      warehouseId: 'WH-001',
      date: new Date().toISOString(),
      totalRequestedQty: 75,
      totalRequestedWeight: 625.25,
      totalRequestedValue: 75000,
      totalApprovedQty: 0,
      totalApprovedWeight: 0,
      totalApprovedValue: 0,
      remark: 'Urgent restock needed',
      status: 'REJECTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      vanInventoryTopupId: 'TOP-004',
      vanId: 'VAN-004',
      vanName: 'Van 4 - West Zone',
      employeeId: 'EMP-001',
      warehouseId: 'WH-003',
      date: new Date().toISOString(),
      totalRequestedQty: 300,
      totalRequestedWeight: 2500.0,
      totalRequestedValue: 500000,
      totalApprovedQty: 300,
      totalApprovedWeight: 2500.0,
      totalApprovedValue: 500000,
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      vanInventoryTopupId: 'TOP-005',
      vanId: 'VAN-001',
      vanName: 'Van 1 - North Zone',
      employeeId: 'EMP-002',
      warehouseId: 'WH-002',
      date: new Date().toISOString(),
      totalRequestedQty: 100,
      totalRequestedWeight: 850.0,
      totalRequestedValue: 100000,
      totalApprovedQty: 0,
      totalApprovedWeight: 0,
      totalApprovedValue: 0,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Apply filters
  let filtered = [...mockData];

  if (params.search) {
    const search = params.search.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.vanInventoryTopupId.toLowerCase().includes(search) ||
        item.vanName.toLowerCase().includes(search) ||
        item.warehouseId.toLowerCase().includes(search),
    );
  }

  if (params.status) {
    filtered = filtered.filter((item) => item.status === params.status);
  }

  if (params.vanId) {
    filtered = filtered.filter((item) => item.vanId === params.vanId);
  }

  if (params.warehouseId) {
    filtered = filtered.filter((item) => item.warehouseId === params.warehouseId);
  }

  // Paginate
  const start = (params.page - 1) * params.limit;
  const end = start + params.limit;
  const paginatedData = filtered.slice(start, end);

  return {
    data: paginatedData,
    total: filtered.length,
    page: params.page,
    limit: params.limit,
  };
};

export default VanInventoryTopupListingPage;
