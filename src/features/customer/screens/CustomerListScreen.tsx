// app/customers/index.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { View, FlatList, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { CUSTOMERS_DATA } from '../constants/mockData';
import { useCustomersScreenStyles } from '../styles/CustomersScreen.styles';
import { CustomerCard, EmptyState, SearchBar } from '../components/customer';

export default function CustomersListScreen() {
  const { colors } = useTheme();
  const styles = useCustomersScreenStyles();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('list');

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return CUSTOMERS_DATA;

    const query = searchQuery.toLowerCase().trim();
    return CUSTOMERS_DATA.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.owner.toLowerCase().includes(query) ||
        customer.location.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <CustomerCard
        customer={item}
        index={index}
        // variant={viewMode === 'compact' ? 'compact' : 'default'}
      />
    ),
    [viewMode],
  );

  const renderEmptyState = () => (
    <EmptyState
      searchQuery=""
      // icon="people-outline"
      // message={searchQuery ? `No matches for "${searchQuery}"` : 'Add your first customer'}
      // buttonText={searchQuery ? 'Clear Search' : 'Add Customer'}
      // onButtonPress={() => (searchQuery ? setSearchQuery('') : router.push('/customers/add'))}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          // placeholder="Search by name, owner, or location..."
        />
      </View>

      {/* Results Header with View Toggle */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
        </Text>

        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewToggleButton, viewMode === 'list' && styles.viewToggleButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons
              name="list"
              size={18}
              color={viewMode === 'list' ? 'white' : colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewMode === 'compact' && styles.viewToggleButtonActive,
            ]}
            onPress={() => setViewMode('compact')}
          >
            <Ionicons
              name="grid"
              size={18}
              color={viewMode === 'compact' ? 'white' : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredCustomers}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/customers/add')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
