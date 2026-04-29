import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { useTheme } from '@/shared/hooks/useTheme';
import { PaymentCollectionModal } from '@/shared/components/PaymentCollectionModal';
import { FilterModal } from '@/shared/components/models/Filter.modal';

import { PaymentsScreenProps, PaymentItem } from '../types/payment.types';
import { PaymentsList } from '../components/PaymentList';

import { saleService } from '@/shared/services/sale.service';
import { toast } from '@/shared/utils/toast';

import { useHeader } from '@/shared/contexts/HeaderContext';
import { useOutletStore } from '@/core/store/outlet.store';
import { useFilterContext } from '@/shared/contexts/FilterContext';
import { FilterSection } from '@/shared/types/filter.types';

const LIMIT = 10;

export default function PaymentsScreen({
  customerId,
  outstanding = 0,
  hideFAB = false,
  hideSearch = false,
  hideFilters = false,
}: PaymentsScreenProps) {
  const { colors } = useTheme();

  const { setHeader } = useHeader();
  const { selectedOutlet } = useOutletStore();

  const { updatePaymentsFilterCount, resetPaymentsFilterCount, setOpenPaymentFilterHandler } =
    useFilterContext();

  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    paymentMode: [] as string[],
    status: [] as string[],
  });

  /* -------------------- Header -------------------- */
  useFocusEffect(
    useCallback(() => {
      setHeader({
        showFilter: true,
        onFilterPress: () => setShowFilters(true),
        rightIcon: 'plus',
        onRightPress: () => handleAddPayment(),
        title: 'Collection',
      });
    }, [setHeader]),
  );

  /* -------------------- API -------------------- */
  const getPayments = async (pageNumber = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (pageNumber === 1) setLoading(true);

      const payload: any = {
        page: pageNumber,
        limit: LIMIT,
        customerId,
      };

      if (searchQuery) payload.searchText = searchQuery;
      if (filters.status.length) payload.status = filters.status;
      if (filters.paymentMode.length) payload.paymentMode = filters.paymentMode;

      const res = await saleService.fetchPayments(payload);
      const newData = res?.data || [];

      if (pageNumber === 1) setPayments(newData);
      else setPayments((prev) => [...prev, ...newData]);

      setHasMore(newData.length === LIMIT);
      setPage(pageNumber);
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* -------------------- Initial Load -------------------- */
  useEffect(() => {
    getPayments(1, true);
  }, []);

  /* -------------------- Search + Filters -------------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setPayments([]);
      getPayments(1, true);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  /* -------------------- Refresh -------------------- */
  const onRefresh = useCallback(() => {
    setPage(1);
    setPayments([]);
    getPayments(1, true);
  }, []);

  /* -------------------- Pagination -------------------- */
  const handleLoadMore = () => {
    if (!hasMore || loading || refreshing) return;
    getPayments(page + 1);
  };

  /* -------------------- Filters -------------------- */
  const filterSections: FilterSection[] = [
    {
      id: 'paymentMode',
      title: 'Payment Mode',
      type: 'multiple',
      options: [
        { id: 'CASH', label: 'Cash', value: 'CASH' },
        { id: 'CARD', label: 'Card', value: 'CARD' },
        { id: 'UPI', label: 'UPI', value: 'UPI' },
      ],
      selectedIds: filters.paymentMode,
    },
    {
      id: 'status',
      title: 'Status',
      type: 'multiple',
      options: [
        { id: 'SUCCESS', label: 'Success', value: 'SUCCESS' },
        { id: 'FAILED', label: 'Failed', value: 'FAILED' },
      ],
      selectedIds: filters.status,
    },
  ];

  const handleApplyFilters = (sections: FilterSection[]) => {
    const newFilters = { paymentMode: [] as string[], status: [] as string[] };

    sections.forEach((s) => {
      if (s.id === 'paymentMode') newFilters.paymentMode = s.selectedIds || [];
      if (s.id === 'status') newFilters.status = s.selectedIds || [];
    });

    setFilters(newFilters);
    setShowFilters(false);
  };

  const clearAllFilters = () => {
    setFilters({ paymentMode: [], status: [] });
    setSearchQuery('');
    resetPaymentsFilterCount();
    getPayments(1, true);
  };

  /* -------------------- Filter Chips -------------------- */
  const filterChips = useMemo(() => {
    return [
      ...filters.paymentMode.map((m) => ({
        id: m,
        label: m,
        onRemove: () =>
          setFilters((prev) => ({
            ...prev,
            paymentMode: prev.paymentMode.filter((x) => x !== m),
          })),
      })),
    ];
  }, [filters]);

  /* -------------------- FAB -------------------- */
  const handleAddPayment = () => {
    if (!selectedOutlet) {
      toast.error('Select outlet first');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    getPayments(1, true);
  };

  return (
    <View style={{ flex: 1 }}>
      <PaymentsList
        data={payments}
        loading={loading}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={handleLoadMore}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterChips={filterChips}
        clearAllFilters={clearAllFilters}
        activeFilterCount={filterChips.length}
      />

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        sections={filterSections}
        onApply={handleApplyFilters}
        onReset={clearAllFilters}
      />

      {!hideFAB && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            backgroundColor: colors.primary,
            padding: 14,
            borderRadius: 30,
          }}
          onPress={handleAddPayment}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      <PaymentCollectionModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        outstanding={outstanding}
        outlet={selectedOutlet}
      />
    </View>
  );
}
