// // ProductsScreen.tsx (Add header filter handler)
// import React, {
//   useState,
//   useMemo,
//   useCallback,
//   useEffect,
//   forwardRef,
//   useImperativeHandle,
// } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   RefreshControl,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { router } from 'expo-router';
// import { useTheme } from '@/shared/hooks/useTheme';
// import { ProductCard, SearchBar } from '../components/product';
// import { useProductsScreenStyles } from '../styles/ProductsScreen.styles';
// import { CartItemWithDetails, Product } from '../types/product.types';
// import { FilterSection } from '@/shared/types/filter.types';
// import { FilterModal } from '@/shared/components/models/Filter.modal';
// import { useFilterContext } from '@/shared/contexts/FilterContext';
// import { categoryService } from '@/shared/services/category.service';
// import { productService } from '@/shared/services/product.service';
// import { useCartStore } from '@/core/store/cart.store';

// // Constants
// const LOAD_MORE_THRESHOLD = 0.5;
// const PAGE_SIZE = 20;

// // Types

// interface FilterState {
//   categories: {
//     name: string;
//     categoryId: string;
//   }[];
//   brands: string[];
// }

// export interface ProductsScreenRef {
//   clearFilters: () => void;
//   applyFilters: (filters: any) => void;
//   getFilteredCount: () => number;
//   openFilters: () => void;
// }

// interface ProductsScreenProps {
//   onProductsCountChange?: (count: number) => void;
// }

// const ProductsScreen = forwardRef<ProductsScreenRef, ProductsScreenProps>((props, ref) => {
//   const { colors } = useTheme();
//   const styles = useProductsScreenStyles();
//   const { onProductsCountChange } = props;
//   const { setOpenProductFilterHandler, resetProductsFilterCount } = useFilterContext();

