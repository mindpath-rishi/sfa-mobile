import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { CustomerCard, SearchBar, EmptyState } from '../components/customer';
import { CUSTOMERS_DATA } from '../constants/mockData';
import { useCustomersScreenStyles } from '../styles/CustomersScreen.styles';
import { ViewMode, Customer } from '../types/customer.types';
import { FilterModal } from '@/shared/components/models/Filter.modal';
import { useFilterContext } from '@/shared/contexts/FilterContext';

// Constants
const LOAD_MORE_THRESHOLD = 0.5;
const INITIAL_VIEW_MODE: ViewMode = 'list';

// Types
interface QuickFilter {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
}

interface FilterState {
  status: string[];
  types: string[];
  categories: string[];
  tags: string[];
  creditRange: { min: string; max: string };
  overdue: boolean;
  nearby: boolean;
  visited: string; // 'today' | 'week' | 'month' | 'overdue'
}

export default function CustomersScreen() {
  const { colors } = useTheme();
  const styles = useCustomersScreenStyles();
  const params = useLocalSearchParams();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    types: [],
    categories: [],
    tags: [],
    creditRange: { min: '', max: '' },
    overdue: false,
    nearby: false,
    visited: '',
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(INITIAL_VIEW_MODE);
  const [showFilters, setShowFilters] = useState(false);

  // Auto-open filters if URL param is present
  useEffect(() => {
    if (params.openFilters === 'true') {
      setShowFilters(true);
      router.setParams({ openFilters: undefined });
    }
  }, [params.openFilters]);

  // Memoized data
  const customerTypes = useMemo(() => [...new Set(CUSTOMERS_DATA.map((c) => c.type))].sort(), []);
  const customerCategories = useMemo(
    () => [...new Set(CUSTOMERS_DATA.map((c) => c.category))].sort(),
    [],
  );
  const allTags = useMemo(() => [...new Set(CUSTOMERS_DATA.flatMap((c) => c.tags))].sort(), []);

  // Filter sections for modal
  const filterSections = useMemo(
    (): any[] => [
      {
        id: 'status',
        title: 'Customer Status',
        type: 'multiple',
        icon: 'checkmark-circle-outline',
        options: [
          {
            id: 'active',
            label: 'Active',
            count: CUSTOMERS_DATA.filter((c) => c.status === 'active').length,
          },
          {
            id: 'inactive',
            label: 'Inactive',
            count: CUSTOMERS_DATA.filter((c) => c.status === 'inactive').length,
          },
        ],
        selectedIds: filters.status,
      },
      {
        id: 'types',
        title: 'Customer Type',
        type: 'multiple',
        icon: 'business-outline',
        options: customerTypes.map((type) => ({
          id: type,
          label: type,
          count: CUSTOMERS_DATA.filter((c) => c.type === type).length,
        })),
        selectedIds: filters.types,
      },
      {
        id: 'categories',
        title: 'Business Category',
        type: 'multiple',
        icon: 'apps-outline',
        options: customerCategories.map((cat) => ({
          id: cat,
          label: cat,
          count: CUSTOMERS_DATA.filter((c) => c.category === cat).length,
        })),
        selectedIds: filters.categories,
      },
      {
        id: 'tags',
        title: 'Tags',
        type: 'multiple',
        icon: 'pricetag-outline',
        options: allTags.map((tag) => ({
          id: tag,
          label: tag,
          count: CUSTOMERS_DATA.filter((c) => c.tags.includes(tag)).length,
        })),
        selectedIds: filters.tags,
      },
      {
        id: 'credit',
        title: 'Credit Limit (₹)',
        type: 'range',
        icon: 'cash-outline',
        rangeValue: filters.creditRange,
        min: 0,
        max: 500000,
      },
      {
        id: 'visited',
        title: 'Last Visit',
        type: 'single',
        icon: 'calendar-outline',
        options: [
          { id: 'today', label: 'Today', count: 5 },
          { id: 'week', label: 'This Week', count: 15 },
          { id: 'month', label: 'This Month', count: 32 },
          { id: 'overdue', label: 'Overdue Visit', count: 8 },
        ],
        selectedId: filters.visited,
      },
      {
        id: 'location',
        title: 'Location',
        type: 'multiple',
        icon: 'location-outline',
        options: [
          {
            id: 'nearby',
            label: 'Nearby (< 2km)',
            count: CUSTOMERS_DATA.filter((c) => parseFloat(c.distance) < 2).length,
          },
          {
            id: 'overdue',
            label: 'Overdue Only',
            count: CUSTOMERS_DATA.filter((c) => c.tags.includes('Overdue')).length,
          },
        ],
        selectedIds: [
          ...(filters.nearby ? ['nearby'] : []),
          ...(filters.overdue ? ['overdue'] : []),
        ],
      },
    ],
    [customerTypes, customerCategories, allTags, filters],
  );

  // Quick filters
  const quickFilters: QuickFilter[] = useMemo(
    () => [
      {
        id: 'active',
        label: 'Active',
        icon: 'checkmark-circle',
        active: filters.status.includes('active'),
      },
      {
        id: 'overdue',
        label: 'Overdue',
        icon: 'alert-circle',
        active: filters.overdue,
      },
      {
        id: 'high-value',
        label: 'High Value',
        icon: 'star',
        active: filters.tags.includes('High Value'),
      },
    ],
    [filters.status, filters.overdue, filters.tags],
  );

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return CUSTOMERS_DATA.filter((customer) => {
      // Status filter
      if (filters.status.length && !filters.status.includes(customer.status)) {
        return false;
      }

      // Type filter
      if (filters.types.length && !filters.types.includes(customer.type)) {
        return false;
      }

      // Category filter
      if (filters.categories.length && !filters.categories.includes(customer.category)) {
        return false;
      }

      // Tags filter
      if (filters.tags.length && !filters.tags.some((tag) => customer.tags.includes(tag))) {
        return false;
      }

      // Credit limit filter
      const creditValue = parseFloat(customer.creditLimit.replace(/[^0-9.-]+/g, ''));
      if (filters.creditRange.min && creditValue < parseFloat(filters.creditRange.min)) {
        return false;
      }
      if (filters.creditRange.max && creditValue > parseFloat(filters.creditRange.max)) {
        return false;
      }

      // Overdue filter
      if (filters.overdue && !customer.tags.includes('Overdue')) {
        return false;
      }

      // Nearby filter
      if (filters.nearby && parseFloat(customer.distance) >= 2) {
        return false;
      }

      // Visit filter
      if (filters.visited) {
        // Simplified for demo - in real app, implement proper date filtering
        if (filters.visited === 'overdue') {
          if (new Date(customer.nextVisit) >= new Date()) return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return (
          customer.name.toLowerCase().includes(query) ||
          customer.owner.toLowerCase().includes(query) ||
          customer.location.toLowerCase().includes(query) ||
          customer.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [filters, searchQuery]);

  // Active filters count
  const activeFiltersCount = useMemo(
    () =>
      filters.status.length +
      filters.types.length +
      filters.categories.length +
      filters.tags.length +
      (filters.creditRange.min || filters.creditRange.max ? 1 : 0) +
      (filters.overdue ? 1 : 0) +
      (filters.nearby ? 1 : 0) +
      (filters.visited ? 1 : 0) +
      (searchQuery ? 1 : 0),
    [filters, searchQuery],
  );

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleLoadMore = () => {
    if (!loading && filteredCustomers.length >= 10) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const toggleQuickFilter = useCallback((filter: QuickFilter) => {
    switch (filter.id) {
      case 'active':
        setFilters((prev) => ({
          ...prev,
          status: prev.status.includes('active')
            ? prev.status.filter((s) => s !== 'active')
            : [...prev.status, 'active'],
        }));
        break;
      case 'overdue':
        setFilters((prev) => ({ ...prev, overdue: !prev.overdue }));
        break;
      case 'high-value':
        setFilters((prev) => ({
          ...prev,
          tags: prev.tags.includes('High Value')
            ? prev.tags.filter((t) => t !== 'High Value')
            : [...prev.tags, 'High Value'],
        }));
        break;
    }
  }, []);

  const handleApplyFilters = useCallback(
    (sections: any[]) => {
      const newFilters: FilterState = { ...filters };

      sections.forEach((section) => {
        switch (section.id) {
          case 'status':
            newFilters.status = section.selectedIds || [];
            break;
          case 'types':
            newFilters.types = section.selectedIds || [];
            break;
          case 'categories':
            newFilters.categories = section.selectedIds || [];
            break;
          case 'tags':
            newFilters.tags = section.selectedIds || [];
            break;
          case 'credit':
            newFilters.creditRange = section.rangeValue || { min: '', max: '' };
            break;
          case 'visited':
            newFilters.visited = section.selectedId || '';
            break;
          case 'location':
            newFilters.nearby = section.selectedIds?.includes('nearby') || false;
            newFilters.overdue = section.selectedIds?.includes('overdue') || false;
            break;
        }
      });

      setFilters(newFilters);
      setShowFilters(false);
    },
    [filters],
  );

  const handleCloseFilters = useCallback(() => {
    setShowFilters(false);
    router.setParams({ openFilters: undefined });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      status: [],
      types: [],
      categories: [],
      tags: [],
      creditRange: { min: '', max: '' },
      overdue: false,
      nearby: false,
      visited: '',
    });
    setSearchQuery('');
    setShowFilters(false);
    router.setParams({ openFilters: undefined });
  }, []);

  // Render functions
  const renderQuickFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.quickFiltersContainer}
      contentContainerStyle={styles.quickFiltersContent}
    >
      {quickFilters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[styles.quickFilterChip, filter.active && styles.quickFilterChipActive]}
          onPress={() => toggleQuickFilter(filter)}
        >
          <Ionicons
            name={filter.icon}
            size={16}
            color={filter.active ? 'white' : colors.textSecondary}
          />
          <Text style={[styles.quickFilterText, filter.active && styles.quickFilterTextActive]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={48} color={colors.textTertiary} />
      <Text style={styles.emptyStateTitle}>No customers found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery ? `No matches for "${searchQuery}"` : 'Try changing your filters'}
      </Text>
      {/* {activeFiltersCount > 0 && (
        <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
          <Text style={[styles.clearFiltersText, { color: colors.primary }]}>Clear filters</Text>
        </TouchableOpacity>
      )} */}
    </View>
  );

  const renderFooter = () =>
    loading ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.primary} size="small" />
      </View>
    ) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Filter Button */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Customers</Text>
        <TouchableOpacity
          style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={activeFiltersCount > 0 ? colors.primary : colors.textPrimary}
          />
          {activeFiltersCount > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View> */}
      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </View>
      {/* Quick Filters */}
      {renderQuickFilters()}
      {/* Customer List - FlatList instead of SectionList */}
      {filteredCustomers.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <CustomerCard customer={item} index={index} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={LOAD_MORE_THRESHOLD}
          ListFooterComponent={renderFooter}
          numColumns={viewMode === 'grid' ? 2 : 1}
        />
      )}
      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={handleCloseFilters}
        sections={filterSections}
        onApply={handleApplyFilters}
        onReset={clearAllFilters}
        title="Filter Customers"
        applyButtonText={`Show ${filteredCustomers.length} customers`}
        resetButtonText="Reset"
        showCount={true}
        maxHeight={600}
      />
      {/* Floating Action Button */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            ...Platform.select({
              ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              },
              android: {
                elevation: 8,
              },
            }),
          },
        ]}
        onPress={() => router.push('/customers/add')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
