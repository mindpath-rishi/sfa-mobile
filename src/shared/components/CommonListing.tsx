import React, { useMemo } from 'react';
import type { FlatListProps, ListRenderItem, StyleProp, ViewStyle } from 'react-native';
import { FlatList, RefreshControl, View, TouchableOpacity } from 'react-native';

import { EmptyState } from '@/core/components/EmptyState';
import { Skeleton } from '@/core/components/Skeleton';

import { useTheme } from '@/shared/hooks/useTheme';
import { ListingItemCard } from '@/shared/components/ListingItemCard';
import { AppText, SearchBar } from '@/core/components';
import { useCommonListingStyles } from '../styles/CommonListingStyles';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  listProps?: Omit<
    FlatListProps<TItem>,
    | 'data'
    | 'renderItem'
    | 'keyExtractor'
    | 'contentContainerStyle'
    | 'refreshControl'
    | 'ListHeaderComponent'
    | 'ListFooterComponent'
    | 'ListEmptyComponent'
    | 'onEndReached'
    | 'onEndReachedThreshold'
  >;

  loadingComponent?: React.ReactElement | null;
};

/* -------------------- Helpers -------------------- */
const renderNode = (Comp: any) => (typeof Comp === 'function' ? <Comp /> : Comp);

/* -------------------- Loading Skeleton -------------------- */
const DefaultLoadingSkeleton = () => {
  const styles = useCommonListingStyles();

  return (
    <View style={styles.skeletonContainer}>
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} height={100} borderRadius={12} />
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

    loadingComponent = null,
  } = props;

  const { colors } = useTheme();
  const styles = useCommonListingStyles();

  const isEmpty = data.length === 0;
  const showLoadingWhenEmpty = isEmpty && (loading || refreshing);

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

  /* -------------------- Empty State -------------------- */
  const DefaultListEmptyComponent = useMemo(() => {
    if (showLoadingWhenEmpty) {
      return (
        <View style={styles.emptyContainer}>{loadingComponent ?? <DefaultLoadingSkeleton />}</View>
      );
    }

    if (!isEmpty) return null;

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
  }, [emptyState, isEmpty, loadingComponent, showLoadingWhenEmpty, styles]);

  /* -------------------- Filters -------------------- */
  const renderFilters = () => {
    if (!filterChips.length && !searchValue) return null;

    return (
      <View style={styles.filterContainer}>
        {filterChips.map((chip) => (
          <TouchableOpacity key={chip.id} style={styles.chip} onPress={chip.onRemove}>
            <AppText style={styles.chipText}>{chip.label}</AppText>
          </TouchableOpacity>
        ))}

        {(filterChips.length > 0 || searchValue) && onClearAllFilters && (
          <TouchableOpacity onPress={onClearAllFilters} style={styles.chipClear}>
            <AppText style={styles.chipClearText}>Clear all</AppText>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  /* -------------------- Header (filters only) -------------------- */
  const HeaderComponent = useMemo(() => {
    const hasFilters = filterChips.length > 0;

    if (!hasFilters && !ListHeaderComponent) return null;

    return (
      <View style={styles.headerContainer}>
        {hasFilters && renderFilters()}
        {ListHeaderComponent && renderNode(ListHeaderComponent)}
      </View>
    );
  }, [ListHeaderComponent, filterChips]);

  /* -------------------- Render -------------------- */
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.container}>
        {/* SEARCH BAR - Fixed at top */}
        {enableSearch && (
          <View style={styles.fixedSearchContainer}>
            <SearchBar
              value={searchValue}
              onChangeText={(q) => onSearch?.(q)}
              placeholder={searchPlaceholder}
              debounceDelay={searchDebounceDelay}
              clearable={true}
              fullWidth={true}
            />
          </View>
        )}

        {/* LIST */}
        <FlatList
          testID={testID}
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            isEmpty && { flexGrow: 1 },
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
          showsVerticalScrollIndicator={false}
          {...listProps}
        />
      </View>
    </SafeAreaView>
  );
}
