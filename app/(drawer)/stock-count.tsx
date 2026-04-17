// app/(app)/stock-count/index.tsx
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';

import { EmptyState } from '@/core/components/EmptyState';
import { FilterModal } from '@/shared/components/models/Filter.modal';
import { useFilterContext } from '@/shared/contexts/FilterContext';
import { useAuthStore } from '@/core/store/auth.store';
import { toast } from '@/shared/utils/toast';
import { useRouteStore } from '@/core/store/route.store';
import { stockCountService } from '@/shared/services/stock-count.service';
import { useStockCountStyles } from '@/shared/styles/StockCount.styles';
import { SearchBar } from '@/features/outlet';
import { StockCountCard } from '@/shared/components/StockCountCart';
import { StockCountDetailModal } from '@/shared/components/StockCountDetailModal';

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
  const [loading, setLoading] = useState(false);
  const [stockCounts, setStockCounts] = useState<StockCountItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStockCount, setSelectedStockCount] = useState<StockCountItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailItems, setDetailItems] = useState<any[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const { user } = useAuthStore();
  const { selectedRoute: route } = useRouteStore();

  const { setOpenStockCountFilterHandler, updateStockCountFilterCount, resetStockCountFilterCount } = useFilterContext();

  const [filters, setFilters] = useState({
    status: [] as string[],
  });

  // Register filter handler
  useEffect(() => {
    if (!hideFilters) {
      setOpenStockCountFilterHandler(() => setShowFilters(true));
    }
    return () => {
      if (!hideFilters) setOpenStockCountFilterHandler(() => {});
    };
  }, [hideFilters]);

  // Filter sections
  const filterSections: any = useMemo(() => [
    {
      id: 'status',
      title: 'Status',
      type: 'multiple',
      options: [
        { id: 'DRAFT', label: 'Draft' },
        { id: 'IN_PROGRESS', label: 'In Progress' },
        { id: 'SUBMITTED', label: 'Submitted' },
        { id: 'APPROVED', label: 'Approved' },
        { id: 'REJECTED', label: 'Rejected' },
      ],
      selectedIds: filters.status,
    },
  ], [filters]);

  // Fetch stock counts
  const getStockCounts = async (pageNumber = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const payload: any = {
        page: pageNumber,
        limit: LIMIT,
        filters,
        vanId: vanId || user?.vanId,
        employeeId: user?.userId,
      };

      if (searchQuery) payload.searchText = searchQuery;

      const response = await stockCountService.fetchStockCounts(payload);
      const apiData = response?.data;
      const newData = apiData?.data || apiData?.items || apiData || [];
      const total = apiData?.meta?.total || apiData?.total || apiData?.count || newData.length;

      if (pageNumber === 1) {
        setStockCounts(newData);
      } else {
        setStockCounts(prev => [...prev, ...newData]);
      }
      
      setHasMore(newData.length === LIMIT && total > pageNumber * LIMIT);
      setPage(pageNumber);
    } catch (e) {
      console.log('Error fetching stock counts:', e);
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
    }, [route, user, vanId])
  );

  // Handle search & filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setStockCounts([]);
      getStockCounts(1, true);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, filters, vanId]);

  // Handlers
  const onRefresh = useCallback(() => {
    setPage(1);
    setStockCounts([]);
    getStockCounts(1, true);
  }, []);

  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    getStockCounts(page + 1);
  };

  const handleApplyFilters = useCallback((sections: any[]) => {
    const newFilters = { status: [] as string[] };
    let count = 0;

    sections.forEach(section => {
      if (section.selectedIds?.length) count += section.selectedIds.length;
      if (section.id === 'status') newFilters.status = section.selectedIds || [];
    });

    updateStockCountFilterCount(count);
    setFilters(newFilters);
    setShowFilters(false);
    setPage(1);
    setStockCounts([]);
    getStockCounts(1, true);
  }, []);

  const clearAllFilters = useCallback(() => {
    resetStockCountFilterCount();
    setFilters({ status: [] });
    setSearchQuery('');
    setShowFilters(false);
    setPage(1);
    setStockCounts([]);
    getStockCounts(1, true);
  }, []);

  const handleViewDetails = async (item: StockCountItem) => {
    setSelectedStockCount(item);
    setDetailModalVisible(true);
    try {
      setIsLoadingDetail(true);
      const response = await stockCountService.fetchStockCountItems(item.stockCountId);
      const items = response?.data?.items || response?.data || [];
      setDetailItems(items);
    } catch (error) {
      console.log('Error fetching details:', error);
      toast.error('Failed to load stock count details');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCreateStockCount = useCallback(() => {
    router.push('/stock-count/create');
  }, []);

  const renderFooter = () => (
    loading && stockCounts.length > 0 ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.primary} size="small" />
      </View>
    ) : null
  );

  const renderEmptyState = () => (
    <EmptyState
      title={searchQuery ? "No stock counts found" : "No stock counts yet"}
      description={searchQuery 
        ? "Try adjusting your search criteria or filters." 
        : "Tap the + button below to start your first stock count."}
      icon={searchQuery ? "search-outline" : "clipboard-outline"}
      actionLabel={searchQuery ? "Clear Search" : undefined}
      onAction={searchQuery ? () => setSearchQuery('') : undefined}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!hideSearch && (
        <View style={styles.searchWrapper}>
          <SearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
            placeholder="Search by ID or van..."
          />
        </View>
      )}

      {stockCounts.length === 0 && !loading ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={stockCounts}
          keyExtractor={(item) => item.stockCountId}
          renderItem={({ item, index }) => (
            <StockCountCard
              stockCount={item} 
              index={index} 
              onPress={() => handleViewDetails(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        sections={filterSections}
        onApply={handleApplyFilters}
        onReset={clearAllFilters}
        title="Filter Stock Counts"
        applyButtonText="Apply"
        resetButtonText="Reset"
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
    </View>
  );
}