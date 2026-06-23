import { api } from '@/core/network';
import type { ApiRequestConfig, ApiResponse } from '@/core/network/api.types';
import { LoginRequest, LoginResponse } from '@/features/auth/types/login.types';
import { CreateActivityPayload, DayStartPayload } from '../types/home.types';
import { Platform } from 'react-native';
import {
  captureCurrentLocation,
  stopSalesmanBackgroundLocation,
  type CapturedLocation,
} from '@/shared/services/location.service';

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
    qtyTonnage?: number;
    qtyValue?: number;
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
  designation?: string;
  targetCases: number;
  achievementCases: number;
  remainingCases: number;
  targetTonnage?: number;
  achievementTonnage?: number;
  remainingTonnage?: number;
  targetValue?: number;
  achievementValue?: number;
  remainingValue?: number;
  achievementPercentage: number;
  rrr: number;
  crr: number;
  hasTarget: boolean;
}

export interface UserPrimaryCategoryTargetSummary {
  categoryId: string;
  category: string;
  targetCases: number;
  achievementCases: number;
  remainingCases: number;
  targetTonnage: number;
  achievementTonnage: number;
  remainingTonnage: number;
  targetValue: number;
  achievementValue: number;
  remainingValue: number;
  achievementPercentage: number;
}

export interface ManagerOrderSummaryResponse {
  primaryCategoryWiseOrder: {
    totalCases: number;
    totalTonnage?: number;
    totalValue?: number;
    categories: {
      categoryId: string;
      category: string;
      cases: number;
      tonnage?: number;
      value?: number;
      percentage: number;
      tonnagePercentage?: number;
      valuePercentage?: number;
    }[];
  };
  managerOrderSummary: {
    orders: number;
    validation: number;
    orderCases?: number;
    orderTonnage?: number;
    orderValue?: number;
    validationCases?: number;
    validationTonnage?: number;
    validationValue?: number;
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
  users: number;
  vans: number;
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

export interface TimelineLocation {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  speed?: number | null;
  capturedAt?: string | null;
}

export interface ManagerUserTimelineResponse {
  employeeId: string;
  employeeName: string;
  date: string;
  dayStartTime?: string | null;
  dayEndTime?: string | null;
  dayStartImageUrl?: string | null;
  dayStartImageMediaId?: string | null;
  dayStartLocation?: TimelineLocation | null;
  dayEndLocation?: TimelineLocation | null;
  currentLocation?: TimelineLocation | null;
  activities: {
    id: string;
    source?: string;
    type: string;
    time: string;
    duration: string;
    outlet: string;
    owner: string;
    location?: TimelineLocation | null;
    checkInLocation?: TimelineLocation | null;
    checkOutLocation?: TimelineLocation | null;
    metrics: {
      label: string;
      value: string;
    }[];
    order?: {
      orderNo: string;
      outlet: string;
      quantityCases: string;
      quantitySuperUnit: string;
      totalPieces: string;
      netValue: string;
      categories: {
        id: string;
        name: string;
        meta: string;
        value: string;
        lines: {
          id: string;
          name: string;
          ptr: string;
          qty: string;
          unit: string;
          value: string;
        }[];
      }[];
      schemeDiscount: string;
      cashDiscount: string;
      tax: string;
      payableAmount: string;
    };
  }[];
}

export interface ManagerUserMtdSummaryResponse {
  employeeId: string;
  employeeName: string;
  date: string;
  utc: number;
  upc: number;
  zeroOrder: number;
  notVisited: number;
  total: number;
}

export interface ManagerUserRoutePlanResponse {
  employeeId: string;
  employeeName: string;
  date: string;
  stops: {
    id: string;
    outletId: string;
    name: string;
    time: string;
    status: 'completed' | 'pending' | 'missed';
    type: string;
  }[];
}

export interface SalesmanDayWiseSummaryItem {
  date: string;
  label: string;
  dayStatus?: 'Retailing' | 'Official Work' | 'Leave' | 'Absent';
  retailing: number;
  officialWork: number;
  leave: number;
  absent: number;
  totalActivities: number;
  retailingDuration?: string | null;
  totalDuration?: string | null;
  tc: number;
  pc: number;
  upc: number;
  netValue: number;
  cases: number;
  firstCallTime?: string | null;
  firstPcTime?: string | null;
}

export type SalesmanProductSalesGroupBy = 'PRIMARYCATEGORY' | 'SECONDARYCATEGORY' | 'SKU';

export interface SalesmanProductSalesResponse {
  overview: {
    sc: number;
    tc: number;
    pc: number;
    netValue: number;
    cases: number;
    lpc: number;
  };
  categories: {
    id: string;
    name: string;
    value: number;
    pcs: number;
    cases: number;
    growth: number;
  }[];
}

export interface SalesmanPocketTargetResponse {
  startDate: string;
  endDate: string;
  retailingDays: number;
  avgRetailingTime?: string | null;
  avgTotalTime?: string | null;
  dayWiseSummary?: SalesmanDayWiseSummaryItem[];
  target: {
    metric?: TargetMetric;
    selected?: {
      target: number;
      achieved: number;
      remaining: number;
      achievementPercentage: number;
      mtd: number;
      lmtd: number;
      improvement: number;
      crr: number;
      rrr: number;
    };
    targetCases: number;
    achievedCases: number;
    remainingCases: number;
    targetTonnage: number;
    achievedTonnage: number;
    remainingTonnage: number;
    targetValue: number;
    achievedValue: number;
    remainingValue: number;
    achievementPercentage: number;
    crr: number;
    rrr: number;
  };
  pocket: {
    tc: number;
    avgTc: number;
    pc: number;
    avgPc: number;
    upc: number;
    utc: number;
    totalLinesSold: number;
    lpc: number;
    avgFirstCallTime?: string | null;
    avgFirstPcTime?: string | null;
  };
  vanUtilization?: {
    openingStockCases: number;
    topupStockCases: number;
    totalStockCases: number;
    salesCases: number;
    utilizationPercentage: number;
  };
}

export interface SalesmanReportShareResponse {
  message?: string;
  shareText?: string;
  text?: string;
  url?: string;
  reportUrl?: string;
  fileUrl?: string;
}

export type SalesmanReportType = 'MST' | 'MSR' | 'DSR';

export interface SalesmanDispatchStatusItem {
  orderId?: string;
  orderNo?: string;
  outletName?: string;
  outlet?: string;
  invoiceNo?: string;
  status?: string;
  orderDate?: string;
  dispatchDate?: string;
  vehicleNo?: string;
  cases?: number;
  pieces?: number;
  netValue?: number;
}

export type TargetMetric = 'cases' | 'tonnage' | 'value';

export interface HomeService {
  /** Authenticates user and returns token/user payload from backend */
  dayStart(payload: DayStartPayload, config?: ApiRequestConfig): Promise<ApiResponse<any>>;
  uploadDayStartImage: (
    params: {
      uri: string;
      ownerId: string;
      subOwnnerId: string;
    },
    config?: ApiRequestConfig,
  ) => Promise<ApiResponse<{ mediaId: string; url: string }>>;
  getDayStatus(workSessionId: string, config?: ApiRequestConfig): Promise<ApiResponse<any>>;
  getTodayActivities(workSessionId: string): Promise<ApiResponse<any>>;
  createActivity(payload: CreateActivityPayload): Promise<ApiResponse<any>>;
  getRoutes: (vanId: string) => Promise<ApiResponse<any>>;
  getVanMappedRoutes: () => Promise<ApiResponse<any>>;
  getVan: (userId: string) => Promise<ApiResponse<any>>;
  getVans: (params?: { limit?: number; page?: number }) => Promise<ApiResponse<any>>;
  dayComplete(
    carryForwardStock:
      | any
      | {
          carryForwardStock?: any;
          dayEndLocation?: CapturedLocation;
        },
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<any>>;
  cancelVanChangeRequest(workSessionId: string): Promise<ApiResponse<any>>;
  requestVanChange(
    workSessionId: string,
    payload: {
      requestedVanId: string;
      requestedVanName?: string;
      vanChangeReason?: string;
    },
  ): Promise<ApiResponse<any>>;
  getEmployeeStats(employeeId: string): Promise<ApiResponse<any>>;
  getSalesmanPocketAndTarget: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    metric?: TargetMetric;
  }) => Promise<ApiResponse<SalesmanPocketTargetResponse>>;
  getSalesmanDayWiseSummary: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<ApiResponse<SalesmanDayWiseSummaryItem[]>>;
  getSalesmanProductSales: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: SalesmanProductSalesGroupBy;
  }) => Promise<ApiResponse<SalesmanProductSalesResponse>>;
  shareSalesmanMSR: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<ApiResponse<SalesmanReportShareResponse>>;
  shareSalesmanMST: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<ApiResponse<SalesmanReportShareResponse>>;
  shareSalesmanDSR: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<ApiResponse<SalesmanReportShareResponse>>;
  shareSalesmanReport: (
    type: SalesmanReportType,
    params?: {
      date?: string;
      startDate?: string;
      endDate?: string;
    },
  ) => Promise<ApiResponse<SalesmanReportShareResponse>>;
  getSalesmanDispatchOrders: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<ApiResponse<SalesmanDispatchStatusItem[]>>;
  getSalesmanDispatchStatus: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<ApiResponse<SalesmanDispatchStatusItem[]>>;
  getManagerStats(
    params?:
      | string
      | {
          date?: string;
          startDate?: string;
          endDate?: string;
        },
  ): Promise<ApiResponse<ManagerStatsResponse>>;
  getManagerTarget: (date?: string) => Promise<ApiResponse<ManagerTargetResponse>>;
  getUserWiseTargetSummary: (date?: string) => Promise<ApiResponse<UserWiseTargetSummary[]>>;
  getUserPrimaryCategoryTargets: (params: {
    employeeId: string;
    date?: string;
  }) => Promise<ApiResponse<UserPrimaryCategoryTargetSummary[]>>;
  getManagerOrderSummary: () => Promise<ApiResponse<ManagerOrderSummaryResponse>>;
  getManagerTeamCoverage: () => Promise<ApiResponse<ManagerTeamCoverageResponse>>;
  getManagerBeatOMeter: () => Promise<ApiResponse<ManagerBeatOMeterResponse>>;
  getManagerFieldUsers: (params?: {
    date?: string;
    searchKey?: string;
    searchText?: string;
  }) => Promise<ApiResponse<ManagerFieldUserSummary[]>>;
  getManagerUserTimeline: (params: {
    employeeId: string;
    date?: string;
  }) => Promise<ApiResponse<ManagerUserTimelineResponse>>;
  getManagerUserMtdSummary: (params: {
    employeeId: string;
    date?: string;
  }) => Promise<ApiResponse<ManagerUserMtdSummaryResponse>>;
  getManagerUserRoutePlan: (params: {
    employeeId: string;
    date?: string;
  }) => Promise<ApiResponse<ManagerUserRoutePlanResponse>>;
}

