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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Skeleton } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { useProductsScreenStyles } from '../styles/ProductsScreen.styles';
import { ProductCard } from '../components/product';
import { FilterModal } from '@/shared/components/models/Filter.modal';
import { useFilterContext } from '@/shared/contexts/FilterContext';
import { useCartStore } from '@/core/store/cart.store';
import { useOutletStore } from '@/core/store/outlet.store';
import { getRouteCustomerCategoryId, useRouteStore } from '@/core/store/route.store';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { categoryService } from '@/shared/services/category.service';
import { productService } from '@/shared/services/product.service';
import { ProductsScreenRef, ProductsScreenProps } from '../types/product.types';
import { EmptyState } from '@/core/components/EmptyState';

const { width } = Dimensions.get('window');
const PAGE_SIZE = 20;
const LOAD_MORE_THRESHOLD = 0.5;
const CATEGORY_WIDTH = 60;
const PRODUCT_WIDTH = width - CATEGORY_WIDTH - 16;

type QuickFilterType = 'all' | 'focused';

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
  const customerCategoryId = useRouteStore((state) =>
    getRouteCustomerCategoryId(state.selectedRoute),
  );
  const outletCustomerCategoryId = useOutletStore(
    (state) =>
      state.activeVisit?.outlet?.customerCategoryId ||
      state.selectedOutlet?.customerCategoryId,
  );
  const insets = useSafeAreaInsets();

  const { mode = 'sales', onCartUpdate, onSubmit } = props;

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

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

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

  const calculateActiveFilterCount = useCallback(() => {
    let count = 0;
    count += filters.categories.length;
    count += filters.brands.length;
    if (searchQuery.trim()) count++;
    if (quickFilter !== 'all') count++;
    return count;
  }, [filters, searchQuery, quickFilter]);

  const fetchProducts = useCallback(
    async (page: number = 1, shouldAppend: boolean = false, isSearch: boolean = false) => {
      try {
        if (isSearch || (page === 1 && !shouldAppend)) {
          setIsLoading(true);
          setProducts([]); // Clear products immediately to show skeleton
        } else if (!shouldAppend) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        let categoryIds = filters.categories.map((c) => c.categoryId);
        if (selectedCategory) {
          categoryIds = [selectedCategory.categoryId];
        }

        const params: any = mapFiltersToParams(
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

        const latestRoute = useRouteStore.getState().selectedRoute;
        const outletState = useOutletStore.getState();
        const resolvedCustomerCategoryId =
          getRouteCustomerCategoryId(latestRoute) ||
          outletState.activeVisit?.outlet?.customerCategoryId ||
          outletState.selectedOutlet?.customerCategoryId ||
          customerCategoryId ||
          outletCustomerCategoryId;

        if (resolvedCustomerCategoryId) {
          params.customerCategoryId = resolvedCustomerCategoryId;
        } else if (__DEV__) {
          console.log('Missing customerCategoryId for product fetch', {
            selectedRoute: latestRoute,
            activeVisitOutlet: outletState.activeVisit?.outlet,
            selectedOutlet: outletState.selectedOutlet,
          });
        }

        const response = await productService.fetchProducts(params);

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
        if (page === 1 || isSearch) setIsLoading(false);
        if (shouldAppend) setIsLoadingMore(false);
      }
    },
    [
      searchQuery,
      filters,
      selectedCategory,
      quickFilter,
      customerCategoryId,
      outletCustomerCategoryId,
    ],
  );

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

  const handleQuickFilterChange = useCallback((filter: QuickFilterType) => {
    setQuickFilter(filter);
    setSelectedCategory(null);
    setFilters({ categories: [], brands: [] });
    setSearchQuery('');
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchProducts(1, false);
    setIsRefreshing(false);
  }, [fetchProducts]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      fetchProducts(currentPage + 1, true);
    }
  }, [isLoadingMore, hasMore, isLoading, currentPage, fetchProducts]);

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
          compCode: product.compCode,
          categoryId: product.categoryId,
          parentCategoryId: product.parentCategoryId,
        },
      ]);
    },
    [addItems],
  );

  const handleApplyFilters = useCallback(
    async (sections: any[]) => {
      const newFilters = { ...filters };

      sections.forEach((section) => {
        if (section.id === 'brands') {
          newFilters.brands = section.selectedIds || [];
        }
      });

      setFilters(newFilters);
      setShowFilters(false);
      setSelectedCategory(null);

      // Immediately show skeleton and fetch products
      setIsLoading(true);
      setProducts([]);
      await fetchProducts(1, false, true);
    },
    [filters, fetchProducts],
  );

  const clearAllFilters = useCallback(async () => {
    setFilters({ categories: [], brands: [] });
    setSelectedCategory(null);
    setSearchQuery('');
    setQuickFilter('all');
    setShowFilters(false);
    resetProductsFilterCount();

    // Immediately show skeleton and fetch products
    setIsLoading(true);
    setProducts([]);
    await fetchProducts(1, false, true);
  }, [resetProductsFilterCount, fetchProducts]);

  const handleSubmit = useCallback(() => {
    if (items.length === 0) {
      Alert.alert('Cart Empty', 'Please add items to your cart before proceeding');
      return;
    }

    if (mode === 'topup' && onSubmit) {
      onSubmit(items);
    } else {
      router.push({ pathname: '/checkin/sale', params: { mode } });
    }
  }, [items, mode, onSubmit]);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
    setIsLoading(true);
    setProducts([]);
    fetchProducts(1, false, true);
  }, [fetchProducts]);

  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      setIsLoading(true);
      setProducts([]);
      fetchProducts(1, false, true);
    }
  }, [searchQuery, fetchProducts]);

  const updateHeaderConfig = useCallback(() => {
    const filterCount = calculateActiveFilterCount();

    setHeader({
      title: 'Products',
      showBack: true,
      showSearchBar: true,
      searchPlaceholder: 'Search products...',
      searchValue: searchQuery,
      onSearchChange: setSearchQuery,
      onSearchClear: handleSearchClear,
      onSearchPress: handleSearchSubmit,
      autoFocusSearch: false,
      showFilter: true,
      filterCount: filterCount,
      filterActive: filterCount > 0,
      onFilterPress: () => setShowFilters(true),
      elevated: false,
      centeredTitle: false,
      size: 'sm',
      showBorder: false,
    });
  }, [searchQuery, filters, quickFilter, calculateActiveFilterCount, setHeader]);

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([fetchProducts(1, false), fetchCategories()]);
    };
    initialize();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1, false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filters, selectedCategory, quickFilter, fetchProducts]);

  useEffect(() => {
    if (onCartUpdate) {
      onCartUpdate(items, cartSummary);
    }
  }, [items, cartSummary, onCartUpdate]);

  useEffect(() => {
    setOpenProductFilterHandler(() => setShowFilters(true));
    return () => setOpenProductFilterHandler(() => {});
  }, [setOpenProductFilterHandler]);

  useEffect(() => {
    updateHeaderConfig();
  }, [updateHeaderConfig]);

  useImperativeHandle(ref, () => ({
    clearFilters: clearAllFilters,
    getFilteredCount: () => products.length,
    openFilters: () => setShowFilters(true),
    getCartItems: () => items,
    clearCart: () => clearCart(),
    applyFilters: () => handleApplyFilters,
  }));

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
            size={14}
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
            size={14}
            color={quickFilter === 'focused' ? colors.primary : colors.textSecondary}
          />
          <AppText
            style={[
              styles.quickFilterText,
              quickFilter === 'focused' && styles.quickFilterTextActive,
            ]}
          >
            Focused
          </AppText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderCategoryList = () => (
    <View style={[styles.categoryContainer, { width: CATEGORY_WIDTH }]}>
      <ScrollView
        style={styles.categoryList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.categoryListContent}
      >
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
              size={18}
              color={
                !selectedCategory && quickFilter === 'all' ? colors.primary : colors.textSecondary
              }
            />
          </View>
          <AppText
            style={[
              styles.categoryItemName,
              !selectedCategory && quickFilter === 'all' && styles.categoryItemNameActive,
            ]}
            numberOfLines={1}
          >
            All
          </AppText>
          <AppText style={styles.categoryItemCount}>{totalCount}</AppText>
          {!selectedCategory && quickFilter === 'all' && (
            <View style={[styles.categoryItemIndicator, { backgroundColor: colors.primary }]} />
          )}
        </TouchableOpacity>

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
              <AppText
                style={[styles.categoryItemName, isActive && styles.categoryItemNameActive]}
                numberOfLines={2}
              >
                {category.name}
              </AppText>
              {isActive && (
                <View style={[styles.categoryItemIndicator, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonQuickFilters}>
        <Skeleton height={32} width={70} borderRadius={16} />
        <Skeleton height={32} width={80} borderRadius={16} />
      </View>
      <View style={styles.skeletonMainContent}>
        <View style={[styles.skeletonCategoryList, { width: CATEGORY_WIDTH }]}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={styles.skeletonCategoryItem}>
              <Skeleton height={44} width="100%" borderRadius={8} />
            </View>
          ))}
        </View>
        <View style={[styles.skeletonProductsList, { width: PRODUCT_WIDTH }]}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.skeletonProductItem}>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                <Skeleton height={80} width={80} borderRadius={12} />
                <View style={{ flex: 1, gap: 8 }}>
                  <Skeleton height={16} width="80%" borderRadius={4} />
                  <Skeleton height={12} width="60%" borderRadius={4} />
                  <Skeleton height={14} width="40%" borderRadius={4} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

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
    }

    return (
      <View style={styles.emptyStateWrapper}>
        <EmptyState
          title={title}
          description={description}
          icon={icon}
          actionLabel={hasActiveFilters ? 'Clear filters' : undefined}
          onAction={hasActiveFilters ? clearAllFilters : undefined}
          size="small"
        />
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <AppText style={styles.loadingMoreText}>Loading more products...</AppText>
      </View>
    );
  };

  const renderProductItem = ({ item, index }: { item: any; index: number }) => (
    <ProductCard
      index={index}
      product={item}
      onAddToCart={(cartItems) => handleAddToCart(cartItems, item)}
      mode={mode}
    />
  );

  const renderActionButton = () => {
    const isNoSale = mode === 'sales' && items.length === 0;

    if (!isNoSale && items.length === 0) return null;

    const handlePress = () => {
      if (isNoSale) {
        router.push('/checkin/nonsale');
      } else {
        handleSubmit();
      }
    };

    return (
      <View style={[styles.cartButtonWrapper, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity style={styles.cartButton} onPress={handlePress} activeOpacity={0.8}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark || colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cartButtonGradient}
          >
            <View style={styles.cartButtonContent}>
              <AppText style={styles.cartButtonLabel}>
                {isNoSale ? 'Add No Sale Reason' : 'Proceed'} • K{cartSummary.totalValue.toFixed(2)}
              </AppText>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  // Show skeleton on initial load or when fetching new data
  if (isLoading && products.length === 0) {
    return renderSkeletonLoader();
  }

  return (
    <View style={styles.container}>
      {renderQuickFilters()}

      <View style={styles.mainContent}>
        {renderCategoryList()}

        <View style={[styles.productsSection, { width: PRODUCT_WIDTH }]}>
          {products.length === 0 ? (
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

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        sections={filterSections}
        onApply={handleApplyFilters}
        onReset={clearAllFilters}
        title="Filter Products"
        applyButtonText={`Apply Filters`}
        resetButtonText="Reset All"
        showCount={true}
        maxHeight={600}
      />

      {renderActionButton()}
    </View>
  );
}

export const ProductsScreen = forwardRef(ProductsScreenComponent);
ProductsScreen.displayName = 'ProductsScreen';
export default ProductsScreen;
