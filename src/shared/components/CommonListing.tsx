// import React, { useMemo } from 'react';
// import type { FlatListProps, ListRenderItem, StyleProp, ViewStyle } from 'react-native';
// import { FlatList, RefreshControl, View, TouchableOpacity } from 'react-native';

// import { EmptyState } from '@/core/components/EmptyState';
// import { Skeleton } from '@/core/components/Skeleton';

// import { useTheme } from '@/shared/hooks/useTheme';
// import { ListingItemCard } from '@/shared/components/ListingItemCard';
// import { AppText, SearchBar } from '@/core/components';
// import { useCommonListingStyles } from '../styles/CommonListingStyles';
// import { SafeAreaView } from 'react-native-safe-area-context';

// /* -------------------- TYPES -------------------- */
// export type CommonListingProps<TItem> = {
//   data: TItem[];
//   renderItem?: ListRenderItem<TItem>;
//   keyExtractor: (item: TItem, index: number) => string;

//   refreshing?: boolean;
//   onRefresh?: () => void;
//   loading?: boolean;

//   onEndReached?: (() => void) | null;
//   onEndReachedThreshold?: number;

//   contentContainerStyle?: StyleProp<ViewStyle>;
//   ListHeaderComponent?: FlatListProps<TItem>['ListHeaderComponent'];
//   ListFooterComponent?: FlatListProps<TItem>['ListFooterComponent'];
//   ListEmptyComponent?: FlatListProps<TItem>['ListEmptyComponent'];

//   emptyState?: any;
//   loadingComponent?: React.ReactElement | null;
//   testID?: string;

//   enableSearch?: boolean;
//   searchPlaceholder?: string;
//   searchDebounceDelay?: number;
//   onSearch?: (query: string) => void;
//   searchValue?: string;

//   useDefaultCard?: boolean;

//   cardProps?: {
//     onPress?: (item: TItem) => void;
//     leading?: (item: TItem) => React.ReactNode;
//     title: (item: TItem) => React.ReactNode;
//     headerRight?: (item: TItem) => React.ReactNode;
//     subtitle?: (item: TItem) => React.ReactNode;
//     subtitleRight?: (item: TItem) => React.ReactNode;
//     children?: (item: TItem) => React.ReactNode;
//     showChevron?: boolean;
//   };

//   filterChips?: Array<{
//     id: string;
//     label: string;
//     onRemove?: () => void;
//   }>;

//   onClearAllFilters?: () => void;

//   refreshControlProps?: Omit<
//     React.ComponentProps<typeof RefreshControl>,
//     'refreshing' | 'onRefresh' | 'tintColor' | 'colors'
//   >;

//   listProps?: Omit<
//     FlatListProps<TItem>,
//     | 'data'
//     | 'renderItem'
//     | 'keyExtractor'
//     | 'contentContainerStyle'
//     | 'refreshControl'
//     | 'ListHeaderComponent'
//     | 'ListFooterComponent'
//     | 'ListEmptyComponent'
//     | 'onEndReached'
//     | 'onEndReachedThreshold'
//   >;
// };

// /* -------------------- Helpers -------------------- */
// const renderNode = (Comp: any) => (typeof Comp === 'function' ? <Comp /> : Comp);

// /* -------------------- Loading Skeleton -------------------- */
// const DefaultLoadingSkeleton = () => {
//   const styles = useCommonListingStyles();

//   return (
//     <View style={styles.skeletonContainer}>
//       {[...Array(3)].map((_, i) => (
//         <Skeleton key={i} height={100} />
//       ))}
//     </View>
//   );
// };

// /* -------------------- COMPONENT -------------------- */
// export function CommonListing<TItem>(props: CommonListingProps<TItem>) {
//   const {
//     data,
//     renderItem: renderItemProp,
//     keyExtractor,

//     refreshing = false,
//     onRefresh,
//     loading = false,

//     onEndReached = null,
//     onEndReachedThreshold = 0.5,

//     contentContainerStyle,
//     ListHeaderComponent,
//     ListFooterComponent,
//     ListEmptyComponent: ListEmptyComponentProp,

//     emptyState,
//     loadingComponent = null,
//     testID = 'common-listing',

//     enableSearch = false,
//     searchPlaceholder = 'Search...',
//     searchDebounceDelay = 300,
//     onSearch,
//     searchValue = '',

