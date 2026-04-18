// import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
// import {
//   View,
//   FlatList,
//   TouchableOpacity,
//   RefreshControl,
//   ActivityIndicator,
//   Text,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { router, useFocusEffect } from 'expo-router';
// import { useTheme } from '@/shared/hooks/useTheme';

// import { EmptyState } from '@/core/components/EmptyState';
// import { FilterModal } from '@/shared/components/models/Filter.modal';
// import { useAuthStore } from '@/core/store/auth.store';
// import { toast } from '@/shared/utils/toast';
// import { useRouteStore } from '@/core/store/route.store';
// import { vanService } from '@/shared/services/van.service';
// import { SearchBar } from '@/features/outlet';
// import { TopupCardSkeleton } from '@/shared/components/TopupCardSkeleton';
// import { TopupCard } from '@/shared/components/TopupCart';
// import { FilterSection } from '@/shared/types/filter.types';
// import { useTopupStyles } from '@/shared/styles/Topup.styles';
// import { useHeader } from '@/shared/contexts/HeaderContext';

// const LIMIT = 15;

// interface TopupItem {
//   vanInventoryTopupId: string;
//   vanId: string;
//   vanName: string;
//   employeeId: string;
//   employeeName?: string;
//   warehouseId: string;
//   date: string;
//   totalRequestedQty: number;
//   totalRequestedWeight: number;
//   totalRequestedValue: number;
//   totalApprovedQty: number;
//   totalApprovedWeight: number;
//   totalApprovedValue: number;
//   totalRequestedPieces: number;
//   totalRequestedCases: number;
//   totalApprovedPieces: number;
//   totalApprovedCases: number;
//   remark?: string;
//   status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
//   approvedByName?: string;
//   approvedAt?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// interface TopupScreenProps {
//   hideFAB?: boolean;
//   hideSearch?: boolean;
//   hideFilters?: boolean;
//   vanId?: string;
// }

// export default function TopupScreen({
//   hideFAB = false,
//   hideSearch = false,
//   hideFilters = false,
//   vanId,
// }: TopupScreenProps) {
//   const { colors } = useTheme();
//   const styles = useTopupStyles();

//   const [searchQuery, setSearchQuery] = useState('');
//   const [refreshing, setRefreshing] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [topups, setTopups] = useState<TopupItem[]>([]);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [showFilters, setShowFilters] = useState(false);

//   const { user } = useAuthStore();
//   const { selectedRoute: route } = useRouteStore();
//   const { setHeader } = useHeader();

//   const [filters, setFilters] = useState({
//     status: [] as string[],
//     dateRange: { start: '', end: '' },
//     minValue: '',
//     maxValue: '',
//   });

//   // Set up header with filter button
//   useFocusEffect(
//     useCallback(() => {
//       console.log("===============95============")
//       setHeader({
//         showFilter: true,
//         onFilterPress: () => setShowFilters(true),
//         rightIcon: 'plus',
//         onRightPress: () => handleCreateTopup()
//       });
//     }, [setHeader]),
//   );

//   // Filter sections
//   const filterSections = useMemo((): FilterSection[] => {
//     const sections: FilterSection[] = [];

//     // Status filter section
//     sections.push({
//       id: 'status',
//       title: 'Status',
//       type: 'multiple',
//       options: [
//         { id: 'DRAFT', label: 'Draft', count: topups.filter((t) => t.status === 'DRAFT').length },
//         {
//           id: 'SUBMITTED',
//           label: 'Submitted',
//           count: topups.filter((t) => t.status === 'SUBMITTED').length,
//         },
//         {
//           id: 'APPROVED',
//           label: 'Approved',
//           count: topups.filter((t) => t.status === 'APPROVED').length,
//         },
//         {
//           id: 'REJECTED',
//           label: 'Rejected',
//           count: topups.filter((t) => t.status === 'REJECTED').length,
//         },
//       ],
//       selectedIds: filters.status,
//     });

