// ProductsScreen.tsx (Add header filter handler)
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
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { ProductCard, SearchBar } from '../components/product';
import { useProductsScreenStyles } from '../styles/ProductsScreen.styles';
import { CartItemWithDetails, Product } from '../types/product.types';
import { FilterSection } from '@/shared/types/filter.types';
import { FilterModal } from '@/shared/components/models/Filter.modal';
import { useFilterContext } from '@/shared/contexts/FilterContext';
import { categoryService } from '@/shared/services/category.service';
import { productService } from '@/shared/services/product.service';
import { useCartStore } from '@/core/store/cart.store';

// Constants
const LOAD_MORE_THRESHOLD = 0.5;
const PAGE_SIZE = 20;

// Types

interface FilterState {
  categories: {
    name: string;
    categoryId: string;
  }[];
  brands: string[];
}

export interface ProductsScreenRef {
  clearFilters: () => void;
  applyFilters: (filters: any) => void;
  getFilteredCount: () => number;
  openFilters: () => void;
}

interface ProductsScreenProps {
  onProductsCountChange?: (count: number) => void;
}

const ProductsScreen = forwardRef<ProductsScreenRef, ProductsScreenProps>((props, ref) => {
  const { colors } = useTheme();
  const styles = useProductsScreenStyles();
  const { onProductsCountChange } = props;
  const { setOpenProductFilterHandler, resetProductsFilterCount } = useFilterContext();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // API Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { addItems, items, summary, hydrate } = useCartStore();
  // const { activeVisit } = useOutletStore();

  // Fetch products from API
  const fetchProducts = useCallback(
    async (
      page: number = 1,
      shouldAppend: boolean = false,
      search: string = searchQuery,
      categoryIds?: string[],
      brandNames?: string[],
    ) => {
      try {
        if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const params: any = {
          page,
          limit: PAGE_SIZE,
          searchText: search || undefined,
        };

        // Add category filter if selected
        if (categoryIds?.length) {
          params.categoryIds = categoryIds.join(',');
        }

        // Add brand filter if selected
        if (brandNames?.length) {
          params.brands = brandNames.join(',');
        }

        const response: any = await productService.fetchProducts(params);

        if (response?.success) {
          const newProducts = response.data || [];
          // if (items.length) {
          //   newProducts.forEach((item: any) => {
          //     const findItem = items.find((_item) => item.productId === _item.productId);
          //     if (findItem) {
          //       if (findItem.caseQty) {
          //         item.caseQty = findItem.caseQty;
          //       }
          //       if (findItem?.pieceQty) {
          //         item.pieceQty = findItem.pieceQty;
          //       }
          //     }
          //   });
          // }
          const total = response.total || 0;

          // Use backend data as single source of truth
          // No transformation needed - trust backend values
          if (shouldAppend) {
            setProducts((prev) => [...prev, ...newProducts]);
          } else {
            setProducts(newProducts);
          }

          setTotalCount(total);
          setHasMore(page * PAGE_SIZE < total);
          setCurrentPage(page);
        } else {
          console.error('Failed to fetch products:', response?.message);
          if (page === 1) {
            setProducts([]);
            setHasMore(false);
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        Alert.alert('Error', 'Failed to load products. Please try again.');
        if (page === 1) {
          setProducts([]);
        }
      } finally {
        if (page === 1) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [searchQuery],
  );

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

  useEffect(() => {
    useCartStore.getState().hydrate();
    console.log(items, '============items===============');
  }, []);

  // Fetch brands from API
  const fetchBrands = useCallback(async () => {
    try {
      // const response: any = await productService.fetchBrands();
      // if (response?.success) {
      //   setBrands(response.data || []);
      // }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const params: any = {
        page: 1,
        limit: 100,
      };
      const response: any = await categoryService.fetchCategory(params);
      if (response?.success) {
        setFilters((prev) => ({ ...prev, categories: response.data }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts(1, false);
    fetchBrands();
    fetchCategories();
  }, []);

  // Handle filter changes
  useEffect(() => {
    const categoryIds = filters.categories.map((cat) => cat.categoryId);
    const brandNames = filters.brands;
    fetchProducts(1, false, searchQuery, categoryIds, brandNames);
  }, [filters, searchQuery]);

  // Set up filter handler from context
  useEffect(() => {
    setOpenProductFilterHandler(() => {
      setShowFilters(true);
    });

    return () => {
      setOpenProductFilterHandler(() => {});
    };
  }, [setOpenProductFilterHandler]);

  // Calculate active filter count
  const calculateActiveFilterCount = useCallback(() => {
    let count = 0;
    count += filters.categories.length;
    count += filters.brands.length;
    if (searchQuery.trim()) count++;
    return count;
  }, [filters, searchQuery]);

  // Reset filter count on unmount
  useEffect(() => {
    return () => {
      resetProductsFilterCount();
    };
  }, [resetProductsFilterCount]);

  // Filter sections for modal
  const filterSections = useMemo(
    (): any[] => [
      {
        id: 'categories',
        title: 'Categories',
        type: 'multiple',
        icon: 'apps-outline',
        options: filters.categories?.map((item) => ({
          label: item.name,
          id: item.categoryId,
          count: 0,
        })),
        selectedIds: filters.categories.map((cat) => cat.categoryId),
      },
      {
        id: 'brands',
        title: 'Brands',
        type: 'multiple',
        icon: 'business-outline',
        options: brands.map((brand) => ({
          id: brand,
          label: brand,
        })),
        selectedIds: filters.brands,
      },
    ],
    [brands, filters],
  );

  const cartSummary = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const caseUnits = (item.caseQty || 0) * item.unitQtyInCase;
        const pieceUnits = item.pieceQty || 0;

        acc.totalUnits += caseUnits + pieceUnits;

        acc.totalValue +=
          (item.caseQty || 0) * item.casePrice + (item.pieceQty || 0) * item.piecePrice;

        return acc;
      },
      { totalUnits: 0, totalValue: 0 },
    );
  }, [items]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    clearFilters: () => {
      setFilters({
        categories: [],
        brands: [],
      });
      setSearchQuery('');
      resetProductsFilterCount();
    },
    applyFilters: (newFilters: any) => {
      console.log('Apply filters called from parent', newFilters);
    },
    getFilteredCount: () => products.length,
    openFilters: () => {
      setShowFilters(true);
    },
  }));

  // Handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts(1, false);
    setRefreshing(false);
  }, [fetchProducts]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      fetchProducts(currentPage + 1, true);
    }
  }, [loadingMore, hasMore, loading, currentPage, fetchProducts]);

  const handleAddToCart = useCallback(
    (items: CartItemWithDetails[], product: Product) => {
      if (!items?.length || !product) return;

      console.log(items, '==============items===============');
      // Convert incoming items → single merged item
      let caseQty = 0;
      let pieceQty = 0;

      items.forEach((item) => {
        caseQty += item.caseQty || 0;
        pieceQty += item.pieceQty || 0;
      });

      // if (caseQty === 0 && pieceQty === 0) return;

      // ✅ Send to store
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
        },
      ]);

      const totalItems = caseQty + pieceQty;

      const totalValue = caseQty * product.casePrice + pieceQty * product.piecePrice;

      Alert.alert(
        '✅ Added to Cart',
        `${totalItems} item(s) added\nTotal: ₹${totalValue.toFixed(2)}`,
        [{ text: 'OK' }],
      );
    },
    [addItems],
  );

  const handleApplyFilters = useCallback(
    (sections: FilterSection[]) => {
      const newFilters: FilterState = { ...filters };

      sections.forEach((section) => {
        switch (section.id) {
          case 'categories':
            const selectedCategories = filters.categories.filter((cat) =>
              section.selectedIds?.includes(cat.categoryId),
            );
            newFilters.categories = selectedCategories;
            break;
          case 'brands':
            newFilters.brands = section.selectedIds || [];
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
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      categories: [],
      brands: [],
    });
    setSearchQuery('');
    setShowFilters(false);
    resetProductsFilterCount();
  }, [resetProductsFilterCount]);

  const handleProcessSale = useCallback(() => {
    if (items.length === 0) {
      Alert.alert('Cart Empty', 'Add items to cart before processing sale');
      return;
    }

    // Store cart items in context or params for checkout screen
    router.push({
      pathname: '/checkin/sale',
    });
  }, [items, cartSummary]);

  // Render functions
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cube-outline" size={48} color={colors.textTertiary} />
      <Text style={styles.emptyStateTitle}>No products found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery ? `No matches for "${searchQuery}"` : 'Try changing your filters'}
      </Text>
      {calculateActiveFilterCount() > 0 && (
        <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
          <Text style={[styles.clearFiltersText, { color: colors.primary }]}>Clear filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.primary} size="small" />
      </View>
    );
  };

  const renderCartButton = () =>
    items.length > 0 ? (
      <TouchableOpacity
        style={[styles.cartButton, { backgroundColor: colors.primary }]}
        onPress={handleProcessSale}
        activeOpacity={0.9}
      >
        <View style={styles.cartButtonContent}>
          <View>
            <Text style={styles.cartButtonLabel}>Ready to checkout</Text>
            <Text style={styles.cartButtonTotal}>
              {cartSummary.totalUnits} units • ₹{cartSummary.totalValue.toFixed(2)}
            </Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={28} color="white" />
        </View>
      </TouchableOpacity>
    ) : null;

  // if (loading && products.length === 0) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color={colors.primary} />
  //     </View>
  //   );
  // }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </View>

      {/* Product List */}
      {products.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={productsWithCart}
          keyExtractor={(item) => item.productId}
          renderItem={({ item, index }) => (
            <ProductCard
              product={item}
              index={index}
              onAddToCart={(items) => handleAddToCart(items, item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={LOAD_MORE_THRESHOLD}
          ListFooterComponent={renderFooter}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={handleCloseFilters}
        sections={filterSections}
        onApply={handleApplyFilters}
        onReset={clearAllFilters}
        title="Filter Products"
        applyButtonText={`Show ${totalCount} products`}
        resetButtonText="Reset"
        showCount={true}
        maxHeight={600}
      />

      {/* Cart Button */}
      {renderCartButton()}
    </View>
  );
});

ProductsScreen.displayName = 'ProductsScreen';

export default ProductsScreen;
