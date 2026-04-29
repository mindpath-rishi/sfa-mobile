// app/topup/index.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { useTheme } from '@/shared/hooks/useTheme';
import { FilterModal } from '@/shared/components/models/Filter.modal';
import { toast } from '@/shared/utils/toast';
import { vanService } from '@/shared/services/van.service';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useFilterContext } from '@/shared/contexts/FilterContext';
import { FilterSection } from '@/shared/types/filter.types';
import { useAuthStore } from '@/core/store/auth.store';
import {
  PAGINATION,
  DEBOUNCE_DELAY,
  MESSAGES,
  DEFAULT_FILTERS,
  FILTER_SECTIONS,
  HEADER,
  TOPUP_STATUS_OPTIONS,
} from '../constants/topup.constants';
import { useTopupStyles } from '../styles/topupScreen.styles';
import { Topup } from '../types/topup.types';
import { TopupList } from '../components/TopupList';


interface TopupScreenProps {
  vanId?: string;
  hideFAB?: boolean;
  hideSearch?: boolean;
  hideFilters?: boolean;
}

export default function TopupScreen({
  vanId,
  hideFAB = false,
  hideFilters = false,
}: TopupScreenProps) {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const styles = useTopupStyles();

  const { setHeader } = useHeader();
  const {
    updateTopupFilterCount,
    resetTopupFilterCount,
    setOpenTopupFilterHandler,
  } = useFilterContext();

  const [topups, setTopups] = useState<Topup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState<any>(PAGINATION.DEFAULT_PAGE);
  const [hasMore, setHasMore] = useState(true);

  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  /* -------------------- Header -------------------- */
  useFocusEffect(
    useCallback(() => {
      setHeader({
        showFilter: true,
        onFilterPress: () => setShowFilters(true),
        rightIcon: HEADER.RIGHT_ICON,
        onRightPress: () => handleCreateTopup(),
        title: HEADER.TITLE,
      });
    }, [setHeader])
  );

  /* -------------------- API -------------------- */
  const getTopups = async (
    pageNumber = PAGINATION.DEFAULT_PAGE,
    isRefresh = false
  ) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (pageNumber === PAGINATION.DEFAULT_PAGE) setLoading(true);

      const payload: any = {
        page: pageNumber,
        limit: PAGINATION.LIMIT,
        vanId: vanId || user?.vanId,
        employeeId: user?.userId,
      };

      if (searchQuery) payload.searchText = searchQuery;
      if (filters.status.length) payload.status = filters.status;
      if (filters.dateRange.start) payload.startDate = filters.dateRange.start;
      if (filters.dateRange.end) payload.endDate = filters.dateRange.end;
      if (filters.minValue) payload.minValue = parseFloat(filters.minValue);
      if (filters.maxValue) payload.maxValue = parseFloat(filters.maxValue);

      const res = await vanService.fetchInventoryTopupRequests(payload);
      const newData = res?.data?.data || res?.data || [];

      if (pageNumber === PAGINATION.DEFAULT_PAGE) setTopups(newData);
      else setTopups((prev) => [...prev, ...newData]);

      setHasMore(newData.length === PAGINATION.LIMIT);
      setPage(pageNumber);
    } catch {
      toast.error(MESSAGES.LOAD_ERROR);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* -------------------- Initial Load -------------------- */
  useEffect(() => {
    getTopups(PAGINATION.DEFAULT_PAGE, true);
  }, []);

  /* -------------------- Search + Filters -------------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(PAGINATION.DEFAULT_PAGE);
      setTopups([]);
      getTopups(PAGINATION.DEFAULT_PAGE, true);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  /* -------------------- Refresh -------------------- */
  const onRefresh = useCallback(() => {
    setPage(PAGINATION.DEFAULT_PAGE);
    setTopups([]);
    getTopups(PAGINATION.DEFAULT_PAGE, true);
  }, []);

  /* -------------------- Pagination -------------------- */
  const handleLoadMore = () => {
    if (!hasMore || loading || refreshing) return;
    getTopups(page + 1);
  };

  /* -------------------- Filters -------------------- */
  const filterSections: FilterSection[] = [
    {
      id: FILTER_SECTIONS.STATUS.id,
      title: FILTER_SECTIONS.STATUS.title,
      type: FILTER_SECTIONS.STATUS.type,
      options: TOPUP_STATUS_OPTIONS,
      selectedIds: filters.status,
    },
    {
      id: FILTER_SECTIONS.DATE_RANGE.id,
      title: FILTER_SECTIONS.DATE_RANGE.title,
      type: FILTER_SECTIONS.DATE_RANGE.type,
      rangeValue: {
        min: filters.dateRange.start,
        max: filters.dateRange.end,
      },
    },
    {
      id: FILTER_SECTIONS.VALUE_RANGE.id,
      title: FILTER_SECTIONS.VALUE_RANGE.title,
      type: FILTER_SECTIONS.VALUE_RANGE.type,
      rangeValue: {
        min: filters.minValue,
        max: filters.maxValue,
      },
    },
  ];

  const handleApplyFilters = (sections: FilterSection[]) => {
    const newFilters: any = { ...DEFAULT_FILTERS };

    sections.forEach((s) => {
      if (s.id === FILTER_SECTIONS.STATUS.id)
        newFilters.status = s.selectedIds || [];
      if (s.id === FILTER_SECTIONS.DATE_RANGE.id && s.rangeValue) {
        newFilters.dateRange = {
          start: s.rangeValue.min || '',
          end: s.rangeValue.max || '',
        };
      }
      if (s.id === FILTER_SECTIONS.VALUE_RANGE.id && s.rangeValue) {
        newFilters.minValue = s.rangeValue.min || '';
        newFilters.maxValue = s.rangeValue.max || '';
      }
    });

    setFilters(newFilters);
    setShowFilters(false);
  };

  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery('');
    resetTopupFilterCount();
    getTopups(PAGINATION.DEFAULT_PAGE, true);
  };

  /* -------------------- Filter Chips -------------------- */
  const filterChips = useMemo(() => {
    const chips = [];

    // Status chips
    chips.push(
      ...filters.status.map((status) => ({
        id: `status-${status}`,
        label: `Status: ${status}`,
        onRemove: () =>
          setFilters((prev) => ({
            ...prev,
            status: prev.status.filter((s) => s !== status),
          })),
      }))
    );

    // Date range chip
    if (filters.dateRange.start || filters.dateRange.end) {
      chips.push({
        id: 'dateRange',
        label: `Date: ${filters.dateRange.start || 'any'} - ${
          filters.dateRange.end || 'any'
        }`,
        onRemove: () =>
          setFilters((prev) => ({
            ...prev,
            dateRange: { start: '', end: '' },
          })),
      });
    }

    // Value range chip
    if (filters.minValue || filters.maxValue) {
      chips.push({
        id: 'valueRange',
        label: `Value: ${filters.minValue || '0'} - ${
          filters.maxValue || '∞'
        } ZMW`,
        onRemove: () =>
          setFilters((prev) => ({
            ...prev,
            minValue: '',
            maxValue: '',
          })),
      });
    }

    return chips;
  }, [filters]);

  /* -------------------- Create Topup -------------------- */
  const handleCreateTopup = () => {
    router.push('/topup/create');
  };

  /* -------------------- Filter Count -------------------- */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status.length) count += filters.status.length;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.minValue || filters.maxValue) count++;
    if (searchQuery) count++;
    return count;
  }, [filters, searchQuery]);

  // Update filter count in context
  useEffect(() => {
    updateTopupFilterCount(activeFilterCount);
  }, [activeFilterCount, updateTopupFilterCount]);

  // Register filter handler for context
  useEffect(() => {
    if (!hideFilters) {
      setOpenTopupFilterHandler(() => setShowFilters(true));
    }
    return () => {
      if (!hideFilters) {
        setOpenTopupFilterHandler(() => {});
      }
    };
  }, [hideFilters, setOpenTopupFilterHandler]);

  return (
    <View style={styles.container}>
      <TopupList
        data={topups}
        loading={loading}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={handleLoadMore}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterChips={filterChips}
        clearAllFilters={clearAllFilters}
        activeFilterCount={activeFilterCount}
      />

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        sections={filterSections}
        onApply={handleApplyFilters}
        onReset={clearAllFilters}
        title="Filter Top-ups"
        applyButtonText={`Apply${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}`}
        resetButtonText="Reset"
        showCount={true}
        maxHeight={600}
      />
    </View>
  );
}