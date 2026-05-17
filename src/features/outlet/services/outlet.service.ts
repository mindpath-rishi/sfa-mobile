import { api } from '@/core/network';
import type { ApiResponse } from '@/core/network/api.types';

/**
 * Query params for fetching route outlets
 */
export interface GetRouteOutletsParams {
  routeId: string;
  page?: number;
  limit?: number;
  searchText?: string;
  routeSessionId?: string;
  filters?: {
    status?: string[];
    types?: string[];
    categories?: string[];
    tags?: string[];
    creditRange?: { min?: string; max?: string };
    overdue?: boolean;
    nearby?: boolean;
    visited?: string;
  };
}

export interface VisitStatusParams {
  routeSessionId: string;
  workSessionId: string;
  outletId: string;
  vanId: string;
}

export interface StartVisitPayload {
  routeSessionId: string;
  workSessionId: string;
  employeeId: string;
  vanId: string;
  outletId: string;
  sequence: number;
}

/**
 * Route API contract
 */
export interface OutletService {
  getRouteOutlets(params: GetRouteOutletsParams): Promise<ApiResponse<any>>;
  getOutletDetail(customerId: string): Promise<ApiResponse<any>>;
  startVisit(payload: StartVisitPayload): Promise<ApiResponse<any>>;
  visitStatus(payload: StartVisitPayload): Promise<ApiResponse<any>>;
  completeVisit(visitId: string | undefined): Promise<ApiResponse<any>>;
  createCustomer(payload: any): Promise<ApiResponse<any>>;
  getVisitHistory(payload: any): Promise<ApiResponse<any>>;
  changeRoute(payload: any): Promise<ApiResponse<any>>;
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
export const outletService: OutletService = {
  getRouteOutlets: async (params) => {
    const { routeId, page = 1, limit = 10, searchText, filters = {}, routeSessionId } = params;

    // 🔥 Flatten filters for query params
    const queryParams = cleanParams({
      page,
      limit,
      searchText,

      status: filters.status?.join(','),
      types: filters.types?.join(','),
      categories: filters.categories?.join(','),
      tags: filters.tags?.join(','),

      creditMin: filters.creditRange?.min,
      creditMax: filters.creditRange?.max,

      overdue: filters.overdue,
      nearby: filters.nearby,
      visited: filters.visited,
      routeSessionId,
    });

    return api.get<any>(`/route/${routeId}/customers`, {
      params: queryParams,
    }) as Promise<ApiResponse<any>>;
  },

  getOutletDetail: async (customerId) => {
    return api.get<any>(`/customer/${customerId}`, {}) as Promise<ApiResponse<any>>;
  },
  startVisit: async (payload: StartVisitPayload) => {
    return api.post<any>('shop-visit', payload) as Promise<ApiResponse<any>>;
  },

  visitStatus: async (params: VisitStatusParams) => {
    return api.get<any>(`shop-visit/status`, { params }) as Promise<ApiResponse<any>>;
  },

  completeVisit: async (visitId: string) => {
    return api.patch<any>(`shop-visit/${visitId}`, {
      status: 'COMPLETED',
      checkOutTime: new Date().toISOString(),
    }) as Promise<ApiResponse<any>>;
  },

  createCustomer: async (payload: any) => {
    return api.post<any>(`customer`, payload) as Promise<ApiResponse<any>>;
  },

  getVisitHistory: async (payload: any) => {
    return api.get<any>(`shop-visit`, { params: payload }) as Promise<ApiResponse<any>>;
  },

  changeRoute: async (payload: any) => {
    return api.post<any>(`route-session`, payload) as Promise<ApiResponse<any>>;
  },
};
