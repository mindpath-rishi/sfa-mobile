import { api } from '@/core/network';
import type { ApiResponse } from '@/core/network/api.types';

/* ================= SERVICE ================= */

export interface StockCountService {
  fetchStockCounts: (params: any) => Promise<ApiResponse<any>>;
  fetchStockCountItems: (params: any) => Promise<ApiResponse<any>>;
}

/**
 * Thin service layer (only API calls)
 */
export const stockCountService: StockCountService = {
  fetchStockCounts: (params) =>
    api.get<any>(`/stock-count`, { params }) as Promise<ApiResponse<any>>,
  fetchStockCountItems: (stockCountId) =>
    api.get<any>(`/stock-count-item/`, { params: {
      stockCountId: stockCountId
    }},) as Promise<ApiResponse<any>>,
};
