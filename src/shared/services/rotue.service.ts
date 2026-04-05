import { api } from '@/core/network';
import type { ApiResponse } from '@/core/network/api.types';

/* ================= SERVICE ================= */

export interface RouteService {
  fetchRoute: (routeId: string) => Promise<ApiResponse<any>>;
}

/**
 * Thin service layer (only API calls)
 */
export const routeService: RouteService = {
  fetchRoute: (routeId: string) => api.get<any>(`/route/${routeId}`) as Promise<ApiResponse<any>>,
};
