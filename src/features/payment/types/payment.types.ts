export interface PaymentItem {
  paymentId: string;
  customerId: string;
  customerName?: string;
  amount: number;
  paymentMode: 'CASH' | 'CARD' | 'CHEQUE' | 'BANK_TRANSFER' | 'UPI' | 'MOBILE_MONEY';
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  date: string;
  referenceNo?: string;
  sales: any[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentsScreenProps {
  customerId?: string;
  hideFAB?: boolean;
  hideSearch?: boolean;
  hideFilters?: boolean;
  outstanding?: number;
}

export interface PaymentListProps {
  data: PaymentItem[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterChips: any[];
  clearAllFilters: () => void;
  activeFilterCount: number;
}