//     // Date range filter
//     sections.push({
//       id: 'dateRange',
//       title: 'Date Range',
//       type: 'range',
//       rangeValue: {
//         min: filters.dateRange.start,
//         max: filters.dateRange.end,
//       },
//     });

//     // Value range filter
//     sections.push({
//       id: 'valueRange',
//       title: 'Request Value (ZMW)',
//       type: 'range',
//       rangeValue: {
//         min: filters.minValue,
//         max: filters.maxValue,
//       },
//     });

//     return sections;
//   }, [filters, topups]);

//   // Fetch topups
//   const getTopups = async (pageNumber = 1, isRefresh = false) => {
//     try {
//       if (isRefresh) {
//         setRefreshing(true);
//       } else if (pageNumber === 1) {
//         setLoading(true);
//       }

//       const payload: any = {
//         page: pageNumber,
//         limit: LIMIT,
//         filters: {
//           status: filters.status,
//         },
//         vanId: vanId || user?.vanId,
//         employeeId: user?.userId,
//         // searchText: searchQuery
//       };

//       if (searchQuery) payload.searchText = searchQuery;

//       // Add date range filters
//       if (filters.dateRange.start) payload.startDate = filters.dateRange.start;
//       if (filters.dateRange.end) payload.endDate = filters.dateRange.end;

//       // Add value range filters
//       if (filters.minValue) payload.minValue = parseFloat(filters.minValue);
//       if (filters.maxValue) payload.maxValue = parseFloat(filters.maxValue);

//       const response = await vanService.fetchInventoryTopupRequests(payload);
//       const apiData = response?.data;
//       let newData = apiData?.data || apiData?.items || apiData || [];

//       // Apply value range filter client-side if needed (since API might not support it)
//       if (filters.minValue || filters.maxValue) {
//         const minVal = filters.minValue ? parseFloat(filters.minValue) : 0;
//         const maxVal = filters.maxValue ? parseFloat(filters.maxValue) : Infinity;
//         newData = newData.filter((item: TopupItem) => {
//           const value = item.totalRequestedValue;
//           return value >= minVal && value <= maxVal;
//         });
//       }

//       const total = apiData?.meta?.total || apiData?.total || apiData?.count || newData.length;

//       if (pageNumber === 1) {
//         setTopups(newData);
//       } else {
//         setTopups((prev) => [...prev, ...newData]);
//       }

//       setHasMore(newData.length === LIMIT && total > pageNumber * LIMIT);
//       setPage(pageNumber);
//     } catch (e) {
//       console.log('Error fetching topups:', e);
//       toast.error('Failed to load top-up requests');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // Refresh on focus
//   useFocusEffect(
//     useCallback(() => {
//       getTopups(1, true);
//     }, [route, user, vanId]),
//   );

//   // Handle search & filters
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setPage(1);
//       setTopups([]);
//       getTopups(1, true);
//     }, 300);
//     return () => clearTimeout(timer);
//   }, [
//     searchQuery,
//     filters.status,
//     filters.dateRange.start,
//     filters.dateRange.end,
//     filters.minValue,
//     filters.maxValue,
//     vanId,
//   ]);

//   // Handlers
//   const onRefresh = useCallback(() => {
//     setPage(1);
//     setTopups([]);
//     getTopups(1, true);
//   }, []);

//   const handleLoadMore = () => {
//     if (!hasMore || loading || refreshing) return;
//     getTopups(page + 1);
//   };

//   const handleApplyFilters = useCallback((sections: FilterSection[]) => {
//     const newFilters = {
//       status: [] as string[],
//       dateRange: { start: '', end: '' },
//       minValue: '',
//       maxValue: '',
//     };

//     sections.forEach((section) => {
//       if (section.id === 'status' && section.selectedIds) {
//         newFilters.status = section.selectedIds;
//       } else if (section.id === 'dateRange' && section.rangeValue) {
//         newFilters.dateRange = {
//           start: section.rangeValue.min || '',
//           end: section.rangeValue.max || '',
//         };
//       } else if (section.id === 'valueRange' && section.rangeValue) {
//         newFilters.minValue = section.rangeValue.min || '';
//         newFilters.maxValue = section.rangeValue.max || '';
//       }
//     });

