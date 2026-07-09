import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { FilterModal } from '@/shared/components/models/Filter.modal';
import { useFilterContext } from '@/shared/contexts/FilterContext';
import { useAuthStore } from '@/core/store/auth.store';
import { toast } from '@/shared/utils/toast';
import { useRouteStore } from '@/core/store/route.store';
import { stockCountService } from '@/shared/services/stock-count.service';
import { useStockCountStyles } from '@/shared/styles/StockCount.styles';
import { StockCountDetailModal } from '@/shared/components/StockCountDetailModal';
import { CommonListing } from '@/shared/components/CommonListing';
import { ListingItemCard } from '@/shared/components/ListingItemCard';
import { AppModal, AppText, SearchBar } from '@/core/components';
import { IconTile } from '@/shared/components/IconTile';
import { StatusChip } from '@/shared/components/StatusChip';
import { formatCurrency, formatDateSafe } from '@/shared/utils/currenty.utils';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { FilterSection } from '@/shared/types/filter.types';
import { homeService } from '@/features/home/services/home.service';
import { vanService } from '@/shared/services/van.service';
import { DayEndSummaryModal } from '@/features/home/components/models/DayEndSummaryModal';
import { ConfirmationModal } from '@/core/components';
import { useLoaderStore } from '@/core/loader/loader.store';

const LIMIT = 15;

