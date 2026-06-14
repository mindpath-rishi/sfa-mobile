// topup.types.ts

import { TopupStatusType } from '../constants/topup.constants';

export interface FilterOptions {
  status: TopupStatusType[];
  dateRange: {
    start: string;
    end: string;
  };
  minValue: string;
  maxValue: string;
}

export interface TopupStatusConfig {
  label: string;
  color: string;
  bg: string;
  icon: string;
  order: number;
}

export interface TopupItem {
  _id: string;
  productId: string;
  productName: string;
  requestedCaseQty: number;
  requestedPieceQty: number;
  requestedQty: number;
  approvedCaseQty: number;
  approvedPieceQty: number;
  approvedQty: number;
  piecePrice: number;
  casePrice: number;
  pieceNetWeight: number;
  caseNetWeight: number;
  requestedWeight: number;
  requestedValue: number;
  approvedWeight: number;
  approvedValue: number;
  unitQtyInCase: number;
  vanInventoryTopupId: string
}

export interface Topup {
  _id: string;
  vanInventoryTopupId: string;
  vanId: string;
  vanName: string;
  employeeId: string;
  employeeName?: string;
  warehouseId: string;
  date: string;
  totalRequestedQty: number;
  totalRequestedWeight: number;
  totalRequestedValue: number;
  totalRequestedCases: number;
  totalRequestedPieces: number;
  totalApprovedCases: number;
  totalApprovedPieces: number;
  totalApprovedQty: number;
  totalApprovedWeight: number;
  totalApprovedValue: number;
  remark?: string;
  rejectedReason?: string;
  status: TopupStatusType;
  approvedByName?: string;
  approvedAt?: string;
  acceptedAt?: string;
  acceptedBy?: string;
  declinedAt?: string;
  declinedBy?: string;
  declinedReason?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  items: TopupItem[];
}

export interface TopupListProps {
  data: Topup[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterChips: Array<{
    id: string;
    label: string;
    onRemove: () => void;
  }>;
  clearAllFilters: () => void;
  activeFilterCount: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}
