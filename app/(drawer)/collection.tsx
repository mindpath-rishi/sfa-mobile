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
  outstanding?: any;
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

  const [filters, setFilters] = useState<any>({
    paymentMode: [],
    status: [],
  });

  /* ================= REGISTER FILTER HANDLER ================= */

  useEffect(() => {
    if (!hideFilters) {
      setOpenPaymentFilterHandler(() => {
        setShowFilters(true);
      });
    }

    return () => {
      if (!hideFilters) {
        setOpenPaymentFilterHandler(() => {});
      }
    };
  }, [hideFilters]);

  /* ================= FILTER SECTIONS ================= */

  const filterSections: any = useMemo(() => {
    return [
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
    ];
  }, [filters]);

  /* ================= API CALL ================= */

  const getPayments = async (pageNumber = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const payload: any = {
        page: pageNumber,
        limit: LIMIT,
        filters,
        vanId: user?.vanId,
        employeeId: user?.userId,
        customerId,
      };

      const response: ApiResponse<any> = await saleService.fetchPayments(payload);

      if (response.statusCode === 200) {
        const newData = response.data || [];

        setPayments((prev) => (isRefresh ? newData : [...prev, ...newData]));
        setHasMore(newData.length === LIMIT);
        setPage(pageNumber);
      }
    } catch (e) {
      console.log('Pagination error:', e);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ================= EFFECTS ================= */

  useFocusEffect(
    useCallback(() => {
      getPayments(1, true);
      return () => {};
    }, [route, user, customerId]),
  );

  // Search + Filters
  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      setPayments([]);
      getPayments(1, true);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery, filters, customerId]);

  /* ================= HANDLERS ================= */

  const onRefresh = useCallback(() => {
    setPage(1);
    setPayments([]);
    getPayments(1, true);
  }, []);

  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    getPayments(page + 1);
  };

  const handleApplyFilters = useCallback(
    (sections: any[]) => {
      const newFilters = { ...filters };
      let count = 0;

      sections.forEach((section) => {
        if (section.selectedIds?.length) {
          count += section.selectedIds.length;
        }

        switch (section.id) {
          case 'paymentMode':
            newFilters.paymentMode = section.selectedIds || [];
            break;
          case 'status':
            newFilters.status = section.selectedIds || [];
            break;
        }
      });

      updatePaymentsFilterCount(count);
      setPage(1);
      setPayments([]);
      setFilters(newFilters);
      setShowFilters(false);
    },
    [filters],
  );

  const clearAllFilters = useCallback(() => {
    resetPaymentsFilterCount();

    setPage(1);
    setPayments([]);

    setFilters({
      paymentMode: [],
      status: [],
    });

    setSearchQuery('');
    setShowFilters(false);
  }, []);

  const handleAddPayment = useCallback(() => {
    if (!outlet) {
      toast.error('No outlet selected', 'Please select an outlet first');
      return;
    }
    setSelectedOutlet(outlet);
    setShowPaymentModal(true);
  }, [outlet]);

  const handlePaymentSuccess = useCallback((invoiceData: any) => {
    // Refresh the payments list
    getPayments(1, true);
    // toast.success('Success', 'Payment collected successfully');

    // // Navigate to invoice sharing screen if needed
    // if (invoiceData) {
    //   router.push({
    //     pathname: '/checkin/shareinvoice',
    //     params: { invoice: JSON.stringify(invoiceData) },
    //   });
    // }
  }, []);

  const renderFooter = () => {
    if (!loading) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.primary} size="small" />
      </View>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      title="No payments found"
      description="Try adjusting your filters or add a new payment"
      icon="cash-outline"
      actionLabel="Clear Filters"
      onAction={clearAllFilters}
    />
  );

  /* ================= UI ================= */

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

      {!hideFilters && (
        <FilterModal
          visible={showFilters}
          onClose={() => setShowFilters(false)}
          sections={filterSections}
          onApply={handleApplyFilters}
          onReset={clearAllFilters}
          title="Filter Payments"
          applyButtonText="Apply Filters"
          resetButtonText="Reset"
        />
      )}

      {!hideFAB && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={handleAddPayment}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* Payment Collection Modal */}
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