interface StockCountItem {
  stockCountId: string;
  workSessionId: string;
  vanId: string;
  vanName?: string;
  employeeId: string;
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
  updatedById?: string;
  approvedById?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface StockCountScreenProps {
  hideFAB?: boolean;
  hideSearch?: boolean;
  hideFilters?: boolean;
  vanId?: string;
}

export default function StockCountScreen({
  hideFAB = false,
  hideSearch = false,
  hideFilters = false,
  vanId,
}: StockCountScreenProps) {
  const { colors } = useTheme();
  const styles = useStockCountStyles();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stockCounts, setStockCounts] = useState<StockCountItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStockCount, setSelectedStockCount] = useState<StockCountItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailItems, setDetailItems] = useState<any[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [dayEndSummary, setDayEndSummary] = useState<any>(null);
  const [showDayEndSummary, setShowDayEndSummary] = useState(false);
  const [showSettlementConfirm, setShowSettlementConfirm] = useState(false);
  const [showSettlementOptions, setShowSettlementOptions] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [carryForwardStock, setCarryForwardStock] = useState(true);
  const hasPromptedSettlementRef = useRef(false);
  const loader = useLoaderStore();

  const { user, workSessionId } = useAuthStore();
  const { selectedRoute: route } = useRouteStore();
  const { setHeader } = useHeader();
  const {
    stockCountFilterCount,
    updateStockCountFilterCount,
    resetStockCountFilterCount,
    setOpenStockCountFilterHandler,
  } = useFilterContext();

  const [filters, setFilters] = useState({
    status: [] as string[],
    dateRange: { start: '', end: '' },
    minValue: '',
    maxValue: '',
  });

  const handleEndDayFromSettlement = useCallback(async () => {
    try {
      loader.show({ message: 'Loading van settlement summary...' });

      const vanIdToUse = vanId || user?.vanId || useRouteStore.getState().van?.vanId;
      if (!vanIdToUse) {
        toast.error('Van not found. Please start your day first.' as any);
        return;
      }

      const res: any = await vanService.fetchTodayStockSummary(
        { vanId: vanIdToUse, workSessionId },
        { showLoader: false },
      );
      setDayEndSummary(res?.data);
      setShowDayEndSummary(true);
    } catch (error) {
      console.error('Error fetching day end summary:', error);
      toast.error('Failed to load day end summary. Please try again.' as any);
    } finally {
      loader.hide();
    }
  }, [loader, user?.vanId, vanId, workSessionId]);

  const submitDayEnd = useCallback(async () => {
    try {
      setShowFinalConfirm(false);
      await new Promise((resolve) => setTimeout(resolve, 100));
      loader.show({ message: 'Completing van settlement...' });

      const response: any = await homeService.dayComplete(carryForwardStock as any, {
        showLoader: false,
      });
      if (response?.success || response?.statusCode === 200) {
        loader.show({ message: 'Finalizing settlement...' });
        toast.success('Your day successfully completed' as any);
        setShowFinalConfirm(false);
        setShowSettlementOptions(false);
        setShowDayEndSummary(false);
        router.replace('/(drawer)/(tabs)/home');
        return;
      }
      toast.error((response?.message || 'Failed to complete day') as any);
    } catch (error) {
      console.error('Error completing day:', error);
      toast.error('Failed to complete day. Please try again.' as any);
    } finally {
      loader.hide();
    }
  }, [carryForwardStock, loader]);

  const handleCreateStockCount = useCallback(() => {
    router.push('/stock-count/create');
  }, []);

  // Register filter handler for context
  useEffect(() => {
    if (!hideFilters) {
      setOpenStockCountFilterHandler(() => setShowFilters(true));
    }
    return () => {
      if (!hideFilters) {
        setOpenStockCountFilterHandler(() => {});
      }
    };
  }, [hideFilters, setOpenStockCountFilterHandler]);

  // Filter sections
  const filterSections = useMemo((): FilterSection[] => {
    const sections: FilterSection[] = [];

    // Status filter section
    sections.push({
      id: 'status',
      title: 'Status',
      type: 'multiple',
      options: [
        {
          id: 'DRAFT',
          label: 'Draft',
          count: stockCounts.filter((t) => t.status === 'DRAFT').length,
          value: 'DRAFT',
        },
        {
          id: 'IN_PROGRESS',
          label: 'In Progress',
          count: stockCounts.filter((t) => t.status === 'IN_PROGRESS').length,
          value: 'IN_PROGRESS',
        },
        {
          id: 'SUBMITTED',
          label: 'Submitted',
          count: stockCounts.filter((t) => t.status === 'SUBMITTED').length,
          value: 'SUBMITTED',
        },
        {
          id: 'APPROVED',
          label: 'Approved',
          count: stockCounts.filter((t) => t.status === 'APPROVED').length,
          value: 'APPROVED',
        },
        {
          id: 'REJECTED',
          label: 'Rejected',
          count: stockCounts.filter((t) => t.status === 'REJECTED').length,
          value: 'REJECTED',
        },
      ],
      selectedIds: filters.status,
    });

    // Date range filter
    sections.push({
      id: 'dateRange',
      title: 'Date Range',
      type: 'date',
      rangeValue: {
        min: filters.dateRange.start,
        max: filters.dateRange.end,
      },
    });

    // Value range filter (variance value)
    sections.push({
      id: 'valueRange',
      title: 'Variance Value (ZMW)',
      type: 'range',
      rangeValue: {
        min: filters.minValue,
        max: filters.maxValue,
      },
    });

    return sections;
  }, [filters, stockCounts]);

  // Set up header with filter button and FAB
  useFocusEffect(
    useCallback(() => {
      setHeader({
        showFilter: true,
        onFilterPress: () => setShowFilters(true),
        rightIcon: 'plus',
        onRightPress: () => handleCreateStockCount(),
        title: 'Van Settlement',
      });
    }, [handleCreateStockCount, setHeader]),
  );

  // Auto start settlement flow when opening this screen
  useFocusEffect(
    useCallback(() => {
      if (!hasPromptedSettlementRef.current) {
        hasPromptedSettlementRef.current = true;
        setCarryForwardStock(true); // default selected
        setShowSettlementConfirm(true);
      }
    }, []),
  );

  // Fetch stock counts
  const getStockCounts = async (pageNumber = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNumber === 1) {
        setLoading(true);
      }

      const payload: any = {
        page: pageNumber,
        limit: LIMIT,
        filters: {
          status: filters.status,
        },
        vanId: vanId || user?.vanId,
        employeeId: user?.userId,
      };

      if (searchQuery) payload.searchText = searchQuery;

      // Add date range filters
      if (filters.dateRange.start) payload.startDate = filters.dateRange.start;
      if (filters.dateRange.end) payload.endDate = filters.dateRange.end;

      // Add value range filters (variance value)
      if (filters.minValue) payload.minVarianceValue = parseFloat(filters.minValue);
      if (filters.maxValue) payload.maxVarianceValue = parseFloat(filters.maxValue);

      const response = await stockCountService.fetchStockCounts(payload);
      const apiData = response?.data;
      let newData = apiData?.data || apiData?.items || apiData || [];

      // Apply variance value range filter client-side if needed (since API might not support it)
      if (filters.minValue || filters.maxValue) {
        const minVal = filters.minValue ? parseFloat(filters.minValue) : -Infinity;
        const maxVal = filters.maxValue ? parseFloat(filters.maxValue) : Infinity;
        newData = newData.filter((item: StockCountItem) => {
          const varianceValue = Math.abs(item.varianceValue);
          return varianceValue >= minVal && varianceValue <= maxVal;
        });
      }

      const total = apiData?.meta?.total || apiData?.total || apiData?.count || newData.length;

      if (pageNumber === 1) {
        setStockCounts(newData);
      } else {
        setStockCounts((prev) => [...prev, ...newData]);
      }

      setHasMore(newData.length === LIMIT && total > pageNumber * LIMIT);
      setPage(pageNumber);
    } catch (e) {
      toast.error('Failed to load stock counts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      getStockCounts(1, true);
    }, [route, user, vanId]),
  );

  // Handle search & filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setStockCounts([]);
      getStockCounts(1, true);
    }, 300);
    return () => clearTimeout(timer);
  }, [
    searchQuery,
    filters.status,
    filters.dateRange.start,
    filters.dateRange.end,
    filters.minValue,
    filters.maxValue,
    vanId,
  ]);

  // Update filter count whenever filters change
  useEffect(() => {
    let count = 0;
    if (filters.status.length) count += filters.status.length;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.minValue || filters.maxValue) count++;
    if (searchQuery) count++;
    updateStockCountFilterCount(count);
  }, [filters, searchQuery, updateStockCountFilterCount]);

  // Handlers
  const onRefresh = useCallback(() => {
    setPage(1);
    setStockCounts([]);
    getStockCounts(1, true);
  }, []);

  const handleLoadMore = () => {
    if (!hasMore || loading || refreshing) return;
    getStockCounts(page + 1);
  };

  const handleApplyFilters = useCallback(
    (sections: FilterSection[]) => {
      const newFilters = {
        status: [] as string[],
        dateRange: { start: '', end: '' },
        minValue: '',
        maxValue: '',
      };
      let newSearchQuery = searchQuery;

      sections.forEach((section) => {
        if (section.id === 'search' && section.searchValue !== undefined) {
          newSearchQuery = section.searchValue || '';
        } else if (section.id === 'status' && section.selectedIds) {
          newFilters.status = section.selectedIds;
        }
      });

      setSearchQuery(newSearchQuery);
      setFilters(newFilters);
      setShowFilters(false);
      setPage(1);
      setStockCounts([]);
      getStockCounts(1, true);
    },
    [searchQuery],
  );

  const clearAllFilters = useCallback(() => {
    setFilters({
      status: [],
      dateRange: { start: '', end: '' },
      minValue: '',
      maxValue: '',
    });
    setSearchQuery('');
    setShowFilters(false);
    setPage(1);
    setStockCounts([]);
    resetStockCountFilterCount();
    getStockCounts(1, true);
  }, [resetStockCountFilterCount]);

  const handleViewDetails = async (item: StockCountItem) => {
    setSelectedStockCount(item);
    setDetailModalVisible(true);
    try {
      setIsLoadingDetail(true);
      const response = await stockCountService.fetchStockCountItems(item.stockCountId);
      const items = response?.data?.items || response?.data || [];
      setDetailItems(items);
    } catch (error) {
      toast.error('Failed to load stock count details');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Calculate active filter count for display
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status.length) count += filters.status.length;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.minValue || filters.maxValue) count++;
    if (searchQuery) count++;
    return count;
  }, [filters, searchQuery]);

  const renderFooter = () =>
    loading && stockCounts.length > 0 ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.primary} size="small" />
      </View>
    ) : null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { color: '#10B981', bg: '#10B98112', label: 'Approved' };
      case 'SUBMITTED':
        return { color: '#3B82F6', bg: '#3B82F612', label: 'Submitted' };
      case 'IN_PROGRESS':
        return { color: '#F59E0B', bg: '#F59E0B12', label: 'In Progress' };
      case 'REJECTED':
        return { color: '#EF4444', bg: '#EF444412', label: 'Rejected' };
      default:
        return { color: '#8B5CF6', bg: '#8B5CF612', label: 'Draft' };
    }
  };

  // Render filter chips
  const renderFilterChips = () => {
    if (activeFilterCount === 0) return null;

    return (
      <View style={styles.filterChipsContainer}>
        <View style={styles.filterChipsContent}>
          {searchQuery && (
            <View style={[styles.filterChip, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.filterChipText, { color: colors.primary }]}>
                Search: {searchQuery}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  updateStockCountFilterCount(activeFilterCount - 1);
                  setTimeout(() => getStockCounts(1, true), 100);
                }}
              >
                <Ionicons name="close-circle" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}

          {filters.status.map((status) => (
            <View
              key={`status-${status}`}
              style={[styles.filterChip, { backgroundColor: colors.primary + '15' }]}
            >
              <Text style={[styles.filterChipText, { color: colors.primary }]}>
                Status: {status}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setFilters((prev) => ({
                    ...prev,
                    status: prev.status.filter((s) => s !== status),
                  }));
                  updateStockCountFilterCount(activeFilterCount - 1);
                  setTimeout(() => getStockCounts(1, true), 100);
                }}
              >
                <Ionicons name="close-circle" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ))}

          {(filters.dateRange.start || filters.dateRange.end) && (
            <View style={[styles.filterChip, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.filterChipText, { color: colors.primary }]}>
                Date: {filters.dateRange.start || 'any'} - {filters.dateRange.end || 'any'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { start: '', end: '' },
                  }));
                  updateStockCountFilterCount(activeFilterCount - 1);
                  setTimeout(() => getStockCounts(1, true), 100);
                }}
              >
                <Ionicons name="close-circle" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}

          {(filters.minValue || filters.maxValue) && (
            <View style={[styles.filterChip, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.filterChipText, { color: colors.primary }]}>
                Variance: {filters.minValue || '0'} - {filters.maxValue || '∞'} ZMW
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setFilters((prev) => ({
                    ...prev,
                    minValue: '',
                    maxValue: '',
                  }));
                  updateStockCountFilterCount(activeFilterCount - 1);
                  setTimeout(() => getStockCounts(1, true), 100);
                }}
              >
                <Ionicons name="close-circle" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!hideSearch && (
        <View style={styles.searchWrapper}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by ID or van..."
          />
        </View>
      )}

      {renderFilterChips()}

      <CommonListing<StockCountItem>
        data={stockCounts}
        keyExtractor={(item) => item.stockCountId}
        renderItem={({ item }) => {
          const statusConfig = getStatusConfig(item.status);
          const varianceValue = Math.abs(item.varianceValue);
          const isOverstock = item.varianceValue > 0;
          const isUnderstock = item.varianceValue < 0;

          return (
            <ListingItemCard
              onPress={() => handleViewDetails(item)}
              leading={<IconTile icon="clipboard-outline" color={statusConfig.color} />}
              title={
                <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
                  {item.vanName || item.vanId}
                </AppText>
              }
              headerRight={
                <StatusChip
                  label={statusConfig.label}
                  color={statusConfig.color}
                  backgroundColor={statusConfig.bg}
                />
              }
              showChevron={true}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <View style={{ flex: 1 }}>
                  <AppText style={{ fontSize: 11, color: colors.textTertiary, marginBottom: 2 }}>
                    System Value
                  </AppText>
                  <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.textSecondary }}>
                    {formatCurrency(item.systemValue)}
                  </AppText>
                </View>

                <View style={{ flex: 1 }}>
                  <AppText style={{ fontSize: 11, color: colors.textTertiary, marginBottom: 2 }}>
                    Counted Value
                  </AppText>
                  <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>
                    {formatCurrency(item.countedValue)}
                  </AppText>
                </View>

                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <AppText style={{ fontSize: 11, color: colors.textTertiary, marginBottom: 2 }}>
                    Variance
                  </AppText>
                  <AppText
                    style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: isOverstock
                        ? colors.success
                        : isUnderstock
                          ? colors.error
                          : colors.textSecondary,
                    }}
                  >
                    {isOverstock ? '+' : ''}
                    {formatCurrency(varianceValue)}
                  </AppText>
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 4,
                  paddingTop: 8,
                  borderTopWidth: 1,
                  borderTopColor: colors.divider,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="calendar-outline" size={12} color={colors.textTertiary} />
                  <AppText style={{ fontSize: 11, color: colors.textTertiary }}>
                    {formatDateSafe(item.date)}
                  </AppText>
                </View>

                {item.status === 'APPROVED' && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="shield-checkmark" size={12} color={colors.success} />
                    <AppText style={{ fontSize: 10, color: colors.textTertiary }}>
                      Approved by {item.approvedById || 'Manager'}
                    </AppText>
                  </View>
                )}
              </View>
            </ListingItemCard>
          );
        }}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        loading={loading}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        emptyState={{
          title:
            searchQuery || activeFilterCount > 0 ? 'No stock counts found' : 'No stock counts yet',
          description:
            searchQuery || activeFilterCount > 0
              ? 'Try adjusting your search criteria or filters.'
              : 'Tap the + button below to create your first stock count.',
          icon: searchQuery || activeFilterCount > 0 ? 'search-outline' : 'clipboard-outline',
          actionLabel: searchQuery || activeFilterCount > 0 ? 'Clear All Filters' : undefined,
          onAction: searchQuery || activeFilterCount > 0 ? clearAllFilters : undefined,
        }}
        loadingComponent={
          <View style={styles.listContent}>
            {[...Array(6)].map((_, i) => (
              <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.skeleton }]}>
                <ActivityIndicator color={colors.primary} size="small" />
              </View>
            ))}
          </View>
        }
      />

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        sections={filterSections}
        onApply={handleApplyFilters}
        onReset={clearAllFilters}
        title="Filter Stock Counts"
        applyButtonText={`Apply${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}`}
        resetButtonText="Reset"
        showCount={true}
        maxHeight={600}
      />

      {!hideFAB && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={handleCreateStockCount}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      )}

      <StockCountDetailModal
        visible={detailModalVisible}
        stockCount={selectedStockCount}
        detailItems={detailItems}
        isLoading={isLoadingDetail}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedStockCount(null);
          setDetailItems([]);
        }}
      />

      <DayEndSummaryModal
        visible={showDayEndSummary}
        data={dayEndSummary}
        onClose={() => setShowDayEndSummary(false)}
        onProceed={() => {
          setShowDayEndSummary(false);
          setShowSettlementOptions(true);
        }}
      />

      <ConfirmationModal
        visible={showSettlementConfirm}
        title="Van Settlement"
        message="Do you want to view the van settlement?"
        confirmText="View"
        cancelText="Cancel"
        type="info"
        onCancel={() => {
          setShowSettlementConfirm(false);
          router.back();
        }}
        onConfirm={() => {
          setShowSettlementConfirm(false);
          void handleEndDayFromSettlement();
        }}
      />

      <AppModal
        visible={showSettlementOptions}
        onClose={() => setShowSettlementOptions(false)}
        position="center"
        animation="fade"
        showBackdrop={true}
        closeOnBackdropPress={true}
        showHeader={false}
      >
        <View style={{ padding: 16 }}>
          <AppText style={{ fontSize: 16, fontWeight: '800', marginBottom: 8 }}>
            Settlement Options
          </AppText>
          <AppText style={{ fontSize: 12, opacity: 0.8, marginBottom: 14 }}>
            Choose how you want to handle remaining stock.
          </AppText>

          <TouchableOpacity
            onPress={() => setCarryForwardStock(true)}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: carryForwardStock ? colors.primary : colors.border,
              backgroundColor: carryForwardStock ? colors.primary + '10' : colors.surface,
              marginBottom: 10,
            }}
          >
            <Ionicons
              name={carryForwardStock ? 'radio-button-on' : 'radio-button-off'}
              size={18}
              color={carryForwardStock ? colors.primary : colors.textSecondary}
            />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <AppText style={{ fontSize: 14, fontWeight: '700' }}>Carry Forward Stock</AppText>
              <AppText style={{ fontSize: 12, opacity: 0.75 }}>
                Keep remaining stock in van for next day.
              </AppText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCarryForwardStock(false)}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: !carryForwardStock ? colors.primary : colors.border,
              backgroundColor: !carryForwardStock ? colors.primary + '10' : colors.surface,
            }}
          >
            <Ionicons
              name={!carryForwardStock ? 'radio-button-on' : 'radio-button-off'}
              size={18}
              color={!carryForwardStock ? colors.primary : colors.textSecondary}
            />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <AppText style={{ fontSize: 14, fontWeight: '700' }}>Unload Stock</AppText>
              <AppText style={{ fontSize: 12, opacity: 0.75 }}>
                Return all remaining stock to warehouse.
              </AppText>
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <TouchableOpacity
              onPress={() => {
                setShowSettlementOptions(false);
                setShowDayEndSummary(true);
              }}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
              }}
            >
              <AppText style={{ fontWeight: '700', color: colors.textSecondary }}>Back</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowSettlementOptions(false);
                setShowFinalConfirm(true);
              }}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: colors.primary,
                alignItems: 'center',
              }}
            >
              <AppText style={{ fontWeight: '800', color: '#fff' }}>Continue</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </AppModal>

      <ConfirmationModal
        visible={showFinalConfirm}
        title="Final Confirmation"
        message={
          carryForwardStock
            ? 'Confirm van settlement with Carry Forward Stock?'
            : 'Confirm van settlement with Unload Stock?'
        }
        confirmText="Submit"
        cancelText="Cancel"
        type="warning"
        onCancel={() => setShowFinalConfirm(false)}
        onConfirm={() => void submitDayEnd()}
      />
    </View>
  );
}