//     setFilters(newFilters);
//     setShowFilters(false);
//     setPage(1);
//     setTopups([]);
//     getTopups(1, true);
//   }, []);

//   const clearAllFilters = useCallback(() => {
//     setFilters({
//       status: [],
//       dateRange: { start: '', end: '' },
//       minValue: '',
//       maxValue: '',
//     });
//     setSearchQuery('');
//     setShowFilters(false);
//     setPage(1);
//     setTopups([]);
//     getTopups(1, true);
//   }, []);

//   const handleCreateTopup = useCallback(() => {
//     router.push('/topup/create');
//   }, []);

//   // Calculate active filter count for display
//   const activeFilterCount = useMemo(() => {
//     let count = 0;
//     if (filters.status.length) count += filters.status.length;
//     if (filters.dateRange.start || filters.dateRange.end) count++;
//     if (filters.minValue || filters.maxValue) count++;
//     if (searchQuery) count++;
//     return count;
//   }, [filters, searchQuery]);

//   const renderFooter = () =>
//     loading && topups.length > 0 ? (
//       <View style={styles.footerLoader}>
//         <ActivityIndicator color={colors.primary} size="small" />
//       </View>
//     ) : null;

//   const renderEmptyState = () => (
//     <EmptyState
//       title={searchQuery || activeFilterCount > 0 ? 'No top-ups found' : 'No inventory top-ups yet'}
//       description={
//         searchQuery || activeFilterCount > 0
//           ? 'Try adjusting your search criteria or filters.'
//           : 'Tap the + button below to create your first top-up request.'
//       }
//       icon={searchQuery || activeFilterCount > 0 ? 'search-outline' : 'truck-outline'}
//       actionLabel={searchQuery || activeFilterCount > 0 ? 'Clear All Filters' : undefined}
//       onAction={searchQuery || activeFilterCount > 0 ? clearAllFilters : undefined}
//     />
//   );

//   // Render filter chips
//   const renderFilterChips = () => {
//     if (activeFilterCount === 0) return null;

