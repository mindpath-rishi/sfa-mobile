// ProductsScreen.tsx

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { AppText, SearchBar, Skeleton } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { useProductsScreenStyles } from '../styles/ProductsScreen.styles';
import { ProductCard } from '../components/product';
import { FilterModal } from '@/shared/components/models/Filter.modal';
import { useFilterContext } from '@/shared/contexts/FilterContext';
import { useCartStore } from '@/core/store/cart.store';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { categoryService } from '@/shared/services/category.service';
import { productService } from '@/shared/services/product.service';
import { ProductsScreenRef, ProductsScreenProps } from '../types/product.types';
import { EmptyState } from '@/core/components/EmptyState';

const { width } = Dimensions.get('window');
const PAGE_SIZE = 20;
const LOAD_MORE_THRESHOLD = 0.5;
const CATEGORY_WIDTH = 50;
const PRODUCT_WIDTH = width - CATEGORY_WIDTH;

type QuickFilterType = 'all' | 'focused';

/**
 * Mapper: UI filters → API params
 */
const mapFiltersToParams = (
  filters: {
    searchText?: string;
    categoryIds?: string[];
    brandIds?: string[];
  },
  page: number,
  limit: number,
) => ({
  page,
  limit,
  searchText: filters.searchText?.trim() || undefined,
  categoryIds: filters.categoryIds?.length ? filters.categoryIds.join(',') : undefined,
  brandIds: filters.brandIds?.length ? filters.brandIds.join(',') : undefined,
});