/**
 * Thin service layer on top of the shared HTTP client.
 * No UI logic here — only network calls + typing.
 */
export const homeService: HomeService = {
  dayStart: (payload, config) =>
    api.post<any, DayStartPayload>('/work-session', payload, config) as Promise<ApiResponse<any>>,
  uploadDayStartImage: async ({ uri, ownerId, subOwnnerId }, config) => {
    const formData = new FormData();
    const cleanUri = uri.split('?')[0];
    const extension = cleanUri.includes('.') ? cleanUri.split('.').pop() || 'jpg' : 'jpg';
    const mimeType = extension.toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';
    const fileName = `day-start-${Date.now()}.${extension}`;

    if (Platform.OS === 'web') {
      const blob = await fetch(uri).then((response) => response.blob());
      const WebFile = (globalThis as any).File;
      const file =
        typeof WebFile !== 'undefined'
          ? new WebFile([blob], fileName, { type: blob.type || mimeType })
          : blob;

      formData.append('file', file, fileName);
    } else {
      formData.append('file', {
        uri,
        name: fileName,
        type: mimeType,
      } as any);
    }

    formData.append('ownerType', 'EMPLOYEE');
    formData.append('ownerId', ownerId);
    formData.append('mediaType', 'IMAGE');
    formData.append('purpose', 'PROOF');
    formData.append('title', 'Day Start Selfie');
    formData.append('isPrimary', 'false');
    formData.append('subOwnerId', subOwnnerId || '');

    return api.post<{ mediaId: string; url: string }, FormData>(
      '/media/upload',
      formData,
      config,
    ) as Promise<ApiResponse<{ mediaId: string; url: string }>>;
  },
  getDayStatus: (_workSessionId, config) =>
    api.get<any>(`/work-session/today-activity`, config) as Promise<ApiResponse<any>>,
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
  dayComplete: async (carryForwardStock, config) => {
    const payload =
      carryForwardStock &&
      typeof carryForwardStock === 'object' &&
      'dayEndLocation' in carryForwardStock
        ? carryForwardStock
        : {
            carryForwardStock,
            dayEndLocation: await captureCurrentLocation(),
          };

    const response = (await api.post(
      '/work-session/complete',
      payload,
      config,
    )) as ApiResponse<any>;

    if (response?.success) {
      await stopSalesmanBackgroundLocation();
    }

    return response;
  },
  cancelVanChangeRequest: (workSessionId: string) =>
    api.patch<any>(`/work-session/van-change/${workSessionId}/cancel`, {}) as Promise<
      ApiResponse<any>
    >,
  requestVanChange: (workSessionId, payload) =>
    api.patch<any>(`/work-session/van-change/${workSessionId}/request`, payload) as Promise<
      ApiResponse<any>
    >,
  getEmployeeStats: (employeeId: string) =>
    api.get<any>(`/employee/${employeeId}/stats`, {}) as Promise<ApiResponse<any>>,
  getSalesmanPocketAndTarget: (params) =>
    api.get<SalesmanPocketTargetResponse>(`/employee/salesman/my-pocket-target`, {
      params,
    }) as Promise<ApiResponse<SalesmanPocketTargetResponse>>,
  getSalesmanDayWiseSummary: (params) =>
    api.get<SalesmanDayWiseSummaryItem[]>(`/employee/salesman/day-wise-summary`, {
      params,
    }) as Promise<ApiResponse<SalesmanDayWiseSummaryItem[]>>,
  getSalesmanProductSales: (params) =>
    api.get<SalesmanProductSalesResponse>(`/employee/salesman/product-sales`, {
      params,
    }) as Promise<ApiResponse<SalesmanProductSalesResponse>>,
  shareSalesmanReport: (type, params) =>
    api.post<SalesmanReportShareResponse, typeof params>(
      `/employee/salesman/share-${type.toLowerCase()}`,
      params,
    ) as Promise<ApiResponse<SalesmanReportShareResponse>>,
  shareSalesmanMSR: (params) => homeService.shareSalesmanReport('MSR', params),
  shareSalesmanMST: (params) => homeService.shareSalesmanReport('MST', params),
  shareSalesmanDSR: (params) => homeService.shareSalesmanReport('DSR', params),
  getSalesmanDispatchOrders: (params) =>
    api.get<SalesmanDispatchStatusItem[]>(`/employee/salesman/dispatch-order`, {
      params,
    }) as Promise<ApiResponse<SalesmanDispatchStatusItem[]>>,
  getSalesmanDispatchStatus: (params) => homeService.getSalesmanDispatchOrders(params),
  getManagerStats: (params) => {
    const queryParams = typeof params === 'string' ? { date: params } : params;

    return api.get<ManagerStatsResponse>(`/employee/manager/stats`, {
      params: queryParams,
    }) as Promise<ApiResponse<ManagerStatsResponse>>;
  },
  getManagerTarget: (date?: string) =>
    api.get<ManagerTargetResponse>(`/employee/manager/target`, {
      params: date ? { date } : undefined,
    }) as Promise<ApiResponse<ManagerTargetResponse>>,
  getUserWiseTargetSummary: (date?: string) =>
    api.get<UserWiseTargetSummary[]>(`/employee/manager/user-wise-target`, {
      params: date ? { date } : undefined,
    }) as Promise<ApiResponse<UserWiseTargetSummary[]>>,
  getUserPrimaryCategoryTargets: (params) =>
    api.get<UserPrimaryCategoryTargetSummary[]>(`/employee/manager/user-primary-category-target`, {
      params,
    }) as Promise<ApiResponse<UserPrimaryCategoryTargetSummary[]>>,
  getManagerOrderSummary: () =>
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
        ...(params?.searchKey ? { searchText: params.searchKey } : {}),
        ...(params?.searchText ? { searchText: params.searchText } : {}),
      },
    }) as Promise<ApiResponse<ManagerFieldUserSummary[]>>,
  getManagerUserTimeline: (params) =>
    api.get<ManagerUserTimelineResponse>(`/employee/manager/user-timeline`, {
      params,
    }) as Promise<ApiResponse<ManagerUserTimelineResponse>>,
  getManagerUserMtdSummary: (params) =>
    api.get<ManagerUserMtdSummaryResponse>(`/employee/manager/user-mtd-summary`, {
      params,
    }) as Promise<ApiResponse<ManagerUserMtdSummaryResponse>>,
  getManagerUserRoutePlan: (params) =>
    api.get<ManagerUserRoutePlanResponse>(`/employee/manager/user-route-plan`, {
      params,
    }) as Promise<ApiResponse<ManagerUserRoutePlanResponse>>,
};
