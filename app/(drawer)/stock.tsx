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
  Dimensions,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { vanService } from '@/shared/services/van.service';
import { useRouteStore } from '@/core/store/route.store';
import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { useStockPageStyles } from '@/shared/styles/Stock.styles';
import { debounce } from 'lodash';

const { width } = Dimensions.get('window');

interface StockPageProps {
  loadNumber?: string;
}

export const StockPage: React.FC<StockPageProps> = ({ loadNumber: propLoadNumber }) => {
  const styles = useStockPageStyles();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const van = useRouteStore.getState().van;

  const loadNumber = propLoadNumber || (route.params as any)?.loadNumber;

  const [vanStock, setVanStock] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const [summary, setSummary] = useState({
    totalCases: 0,
    totalPiece: 0,
    totalValue: 0,
    totalNetWeight: 0,
    totalItems: 0,
  });

  const opacityAnim = useState(new Animated.Value(0))[0];
  const flatListRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const formatStock = useCallback((cases = 0, pieces = 0) => {
    if (cases === 0 && pieces === 0) return 'Out';
    if (cases === 0) return `${pieces}P`;
    if (pieces === 0) return `${cases}C`;
    return `${cases}C ${pieces}P`;
  }, []);

  const formatCurrency = useCallback((value: number) => {
    return `K ${value.toLocaleString('en-ZM', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, []);

  const isOutOfStock = useCallback((item: any) => {
    return (!item.cases || item.cases === 0) && (!item.pieces || item.pieces === 0);
  }, []);

  // Server-side search with debounce
  const searchProducts = useCallback(
    debounce(async (query: string, page: number = 1, reset: boolean = true) => {
      if (!van?.vanId) return;

      try {
        if (reset) {
          setIsSearching(true);
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const response = await vanService.fetchVanStocks(van.vanId, {
          searchText: query,
          page: page,
          limit: itemsPerPage,
        });

        const resData = response?.data;
        const products = resData?.products || [];
        const total = resData?.total || 0;

        if (reset) {
          setVanStock(products);
          setTotalItems(total);
          setHasMore(products.length === itemsPerPage && products.length < total);
          setCurrentPage(page);

          // Update summary when searching
          setSummary({
            totalCases: resData?.totalCases || 0,
            totalPiece: resData?.totalPieces || 0,
            totalValue: resData?.totalValue || 0,
            totalNetWeight: resData?.totalNetWeight || 0,
            totalItems: (resData?.totalCases || 0) + (resData?.totalPieces || 0),
          });
        } else {
          setVanStock((prev) => [...prev, ...products]);
          setHasMore(products.length === itemsPerPage && vanStock.length + products.length < total);
          setCurrentPage(page);
        }

        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.log('Error searching products:', error);
        if (reset) {
          setVanStock([]);
          setTotalItems(0);
        }
      } finally {
        if (reset) {
          setIsSearching(false);
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    }, 1200),
    [van, itemsPerPage],
  );

  const getVanStock = useCallback(
    async (isRefreshing = false, page: number = 1) => {
      try {
        if (isRefreshing) setRefreshing(true);
        else if (page === 1) setIsLoading(true);
        else setIsLoadingMore(true);

        if (!van?.vanId) {
          setVanStock([]);
          setTotalItems(0);
          return;
        }

        const response = await vanService.fetchVanStocks(van.vanId, {
          page: page,
          limit: itemsPerPage,
          search: searchQuery || undefined,
        });

        const resData = response?.data;
        const products = resData?.products || [];
        const total = resData?.total || 0;
        const totalItemsCount = (resData?.totalCases || 0) + (resData?.totalPieces || 0);

        if (page === 1) {
          setVanStock(products);
          setTotalItems(total);
          setSummary({
            totalCases: resData?.totalCases || 0,
            totalPiece: resData?.totalPieces || 0,
            totalValue: resData?.totalValue || 0,
            totalNetWeight: resData?.totalNetWeight || 0,
            totalItems: totalItemsCount,
          });
        } else {
          setVanStock((prev) => [...prev, ...products]);
        }

        setHasMore(products.length === itemsPerPage && vanStock.length + products.length < total);
        setCurrentPage(page);

        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.log('Error fetching van stock:', error);
        if (page === 1) {
          setVanStock([]);
          setTotalItems(0);
        }
      } finally {
        if (isRefreshing) setRefreshing(false);
        else if (page === 1) setIsLoading(false);
        else setIsLoadingMore(false);
      }
    },
    [van, itemsPerPage, searchQuery, opacityAnim],
  );

  // Initial load
  useEffect(() => {
    getVanStock(false, 1);
  }, [van]);

  // Handle search
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.length > 0) {
      searchProducts(text, 1, true);
    } else {
      getVanStock(false, 1);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    getVanStock(false, 1);
  };

  const onRefresh = useCallback(() => {
    getVanStock(true, 1);
  }, [getVanStock]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading && !isSearching) {
      getVanStock(false, currentPage + 1);
    }
  }, [isLoadingMore, hasMore, isLoading, isSearching, getVanStock, currentPage]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Hero Section */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <View>
            <AppText style={styles.heroTitle}>Stock Inventory</AppText>
            <AppText style={styles.heroSubtitle}>Manage your van stock</AppText>
          </View>
          {loadNumber && (
            <View style={styles.loadNumberChip}>
              <Ionicons name="cube-outline" size={16} color={colors.surface} />
              <AppText style={styles.loadNumberChipText}>Load #{loadNumber}</AppText>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search products..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {isSearching && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        {searchQuery.length > 0 && (
          <AppText style={[styles.searchResultText, { color: colors.textSecondary }]}>
            {totalItems} product{totalItems !== 1 ? 's' : ''} found
          </AppText>
        )}
      </View>

      {/* All Metrics in Single Horizontal Scrollable Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.metricsScrollContainer}
        style={styles.metricsWrapper}
      >
        {/* Total Items */}
        <View style={styles.metricItem}>
          <AppText style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Total Items
          </AppText>
          <AppText style={[styles.metricValue, { color: colors.primary }]}>
            {summary.totalItems.toLocaleString()}
          </AppText>
        </View>

        <View style={[styles.metricDivider, { backgroundColor: colors.divider }]} />

        {/* Total Cases */}
        <View style={styles.metricItem}>
          <AppText style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Total Cases
          </AppText>
          <AppText style={[styles.metricValue, { color: colors.primary }]}>
            {summary.totalCases.toLocaleString()}
          </AppText>
        </View>

        <View style={[styles.metricDivider, { backgroundColor: colors.divider }]} />

        {/* Total Pieces */}
        <View style={styles.metricItem}>
          <AppText style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Total Pieces
          </AppText>
          <AppText style={[styles.metricValue, { color: colors.success }]}>
            {summary.totalPiece.toLocaleString()}
          </AppText>
        </View>

        <View style={[styles.metricDivider, { backgroundColor: colors.divider }]} />

        {/* Net Weight */}
        <View style={styles.metricItem}>
          <AppText style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Net Weight
          </AppText>
          <AppText style={[styles.metricValue, { color: colors.info }]}>
            {summary.totalNetWeight.toFixed(2)} kg
          </AppText>
        </View>

        <View style={[styles.metricDivider, { backgroundColor: colors.divider }]} />

        {/* Total Value */}
        <View style={styles.metricItem}>
          <AppText style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Total Value
          </AppText>
          <AppText style={[styles.metricValue, { color: colors.warning }]}>
            {formatCurrency(summary.totalValue)}
          </AppText>
        </View>
      </ScrollView>
    </View>
  );

  const renderProductItem = ({ item, index }: { item: any; index: number }) => {
    const outOfStock = isOutOfStock(item);
    const animatedStyle = {
      opacity: opacityAnim,
      transform: [
        { translateY: opacityAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
      ],
    };

    return (
      <Animated.View style={[styles.productRow, animatedStyle]}>
        <View style={styles.productLeft}>
          <AppText style={[styles.productIndex, { color: colors.textTertiary }]}>
            {index + 1}
          </AppText>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: outOfStock ? colors.error : colors.success },
            ]}
          />
        </View>

        <View style={styles.productCenter}>
          <AppText
            style={[styles.productName, outOfStock && { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {item.name}
          </AppText>
          {item.productId && (
            <AppText style={[styles.productCode, { color: colors.textTertiary }]}>
              {item.productId}
            </AppText>
          )}
        </View>

        <View style={styles.productRight}>
          {outOfStock ? (
            <AppText style={[styles.outOfStockText, { color: colors.error }]}>Out</AppText>
          ) : (
            <>
              <AppText style={[styles.productStock, { color: colors.primary }]}>
                {formatStock(item.cases, item.pieces)}
              </AppText>
              {item.price && (
                <AppText style={[styles.productPrice, { color: colors.textTertiary }]}>
                  {formatCurrency(item.price)}
                </AppText>
              )}
            </>
          )}
        </View>
      </Animated.View>
    );
  };

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

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons
        name={searchQuery ? 'search-outline' : 'cube-outline'}
        size={48}
        color={colors.textTertiary}
      />
      <AppText style={[styles.emptyStateText, { color: colors.textSecondary }]}>
        {searchQuery ? 'No products found' : 'No stock available'}
      </AppText>
      {searchQuery && (
        <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
          <AppText style={[styles.clearSearchText, { color: colors.primary }]}>
            Clear search
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={vanStock}
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
        ListEmptyComponent={!isLoading ? renderEmptyState() : null}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
      {isLoading && !refreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading stock...
          </AppText>
        </View>
      )}
    </View>
  );
};

export default StockPage;