// Helper to get initials from category name
const getInitials = (name: string) => {
  if (!name) return '?';
  const words = name.split(' ');
  if (words.length === 1) return name.charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

function ProductsScreenComponent(props: ProductsScreenProps, ref: React.Ref<ProductsScreenRef>) {
  const { colors } = useTheme();
  const styles = useProductsScreenStyles();
  const { setHeader } = useHeader();
  const { setOpenProductFilterHandler, resetProductsFilterCount } = useFilterContext();
  const { items, addItems, clearCart } = useCartStore();

  const { mode = 'sales', onCartUpdate, onSubmit, submitButtonText } = props;

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [filters, setFilters] = useState({
    categories: [] as { name: string; categoryId: string }[],
    brands: [] as string[],
  });

  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Cart Summary
   */
  const cartSummary = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const caseQty = item.caseQty || 0;
        const pieceQty = item.pieceQty || 0;

        acc.totalUnits += caseQty * item.unitQtyInCase + pieceQty;
        acc.totalItems += caseQty + pieceQty;
        acc.totalWeight +=
          caseQty * (item.caseNetWeight || 0) + pieceQty * (item.pieceNetWeight || 0);
        acc.totalValue += caseQty * item.casePrice + pieceQty * item.piecePrice;

        return acc;
      },
      { totalUnits: 0, totalValue: 0, totalItems: 0, totalWeight: 0 },
    );
  }, [items]);

  /**
   * Merge cart data into products
   */
  const productsWithCart = useMemo(() => {
    return products.map((product) => {
      const cartItem = items.find((i) => i.productId === product.productId);
      return {
        ...product,
        caseQty: cartItem?.caseQty || 0,
        pieceQty: cartItem?.pieceQty || 0,
      };
    });
  }, [products, items]);

  /**
   * Filter sections for modal
   */
  const filterSections: any = useMemo(
    () => [
      {
        id: 'brands',
        title: 'Brands',
        type: 'multiple' as const,
        icon: 'business-outline',
        options: brands.map((brand: string) => ({
          id: brand,
          label: brand,
        })),
        selectedIds: filters.brands,
      },
    ],
    [brands, filters],
  );

  /**
   * Filter count
   */
  const calculateActiveFilterCount = useCallback(() => {
    let count = 0;
    count += filters.categories.length;
    count += filters.brands.length;
    if (searchQuery.trim()) count++;
    if (quickFilter !== 'all') count++;
    return count;
  }, [filters, searchQuery, quickFilter]);

  /**
   * Fetch Products
   */
  const fetchProducts = useCallback(
    async (page: number = 1, shouldAppend: boolean = false) => {
      try {
        if (page === 1) setIsLoading(true);
        else setIsLoadingMore(true);

        let categoryIds = filters.categories.map((c) => c.categoryId);
        if (selectedCategory) {
          categoryIds = [selectedCategory.categoryId];
        }

        // Apply quick filter logic
        let extraParams: any = {};

        const params = mapFiltersToParams(
          {
            searchText: searchQuery,
            categoryIds: categoryIds,
            brandIds: filters.brands,
          },
          page,
          PAGE_SIZE,
        );

        if (quickFilter === 'focused') {
          params['isFocusedPack'] = 'Y';
        }

        const response = await productService.fetchProducts({ ...params, ...extraParams });

        if (response?.success) {
          const newProducts = response.data || [];
          const total = response?.meta?.total || 0;

          setProducts((prev) => (shouldAppend ? [...prev, ...newProducts] : newProducts));
          setTotalCount(total);
          setHasMore(page * PAGE_SIZE < total);
          setCurrentPage(page);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        if (page === 1) setProducts([]);
      } finally {
        if (page === 1) setIsLoading(false);
        else setIsLoadingMore(false);
      }
    },
    [searchQuery, filters, selectedCategory, quickFilter],
  );

  /**
   * Fetch Categories
   */
  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryService.fetchCategory({
        page: 1,
        limit: 100,
      });
      if (response?.success) {
        setCategoriesList(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  /**
   * Handle category selection
   */
  const handleCategorySelect = useCallback(
    (category: any) => {
      if (selectedCategory?.categoryId === category.categoryId) {
        setSelectedCategory(null);
        setFilters((prev) => ({ ...prev, categories: [] }));
      } else {
        setSelectedCategory(category);
        setFilters((prev) => ({ ...prev, categories: [] }));
      }
    },
    [selectedCategory],
  );

  /**
   * Handle quick filter change
   */
  const handleQuickFilterChange = useCallback((filter: QuickFilterType) => {
    setQuickFilter(filter);
    setSelectedCategory(null);
    setFilters({ categories: [], brands: [] });
    setSearchQuery('');
  }, []);

  /**
   * Refresh
   */
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchProducts(1, false);
    setIsRefreshing(false);
  }, [fetchProducts]);

  /**
   * Load More
   */
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      fetchProducts(currentPage + 1, true);
    }
  }, [isLoadingMore, hasMore, isLoading, currentPage, fetchProducts]);

  /**
   * Add to Cart
   */
  const handleAddToCart = useCallback(
    (cartItems: any[], product: any) => {
      if (!cartItems?.length || !product) return;

      let caseQty = 0;
      let pieceQty = 0;

      cartItems.forEach((item) => {
        caseQty += item.caseQty || 0;
        pieceQty += item.pieceQty || 0;
      });

      addItems([
        {
          productId: product.productId,
          productName: product.name,
          casePrice: product.casePrice,
          piecePrice: product.piecePrice,
          unitQtyInCase: product.unitQtyInCase,
          caseQty,
          pieceQty,
          stock: product.stock,
          caseNetWeight: product.caseNetWeight,
          pieceNetWeight: product.pieceNetWeight,
        },
      ]);
    },
    [addItems],
  );

  /**
   * Apply Filters
   */
  const handleApplyFilters = useCallback(
    (sections: any[]) => {
      const newFilters = { ...filters };

      sections.forEach((section) => {
        if (section.id === 'brands') {
          newFilters.brands = section.selectedIds || [];
        }
      });

      setFilters(newFilters);
      setShowFilters(false);
      setSelectedCategory(null);
    },
    [filters],
  );

  /**
   * Clear Filters
   */
  const clearAllFilters = useCallback(() => {
    setFilters({ categories: [], brands: [] });
    setSelectedCategory(null);
    setSearchQuery('');
    setQuickFilter('all');
    setShowFilters(false);
    resetProductsFilterCount();
    fetchProducts(1, false);
  }, [resetProductsFilterCount, fetchProducts]);

  /**
   * Submit
   */
  const handleSubmit = useCallback(() => {
    if (items.length === 0) {
      Alert.alert('Cart Empty', 'Add items before proceeding');
      return;
    }

    if (mode === 'topup' && onSubmit) {
      onSubmit(items);
    } else {
      router.push({ pathname: '/checkin/sale', params: { mode } });
    }
  }, [items, mode, onSubmit]);

  /**
   * Effects
   */
  useEffect(() => {
    fetchProducts(1, false);
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(1, false);
  }, [searchQuery, filters, selectedCategory, quickFilter]);

  useEffect(() => {
    if (onCartUpdate) {
      onCartUpdate(items, cartSummary);
    }
  }, [items, cartSummary, onCartUpdate]);

  useEffect(() => {
    setOpenProductFilterHandler(() => setShowFilters(true));
    return () => setOpenProductFilterHandler(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      const filterCount = calculateActiveFilterCount();
      setHeader({
        onFilterPress: () => setShowFilters(true),
        badgeCount: filterCount,
        filterActive: !!filterCount,
        filterCount,
      });
    }, [filters, searchQuery, quickFilter]),
  );

  useImperativeHandle(ref, () => ({
    clearFilters: clearAllFilters,
    getFilteredCount: () => products.length,
    openFilters: () => setShowFilters(true),
    getCartItems: () => items,
    clearCart: () => clearCart(),
    applyFilters: () => handleApplyFilters,
  }));

  /**
   * Render Helpers
   */

  // Render quick filters
  const renderQuickFilters = () => (
    <View style={styles.quickFiltersContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickFiltersContent}
      >
        <TouchableOpacity
          style={[styles.quickFilterChip, quickFilter === 'all' && styles.quickFilterChipActive]}
          onPress={() => handleQuickFilterChange('all')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="apps-outline"
            size={16}
            color={quickFilter === 'all' ? colors.primary : colors.textSecondary}
          />
          <AppText
            style={[styles.quickFilterText, quickFilter === 'all' && styles.quickFilterTextActive]}
          >
            All
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickFilterChip,
            quickFilter === 'focused' && styles.quickFilterChipActive,
          ]}
          onPress={() => handleQuickFilterChange('focused')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="star-outline"
            size={16}
            color={quickFilter === 'focused' ? colors.primary : colors.textSecondary}
          />
          <AppText
            style={[
              styles.quickFilterText,
              quickFilter === 'focused' && styles.quickFilterTextActive,
            ]}
          >
            Focused Pack
          </AppText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // Render vertical category list with initials
  const renderCategoryList = () => (
    <View style={[styles.categoryContainer, { width: CATEGORY_WIDTH }]}>
      <ScrollView
        style={styles.categoryList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.categoryListContent}
      >
        {/* All Products Option */}
        <TouchableOpacity
          style={[
            styles.categoryItem,
            !selectedCategory && quickFilter === 'all' && styles.categoryItemActive,
          ]}
          onPress={() => {
            setSelectedCategory(null);
            setQuickFilter('all');
          }}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.categoryItemAvatar,
              !selectedCategory && quickFilter === 'all' && styles.categoryItemAvatarActive,
            ]}
          >
            <Ionicons
              name="grid-outline"
              size={16}
              color={
                !selectedCategory && quickFilter === 'all' ? colors.primary : colors.textSecondary
              }
            />
          </View>
          <View style={styles.categoryItemInfo}>
            <AppText
              style={[
                styles.categoryItemName,
                !selectedCategory && quickFilter === 'all' && styles.categoryItemNameActive,
              ]}
              numberOfLines={2}
            >
              All
            </AppText>
            <AppText style={styles.categoryItemCount}>{totalCount}</AppText>
          </View>
          {!selectedCategory && quickFilter === 'all' && (
            <View style={[styles.categoryItemIndicator, { backgroundColor: colors.primary }]} />
          )}
        </TouchableOpacity>

        {/* Category Items */}
        {categoriesList.map((category) => {
          const isActive = selectedCategory?.categoryId === category.categoryId;
          const initials = getInitials(category.name);

          return (
            <TouchableOpacity
              key={category.categoryId}
              style={[styles.categoryItem, isActive && styles.categoryItemActive]}
              onPress={() => handleCategorySelect(category)}
              activeOpacity={0.7}
            >
              <View
                style={[styles.categoryItemAvatar, isActive && styles.categoryItemAvatarActive]}
              >
                <AppText
                  style={[
                    styles.categoryItemInitials,
                    isActive && styles.categoryItemInitialsActive,
                  ]}
                >
                  {initials}
                </AppText>
              </View>
              <View style={styles.categoryItemInfo}>
                <AppText
                  style={[styles.categoryItemName, isActive && styles.categoryItemNameActive]}
                  numberOfLines={2}
                >
                  {category.name}
                </AppText>
              </View>
              {isActive && (
                <View style={[styles.categoryItemIndicator, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  // Render header stats
  const renderHeaderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Ionicons name="cube-outline" size={12} color={colors.textSecondary} />
        <AppText style={styles.statText}>{products.length} Products</AppText>
      </View>
      {quickFilter === 'focused' && (
        <View style={styles.statItem}>
          <Ionicons name="star-outline" size={12} color={colors.textSecondary} />
          <AppText style={styles.statText}>Focused Pack</AppText>
        </View>
      )}
      {selectedCategory && (
        <View style={styles.statItem}>
          <Ionicons name="folder-outline" size={12} color={colors.textSecondary} />
          <AppText style={styles.statText} numberOfLines={1}>
            {selectedCategory.name}
          </AppText>
        </View>
      )}
      {searchQuery && (
        <View style={styles.statItem}>
          <Ionicons name="search-outline" size={12} color={colors.textSecondary} />
          <AppText style={styles.statText} numberOfLines={1}>
            "{searchQuery}"
          </AppText>
        </View>
      )}
    </View>
  );

  // Full page skeleton loader
  const renderFullSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.searchWrapper}>
        <Skeleton height={44} width="100%" borderRadius={12} />
      </View>
      <View style={styles.skeletonQuickFilters}>
        <Skeleton height={36} width={80} borderRadius={18} />
        <Skeleton height={36} width={100} borderRadius={18} />
      </View>
      <View style={styles.skeletonMainContent}>
        <View style={[styles.skeletonCategoryList, { width: CATEGORY_WIDTH }]}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={styles.skeletonCategoryItem}>
              <Skeleton height={50} width="100%" borderRadius={8} />
            </View>
          ))}
        </View>
        <View style={[styles.skeletonProductsList, { width: PRODUCT_WIDTH }]}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.skeletonProductItem}>
              <Skeleton height={120} width="100%" borderRadius={12} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  // Empty state
  const renderEmptyState = () => {
    const hasActiveFilters =
      calculateActiveFilterCount() > 0 || selectedCategory || quickFilter !== 'all';

    let title = 'No products found';
    let description = 'Try adjusting your search or filters';
    let icon: 'search-outline' | 'cube-outline' | 'folder-open-outline' = 'search-outline';

    if (!hasActiveFilters && !searchQuery) {
      title = 'No products available';
      description = 'Check back later for new products';
      icon = 'cube-outline';
    } else if (searchQuery && !hasActiveFilters) {
      title = `No results for "${searchQuery}"`;
      description = 'Try a different search term';
      icon = 'search-outline';
    } else if (selectedCategory) {
      title = `No products in ${selectedCategory.name}`;
      description = 'Try a different category';
      icon = 'folder-open-outline';
    } else if (quickFilter === 'focused') {
      title = 'No focused packs available';
      description = 'Check back later for focused packs';
      // icon = 'star-outline';
    }

    return (
      <View style={styles.emptyStateWrapper}>
        <EmptyState
          title={title}
          description={description}
          icon={icon}
          actionLabel={hasActiveFilters ? 'Clear filters' : undefined}
          onAction={hasActiveFilters ? clearAllFilters : undefined}
        />
      </View>
    );
  };

  // Footer loader
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <AppText style={styles.loadingMoreText}>Loading more products...</AppText>
      </View>
    );
  };

  // Render product item
  const renderProductItem = ({ item, index }: { item: any; index: number }) => (
    <ProductCard
      index={index}
      product={item}
      onAddToCart={(cartItems) => handleAddToCart(cartItems, item)}
      mode={mode}
    />
  );

  // Action button
  const renderActionButton = () => {
    const isNoSale = mode === 'sales' && items.length === 0;

    const handlePress = () => {
      if (isNoSale) {
        router.push('/checkin/nonsale');
      } else {
        handleSubmit();
      }
    };

    return (
      <TouchableOpacity
        style={[styles.cartButton, { backgroundColor: colors.primary }]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cartButtonGradient}
        >
          <View style={styles.cartButtonContent}>
            <View>
              <AppText style={styles.cartButtonLabel}>
                {isNoSale
                  ? 'Add No Sale Reason'
                  : mode === 'topup'
                    ? 'Ready to Submit'
                    : 'Ready to Checkout'}
              </AppText>
              {!isNoSale && (
                <AppText style={styles.cartButtonTotal}>
                  {cartSummary.totalItems} Items • K{cartSummary.totalValue.toFixed(2)}
                  {mode === 'topup' &&
                    cartSummary.totalWeight > 0 &&
                    ` • ${cartSummary.totalWeight.toFixed(2)} kg`}
                </AppText>
              )}
            </View>
            <View style={styles.cartButtonIcon}>
              <Ionicons name="arrow-forward-circle" size={28} color="white" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Show full skeleton on initial load
  if (isLoading && products.length === 0) {
    return renderFullSkeleton();
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products..."
          debounceDelay={500}
          clearable={true}
          fullWidth={true}
        />
      </View>

      {/* Quick Filters */}
      {renderQuickFilters()}

      {/* Header Stats */}
      {renderHeaderStats()}

      {/* Main Content with Category Sidebar */}
      <View style={styles.mainContent}>
        {/* Vertical Category List with Initials */}
        {renderCategoryList()}

        {/* Product List */}
        <View style={[styles.productsSection, { width: PRODUCT_WIDTH }]}>
          {products.length === 0 && !isLoading ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={productsWithCart}
              keyExtractor={(item) => item.productId}
              renderItem={renderProductItem}
              contentContainerStyle={styles.productsList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.primary}
                  colors={[colors.primary]}
                />
              }
              onEndReached={loadMore}
              onEndReachedThreshold={LOAD_MORE_THRESHOLD}
              ListFooterComponent={renderFooter}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={true}
            />
          )}
        </View>
      </View>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        sections={filterSections}
        onApply={handleApplyFilters}
        onReset={clearAllFilters}
        title="Filter Products"
        applyButtonText={`Show ${totalCount} products`}
        resetButtonText="Reset"
        showCount={true}
        maxHeight={600}
      />

      {/* Action Button */}
      {renderActionButton()}
    </View>
  );
}

export const ProductsScreen = forwardRef(ProductsScreenComponent);
ProductsScreen.displayName = 'ProductsScreen';
export default ProductsScreen;
