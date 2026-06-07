import { api } from '@/core/network';
import type { ApiResponse } from '@/core/network/api.types';
import { LoginRequest, LoginResponse } from '@/features/auth/types/login.types';
import { CreateActivityPayload, DayStartPayload } from '../types/home.types';

/**
 * Auth API contract used by the app.
 * Keeps login/logout strongly-typed and easy to mock in tests.
 */
export interface ManagerStatsResponse {
  userSummary: {
    retailing: number;
    officeWork: number;
    leave: number;
    absent: number;
    total: number;
  };
  callSummary: {
    productivity: number;
    covered: number;
    pc: number;
    tc: number;
    sc: number;
    qtyCases: number;
  };
}

export interface ManagerTargetData {
  startDate: string;
  endDate: string;
  targetCases: number;
  achievedCases: number;
  remainingCases: number;
  targetTonnage: number;
  achievedTonnage: number;
  targetValue: number;
  achievedValue: number;
  achievementPercentage: number;
  display: {
    percentage: string;
    achievedCases: string;
    remainingMessage: string;
  };
}

export interface ManagerTargetResponse {
  startDate?: string;
  endDate?: string;
  targetCases?: number;
  achievedCases?: number;
  remainingCases?: number;
  targetTonnage?: number;
  achievedTonnage?: number;
  targetValue?: number;
  achievedValue?: number;
  achievementPercentage?: number;
  display?: {
    percentage?: string;
    achievedCases?: string;
    remainingMessage?: string;
  };
}

export interface UserWiseTargetSummary {
  employeeId: string;
  employeeName: string;
  designation: string;
  targetCases: number;
  achievementCases: number;
  remainingCases: number;
  achievementPercentage: number;
  rrr: number;
  crr: number;
  hasTarget: boolean;
}

export interface UserWiseTargetResponse {
  data: UserWiseTargetSummary[];
  summary: {
    totalUsers: number;
    usersWithTarget: number;
    totalTargetCases: number;
    totalAchievementCases: number;
    overallAchievementPercentage: number;
  };
}

export interface ManagerOrderSummaryResponse {
  primaryCategoryWiseOrder: {
    totalCases: number;
    categories: {
      categoryId: string;
      category: string;
      cases: number;
      percentage: number;
    }[];
  };
  managerOrderSummary: {
    orders: number;
    validation: number;
  };
  outletSummary: {
    upc: {
      count: number;
      percentage: number;
    };
    zeroOrder: {
      count: number;
      percentage: number;
    };
    notVisited: {
      count: number;
      percentage: number;
    };
    total: {
      count: number;
      percentage: number;
    };
    productivity: {
      pc: number;
      tc: number;
      percentage: number;
    };
  };
}

export interface ManagerTeamCoverageResponse {
  warehouse: number;
  routes: number;
  outlets: number;
  outletsPlanned: number;
  upc: number;
  uic: number;
}

export interface ManagerBeatOMeterResponse {
  employeeId?: string;
  employeeName?: string;
  designation?: string;
  totalOutlets?: number;
  summary?: {
    visitedOutlets?: number;
    orderedOutlets?: number;
    visitedPercentage?: number;
    orderedPercentage?: number;
  };
  outletTypes?: {
    type?: string;
    color?: string;
    total?: number;
    mtdVisited?: {
      count?: number;
      percentage?: number;
    };
    mtdOrder?: {
      count?: number;
      percentage?: number;
    };
  }[];
}

export interface ManagerFieldUserSummary {
  employeeId: string;
  employeeName: string;
  mobile?: string;
  activity?: {
    name?: string;
    color?: string;
  } | null;
  routeName?: string | null;
  location?: string | null;
  summary?: {
    firstCallTime?: string | null;
    firstPcTime?: string | null;
    tc?: number;
    pc?: number;
    lpc?: number;
  } | null;
}