//     return (
//       <View style={styles.filterChipsContainer}>
//         <FlatList
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           data={[
//             ...(searchQuery
//               ? [
//                   {
//                     id: 'search',
//                     label: `Search: ${searchQuery}`,
//                     type: 'search',
//                   },
//                 ]
//               : []),
//             ...filters.status.map((status) => ({
//               id: `status-${status}`,
//               label: `Status: ${status}`,
//               type: 'status',
//               value: status,
//             })),
//             ...(filters.dateRange.start || filters.dateRange.end
//               ? [
//                   {
//                     id: 'dateRange',
//                     label: `Date: ${filters.dateRange.start || 'any'} - ${filters.dateRange.end || 'any'}`,
//                     type: 'dateRange',
//                   },
//                 ]
//               : []),
//             ...(filters.minValue || filters.maxValue
//               ? [
//                   {
//                     id: 'valueRange',
//                     label: `Value: ${filters.minValue || '0'} - ${filters.maxValue || '∞'} ZMW`,
//                     type: 'valueRange',
//                   },
//                 ]
//               : []),
//           ]}
//           keyExtractor={(item) => item.id}
//           renderItem={({ item }) => (
//             <View style={[styles.filterChip, { backgroundColor: colors.primary + '15' }]}>
//               <Text style={[styles.filterChipText, { color: colors.primary }]}>{item.label}</Text>
//               <TouchableOpacity
//                 onPress={() => {
//                   if (item.type === 'search') {
//                     setSearchQuery('');
//                   } else if (item.type === 'status') {
//                     setFilters((prev) => ({
//                       ...prev,
//                       status: prev.status.filter((s) => s !== item.value),
//                     }));
//                     setTimeout(() => getTopups(1, true), 100);
//                   } else if (item.type === 'dateRange') {
//                     setFilters((prev) => ({
//                       ...prev,
//                       dateRange: { start: '', end: '' },
//                     }));
//                     setTimeout(() => getTopups(1, true), 100);
//                   } else if (item.type === 'valueRange') {
//                     setFilters((prev) => ({
//                       ...prev,
//                       minValue: '',
//                       maxValue: '',
//                     }));
//                     setTimeout(() => getTopups(1, true), 100);
//                   }
//                 }}
//               >
//                 <Ionicons name="close-circle" size={16} color={colors.primary} />
//               </TouchableOpacity>
//             </View>
//           )}
//           contentContainerStyle={styles.filterChipsContent}
//         />
//       </View>
//     );
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       {!hideSearch && (
//         <View style={styles.searchWrapper}>
//           <SearchBar
//             searchQuery={searchQuery}
//             setSearchQuery={setSearchQuery}
//             placeholder="Search van, employee or ID..."
//           />
//         </View>
//       )}

//       {renderFilterChips()}

//       {loading && topups.length === 0 ? (
//         <View style={styles.listContent}>
//           {[...Array(6)].map((_, i) => (
//             <TopupCardSkeleton key={i} />
//           ))}
//         </View>
//       ) : topups.length === 0 ? (
//         renderEmptyState()
//       ) : (
//         <FlatList
//           data={topups}
//           keyExtractor={(item) => item.vanInventoryTopupId}
//           renderItem={({ item, index }) => <TopupCard topup={item} index={index} />}
//           contentContainerStyle={styles.listContent}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//           onEndReached={handleLoadMore}
//           onEndReachedThreshold={0.5}
//           ListFooterComponent={renderFooter}
//         />
//       )}

//       <FilterModal
//         visible={showFilters}
//         onClose={() => setShowFilters(false)}
//         sections={filterSections}
//         onApply={handleApplyFilters}
//         onReset={clearAllFilters}
//         title="Filter Top-ups"
//         applyButtonText={`Apply${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}`}
//         resetButtonText="Reset"
//         showCount={true}
//         maxHeight={600}
//       />

//       {/* {!hideFAB && (
//         <TouchableOpacity
//           style={[styles.fab, { backgroundColor: colors.primary }]}
//           onPress={handleCreateTopup}
//           activeOpacity={0.8}
//         >
//           <Ionicons name="add" size={24} color="#FFF" />
//         </TouchableOpacity>
//       )} */}
//     </View>
//   );
// }

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';

import { EmptyState } from '@/core/components/EmptyState';
import { FilterModal } from '@/shared/components/models/Filter.modal';
import { useAuthStore } from '@/core/store/auth.store';
import { toast } from '@/shared/utils/toast';
import { useRouteStore } from '@/core/store/route.store';
import { vanService } from '@/shared/services/van.service';
import { SearchBar } from '@/features/outlet';
import { TopupCardSkeleton } from '@/shared/components/TopupCardSkeleton';
import { TopupCard } from '@/shared/components/TopupCart';
import { FilterSection } from '@/shared/types/filter.types';
import { useTopupStyles } from '@/shared/styles/Topup.styles';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useFilterContext } from '@/shared/contexts/FilterContext';

const LIMIT = 15;

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

interface TopupScreenProps {
  hideFAB?: boolean;
  hideSearch?: boolean;
  hideFilters?: boolean;
  vanId?: string;
}

export default function TopupScreen({
  hideFAB = false,
  hideSearch = false,
  hideFilters = false,
  vanId,
}: TopupScreenProps) {
  const { colors } = useTheme();
  const styles = useTopupStyles();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [topups, setTopups] = useState<TopupItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const { user } = useAuthStore();
  const { selectedRoute: route } = useRouteStore();
  const { setHeader } = useHeader();
  const {
    topupFilterCount,
    updateTopupFilterCount,
    resetTopupFilterCount,
    setOpenTopupFilterHandler,
  } = useFilterContext();

  const [filters, setFilters] = useState({
    status: [] as string[],
    dateRange: { start: '', end: '' },
    minValue: '',
    maxValue: '',
  });



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

  // Filter sections
  const filterSections = useMemo((): FilterSection[] => {
    const sections: FilterSection[] = [];

    // Status filter section
    sections.push({
      id: 'status',
      title: 'Status',
      type: 'multiple',
      options: [
        { id: 'DRAFT', label: 'Draft', count: topups.filter((t) => t.status === 'DRAFT').length },
        {
          id: 'SUBMITTED',
          label: 'Submitted',
          count: topups.filter((t) => t.status === 'SUBMITTED').length,
        },
        {
          id: 'APPROVED',
          label: 'Approved',
          count: topups.filter((t) => t.status === 'APPROVED').length,
        },
        {
          id: 'REJECTED',
          label: 'Rejected',
          count: topups.filter((t) => t.status === 'REJECTED').length,
        },
      ],
      selectedIds: filters.status,
    });

    // Date range filter
    sections.push({
      id: 'dateRange',
      title: 'Date Range',
      type: 'range',
      rangeValue: {
        min: filters.dateRange.start,
        max: filters.dateRange.end,
      },
    });

    // Value range filter
    sections.push({
      id: 'valueRange',
      title: 'Request Value (ZMW)',
      type: 'range',
      rangeValue: {
        min: filters.minValue,
        max: filters.maxValue,
      },
    });

    return sections;
  }, [filters, topups]);

    // Set up header with filter button
  useFocusEffect(
    useCallback(() => {
      setHeader({
        showFilter: true,
        onFilterPress: () => setShowFilters(true),
        rightIcon: 'plus',
        onRightPress: () => handleCreateTopup(),
        title: 'Topup'
      });
    }, [setHeader]),
  );

  // Fetch topups
  const getTopups = async (pageNumber = 1, isRefresh = false) => {
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

      // Add value range filters
      if (filters.minValue) payload.minValue = parseFloat(filters.minValue);
      if (filters.maxValue) payload.maxValue = parseFloat(filters.maxValue);

      const response = await vanService.fetchInventoryTopupRequests(payload);
      const apiData = response?.data;
      let newData = apiData?.data || apiData?.items || apiData || [];

      // Apply value range filter client-side if needed (since API might not support it)
      if (filters.minValue || filters.maxValue) {
        const minVal = filters.minValue ? parseFloat(filters.minValue) : 0;
        const maxVal = filters.maxValue ? parseFloat(filters.maxValue) : Infinity;
        newData = newData.filter((item: TopupItem) => {
          const value = item.totalRequestedValue;
          return value >= minVal && value <= maxVal;
        });
      }

      const total = apiData?.meta?.total || apiData?.total || apiData?.count || newData.length;

      if (pageNumber === 1) {
        setTopups(newData);
      } else {
        setTopups((prev) => [...prev, ...newData]);
      }

      setHasMore(newData.length === LIMIT && total > pageNumber * LIMIT);
      setPage(pageNumber);
    } catch (e) {
      console.log('Error fetching topups:', e);
      toast.error('Failed to load top-up requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      getTopups(1, true);
    }, [route, user, vanId]),
  );

  // Handle search & filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setTopups([]);
      getTopups(1, true);
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
    updateTopupFilterCount(count);
  }, [filters, searchQuery, updateTopupFilterCount]);

  // Handlers
  const onRefresh = useCallback(() => {
    setPage(1);
    setTopups([]);
    getTopups(1, true);
  }, []);

  const handleLoadMore = () => {
    if (!hasMore || loading || refreshing) return;
    getTopups(page + 1);
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
        } else if (section.id === 'dateRange' && section.rangeValue) {
          newFilters.dateRange = {
            start: section.rangeValue.min || '',
            end: section.rangeValue.max || '',
          };
        } else if (section.id === 'valueRange' && section.rangeValue) {
          newFilters.minValue = section.rangeValue.min || '';
          newFilters.maxValue = section.rangeValue.max || '';
        }
      });

      setSearchQuery(newSearchQuery);
      setFilters(newFilters);
      setShowFilters(false);
      setPage(1);
      setTopups([]);
      getTopups(1, true);
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
    setTopups([]);
    resetTopupFilterCount();
    getTopups(1, true);
  }, [resetTopupFilterCount]);

  const handleCreateTopup = useCallback(() => {
    router.push('/topup/create');
  }, []);

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
    loading && topups.length > 0 ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.primary} size="small" />
      </View>
    ) : null;

  const renderEmptyState = () => (
    <EmptyState
      title={searchQuery || activeFilterCount > 0 ? 'No top-ups found' : 'No inventory top-ups yet'}
      description={
        searchQuery || activeFilterCount > 0
          ? 'Try adjusting your search criteria or filters.'
          : 'Tap the + button below to create your first top-up request.'
      }
      icon={searchQuery || activeFilterCount > 0 ? 'search-outline' : 'truck-outline'}
      actionLabel={searchQuery || activeFilterCount > 0 ? 'Clear All Filters' : undefined}
      onAction={searchQuery || activeFilterCount > 0 ? clearAllFilters : undefined}
    />
  );

  // Render filter chips
  const renderFilterChips = () => {
    if (activeFilterCount === 0) return null;

    return (
      <View style={styles.filterChipsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            ...(searchQuery
              ? [
                  {
                    id: 'search',
                    label: `Search: ${searchQuery}`,
                    type: 'search',
                  },
                ]
              : []),
            ...filters.status.map((status) => ({
              id: `status-${status}`,
              label: `Status: ${status}`,
              type: 'status',
              value: status,
            })),
            ...(filters.dateRange.start || filters.dateRange.end
              ? [
                  {
                    id: 'dateRange',
                    label: `Date: ${filters.dateRange.start || 'any'} - ${filters.dateRange.end || 'any'}`,
                    type: 'dateRange',
                  },
                ]
              : []),
            ...(filters.minValue || filters.maxValue
              ? [
                  {
                    id: 'valueRange',
                    label: `Value: ${filters.minValue || '0'} - ${filters.maxValue || '∞'} ZMW`,
                    type: 'valueRange',
                  },
                ]
              : []),
          ]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.filterChip, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.filterChipText, { color: colors.primary }]}>{item.label}</Text>
              <TouchableOpacity
                onPress={() => {
                  if (item.type === 'search') {
                    setSearchQuery('');
                    updateTopupFilterCount(activeFilterCount - 1);
                    setTimeout(() => getTopups(1, true), 100);
                  } else if (item.type === 'status') {
                    setFilters((prev) => ({
                      ...prev,
                      status: prev.status.filter((s) => s !== item.value),
                    }));
                    updateTopupFilterCount(activeFilterCount - 1);
                    setTimeout(() => getTopups(1, true), 100);
                  } else if (item.type === 'dateRange') {
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: { start: '', end: '' },
                    }));
                    updateTopupFilterCount(activeFilterCount - 1);
                    setTimeout(() => getTopups(1, true), 100);
                  } else if (item.type === 'valueRange') {
                    setFilters((prev) => ({
                      ...prev,
                      minValue: '',
                      maxValue: '',
                    }));
                    updateTopupFilterCount(activeFilterCount - 1);
                    setTimeout(() => getTopups(1, true), 100);
                  }
                }}
              >
                <Ionicons name="close-circle" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.filterChipsContent}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!hideSearch && (
        <View style={styles.searchWrapper}>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search van, employee or ID..."
          />
        </View>
      )}

      {renderFilterChips()}

      {loading && topups.length === 0 ? (
        <View style={styles.listContent}>
          {[...Array(6)].map((_, i) => (
            <TopupCardSkeleton key={i} />
          ))}
        </View>
      ) : topups.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={topups}
          keyExtractor={(item) => item.vanInventoryTopupId}
          renderItem={({ item, index }) => <TopupCard topup={item} index={index} />}
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
        title="Filter Top-ups"
        applyButtonText={`Apply${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}`}
        resetButtonText="Reset"
        showCount={true}
        maxHeight={600}
      />
    </View>
  );
}
