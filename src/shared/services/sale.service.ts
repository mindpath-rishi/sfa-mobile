import { api } from '@/core/network';
import type { ApiResponse } from '@/core/network/api.types';

/* ======================================================
 * TYPES
 * ====================================================== */

export interface CreateSalePayload {
  vanId: string;
  vanName?: string;
  customerId?: string;
  customerName?: string;
  employeeId: string;
  employeeName?: string;
  date: Date;
  totalCases: number;
  totalPieces: number;
  totalQty: number;
  totalWeight: number;
  totalValue: number;
  type: 'CASH' | 'CREDIT';
  paymentMode: string;
  paidAmount: number;
  pendingAmount: number;
  remark?: string;
  items: Array<{
    productId: string;
    productName?: string;
    caseQty: number;
    pieceQty: number;
    quantity: number;
    casePrice: number;
    piecePrice: number;
    caseNetWeight?: number;
    pieceNetWeight?: number;
    totalNetWeight: number;
    totalValue: number;
    unitQtyInCase: number;
  }>;
}

export interface FetchSaleQuery {
  page?: number;
  limit?: number;
  searchText?: number;
  vanId?: string;
  customerId?: string;
  employeeId?: string;
}

/* ======================================================
 * SERVICE
 * ====================================================== */

export interface SaleService {
  createSale: (payload: CreateSalePayload) => Promise<ApiResponse<any>>;
  fetchSales: (params: FetchSaleQuery) => Promise<ApiResponse<any>>;
  fetchPayments: (params: FetchSaleQuery) => Promise<ApiResponse<any>>;
  createPayment: (payload: any) => Promise<ApiResponse<any>>;
  getCategoryWiseSales: (params: any) => Promise<ApiResponse<any>>;
}

/**
 * Thin service layer (only API calls)
 */
export const saleService: SaleService = {
  createSale: (payload: CreateSalePayload) =>
    api.post<any>('/sales', payload) as Promise<ApiResponse<any>>,

  fetchSales: (params: FetchSaleQuery) =>
    api.get<any>('/sales', { params }) as Promise<ApiResponse<any>>,

  fetchPayments: (params: FetchSaleQuery) =>
    api.get<any>('/payment', { params }) as Promise<ApiResponse<any>>,

  createPayment: (payload: any = {}) =>
    api.post<any>('/payment', payload) as Promise<ApiResponse<any>>,

  getCategoryWiseSales: (params: any) =>
    api.get<any>('/sales/category-wise', { params }) as Promise<ApiResponse<any>>,
};
