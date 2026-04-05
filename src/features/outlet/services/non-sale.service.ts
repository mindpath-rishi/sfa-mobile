import { api } from '@/core/network';
import type { ApiResponse } from '@/core/network/api.types';

/**
 * Query params for fetching route outlets
 */
export interface NonSalePayload {
  visitId: string;
  outletId: string;
  vanId: string;
  reasonCategoryId: string;
  reasonId: string;
  remark?: string;
  routeSessionId?: string;
}

/**
 * Route API contract
 */
export interface NonSaleService {
  markNonSale(params: NonSalePayload): Promise<ApiResponse<any>>;
}

/**
 * Helper to clean empty values (important)
 */
const cleanParams = (params: Record<string, any>) => {
  const cleaned: Record<string, any> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      !(Array.isArray(value) && value.length === 0)
    ) {
      cleaned[key] = value;
    }
  });

  return cleaned;
};

/**
 * Service implementation
 */
export const nonSaleService: NonSaleService = {
  markNonSale: async (payload: NonSalePayload) => {
    return api.post<any>('non-sale', payload) as Promise<ApiResponse<any>>;
  },
};
