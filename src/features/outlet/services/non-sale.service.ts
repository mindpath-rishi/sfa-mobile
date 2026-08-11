import { api } from '@/core/network';
import type { ApiResponse } from '@/core/network/api.types';
import { isSalesman } from '@/core/navigation/role.utils';
import { isOfflineMode } from '@/core/offline/offline.store';
import { useAuthStore } from '@/core/store/auth.store';
import { repositories } from '@/repositories';
import { createSchemaId } from '@/utils/uuid';

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
    const user = useAuthStore.getState().user;
    if (isSalesman(user) && isOfflineMode()) {
      const nonSaleId = createSchemaId('NonSale');
      const record = await repositories.nonSales.create(user?.userId ?? '', {
        ...cleanParams(payload),
        uuid: nonSaleId,
        nonSaleId,
        employeeId: user?.userId,
        status: 'COMPLETED',
      });
      return {
        success: true,
        statusCode: 202,
        message: 'Non-sale visit saved locally',
        data: { ...record, nonSaleId },
        offline: true,
      } as ApiResponse<any>;
    }
    return api.post<any>('non-sale', payload) as Promise<ApiResponse<any>>;
  },
};