export interface HomeService {
  /** Authenticates user and returns token/user payload from backend */
  dayStart(payload: DayStartPayload): Promise<ApiResponse<any>>;
  getDayStatus(workSessionId: string): Promise<ApiResponse<any>>;
  getTodayActivities(workSessionId: string): Promise<ApiResponse<any>>;
  createActivity(payload: CreateActivityPayload): Promise<ApiResponse<any>>;
  getRoutes: (vanId: string) => Promise<ApiResponse<any>>;
  getVanMappedRoutes: () => Promise<ApiResponse<any>>;
  getVan: (userId: string) => Promise<ApiResponse<any>>;
  getVans: (params?: { limit?: number; page?: number }) => Promise<ApiResponse<any>>;
  dayComplete(carryForwardStock: any): Promise<ApiResponse<any>>;
  getEmployeeStats(employeeId: string): Promise<ApiResponse<any>>;
  getManagerStats(date?: string): Promise<ApiResponse<ManagerStatsResponse>>;
  getManagerTarget: () => Promise<ApiResponse<ManagerTargetResponse>>;
  getUserWiseTargetSummary: () => Promise<ApiResponse<UserWiseTargetResponse>>;
  getManagerOrderSummary: (date?: string) => Promise<ApiResponse<ManagerOrderSummaryResponse>>;
  getManagerTeamCoverage: () => Promise<ApiResponse<ManagerTeamCoverageResponse>>;
  getManagerBeatOMeter: () => Promise<ApiResponse<ManagerBeatOMeterResponse>>;
  getManagerFieldUsers: (params?: {
    date?: string;
    searchKey?: string;
  }) => Promise<ApiResponse<ManagerFieldUserSummary[]>>;
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
  getVan: (userId: string) =>
    api.get<any>(`/van`, { params: { limit: 1, page: 1, userId } }) as Promise<ApiResponse<any>>,
  getVans: (params) =>
    api.get<any>(`/van`, { params: { limit: 50, page: 1, ...(params || {}) } }) as Promise<
      ApiResponse<any>
    >,
  dayComplete: (carryForwardStock) =>
    api.post('/work-session/complete', { carryForwardStock }) as Promise<ApiResponse<any>>,
  getEmployeeStats: (employeeId: string) =>
    api.get<any>(`/employee/${employeeId}/stats`, {}) as Promise<ApiResponse<any>>,
  getManagerStats: (date?: string) =>
    api.get<ManagerStatsResponse>(`/employee/manager/stats`, {
      params: date ? { date } : undefined,
    }) as Promise<ApiResponse<ManagerStatsResponse>>,
  getManagerTarget: () =>
    api.get<ManagerTargetResponse>(`/employee/manager/target`, {}) as Promise<
      ApiResponse<ManagerTargetResponse>
    >,
  getUserWiseTargetSummary: () =>
    api.get<UserWiseTargetResponse>(`/employee/manager/user-wise-target`, {}) as Promise<
      ApiResponse<UserWiseTargetResponse>
    >,
  getManagerOrderSummary: (date?: string) =>
    api.get<ManagerOrderSummaryResponse>(`/employee/manager/order-summary`, {}) as Promise<
      ApiResponse<ManagerOrderSummaryResponse>
    >,
  getManagerTeamCoverage: () =>
    api.get<ManagerTeamCoverageResponse>(`/employee/manager/team-coverage`, {}) as Promise<
      ApiResponse<ManagerTeamCoverageResponse>
    >,
  getManagerBeatOMeter: () =>
    api.get<ManagerBeatOMeterResponse>(`/employee/manager/get-beat-o-meter`, {}) as Promise<
      ApiResponse<ManagerBeatOMeterResponse>
    >,
  getManagerFieldUsers: (params) =>
    api.get<ManagerFieldUserSummary[]>(`/employee/manager/field-user`, {
      params: {
        ...(params?.date ? { date: params.date } : {}),
        ...(params?.searchKey ? { searchKey: params.searchKey } : {}),
      },
    }) as Promise<ApiResponse<ManagerFieldUserSummary[]>>,
};
