import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { SearchBar, OutletCard } from '../components/outlet';
import { useOutletsScreenStyles } from '../styles/OutletsScreen.styles';
import { storage, StorageKeys } from '@/core/storage';
import { ApiResponse } from '@/core/network';
import { EmptyState } from '@/core/components/EmptyState';
import { FilterModal } from '@/shared/components/models/Filter.modal';
import { useFilterContext } from '@/shared/contexts/FilterContext';
import { useAuthStore } from '@/core/store/auth.store';
import { outletService } from '../services/outlet.service';
import { useOutletStore } from '@/core/store/outlet.store';
import { toast } from '@/shared/utils/toast';
import { useRouteStore } from '@/core/store/route.store';
import { useHeader } from '@/shared/contexts/HeaderContext';

const LIMIT = 10;

export default function OutletsScreen() {
  const { setHeader } = useHeader();
  const { colors } = useTheme();
  const styles = useOutletsScreenStyles();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [routeOutlets, setRouteOutlets] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [showFilters, setShowFilters] = useState(false);
  const route = useRouteStore((s) => s.selectedRoute);
  const activeVisit = useOutletStore((s) => s.activeVisit);

  const { setOpenOutletFilterHandler, updateOutletsFilterCount, resetOutletsFilterCount } =
    useFilterContext();

  const [filters, setFilters] = useState<any>({
    status: [],
    types: [],
    categories: [],
    tags: [],
    creditRange: { min: '', max: '' },
    // overdue: false,
    // nearby: false,
    visited: '',
  });

  /* ================= REGISTER FILTER HANDLER ================= */

  useEffect(() => {
    setOpenOutletFilterHandler(() => {
      setShowFilters(true);
    });

    return () => {
      setOpenOutletFilterHandler(() => {});
    };
  }, []);

  /* ================= FILTER SECTIONS ================= */

  const filterSections: any = useMemo(() => {
    return [
      {
        id: 'status',
        title: 'Status',
        type: 'multiple',
        options: [
          { id: 'ACTIVE', label: 'Active' },
          { id: 'INACTIVE', label: 'Inactive' },
        ],
        selectedIds: filters.status,
      },
      // {
      //   id: 'types',
      //   title: 'Customer Type',
      //   type: 'multiple',
      //   options: [
      //     { id: 'OUT001', label: 'Retail' },
      //     { id: 'OUT002', label: 'Wholesale' },
      //     { id: 'OUT003', label: 'Distributor' },
      //   ],
      //   selectedIds: filters.types,
      // },
      // {
      //   id: 'location',
      //   title: 'Location',
      //   type: 'multiple',
      //   options: [
      //     { id: 'nearby', label: 'Nearby' },
      //     { id: 'overdue', label: 'Overdue' },
      //   ],
      //   selectedIds: [
      //     ...(filters.nearby ? ['nearby'] : []),
      //     ...(filters.overdue ? ['overdue'] : []),
      //   ],
      // },
    ];
  }, [filters]);

  useFocusEffect(
    useCallback(() => {
      setHeader({
        title: 'Outlets',
        showMenu: true,
        showFilter: true,
        onFilterPress: () => setShowFilters(true),
      });
    }, []),
  );

  /* ================= API CALL ================= */

  const getRouteOutlets = async (pageNumber = 1, isRefresh = false) => {
    try {
      console.log(route, '===============route=============');
      if (!route?.routeId) return;

      const payload = {
        routeId: route?.routeId,
        page: pageNumber,
        limit: LIMIT,
        searchText: searchQuery,
        filters,
        routeSessionId: route?.routeSessionId,
      };

      const response: ApiResponse<any> = await outletService.getRouteOutlets(payload);

      if (response.statusCode === 200) {
        const newData = response.data || [];

        setRouteOutlets((prev) => (isRefresh ? newData : [...prev, ...newData]));

        setHasMore(newData.length === LIMIT);
        setPage(pageNumber);
      }
    } catch (e) {
      console.log('Pagination error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ================= EFFECTS ================= */

  useFocusEffect(
    useCallback(() => {
      // ✅ Only run when screen comes into focus
      getRouteOutlets(1, true);

      // optional cleanup (not required here)
      return () => {};
    }, [route]),
  );

  // Search + Filters
  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      setRouteOutlets([]);
      getRouteOutlets(1, true);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery, filters]);

  /* ================= HANDLERS ================= */

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setRouteOutlets([]);
    getRouteOutlets(1, true);
  }, []);

  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    getRouteOutlets(page + 1);
  };

  const handleApplyFilters = useCallback(
    (sections: any[]) => {
      const newFilters = { ...filters };
      let count = 0;

      sections.forEach((section) => {
        if (section.selectedIds?.length) {
          count += section.selectedIds.length;
        }

        switch (section.id) {
          case 'status':
            newFilters.status = section.selectedIds || [];
            break;
          case 'types':
            newFilters.types = section.selectedIds || [];
            break;
          case 'location':
            newFilters.nearby = section.selectedIds?.includes('nearby');
            newFilters.overdue = section.selectedIds?.includes('overdue');
            break;
        }
      });

      updateOutletsFilterCount(count); // ✅ badge sync

      setPage(1);
      setRouteOutlets([]);
      setFilters(newFilters);
      setShowFilters(false);
    },
    [filters],
  );

  const clearAllFilters = useCallback(() => {
    resetOutletsFilterCount(); // ✅ reset badge

    setPage(1);
    setRouteOutlets([]);

    setFilters({
      status: [],
      types: [],
      categories: [],
      tags: [],
      creditRange: { min: '', max: '' },
      // overdue: false,
      // nearby: false,
      visited: '',
    });

    setSearchQuery('');
    setShowFilters(false);
  }, []);

  const renderFooter = () => {
    if (!loading) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.primary} size="small" />
      </View>
    );
  };

  /* ================= UI ================= */

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchWrapper}>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </View>

      {routeOutlets.length === 0 && !loading ? (
        <EmptyState
          title="No items found"
          description="Try adjusting your filters"
          icon="folder-open-outline"
          actionLabel="Clear Filtes"
          onAction={clearAllFilters}
        />
      ) : (
        <FlatList
          data={routeOutlets}
          keyExtractor={(item) => item.customerId}
          renderItem={({ item, index }) => <OutletCard outlet={item} index={index} />}
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
        title="Filter Customers"
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/customers/add')}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