//     useDefaultCard = false,
//     cardProps,

//     filterChips = [],
//     onClearAllFilters,

//     refreshControlProps,
//     listProps,
//   } = props;

//   const { colors } = useTheme();
//   const styles = useCommonListingStyles();

//   const isEmpty = data.length === 0;
//   const showLoadingWhenEmpty = isEmpty && (loading || refreshing);

//   /* -------------------- Default Item -------------------- */
//   const defaultRenderItem: ListRenderItem<TItem> = ({ item, index }) => {
//     if (!cardProps) return null;

//     return (
//       <ListingItemCard
//         onPress={cardProps.onPress ? () => cardProps.onPress!(item) : undefined}
//         leading={cardProps.leading?.(item)}
//         title={cardProps.title(item)}
//         headerRight={cardProps.headerRight?.(item)}
//         subtitle={cardProps.subtitle?.(item)}
//         subtitleRight={cardProps.subtitleRight?.(item)}
//         children={cardProps.children?.(item)}
//         showChevron={cardProps.showChevron}
//         testID={`${testID}-item-${index}`}
//       />
//     );
//   };

//   const renderItem = useDefaultCard && cardProps ? defaultRenderItem : renderItemProp;

//   /* -------------------- Empty -------------------- */
//   const DefaultListEmptyComponent = useMemo(() => {
//     if (showLoadingWhenEmpty) {
//       return (
//         <View style={styles.emptyContainer}>{loadingComponent ?? <DefaultLoadingSkeleton />}</View>
//       );
//     }

//     if (!isEmpty) return null;

//     return (
//       <View style={styles.emptyContainer}>
//         <EmptyState
//           animated={false}
//           {...(emptyState ?? {
//             title: 'No data',
//             description: 'Nothing to display',
//           })}
//         />
//       </View>
//     );
//   }, [emptyState, isEmpty, loadingComponent, showLoadingWhenEmpty, styles]);

//   /* -------------------- Filters -------------------- */
//   const renderFilters = () => {
//     if (!filterChips.length && !searchValue) return null;

//     return (
//       <View style={styles.filterContainer}>
//         {!!searchValue && (
//           <View style={styles.chip}>
//             <AppText style={styles.chipText}>{searchValue}</AppText>
//           </View>
//         )}

//         {filterChips.map((chip) => (
//           <View key={chip.id} style={styles.chip}>
//             <AppText style={styles.chipText}>{chip.label}</AppText>
//           </View>
//         ))}

//         {onClearAllFilters && (
//           <TouchableOpacity onPress={onClearAllFilters} style={styles.chipClear}>
//             <AppText style={styles.chipClearText}>Clear</AppText>
//           </TouchableOpacity>
//         )}
//       </View>
//     );
//   };

//   /* -------------------- Header (WITHOUT SEARCH) -------------------- */
//   const HeaderComponent = useMemo(() => {
//     if (!filterChips.length && !ListHeaderComponent) return null;

//     return (
//       <View style={styles.headerContainer}>
//         {renderFilters()}
//         {ListHeaderComponent ? renderNode(ListHeaderComponent) : null}
//       </View>
//     );
//   }, [ListHeaderComponent, filterChips, searchValue]);

//   /* -------------------- Render -------------------- */
//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <View style={{ flex: 1 }}>
//         {/* ✅ FIXED SEARCH BAR */}
//         {enableSearch && (
//           <View style={styles.fixedSearchContainer}>
//             <SearchBar
//               value={searchValue}
//               onChangeText={(q) => onSearch?.(q)}
//               placeholder={searchPlaceholder}
//               debounceDelay={searchDebounceDelay}
//             />
//           </View>
//         )}

