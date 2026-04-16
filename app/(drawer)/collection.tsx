// app/(app)/payments/index.tsx
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';

import { ApiResponse } from '@/core/network';
import { EmptyState } from '@/core/components/EmptyState';
import { FilterModal } from '@/shared/components/models/Filter.modal';
import { useFilterContext } from '@/shared/contexts/FilterContext';
import { useAuthStore } from '@/core/store/auth.store';
import { toast } from '@/shared/utils/toast';
import { useRouteStore } from '@/core/store/route.store';
import { saleService } from '@/shared/services/sale.service';
import { usePaymentsScreenStyles } from '@/shared/styles/Payments.styles';
import { SearchBar } from '@/features/outlet';
import { PaymentCard } from '@/shared/components/PaymentCard';
import { useOutletStore } from '@/core/store/outlet.store';
import { PaymentCollectionModal } from '@/shared/components/PaymentCollectionModal';

const LIMIT = 10;

interface PaymentScreenProps {
  customerId?: string;
  hideFAB?: boolean;
  hideSearch?: boolean;
  hideFilters?: boolean;
  outstanding?: number;
}

export default function PaymentsScreen({
  customerId,
  hideFAB = false,
  hideSearch = false,
  hideFilters = false,
  outstanding = 0,
}: PaymentScreenProps) {
  const { colors } = useTheme();
  const styles = usePaymentsScreenStyles();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState<any>(null);

  const route = useRouteStore((s) => s.selectedRoute);
  const { user } = useAuthStore();
  const { selectedOutlet: outlet } = useOutletStore();

  const { setOpenPaymentFilterHandler, updatePaymentsFilterCount, resetPaymentsFilterCount } =
    useFilterContext();

  const [filters, setFilters] = useState({
    paymentMode: [],
    status: [],
  });

  // Register filter handler
  useEffect(() => {
    if (!hideFilters) {
      setOpenPaymentFilterHandler(() => setShowFilters(true));
    }
    return () => {
      if (!hideFilters) setOpenPaymentFilterHandler(() => {});
    };
  }, [hideFilters]);

  // Filter sections
  const filterSections: any = useMemo(() => [
    {
      id: 'paymentMode',
      title: 'Payment Mode',
      type: 'multiple',
      options: [
        { id: 'CASH', label: 'Cash' },
        { id: 'CARD', label: 'Card' },
        { id: 'CHEQUE', label: 'Cheque' },
        { id: 'BANK_TRANSFER', label: 'Bank Transfer' },
        { id: 'UPI', label: 'UPI' },
        { id: 'MOBILE_MONEY', label: 'Mobile Money' },
      ],
      selectedIds: filters.paymentMode,
    },
    {
      id: 'status',
      title: 'Payment Status',
      type: 'multiple',
      options: [
        { id: 'SUCCESS', label: 'Success' },
        { id: 'PENDING', label: 'Pending' },
        { id: 'FAILED', label: 'Failed' },
        { id: 'REFUNDED', label: 'Refunded' },
      ],
      selectedIds: filters.status,
    },
  ], [filters]);

  // Fetch payments
  const getPayments = async (pageNumber = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const payload: any = {
        page: pageNumber,
        limit: LIMIT,
        filters,
        vanId: user?.vanId,
        employeeId: user?.userId,
        customerId,
      };

      const response = await saleService.fetchPayments(payload);

      if (response.statusCode === 200) {
        const newData = response.data || [];
        setPayments(prev => isRefresh ? newData : [...prev, ...newData]);
        setHasMore(newData.length === LIMIT);
        setPage(pageNumber);
      }
    } catch (e) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      getPayments(1, true);
    }, [route, user, customerId])
  );

  // Handle search & filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setPayments([]);
      getPayments(1, true);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, filters, customerId]);

  // Handlers
  const onRefresh = useCallback(() => {
    setPage(1);
    setPayments([]);
    getPayments(1, true);
  }, []);

  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    getPayments(page + 1);
  };

  const handleApplyFilters = useCallback((sections: any[]) => {
    const newFilters = { paymentMode: [], status: [] };
    let count = 0;

    sections.forEach(section => {
      if (section.selectedIds?.length) count += section.selectedIds.length;
      if (section.id === 'paymentMode') newFilters.paymentMode = section.selectedIds || [];
      if (section.id === 'status') newFilters.status = section.selectedIds || [];
    });

    updatePaymentsFilterCount(count);
    setFilters(newFilters);
    setShowFilters(false);
    setPage(1);
    setPayments([]);
    getPayments(1, true);
  }, []);

  const clearAllFilters = useCallback(() => {
    resetPaymentsFilterCount();
    setFilters({ paymentMode: [], status: [] });
    setSearchQuery('');
    setShowFilters(false);
    setPage(1);
    setPayments([]);
    getPayments(1, true);
  }, []);

  const handleAddPayment = useCallback(() => {
    if (!outlet) {
      toast.error('Please select an outlet first');
      return;
    }
    setSelectedOutlet(outlet);
    setShowPaymentModal(true);
  }, [outlet]);

  const handlePaymentSuccess = useCallback(() => {
    getPayments(1, true);
  }, []);

  const renderFooter = () => (
    loading ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.primary} size="small" />
      </View>
    ) : null
  );

  const renderEmptyState = () => (
    <EmptyState
      title="No payments found"
      description="Try adjusting your filters"
      icon="cash-outline"
      actionLabel="Clear Filters"
      onAction={clearAllFilters}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!hideSearch && (
        <View style={styles.searchWrapper}>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </View>
      )}

      {payments.length === 0 && !loading ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.paymentId}
          renderItem={({ item, index }) => <PaymentCard payment={item} index={index} />}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        sections={filterSections}
        onApply={handleApplyFilters}
        onReset={clearAllFilters}
        title="Filter Payments"
        applyButtonText="Apply"
        resetButtonText="Reset"
      />

      {!hideFAB && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={handleAddPayment}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      )}

      <PaymentCollectionModal
        visible={showPaymentModal}
        outlet={selectedOutlet}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedOutlet(null);
        }}
        onSuccess={handlePaymentSuccess}
        outstanding={outstanding}
      />
    </View>
  );
}