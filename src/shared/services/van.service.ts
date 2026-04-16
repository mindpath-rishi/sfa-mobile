import { api, ApiResponse } from '@/core/network';

export interface VanService {
  fetchVanStocks: (vanId: string | undefined, params: any) => Promise<ApiResponse<any>>;
  createInventoryTopupRequest: (payload: any) => Promise<ApiResponse<any>>;
  fetchInventoryTopupRequests: (payload: any) => Promise<ApiResponse<any>>;
  fetchTodayStockSummary: (payload: any) => Promise<ApiResponse<any>>;
  fetchInventoryTopupRequest: (topupId: string) => Promise<ApiResponse<any>>;
}

export const vanService: VanService = {
  fetchVanStocks: (vanId: string | undefined, params) =>
    api.get<any>(`/van-inventory/van/${vanId}`, { params }) as Promise<ApiResponse<any>>,

  createInventoryTopupRequest: (payload: any) =>
    api.post<any>('/van-inventory-topup', payload) as Promise<ApiResponse<any>>,

  fetchInventoryTopupRequests: (params: any) =>
    api.get<any>('/van-inventory-topup', { params }) as Promise<ApiResponse<any>>,

  fetchInventoryTopupRequest: (topupId: string) =>
    api.get<any>(`/van-inventory-topup/${topupId}`) as Promise<ApiResponse<any>>,

  fetchTodayStockSummary: (params: any) =>
    api.get<any>('/van-daily-stock/summary', { params }) as Promise<ApiResponse<any>>,
};
