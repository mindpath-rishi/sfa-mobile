// StockPage.tsx

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, FlatList, ActivityIndicator, Animated, RefreshControl } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useFocusEffect } from 'expo-router';

import { vanService } from '@/shared/services/van.service';
import { useRouteStore } from '@/core/store/route.store';
import { AppText, Skeleton } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { createStockStyles } from '../styles/stock.styles';
import { StockHeader } from '../components/StockHeader';
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

  const loadNumber = propLoadNumber || (route.params as any)?.loadNumber;

  // State
  const [stock, setStock] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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


    useFocusEffect(
      useCallback(() => {
        setHeader({
          showFilter: false,
          title: 'Available Stock',
        });
      }, [setHeader])
    );

  // Fetch stock with search
  const fetchStock = useCallback(
    async (isRefresh = false, page = 1, search = searchQuery) => {
      if (!van?.vanId) {
        setStock([]);
        setTotalItems(0);
        return;
      }

      try {
        if (isRefresh) setRefreshing(true);
        else if (page === 1) setIsLoading(true);
        else setIsLoadingMore(true);

        const response = await vanService.fetchVanStocks(van.vanId, {
          searchText: search || undefined,
          page,
          limit: PAGINATION.LIMIT,
        });

        const data = response?.data;
        const products = data?.products || [];

        if (page === 1) {
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
        if (isRefresh) setRefreshing(false);
        else if (page === 1) setIsLoading(false);
        else setIsLoadingMore(false);
      }
    },
    [van, searchQuery, opacityAnim],
  );

  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      fetchStock(false, 1, text);
    },
    [fetchStock],
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    fetchStock(false, 1, '');
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
      <Skeleton height={250} width="100%" style={styles.skeletonHeader} />
      <View style={styles.skeletonMetrics}>
        <View style={styles.skeletonMetricsRow}>
          <Skeleton height={60} width="18%" borderRadius={8} />
          <Skeleton height={60} width="18%" borderRadius={8} />
          <Skeleton height={60} width="18%" borderRadius={8} />
          <Skeleton height={60} width="18%" borderRadius={8} />
        </View>
      </View>
      <View style={styles.skeletonList}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.skeletonItem}>
            <Skeleton height={60} width="100%" borderRadius={8} />
          </View>
        ))}
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <StockHeader
        loadNumber={loadNumber}
        colors={colors}
        styles={styles}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        totalItems={totalItems}
      />

      {/* Metrics Section - Below Header */}
      <StockMetrics
        summary={summary}
        formatCurrency={formatCurrency}
        colors={colors}
        styles={styles}
      />
    </View>
  );

  // Render footer
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

  // Render product item
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

  // Show skeleton while loading
  if (isLoading && !refreshing && stock.length === 0) {
    return renderSkeleton();
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={stock}
        renderItem={renderProductItem}
        keyExtractor={(item, index) => `${item.productId || item.id}-${index}`}
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
            />
          )
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={PAGINATION.ON_END_REACHED_THRESHOLD}
        initialNumToRender={PAGINATION.LIMIT}
        maxToRenderPerBatch={PAGINATION.LIMIT}
        windowSize={10}
      />
    </SafeAreaView>
  );
};

export default StockPage;