//   // State
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filters, setFilters] = useState<FilterState>({
//     categories: [],
//     brands: [],
//   });
//   const [refreshing, setRefreshing] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [showFilters, setShowFilters] = useState(false);

//   // API Data States
//   const [products, setProducts] = useState<Product[]>([]);
//   const [brands, setBrands] = useState<string[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [totalCount, setTotalCount] = useState(0);
//   const { addItems, items, summary, hydrate } = useCartStore();
//   const [categoriesList, setCategoriesList] = useState<any[]>([]);
//   // const { activeVisit } = useOutletStore();

//   // Fetch products from API
//   const fetchProducts = useCallback(
//     async (
//       page: number = 1,
//       shouldAppend: boolean = false,
//       search: string = searchQuery,
//       categoryIds?: string[],
//       brandNames?: string[],
//     ) => {
//       try {
//         if (page === 1) {
//           setLoading(true);
//         } else {
//           setLoadingMore(true);
//         }

//         const params: any = {
//           page,
//           limit: PAGE_SIZE,
//           searchText: search || undefined,
//         };

//         // Add category filter if selected
//         if (categoryIds?.length) {
//           params.categoryIds = categoryIds.join(',');
//         }

//         // Add brand filter if selected
//         if (brandNames?.length) {
//           params.brands = brandNames.join(',');
//         }

//         const response: any = await productService.fetchProducts(params);

//         if (response?.success) {
//           const newProducts = response.data || [];
//           // if (items.length) {
//           //   newProducts.forEach((item: any) => {
//           //     const findItem = items.find((_item) => item.productId === _item.productId);
//           //     if (findItem) {
//           //       if (findItem.caseQty) {
//           //         item.caseQty = findItem.caseQty;
//           //       }
//           //       if (findItem?.pieceQty) {
//           //         item.pieceQty = findItem.pieceQty;
//           //       }
//           //     }
//           //   });
//           // }
//           const total = response.total || 0;

//           // Use backend data as single source of truth
//           // No transformation needed - trust backend values
//           if (shouldAppend) {
//             setProducts((prev) => [...prev, ...newProducts]);
//           } else {
//             setProducts(newProducts);
//           }

//           setTotalCount(total);
//           setHasMore(page * PAGE_SIZE < total);
//           setCurrentPage(page);
//         } else {
//           console.error('Failed to fetch products:', response?.message);
//           if (page === 1) {
//             setProducts([]);
//             setHasMore(false);
//           }
//         }
//       } catch (error) {
//         console.error('Error fetching products:', error);
//         Alert.alert('Error', 'Failed to load products. Please try again.');
//         if (page === 1) {
//           setProducts([]);
//         }
//       } finally {
//         if (page === 1) {
//           setLoading(false);
//         } else {
//           setLoadingMore(false);
//         }
//       }
//     },
//     [searchQuery],
//   );

//   const productsWithCart = useMemo(() => {
//     return products.map((product) => {
//       const cartItem = items.find((i) => i.productId === product.productId);

//       return {
//         ...product,
//         caseQty: cartItem?.caseQty || 0,
//         pieceQty: cartItem?.pieceQty || 0,
//       };
//     });
//   }, [products, items]);

//   useEffect(() => {
//     useCartStore.getState().hydrate();
//     console.log(items, '============items===============');
//   }, []);

//   // Fetch brands from API
//   const fetchBrands = useCallback(async () => {
//     try {
//       // const response: any = await productService.fetchBrands();
//       // if (response?.success) {
//       //   setBrands(response.data || []);
//       // }
//     } catch (error) {
//       console.error('Error fetching brands:', error);
//     }
//   }, []);

//   // Fetch categories
//   const fetchCategories = useCallback(async () => {
//     try {
//       const params: any = {
//         page: 1,
//         limit: 100,
//       };

//       const response: any = await categoryService.fetchCategory(params);

//       if (response?.success) {
//         setCategoriesList(response.data); // ✅ store all options
//       }
//     } catch (error) {
//       console.error('Error fetching categories:', error);
//     }
//   }, []);

//   // Initial load
//   useEffect(() => {
//     fetchProducts(1, false);
//     fetchBrands();
//     fetchCategories();
//   }, []);

//   // Handle filter changes
//   useEffect(() => {
//     const categoryIds = filters.categories.map((cat) => cat.categoryId);
//     const brandNames = filters.brands;
//     fetchProducts(1, false, searchQuery, categoryIds, brandNames);
//   }, [filters, searchQuery]);

//   // Set up filter handler from context
//   useEffect(() => {
//     setOpenProductFilterHandler(() => {
//       setShowFilters(true);
//     });

//     return () => {
//       setOpenProductFilterHandler(() => {});
//     };
//   }, [setOpenProductFilterHandler]);

//   // Calculate active filter count
//   const calculateActiveFilterCount = useCallback(() => {
//     let count = 0;
//     count += filters.categories.length;
//     count += filters.brands.length;
//     if (searchQuery.trim()) count++;
//     return count;
//   }, [filters, searchQuery]);

//   // Reset filter count on unmount
//   useEffect(() => {
//     return () => {
//       resetProductsFilterCount();
//     };
//   }, [resetProductsFilterCount]);

//   // Filter sections for modal
//   const filterSections = useMemo(
//     (): any[] => [
//       {
//         id: 'categories',
//         title: 'Categories',
//         type: 'multiple',
//         icon: 'apps-outline',
//         options: categoriesList.map((item) => ({
//           label: item.name,
//           id: item.categoryId,
//         })),
//         selectedIds: filters.categories.map((cat) => cat.categoryId),
//       },
//       {
//         id: 'brands',
//         title: 'Brands',
//         type: 'multiple',
//         icon: 'business-outline',
//         options: brands.map((brand) => ({
//           id: brand,
//           label: brand,
//         })),
//         selectedIds: filters.brands,
//       },
//     ],
//     [brands, filters],
//   );

//   const cartSummary = useMemo(() => {
//     return items.reduce(
//       (acc, item) => {
//         const caseUnits = (item.caseQty || 0) * item.unitQtyInCase;
//         const pieceUnits = item.pieceQty || 0;

//         acc.totalUnits += caseUnits + pieceUnits;

//         acc.totalValue +=
//           (item.caseQty || 0) * item.casePrice + (item.pieceQty || 0) * item.piecePrice;

//         return acc;
//       },
//       { totalUnits: 0, totalValue: 0 },
//     );
//   }, [items]);

//   // Expose methods to parent
//   useImperativeHandle(ref, () => ({
//     clearFilters: () => {
//       setFilters({
//         categories: [],
//         brands: [],
//       });
//       setSearchQuery('');
//       resetProductsFilterCount();
//     },
//     applyFilters: (newFilters: any) => {
//       console.log('Apply filters called from parent', newFilters);
//     },
//     getFilteredCount: () => products.length,
//     openFilters: () => {
//       setShowFilters(true);
//     },
//   }));

//   // Handlers
//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await fetchProducts(1, false);
//     setRefreshing(false);
//   }, [fetchProducts]);

//   const handleLoadMore = useCallback(() => {
//     if (!loadingMore && hasMore && !loading) {
//       fetchProducts(currentPage + 1, true);
//     }
//   }, [loadingMore, hasMore, loading, currentPage, fetchProducts]);

//   const handleAddToCart = useCallback(
//     (items: CartItemWithDetails[], product: Product) => {
//       if (!items?.length || !product) return;

//       console.log(items, '==============items===============');
//       // Convert incoming items → single merged item
//       let caseQty = 0;
//       let pieceQty = 0;

//       items.forEach((item) => {
//         caseQty += item.caseQty || 0;
//         pieceQty += item.pieceQty || 0;
//       });

//       // if (caseQty === 0 && pieceQty === 0) return;

//       // ✅ Send to store
//       addItems([
//         {
//           productId: product.productId,
//           productName: product.name,
//           casePrice: product.casePrice,
//           piecePrice: product.piecePrice,
//           unitQtyInCase: product.unitQtyInCase,
//           caseQty,
//           pieceQty,
//           stock: product.stock,
//           caseNetWeight: product?.caseNetWeight,
//           pieceNetWeight: product?.pieceNetWeight,
//         },
//       ]);

//       const totalItems = caseQty + pieceQty;

//       const totalValue = caseQty * product.casePrice + pieceQty * product.piecePrice;

//       Alert.alert(
//         '✅ Added to Cart',
//         `${totalItems} item(s) added\nTotal: K${totalValue.toFixed(2)}`,
//         [{ text: 'OK' }],
//       );
//     },
//     [addItems],
//   );

//   const handleApplyFilters = useCallback(
//     (sections: FilterSection[]) => {
//       const newFilters: FilterState = { ...filters };

//       sections.forEach((section) => {
//         switch (section.id) {
//           case 'categories':
//             newFilters.categories = categoriesList.filter((cat) =>
//               section.selectedIds?.includes(cat.categoryId),
//             );
//             break;
//           case 'brands':
//             newFilters.brands = section.selectedIds || [];
//             break;
//         }
//       });

//       setFilters(newFilters);
//       setShowFilters(false);
//     },
//     [filters],
//   );

//   const handleCloseFilters = useCallback(() => {
//     setShowFilters(false);
//   }, []);

//   const clearAllFilters = useCallback(() => {
//     setFilters({
//       categories: [],
//       brands: [],
//     });
//     setSearchQuery('');
//     setShowFilters(false);
//     resetProductsFilterCount();
//   }, [resetProductsFilterCount]);

//   const handleProcessSale = useCallback(() => {
//     if (items.length === 0) {
//       Alert.alert('Cart Empty', 'Add items to cart before processing sale');
//       return;
//     }

//     // Store cart items in context or params for checkout screen
//     router.push({
//       pathname: '/checkin/sale',
//     });
//   }, [items, cartSummary]);

//   // Render functions
//   const renderEmptyState = () => (
//     <View style={styles.emptyState}>
//       <Ionicons name="cube-outline" size={48} color={colors.textTertiary} />
//       <Text style={styles.emptyStateTitle}>No products found</Text>
//       <Text style={styles.emptyStateText}>
//         {searchQuery ? `No matches for "${searchQuery}"` : 'Try changing your filters'}
//       </Text>
//       {calculateActiveFilterCount() > 0 && (
//         <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
//           <Text style={[styles.clearFiltersText, { color: colors.primary }]}>Clear filters</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );

//   const renderFooter = () => {
//     if (!loadingMore) return null;
//     return (
//       <View style={styles.footerLoader}>
//         <ActivityIndicator color={colors.primary} size="small" />
//       </View>
//     );
//   };

//   const renderCartButton = () =>
//     items.length > 0 ? (
//       <TouchableOpacity
//         style={[styles.cartButton, { backgroundColor: colors.primary }]}
//         onPress={handleProcessSale}
//         activeOpacity={0.9}
//       >
//         <View style={styles.cartButtonContent}>
//           <View>
//             <Text style={styles.cartButtonLabel}>Ready to checkout</Text>
//             <Text style={styles.cartButtonTotal}>
//               {cartSummary.totalUnits} units • K{cartSummary.totalValue.toFixed(2)}
//             </Text>
//           </View>
//           <Ionicons name="arrow-forward-circle" size={28} color="white" />
//         </View>
//       </TouchableOpacity>
//     ) : null;

//   // if (loading && products.length === 0) {
//   //   return (
//   //     <View style={styles.loadingContainer}>
//   //       <ActivityIndicator size="large" color={colors.primary} />
//   //     </View>
//   //   );
//   // }

//   return (
//     <View style={styles.container}>
//       {/* Search Bar */}
//       <View style={styles.searchWrapper}>
//         <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
//       </View>

//       {/* Product List */}
//       {products.length === 0 ? (
//         renderEmptyState()
//       ) : (
//         <FlatList
//           data={productsWithCart}
//           keyExtractor={(item) => item.productId}
//           renderItem={({ item, index }) => (
//             <ProductCard
//               product={item}
//               index={index}
//               onAddToCart={(items) => handleAddToCart(items, item)}
//             />
//           )}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               tintColor={colors.primary}
//               colors={[colors.primary]}
//             />
//           }
//           onEndReached={handleLoadMore}
//           onEndReachedThreshold={LOAD_MORE_THRESHOLD}
//           ListFooterComponent={renderFooter}
//           maxToRenderPerBatch={10}
//           windowSize={5}
//           removeClippedSubviews={true}
//         />
//       )}

//       {/* Filter Modal */}
//       <FilterModal
//         visible={showFilters}
//         onClose={handleCloseFilters}
//         sections={filterSections}
//         onApply={handleApplyFilters}
//         onReset={clearAllFilters}
//         title="Filter Products"
//         applyButtonText={`Show ${totalCount} products`}
//         resetButtonText="Reset"
//         showCount={true}
//         maxHeight={600}
//       />

//       {/* Cart Button */}
//       {renderCartButton()}
//     </View>
//   );
// });

// ProductsScreen.displayName = 'ProductsScreen';

// export default ProductsScreen;

// ProductsScreen.tsx (modified sections only)
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
export type ScreenMode = 'sales' | 'topup';

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
  getCartItems: () => any[];
  clearCart: () => void;
}

interface ProductsScreenProps {
  mode?: ScreenMode;
  onProductsCountChange?: (count: number) => void;
  onCartUpdate?: (
    items: any[],
    summary: { totalUnits: number; totalValue: number; totalWeight: number; totalItems: number },
  ) => void;
  onSubmit?: (items: any[]) => void;
  warehouseId?: string;
  vanId?: string;
  submitButtonText?: string;
  maxQuantityLimit?: number; // New prop for max quantity limit
}

const ProductsScreen = forwardRef<ProductsScreenRef, ProductsScreenProps>((props, ref) => {
  const { colors } = useTheme();
  const styles = useProductsScreenStyles();
  const {
    mode = 'sales',
    onProductsCountChange,
    onCartUpdate,
    onSubmit,
    warehouseId,
    vanId,
    submitButtonText,
    maxQuantityLimit = 999999, // Default high limit for top-up
  } = props;
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
  const { addItems, items, hydrate, clearCart } = useCartStore();
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  // Check if mode is topup (unlimited)
  const isUnlimitedMode = mode === 'topup';

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

        if (categoryIds?.length) {
          params.categoryIds = categoryIds.join(',');
        }

        if (brandNames?.length) {
          params.brands = brandNames.join(',');
        }

        const response: any = await productService.fetchProducts(params);

        if (response?.success) {
          const newProducts = response.data || [];
          const total = response.total || 0;

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
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      // API call for brands
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const params: any = {
        page: 1,
        limit: 100,
      };

      const response: any = await categoryService.fetchCategory(params);

      if (response?.success) {
        setCategoriesList(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts(1, false);
    fetchBrands();
    fetchCategories();
  }, []);

  useEffect(() => {
    const categoryIds = filters.categories.map((cat) => cat.categoryId);
    const brandNames = filters.brands;
    fetchProducts(1, false, searchQuery, categoryIds, brandNames);
  }, [filters, searchQuery]);

  useEffect(() => {
    setOpenProductFilterHandler(() => {
      setShowFilters(true);
    });

    return () => {
      setOpenProductFilterHandler(() => {});
    };
  }, [setOpenProductFilterHandler]);

  const calculateActiveFilterCount = useCallback(() => {
    let count = 0;
    count += filters.categories.length;
    count += filters.brands.length;
    if (searchQuery.trim()) count++;
    return count;
  }, [filters, searchQuery]);

  useEffect(() => {
    return () => {
      resetProductsFilterCount();
    };
  }, [resetProductsFilterCount]);

  const filterSections = useMemo(
    (): any[] => [
      {
        id: 'categories',
        title: 'Categories',
        type: 'multiple',
        icon: 'apps-outline',
        options: categoriesList.map((item) => ({
          label: item.name,
          id: item.categoryId,
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
    [brands, filters, categoriesList],
  );

  const cartSummary = useMemo(() => {
    const summary = items.reduce(
      (acc, item) => {
        const caseUnits = (item.caseQty || 0) * item.unitQtyInCase;
        const pieceUnits = item.pieceQty || 0;

        acc.totalUnits += caseUnits + pieceUnits;
        acc.totalItems += 1;
        acc.totalWeight +=
          (item.caseQty || 0) * (item.caseNetWeight || 0) +
          (item.pieceQty || 0) * (item.pieceNetWeight || 0);
        acc.totalValue +=
          (item.caseQty || 0) * item.casePrice + (item.pieceQty || 0) * item.piecePrice;

        return acc;
      },
      { totalUnits: 0, totalValue: 0, totalItems: 0, totalWeight: 0 },
    );
    return summary;
  }, [items]);

  useEffect(() => {
    if (onCartUpdate) {
      onCartUpdate(items, cartSummary);
    }
  }, [items, cartSummary, onCartUpdate]);

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
    getCartItems: () => items,
    clearCart: () => {
      clearCart();
    },
  }));

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

      let caseQty = 0;
      let pieceQty = 0;

      items.forEach((item) => {
        caseQty += item.caseQty || 0;
        pieceQty += item.pieceQty || 0;
      });

      // Check stock limits only for sales mode
      if (!isUnlimitedMode && product.stock !== undefined) {
        const currentCartItem = items.find((i) => i.productId === product.productId);
        const currentQty =
          (currentCartItem?.caseQty || 0) * product.unitQtyInCase +
          (currentCartItem?.pieceQty || 0);
        const newTotalQty = currentQty + (caseQty * product.unitQtyInCase + pieceQty);

        if (newTotalQty > (product.stock || 0)) {
          Alert.alert(
            'Stock Limit Exceeded',
            `Only ${product.stock} units available in stock. You currently have ${currentQty} units in cart.`,
            [{ text: 'OK' }],
          );
          return;
        }
      }

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
          caseNetWeight: product?.caseNetWeight,
          pieceNetWeight: product?.pieceNetWeight,
        },
      ]);

      const totalItems = caseQty + pieceQty;
      const totalValue = caseQty * product.casePrice + pieceQty * product.piecePrice;

      const message = isUnlimitedMode
        ? `${totalItems} item(s) added to top-up\nTotal: K${totalValue.toFixed(2)}`
        : `${totalItems} item(s) added to cart\nTotal: K${totalValue.toFixed(2)}`;

      Alert.alert('✅ Added', message, [{ text: 'OK' }]);
    },
    [addItems, isUnlimitedMode],
  );

  const handleApplyFilters = useCallback(
    (sections: FilterSection[]) => {
      const newFilters: FilterState = { ...filters };

      sections.forEach((section) => {
        switch (section.id) {
          case 'categories':
            newFilters.categories = categoriesList.filter((cat) =>
              section.selectedIds?.includes(cat.categoryId),
            );
            break;
          case 'brands':
            newFilters.brands = section.selectedIds || [];
            break;
        }
      });

      setFilters(newFilters);
      setShowFilters(false);
    },
    [filters, categoriesList],
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

  const handleSubmit = useCallback(() => {
    if (items.length === 0) {
      Alert.alert(
        'Cart Empty',
        isUnlimitedMode
          ? 'Add items to top-up before submitting'
          : 'Add items to cart before processing sale',
      );
      return;
    }

    router.push({
      pathname: '/checkin/sale',
      params: {
        mode,
      },
    });
    // if (isUnlimitedMode && onSubmit) {
    //   onSubmit(items);
    // } else if (!isUnlimitedMode) {
    // }
  }, [items, isUnlimitedMode, onSubmit]);

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

  const renderActionButton = () => {
    if (items.length === 0) return null;

    const buttonText = isUnlimitedMode
      ? submitButtonText || `Submit Top-up (${cartSummary.totalItems} items)`
      : `Proceed to Checkout (${cartSummary.totalItems} items)`;

    return (
      <TouchableOpacity
        style={[styles.cartButton, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
        activeOpacity={0.9}
      >
        <View style={styles.cartButtonContent}>
          <View>
            <Text style={styles.cartButtonLabel}>
              {isUnlimitedMode ? 'Ready to submit' : 'Ready to checkout'}
            </Text>
            <Text style={styles.cartButtonTotal}>
              {cartSummary.totalUnits} units • K{cartSummary.totalValue.toFixed(2)}
              {isUnlimitedMode &&
                cartSummary.totalWeight > 0 &&
                ` • ${cartSummary.totalWeight.toFixed(2)} kg`}
            </Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={28} color="white" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </View>

      {products.length === 0 && !loading ? (
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
              mode={mode} // Pass mode to ProductCard
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

      {/* {loading && products.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )} */}

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

      {renderActionButton()}
    </View>
  );
});

ProductsScreen.displayName = 'ProductsScreen';

export default ProductsScreen;