//         {/* ✅ LIST */}
//         <FlatList
//           testID={testID}
//           data={data}
//           keyExtractor={keyExtractor}
//           renderItem={renderItem}
//           contentContainerStyle={[
//             { paddingTop: enableSearch ? 70 : 0 },
//             isEmpty && { flexGrow: 1 },
//             styles.listContent,
//             contentContainerStyle,
//           ]}
//           refreshControl={
//             onRefresh ? (
//               <RefreshControl
//                 refreshing={refreshing}
//                 onRefresh={onRefresh}
//                 tintColor={colors.primary}
//                 colors={[colors.primary]}
//                 {...refreshControlProps}
//               />
//             ) : undefined
//           }
//           onEndReached={onEndReached ?? undefined}
//           onEndReachedThreshold={onEndReachedThreshold}
//           ListHeaderComponent={HeaderComponent}
//           ListFooterComponent={renderNode(ListFooterComponent)}
//           ListEmptyComponent={ListEmptyComponentProp ?? DefaultListEmptyComponent}
//           {...listProps}
//         />
//       </View>
//     </SafeAreaView>
//   );
// }

import React, { useMemo, useRef, useState, useEffect } from 'react';
import type { FlatListProps, ListRenderItem, StyleProp, ViewStyle } from 'react-native';
import { FlatList, RefreshControl, View, TouchableOpacity, Animated } from 'react-native';

import { EmptyState } from '@/core/components/EmptyState';
import { Skeleton } from '@/core/components/Skeleton';

import { useTheme } from '@/shared/hooks/useTheme';
import { ListingItemCard } from '@/shared/components/ListingItemCard';
import { AppText, SearchBar } from '@/core/components';
import { useCommonListingStyles } from '../styles/CommonListingStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeader } from '../contexts/HeaderContext';

/* -------------------- TYPES -------------------- */
export type CommonListingProps<TItem> = {
  data: TItem[];
  renderItem?: ListRenderItem<TItem>;
  keyExtractor: (item: TItem, index: number) => string;

  refreshing?: boolean;
  onRefresh?: () => void;
  loading?: boolean;

  onEndReached?: (() => void) | null;
  onEndReachedThreshold?: number;

  contentContainerStyle?: StyleProp<ViewStyle>;
  ListHeaderComponent?: FlatListProps<TItem>['ListHeaderComponent'];
  ListFooterComponent?: FlatListProps<TItem>['ListFooterComponent'];
  ListEmptyComponent?: FlatListProps<TItem>['ListEmptyComponent'];
  emptyState?: any;
  testID?: string;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  searchDebounceDelay?: number;
  onSearch?: (query: string) => void;
  searchValue?: string;
  useDefaultCard?: boolean;
  cardProps?: {
    onPress?: (item: TItem) => void;
    leading?: (item: TItem) => React.ReactNode;
    title: (item: TItem) => React.ReactNode;
    headerRight?: (item: TItem) => React.ReactNode;
    subtitle?: (item: TItem) => React.ReactNode;
    subtitleRight?: (item: TItem) => React.ReactNode;
    children?: (item: TItem) => React.ReactNode;
    showChevron?: boolean;
  };

  filterChips?: Array<{
    id: string;
    label: string;
    onRemove?: () => void;
  }>;

  onClearAllFilters?: () => void;

  refreshControlProps?: Omit<
    React.ComponentProps<typeof RefreshControl>,
    'refreshing' | 'onRefresh' | 'tintColor' | 'colors'
  >;

  listProps?: FlatListProps<TItem>;
};

/* -------------------- Helpers -------------------- */
const renderNode = (Comp: any) => (typeof Comp === 'function' ? <Comp /> : Comp);

/* -------------------- Loading Skeleton -------------------- */
const DefaultLoadingSkeleton = () => {
  const styles = useCommonListingStyles();

  return (
    <View style={styles.skeletonContainer}>
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} height={100} />
      ))}
    </View>
  );
};

