// StockPage.tsx

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  Animated,
  RefreshControl,
  Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { vanService } from '@/shared/services/van.service';
import { useRouteStore } from '@/core/store/route.store';
import { AppText, Skeleton } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { createStockStyles } from '../styles/stock.styles';
import { StockProductItem } from '../components/StockProductItem';
import { StockMetrics } from '../components/StockMetrix';
import { StockPageProps, StockSummary, StockItem } from '../types/stock.types';
import { formatStock, formatCurrency, isOutOfStock } from '../utils/stock.utils';
import { PAGINATION, ANIMATION } from '../constants/stock.constants';
import { EmptyState } from '@/core/components/EmptyState';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeader } from '@/shared/contexts/HeaderContext';

export const StockPage: React.FC<StockPageProps> = ({ loadNumber: propLoadNumber }) => {
  const styles = createStockStyles(useTheme().colors);
  const { colors } = useTheme();
  const route = useRoute();
  const van = useRouteStore.getState().van;
  const insets = useSafeAreaInsets();

  const loadNumber = propLoadNumber || (route.params as any)?.loadNumber;

  // State
  const [stock, setStock] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [summary, setSummary] = useState<StockSummary>({
    totalCases: 0,
    totalPiece: 0,
    totalValue: 0,
    totalNetWeight: 0,
    totalItems: 0,
  });

  // Animations
  const opacityAnim = useState(new Animated.Value(0))[0];
  const flatListRef = useRef<FlatList>(null);
  const { setHeader } = useHeader();

  // Update header with search bar
  useFocusEffect(
    useCallback(() => {
      setHeader({
        title: 'Available Stock',
        showBack: true,
        showSearchBar: true,
        searchPlaceholder: 'Search products...',
        searchValue: searchQuery,
        onSearchChange: handleSearch,
        onSearchClear: clearSearch,
        onSearchPress: () => {
          if (searchQuery.trim()) {
            fetchStock(false, 1, searchQuery, true);
          }
        },
        autoFocusSearch: false,
        showFilter: false,
        elevated: true,
        centeredTitle: false,
        size: 'sm',
        showBorder: false,
      });
    }, [searchQuery]),
  );

  const fetchStock = useCallback(
    async (isRefresh = false, page = 1, search = searchQuery, isSearchAction = false) => {
      if (!van?.vanId) {
        setStock([]);
        setTotalItems(0);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (isSearchAction || page === 1) {
          setIsLoading(true);
          setStock([]);
        } else {
          setIsLoadingMore(true);
        }

        const response = await vanService.fetchVanStocks(van.vanId, {
          searchText: search || undefined,
          page,
          limit: PAGINATION.LIMIT,
        });

        const data = response?.data;
        const products = data?.products || [];

        if (page === 1 || isSearchAction) {
          setStock(products);
          setTotalItems(data?.total || 0);
          setSummary({
            totalCases: data?.totalCases || 0,
            totalPiece: data?.totalPieces || 0,
            totalValue: data?.totalValue || 0,
            totalNetWeight: data?.totalNetWeight || 0,
            totalItems: (data?.totalCases || 0) + (data?.totalPieces || 0),
          });
        } else {
          setStock((prev) => [...prev, ...products]);
        }

        setHasMore(
          products.length === PAGINATION.LIMIT && page * PAGINATION.LIMIT < (data?.total || 0),
        );
        setCurrentPage(page);

        Animated.timing(opacityAnim, {
          toValue: ANIMATION.END_OPACITY,
          duration: ANIMATION.DURATION,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error('Error fetching stock:', error);
        if (page === 1) {
          setStock([]);
          setTotalItems(0);
        }
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else if (isSearchAction || page === 1) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [van, opacityAnim],
  );

  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      if (text === '') {
        fetchStock(false, 1, '', true);
      }
    },
    [fetchStock],
  );

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined && searchQuery !== '') {
        fetchStock(false, 1, searchQuery, true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    fetchStock(false, 1, '', true);
  }, [fetchStock]);

  const onRefresh = useCallback(() => {
    fetchStock(true, 1);
  }, [fetchStock]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      fetchStock(false, currentPage + 1);
    }
  }, [isLoadingMore, hasMore, isLoading, fetchStock, currentPage]);

  useFocusEffect(
    useCallback(() => {
      fetchStock(false, 1);
    }, [van]),
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonMetrics}>
        <View style={styles.skeletonMetricsRow}>
          <Skeleton height={48} width="23%" borderRadius={10} />
          <Skeleton height={48} width="23%" borderRadius={10} />
          <Skeleton height={48} width="23%" borderRadius={10} />
          <Skeleton height={48} width="23%" borderRadius={10} />
        </View>
      </View>
      <View style={styles.skeletonList}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={styles.skeletonItem}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Skeleton height={52} width={52} borderRadius={10} />
              <View style={{ flex: 1, gap: 8 }}>
                <Skeleton height={14} width="80%" borderRadius={4} />
                <Skeleton height={10} width="50%" borderRadius={4} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Skeleton height={12} width="35%" borderRadius={4} />
                  <Skeleton height={12} width="35%" borderRadius={4} />
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Metrics Section */}
      <StockMetrics
        summary={summary}
        formatCurrency={formatCurrency}
        colors={colors}
        styles={styles}
      />
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

  const renderProductItem = ({ item, index }: { item: StockItem; index: number }) => (
    <StockProductItem
      item={item}
      index={index}
      formatStock={formatStock}
      formatCurrency={formatCurrency}
      isOutOfStock={isOutOfStock}
      opacityAnim={opacityAnim}
      colors={colors}
      styles={styles}
    />
  );

  if (isLoading && stock.length === 0) {
    return renderSkeleton();
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        ref={flatListRef}
        data={stock}
        renderItem={renderProductItem}
        keyExtractor={(item, index) => `${item.productId || item.id}-${index}`}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: Platform.OS === 'ios' ? 20 : 16 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressViewOffset={Platform.OS === 'ios' ? 0 : 8}
          />
        }
        ListHeaderComponent={renderHeader()}
        ListFooterComponent={renderFooter()}
        ListEmptyComponent={
          !isLoading &&
          !refreshing && (
            <EmptyState
              title={searchQuery ? 'No products found' : 'No stock available'}
              description={
                searchQuery
                  ? 'Try adjusting your search criteria'
                  : 'No stock items available for this van'
              }
              icon={searchQuery ? 'search-outline' : 'cube-outline'}
              actionLabel={searchQuery ? 'Clear search' : undefined}
              onAction={searchQuery ? clearSearch : undefined}
              size="small"
            />
          )
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={PAGINATION.ON_END_REACHED_THRESHOLD}
        initialNumToRender={PAGINATION.LIMIT}
        maxToRenderPerBatch={PAGINATION.LIMIT}
        windowSize={10}
        removeClippedSubviews={Platform.OS === 'android'}
      />
    </SafeAreaView>
  );
};

export default StockPage;
