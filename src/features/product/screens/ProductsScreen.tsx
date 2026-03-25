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
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { ProductCard, SearchBar } from '../components/product';
import { PRODUCTS_DATA } from '../constants/mockData';
import { useProductsScreenStyles } from '../styles/ProductsScreen.styles';
import { CartItem, Product } from '../types/product.types';
import { FilterSection } from '@/shared/types/filter.types';
import { FilterModal } from '@/shared/components/models/Filter.modal';
import { useFilterContext } from '@/shared/contexts/FilterContext';

// Constants
const UNITS_PER_CASE = 12;
const LOAD_MORE_THRESHOLD = 0.5;

// Types
interface CartItemWithDetails extends CartItem {
  productId: string;
  productName: string;
  price: number;
}

interface QuickFilter {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
}

interface FilterState {
  categories: string[];
  brands: string[];
  status: string[];
  rating: string | undefined;
  priceRange: { min: string; max: string };
  discounted: boolean;
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
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const { onProductsCountChange } = props;
  const { productsFilterCount, updateProductsFilterCount, resetProductsFilterCount } =
    useFilterContext();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    status: [],
    rating: undefined,
    priceRange: { min: '', max: '' },
    discounted: false,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);

  // Auto-open filters if URL param is present
  useEffect(() => {
    if (params.openFilters === 'true') {
      setShowFilters(true);
      router.setParams({ openFilters: undefined });
    }
  }, [params.openFilters]);

  // Update header options when screen is focused
  useFocusEffect(
    useCallback(() => {
      // Set the header filter press handler
      navigation.setOptions({
        onFilterPress: () => {
          setShowFilters(true);
        },
      });
    }, [navigation]),
  );

  // Memoized data
  const categories = useMemo(() => [...new Set(PRODUCTS_DATA.map((p) => p.category))].sort(), []);
  const brands = useMemo(() => [...new Set(PRODUCTS_DATA.map((p) => p.brand))].sort(), []);

  // Calculate active filter count
  const calculateActiveFilterCount = useCallback(() => {
    let count = 0;
    count += filters.categories.length;
    count += filters.brands.length;
    count += filters.status.length;
    if (filters.rating) count++;
    if (filters.priceRange.min || filters.priceRange.max) count++;
    if (filters.discounted) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [filters, searchQuery]);

  // Update filter count in context whenever filters change
  useEffect(() => {
    const count = calculateActiveFilterCount();
    updateProductsFilterCount(count);
  }, [filters, searchQuery, calculateActiveFilterCount, updateProductsFilterCount]);

  // Reset filter count on unmount
  useEffect(() => {
    return () => {
      resetProductsFilterCount();
    };
  }, [resetProductsFilterCount]);

  // Filter products
  const filteredProducts = useMemo(() => {
    const result = PRODUCTS_DATA.filter((product) => {
      // Category filter
      if (filters.categories.length && !filters.categories.includes(product.category)) {
        return false;
      }

      // Brand filter
      if (filters.brands.length && !filters.brands.includes(product.brand)) {
        return false;
      }

      // Status filter
      if (filters.status.length && !filters.status.includes(product.status)) {
        return false;
      }

      // Price range filter
      if (filters.priceRange.min && product.price < Number(filters.priceRange.min)) {
        return false;
      }
      if (filters.priceRange.max && product.price > Number(filters.priceRange.max)) {
        return false;
      }

      // Rating filter
      if (filters.rating && product.ratings < Number(filters.rating)) {
        return false;
      }

      // Discount filter
      if (filters.discounted && product.discount <= 0) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return (
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query)
        );
      }

      return true;
    });

    // Notify parent of count change
    if (onProductsCountChange) {
      onProductsCountChange(result.length);
    }

    return result;
  }, [filters, searchQuery, onProductsCountChange]);

  // Filter sections for modal
  const filterSections = useMemo(
    (): any[] => [
      {
        id: 'categories',
        title: 'Categories',
        type: 'multiple',
        icon: 'apps-outline',
        options: categories.map((cat) => ({
          id: cat,
          label: cat,
          count: PRODUCTS_DATA.filter((p) => p.category === cat).length,
        })),
        selectedIds: filters.categories,
      },
      {
        id: 'brands',
        title: 'Brands',
        type: 'multiple',
        icon: 'business-outline',
        options: brands.map((brand) => ({
          id: brand,
          label: brand,
          count: PRODUCTS_DATA.filter((p) => p.brand === brand).length,
        })),
        selectedIds: filters.brands,
      },
      {
        id: 'status',
        title: 'Stock Status',
        type: 'multiple',
        icon: 'cube-outline',
        options: [
          {
            id: 'in_stock',
            label: 'In Stock',
            count: PRODUCTS_DATA.filter((p) => p.status === 'in_stock').length,
          },
          {
            id: 'low_stock',
            label: 'Low Stock',
            count: PRODUCTS_DATA.filter((p) => p.status === 'low_stock').length,
          },
          {
            id: 'out_of_stock',
            label: 'Out of Stock',
            count: PRODUCTS_DATA.filter((p) => p.status === 'out_of_stock').length,
          },
        ],
        selectedIds: filters.status,
      },
      {
        id: 'price',
        title: 'Price Range (₹)',
        type: 'range',
        icon: 'cash-outline',
        rangeValue: filters.priceRange,
        min: 0,
        max: 10000,
      },
      {
        id: 'rating',
        title: 'Rating',
        type: 'single',
        icon: 'star-outline',
        options: [
          { id: '4', label: '4★ & above' },
          { id: '3', label: '3★ & above' },
          { id: '2', label: '2★ & above' },
        ],
        selectedId: filters.rating,
      },
      {
        id: 'offers',
        title: 'Offers',
        type: 'toggle',
        icon: 'pricetag-outline',
        toggleValue: filters.discounted,
      },
    ],
    [categories, brands, filters],
  );

  // Quick filters
  const quickFilters: QuickFilter[] = useMemo(
    () => [
      {
        id: 'in_stock',
        label: 'In Stock',
        icon: 'checkmark-circle',
        active: filters.status.includes('in_stock'),
      },
      {
        id: 'discounted',
        label: 'Offers',
        icon: 'pricetag',
        active: filters.discounted,
      },
      {
        id: 'low_stock',
        label: 'Low Stock',
        icon: 'alert-circle',
        active: filters.status.includes('low_stock'),
      },
    ],
    [filters.status, filters.discounted],
  );

  // Cart summary
  const cartSummary = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => {
        if (item.type === 'cases') {
          acc.totalUnits += item.quantity * UNITS_PER_CASE;
          acc.totalValue += item.quantity * item.price;
        } else {
          acc.totalUnits += item.quantity;
          acc.totalValue += item.quantity * item.price;
        }
        return acc;
      },
      { totalUnits: 0, totalValue: 0 },
    );
  }, [cartItems]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    clearFilters: () => {
      setFilters({
        categories: [],
        brands: [],
        status: [],
        rating: undefined,
        priceRange: { min: '', max: '' },
        discounted: false,
      });
      setSearchQuery('');
      resetProductsFilterCount();
    },
    applyFilters: (newFilters: any) => {
      console.log('Apply filters called from parent', newFilters);
    },
    getFilteredCount: () => filteredProducts.length,
    openFilters: () => {
      setShowFilters(true);
    },
  }));

  // Handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loading && filteredProducts.length >= 10) {
      setLoading(true);
      setTimeout(() => setLoading(false), 1000);
    }
  }, [loading, filteredProducts.length]);

  const handleAddToCart = useCallback((items: CartItem[], product: Product) => {
    if (!items?.length) return;

    const newItems: CartItemWithDetails[] = items.map((item) => ({
      ...item,
      productId: product.id,
      productName: product.name,
      price: item.type === 'cases' ? product.price * UNITS_PER_CASE * 0.95 : product.price,
    }));

    setCartItems((prev) => [...prev, ...newItems]);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    Alert.alert('✅ Added to Cart', `${itemCount} item(s) added`, [{ text: 'OK' }]);
  }, []);

  const toggleQuickFilter = useCallback((filter: QuickFilter) => {
    if (filter.id === 'discounted') {
      setFilters((prev) => ({ ...prev, discounted: !prev.discounted }));
    } else {
      setFilters((prev) => ({
        ...prev,
        status: prev.status.includes(filter.id)
          ? prev.status.filter((id) => id !== filter.id)
          : [...prev.status, filter.id],
      }));
    }
  }, []);

  const handleApplyFilters = useCallback(
    (sections: FilterSection[]) => {
      const newFilters: FilterState = { ...filters };

      sections.forEach((section) => {
        switch (section.id) {
          case 'categories':
            newFilters.categories = section.selectedIds || [];
            break;
          case 'brands':
            newFilters.brands = section.selectedIds || [];
            break;
          case 'status':
            newFilters.status = section.selectedIds || [];
            break;
          case 'rating':
            newFilters.rating = section.selectedId;
            break;
          case 'offers':
            newFilters.discounted = section.toggleValue || false;
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
      categories: [],
      brands: [],
      status: [],
      rating: undefined,
      priceRange: { min: '', max: '' },
      discounted: false,
    });
    setSearchQuery('');
    setShowFilters(false);
    router.setParams({ openFilters: undefined });
    resetProductsFilterCount();
  }, [resetProductsFilterCount]);

  const handleProcessSale = useCallback(() => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Add items to cart before processing sale');
      return;
    }

    router.push('/checkin/sale');

    Alert.alert(
      'Process Sale',
      `Total: ${cartSummary.totalUnits} units\nAmount: ₹${cartSummary.totalValue.toFixed(2)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setCartItems([]);
            Alert.alert('Success', 'Sale completed successfully');
          },
        },
      ],
    );
  }, [cartItems, cartSummary]);

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

  const renderFooter = () =>
    loading ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.primary} size="small" />
      </View>
    ) : null;

  const renderCartButton = () =>
    cartItems.length > 0 ? (
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

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </View>

      {/* Quick Filters */}
      {renderQuickFilters()}

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
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
        applyButtonText={`Show ${filteredProducts.length} products`}
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
