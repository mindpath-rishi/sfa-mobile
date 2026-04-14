// StockPage.tsx
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
  RefreshControl,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { vanService } from '@/shared/services/van.service';
import { useRouteStore } from '@/core/store/route.store';
import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { useStockPageStyles } from '@/shared/styles/Stock.styles';

interface StockPageProps {
  loadNumber?: string;
}

export const StockPage: React.FC<StockPageProps> = ({ loadNumber: propLoadNumber }) => {
  const styles = useStockPageStyles();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const van = useRouteStore.getState().van;

  // Get load number from props or route params
  const loadNumber = propLoadNumber || (route.params as any)?.loadNumber;

  const [vanStock, setVanStock] = useState<any[]>([]);
  const [filteredStock, setFilteredStock] = useState<any[]>([]);
  const [displayedItems, setDisplayedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Infinite scroll pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [hasMore, setHasMore] = useState(true);

  const [summary, setSummary] = useState({
    totalCases: 0,
    totalPiece: 0,
    totalValue: 0,
    totalNetWeight: 0,
  });

  // Animation for content entrance
  const opacityAnim = useState(new Animated.Value(0))[0];
  const flatListRef = useRef<FlatList>(null);

  /* ============================
   * HELPERS
   * ============================ */

  const formatStock = useCallback((cases = 0, pieces = 0) => {
    if (cases === 0 && pieces === 0) return 'Out of Stock';
    return `${cases} Cases ${pieces} Pcs`;
  }, []);

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

  // Check if item is out of stock
  const isOutOfStock = useCallback((item: any) => {
    return (!item.cases || item.cases === 0) && (!item.pieces || item.pieces === 0);
  }, []);

  // Search and filter logic
  const filterProducts = useCallback((products: any[], query: string) => {
    if (!query.trim()) return products;

    const lowerQuery = query.toLowerCase();
    return products.filter(
      (item) =>
        item.name?.toLowerCase().includes(lowerQuery) ||
        item.productSysCode?.toLowerCase().includes(lowerQuery) ||
        item.productId?.toLowerCase().includes(lowerQuery),
    );
  }, []);

  // Load more items for infinite scroll
  const loadMoreItems = useCallback(() => {
    if (isLoadingMore || !hasMore || isSearching) return;

    const nextPage = currentPage + 1;
    const startIndex = (nextPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const nextItems = filteredStock.slice(startIndex, endIndex);

    if (nextItems.length > 0) {
      setDisplayedItems((prev) => [...prev, ...nextItems]);
      setCurrentPage(nextPage);
      setHasMore(endIndex < filteredStock.length);
    } else {
      setHasMore(false);
    }

    setIsLoadingMore(false);
  }, [currentPage, filteredStock, itemsPerPage, hasMore, isLoadingMore, isSearching]);

  // Reset pagination when filter changes
  const resetPagination = useCallback(
    (filteredData: any[]) => {
      const initialItems = filteredData.slice(0, itemsPerPage);
      setDisplayedItems(initialItems);
      setCurrentPage(1);
      setHasMore(filteredData.length > itemsPerPage);
      setIsLoadingMore(false);
    },
    [itemsPerPage],
  );

  // Calculate summary statistics
  const summaryStats = useMemo(
    () => [
      {
        id: 'cases',
        label: 'Total Cases',
        value: summary.totalCases,
        icon: 'package-variant',
        color: colors.primary,
      },
      {
        id: 'pieces',
        label: 'Total Pieces',
        value: summary.totalPiece,
        icon: 'package-multiple',
        color: colors.success,
      },
      {
        id: 'value',
        label: 'Total Value',
        value: formatCurrency(summary.totalValue),
        icon: 'currency-inr',
        color: colors.warning,
      },
      {
        id: 'weight',
        label: 'Net Weight',
        value: formatWeight(summary.totalNetWeight),
        icon: 'weight',
        color: colors.info,
      },
    ],
    [summary, formatCurrency, formatWeight, colors],
  );

  // Get stock statistics
  const stockStats = useMemo(() => {
    const totalProducts = vanStock.length;
    const outOfStockCount = vanStock.filter((item) => isOutOfStock(item)).length;
    const inStockCount = totalProducts - outOfStockCount;
    const stockRate = totalProducts > 0 ? (inStockCount / totalProducts) * 100 : 0;

    return {
      totalProducts,
      inStockCount,
      outOfStockCount,
      stockRate: Math.round(stockRate),
    };
  }, [vanStock, isOutOfStock]);

  /* ============================
   * API CALL
   * ============================ */

  const getVanStock = useCallback(
    async (isRefreshing = false) => {
      try {
        if (isRefreshing) {
          setRefreshing(true);
        } else {
          setIsLoading(true);
        }

        if (!van?.vanId) {
          setVanStock([]);
          setFilteredStock([]);
          setDisplayedItems([]);
          return;
        }

        const response = await vanService.fetchVanStocks(van.vanId);
        const resData = response?.data;

        setSummary({
          totalCases: resData?.totalCases || 0,
          totalPiece: resData?.totalPieces || 0,
          totalValue: resData?.totalValue || 0,
          totalNetWeight: resData?.totalNetWeight || 0,
        });

        // Sort products by name for better UX
        const sortedProducts = (resData?.products || []).sort((a: any, b: any) =>
          a.name.localeCompare(b.name),
        );
        setVanStock(sortedProducts);

        // Apply search filter
        const filtered = filterProducts(sortedProducts, searchQuery);
        setFilteredStock(filtered);

        // Reset pagination with filtered data
        resetPagination(filtered);

        // Trigger animation
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.log('Error fetching van stock:', error);
        setVanStock([]);
        setFilteredStock([]);
        setDisplayedItems([]);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [van, opacityAnim, filterProducts, searchQuery, resetPagination],
  );

  useEffect(() => {
    getVanStock();
  }, [getVanStock]);

  // Handle search
  useEffect(() => {
    const filtered = filterProducts(vanStock, searchQuery);
    setFilteredStock(filtered);
    resetPagination(filtered);
    setIsSearching(searchQuery.length > 0);
  }, [searchQuery, vanStock, filterProducts, resetPagination]);

  const onRefresh = useCallback(() => {
    getVanStock(true);
  }, [getVanStock]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Handle load more for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isSearching && !isLoading) {
      setIsLoadingMore(true);
      loadMoreItems();
    }
  }, [isLoadingMore, hasMore, isSearching, isLoading, loadMoreItems]);

  /* ============================
   * RENDER SUMMARY STAT CARD
   * ============================ */

  const renderSummaryStat = ({
    item,
    index,
  }: {
    item: (typeof summaryStats)[0];
    index: number;
  }) => (
    <Animated.View
      style={[
        styles.statCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: opacityAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
          transform: [
            {
              translateY: opacityAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.statIconContainer}>
        <View style={[styles.statIconWrapper, { backgroundColor: item.color + '15' }]}>
          <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
        </View>
      </View>

      <View style={styles.statContent}>
        <AppText style={[styles.statLabel, { color: colors.textSecondary }]}>{item.label}</AppText>
        <AppText style={[styles.statValue, { color: item.color }]}>
          {typeof item.value === 'number' ? item.value.toLocaleString('en-IN') : item.value}
        </AppText>
      </View>
    </Animated.View>
  );

  /* ============================
   * RENDER SKU ITEM
   * ============================ */

  const renderSkuItem = ({ item, index }: { item: any; index: number }) => {
    const outOfStock = isOutOfStock(item);

    return (
      <Animated.View
        style={[
          styles.skuCard,
          {
            backgroundColor: colors.surface,
            borderColor: outOfStock ? colors.error + '40' : colors.border,
            opacity: opacityAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
            transform: [
              {
                translateY: opacityAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.skuHeaderCompact}>
          <View style={styles.skuLeftSection}>
            <View
              style={[
                styles.skuIndexBadgeCompact,
                {
                  backgroundColor: outOfStock ? colors.error + '15' : colors.primary + '15',
                  borderColor: outOfStock ? colors.error + '30' : colors.primary + '30',
                },
              ]}
            >
              <AppText
                style={[
                  styles.skuIndexTextCompact,
                  { color: outOfStock ? colors.error : colors.primary },
                ]}
              >
                {index + 1}
              </AppText>
            </View>

            <View style={styles.skuProductInfo}>
              <AppText
                style={[
                  styles.skuNameCompact,
                  { color: outOfStock ? colors.textSecondary : colors.textPrimary },
                ]}
                numberOfLines={2}
              >
                {item.name}
              </AppText>
              {item.productSysCode && (
                <AppText style={[styles.skuCodeCompact, { color: colors.textSecondary }]}>
                  {item.productSysCode}
                </AppText>
              )}
            </View>
          </View>

          <View
            style={[
              styles.skuStatusBadge,
              { backgroundColor: outOfStock ? colors.error + '10' : colors.success + '10' },
            ]}
          >
            <MaterialCommunityIcons
              name={outOfStock ? 'close-circle' : 'check-circle'}
              size={14}
              color={outOfStock ? colors.error : colors.success}
            />
          </View>
        </View>

        <View style={styles.skuDetailsGrid}>
          <View style={styles.skuDetailItem}>
            <AppText style={[styles.skuDetailLabel, { color: colors.textSecondary }]}>
              Stock
            </AppText>
            {outOfStock ? (
              <View style={styles.outOfStockBadge}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={14}
                  color={colors.error}
                />
                <AppText style={[styles.outOfStockText, { color: colors.error }]}>
                  Out of Stock
                </AppText>
              </View>
            ) : (
              <AppText style={[styles.skuDetailValue, { color: colors.textPrimary }]}>
                {formatStock(item.cases, item.pieces)}
              </AppText>
            )}
          </View>

          {item.price ? (
            <View style={styles.skuDetailItem}>
              <AppText style={[styles.skuDetailLabel, { color: colors.textSecondary }]}>
                Price
              </AppText>
              <AppText
                style={[
                  styles.skuDetailValue,
                  { color: outOfStock ? colors.textSecondary : colors.primary, fontWeight: '600' },
                ]}
              >
                {formatCurrency(item.price)}
              </AppText>
            </View>
          ) : (
            <View style={styles.skuDetailItem}>
              <AppText style={[styles.skuDetailLabel, { color: colors.textSecondary }]}>
                Status
              </AppText>
              <AppText
                style={[
                  styles.skuDetailValue,
                  { color: outOfStock ? colors.error : colors.success },
                ]}
              >
                {outOfStock ? 'Unavailable' : 'Available'}
              </AppText>
            </View>
          )}
        </View>

        {outOfStock && (
          <View style={[styles.outOfStockOverlay, { backgroundColor: colors.error + '05' }]} />
        )}
      </Animated.View>
    );
  };

  /* ============================
   * RENDER LOADING FOOTER
   * ============================ */

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <AppText style={[styles.loadingFooterText, { color: colors.textSecondary }]}>
          Loading more items...
        </AppText>
      </View>
    );
  };

  /* ============================
   * RENDER SEARCH BAR
   * ============================ */

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View
        style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search by name, code or ID..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={clearSearch}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {isSearching && (
        <AppText style={[styles.searchResultsText, { color: colors.textSecondary }]}>
          Found {filteredStock.length} result{filteredStock.length !== 1 ? 's' : ''}
        </AppText>
      )}
    </View>
  );

  /* ============================
   * RENDER HEADER
   * ============================ */

  const renderHeader = () => (
    <>
      {/* Header Title */}
      {/* <View style={[styles.pageHeader, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText style={[styles.pageTitle, { color: colors.textPrimary }]}>Stock</AppText>
        <TouchableOpacity
          onPress={onRefresh}
          style={styles.refreshButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialCommunityIcons name="refresh" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View> */}

      {/* Load Number Badge */}
      {loadNumber && (
        <View style={styles.loadNumberContainer}>
          <View style={[styles.loadNumberBadge, { backgroundColor: colors.primary + '15' }]}>
            <MaterialCommunityIcons
              name="checkbox-marked-circle"
              size={16}
              color={colors.primary}
            />
            <AppText style={[styles.loadNumberText, { color: colors.primary }]}>
              Load #{loadNumber}
            </AppText>
          </View>
        </View>
      )}

      {/* Stock Overview Card */}
      <View style={styles.stockOverviewCard}>
        <AppText style={[styles.overviewTitle, { color: colors.textPrimary }]}>
          Stock Overview
        </AppText>
        <View style={styles.stockStatsRow}>
          <View style={styles.stockStatItem}>
            <AppText style={[styles.stockStatValue, { color: colors.primary }]}>
              {stockStats.totalProducts}
            </AppText>
            <AppText style={[styles.stockStatLabel, { color: colors.textSecondary }]}>
              Total SKUs
            </AppText>
          </View>
          <View style={styles.stockStatItem}>
            <AppText style={[styles.stockStatValue, { color: colors.success }]}>
              {stockStats.inStockCount}
            </AppText>
            <AppText style={[styles.stockStatLabel, { color: colors.textSecondary }]}>
              In Stock
            </AppText>
          </View>
          <View style={styles.stockStatItem}>
            <AppText style={[styles.stockStatValue, { color: colors.error }]}>
              {stockStats.outOfStockCount}
            </AppText>
            <AppText style={[styles.stockStatLabel, { color: colors.textSecondary }]}>
              Out of Stock
            </AppText>
          </View>
          <View style={styles.stockStatItem}>
            <AppText style={[styles.stockStatValue, { color: colors.warning }]}>
              {stockStats.stockRate}%
            </AppText>
            <AppText style={[styles.stockStatLabel, { color: colors.textSecondary }]}>
              Stock Rate
            </AppText>
          </View>
        </View>
      </View>

      {/* Summary Metrics Section */}
      <View style={styles.summarySection}>
        <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Summary Metrics
        </AppText>
        {isLoading && !refreshing ? (
          renderLoadingState()
        ) : (
          <FlatList
            data={summaryStats}
            renderItem={renderSummaryStat}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.statsGrid}
            scrollEnabled={false}
            contentContainerStyle={styles.statsContainer}
          />
        )}
      </View>

      {/* SKU Details Section Header */}
      <View style={styles.skuSectionHeader}>
        <View style={styles.skuTitleContainer}>
          <MaterialCommunityIcons name="format-list-bulleted" size={22} color={colors.primary} />
          <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            SKU Details
          </AppText>
        </View>
        <View style={[styles.skuCountBadge, { backgroundColor: colors.primary + '10' }]}>
          <AppText style={[styles.skuCountText, { color: colors.primary }]}>
            {filteredStock.length} Items
          </AppText>
        </View>
      </View>

      {/* Search Bar */}
      {renderSearchBar()}
    </>
  );

  /* ============================
   * RENDER EMPTY STATE
   * ============================ */

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
        <MaterialCommunityIcons
          name={searchQuery ? 'file-search-outline' : 'inbox-multiple-outline'}
          size={60}
          color={colors.textSecondary}
        />
      </View>
      <AppText style={[styles.emptyStateText, { color: colors.textSecondary }]}>
        {searchQuery ? 'No matching products found' : 'No products loaded'}
      </AppText>
      <AppText style={[styles.emptyStateSubtext, { color: colors.textTertiary }]}>
        {searchQuery ? 'Try a different search term' : 'Pull to refresh or check back later'}
      </AppText>
    </View>
  );

  /* ============================
   * MAIN RENDER
   * ============================ */

  return (
    <View style={styles.pageContainer}>
      <FlatList
        ref={flatListRef}
        data={displayedItems}
        renderItem={renderSkuItem}
        keyExtractor={(item, index) => `${item.productId || item.id}-${index}`}
        contentContainerStyle={styles.skuListContainer}
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
    </View>
  );

  function renderLoadingState() {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading stock...
        </AppText>
      </View>
    );
  }
};

export default StockPage;
