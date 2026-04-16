import { api } from '@/core/network';
import type { ApiResponse } from '@/core/network/api.types';
import { LoginRequest, LoginResponse } from '@/features/auth/types/login.types';
import { CreateActivityPayload, DayStartPayload } from '../types/home.types';

/**
 * Auth API contract used by the app.
 * Keeps login/logout strongly-typed and easy to mock in tests.
 */
export interface HomeService {
  /** Authenticates user and returns token/user payload from backend */
  dayStart(payload: DayStartPayload): Promise<ApiResponse<any>>;
  getDayStatus(workSessionId: string): Promise<ApiResponse<any>>;
  getTodayActivities(workSessionId: string): Promise<ApiResponse<any>>;
  createActivity(payload: CreateActivityPayload): Promise<ApiResponse<any>>;
  getRoutes: (vanId: string) => Promise<ApiResponse<any>>;
  getVanMappedRoutes: () => Promise<ApiResponse<any>>;
  getVan: () => Promise<ApiResponse<any>>;
  dayComplete(): Promise<ApiResponse<any>>;
  getEmployeeStats(employeeId: string): Promise<ApiResponse<any>>;
}

/**
 * Thin service layer on top of the shared HTTP client.
 * No UI logic here — only network calls + typing.
 */
export const homeService: HomeService = {
  dayStart: (payload) =>
    api.post<any, DayStartPayload>('/work-session', payload) as Promise<ApiResponse<any>>,
  getDayStatus: () => api.get<any>(`/work-session/today-activity`, {}) as Promise<ApiResponse<any>>,
  getTodayActivities: (workSessionId) =>
    api.get<any>(`/activity`, {
      params: { workSessionId },
    }) as Promise<ApiResponse<any>>,
  createActivity: (payload) =>
    api.post<any, CreateActivityPayload>('/activity', payload) as Promise<ApiResponse<any>>,
  getRoutes: (vanId) => api.get<any>('/route', { params: { vanId } }) as Promise<ApiResponse<any>>,
  getVanMappedRoutes: () => api.get<any>(`/van/mapped-routes`, {}) as Promise<ApiResponse<any>>,
  getVan: () =>
    api.get<any>(`/van`, { params: { limit: 1, page: 1 } }) as Promise<ApiResponse<any>>,
  dayComplete: () => api.post('/work-session/complete', {}) as Promise<ApiResponse<any>>,
  getEmployeeStats: (employeeId: string) =>
    api.get<any>(`/employee/${employeeId}/stats`, {}) as Promise<ApiResponse<any>>,
};