/* -------------------- COMPONENT -------------------- */
export function CommonListing<TItem>(props: CommonListingProps<TItem>) {
  const {
    data,
    renderItem: renderItemProp,
    keyExtractor,
    refreshing = false,
    onRefresh,
    loading = false,
    onEndReached = null,
    onEndReachedThreshold = 0.5,
    contentContainerStyle,
    ListHeaderComponent,
    ListFooterComponent,
    ListEmptyComponent: ListEmptyComponentProp,
    emptyState,
    testID = 'common-listing',

    enableSearch = false,
    searchPlaceholder = 'Search...',
    searchDebounceDelay = 300,
    onSearch,
    searchValue = '',

    useDefaultCard = false,
    cardProps,

    filterChips = [],
    onClearAllFilters,

    refreshControlProps,
    listProps,

  } = props;

  const { colors } = useTheme();
  const styles = useCommonListingStyles();

  const isEmpty = data.length === 0;
  const showLoadingWhenEmpty = loading || refreshing;

  /* -------------------- HEADER ANIMATION -------------------- */
  const HEADER_HEIGHT = 65;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(30);
  const [visible, setVisible] = useState(true);
  const { setHeader } = useHeader();

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    if (currentOffset > 30) {
      setHeader({
        hidden: true,
      });
    } else {
      setHeader({
        hidden: false,
      });
    }
    lastOffset.current = currentOffset;
    listProps?.onScroll?.(event);
  };

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : -HEADER_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  /* -------------------- Default Item -------------------- */
  const defaultRenderItem: ListRenderItem<TItem> = ({ item, index }) => {
    if (!cardProps) return null;

    return (
      <ListingItemCard
        onPress={cardProps.onPress ? () => cardProps.onPress!(item) : undefined}
        leading={cardProps.leading?.(item)}
        title={cardProps.title(item)}
        headerRight={cardProps.headerRight?.(item)}
        subtitle={cardProps.subtitle?.(item)}
        subtitleRight={cardProps.subtitleRight?.(item)}
        children={cardProps.children?.(item)}
        showChevron={cardProps.showChevron}
        testID={`${testID}-item-${index}`}
      />
    );
  };

  const renderItem = useDefaultCard && cardProps ? defaultRenderItem : renderItemProp;

  /* -------------------- Empty -------------------- */
  const DefaultListEmptyComponent = useMemo(() => {
    if (showLoadingWhenEmpty) {
      return <DefaultLoadingSkeleton />;
    }

    // if (!isEmpty) return null;

    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          animated={false}
          {...(emptyState ?? {
            title: 'No data',
            description: 'Nothing to display',
          })}
        />
      </View>
    );
  }, [emptyState, isEmpty, showLoadingWhenEmpty, styles]);

  /* -------------------- Filters -------------------- */
  const renderFilters = () => {
    if (!filterChips.length && !searchValue) return null;

    return (
      <View style={styles.filterContainer}>
        {!!searchValue && (
          <View style={styles.chip}>
            <AppText style={styles.chipText}>{searchValue}</AppText>
          </View>
        )}

        {filterChips.map((chip) => (
          <View key={chip.id} style={styles.chip}>
            <AppText style={styles.chipText}>{chip.label}</AppText>
          </View>
        ))}

        {onClearAllFilters && (
          <TouchableOpacity onPress={onClearAllFilters} style={styles.chipClear}>
            <AppText style={styles.chipClearText}>Clear</AppText>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  /* -------------------- Header (filters) -------------------- */
  const HeaderComponent = useMemo(() => {
    if (!filterChips.length && !ListHeaderComponent) return null;
    return (
      <View style={styles.headerContainer}>
        {renderFilters()}
        {ListHeaderComponent ? renderNode(ListHeaderComponent) : null}
      </View>
    );
  }, [ListHeaderComponent, filterChips, searchValue]);

  /* -------------------- Render -------------------- */
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* ✅ FIXED SEARCH */}
        {enableSearch && (
          <View
            style={[
              styles.fixedSearchContainer,
              {
                position: 'absolute',
                left: 0,
                right: 0,
                zIndex: 9,
              },
            ]}
          >
            <SearchBar
              value={searchValue}
              onChangeText={(q) => onSearch?.(q)}
              placeholder={searchPlaceholder}
              debounceDelay={searchDebounceDelay}
            />
          </View>
        )}

        {/* ✅ LIST */}
        <FlatList
          testID={testID}
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          contentContainerStyle={[
            {
              paddingTop: HEADER_HEIGHT,
            },
            isEmpty && { flexGrow: 1 },
            styles.listContent,
            contentContainerStyle,
          ]}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
                {...refreshControlProps}
              />
            ) : undefined
          }
          onEndReached={onEndReached ?? undefined}
          onEndReachedThreshold={onEndReachedThreshold}
          ListHeaderComponent={HeaderComponent}
          ListFooterComponent={renderNode(ListFooterComponent)}
          ListEmptyComponent={ListEmptyComponentProp ?? DefaultListEmptyComponent}
          {...listProps}
        />
      </View>
    </SafeAreaView>
  );
}
