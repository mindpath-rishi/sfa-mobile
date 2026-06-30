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
import { isSalesman } from '@/core/navigation/role.utils';
import { useAuthStore } from '@/core/store/auth.store';
import { isOfflineMode, useOfflineStore } from '@/core/offline/offline.store';
import { repositories } from '@/repositories';
import { syncService } from '@/sync/sync.service';

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
  dayStart: async (payload, config) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.post<any, DayStartPayload>('/work-session', payload, config);
    }
    const record = await repositories.attendance.create(user?.userId ?? '', {
      ...payload,
      userId: user?.userId,
      userName: user?.name,
      dayStartTime: new Date().toISOString(),
      startTime: new Date().toISOString(),
      status: 'ACTIVE',
    } as unknown as Record<string, unknown>);
    const now = new Date().toISOString();
    await repositories.activities.create(user?.userId ?? '', {
      workSessionId: record.uuid,
      userId: user?.userId,
      userName: user?.name,
      vanId: payload.vanId ?? user?.vanId,
      name: payload.activityName,
      description: payload.description,
      startTime: now,
      status: 'ACTIVE',
    });
    if (payload.routeId) {
      await repositories.routeSessions.create(user?.userId ?? '', {
        workSessionId: record.uuid,
        userId: user?.userId,
        userName: user?.name,
        vanId: payload.vanId ?? user?.vanId,
        routeId: payload.routeId,
        routeName: payload.routeName,
        customerCategoryId: payload.customerCategoryId,
        totalShops: payload.totalShops ?? 0,
        startTime: now,
        sessionDate: now,
        status: 'ACTIVE',
        isActive: true,
      });
    }
    useAuthStore.getState().setWorkSessionId(record.uuid);
    return {
      success: true,
      statusCode: 202,
      message: 'Day start saved locally',
      data: { ...record, workSessionId: record.uuid },
    } as ApiResponse<any>;
  },
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
  getDayStatus: async (_workSessionId, config) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<any>(`/work-session/today-activity`, config);
    }
    const isToday = (value: unknown) => {
      if (!value) return false;
      const date = new Date(String(value));
      const today = new Date();
      return (
        !Number.isNaN(date.getTime()) &&
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    };
    const records = await repositories.attendance.findAll(user?.userId ?? '', { limit: 10 });
    const todayRecords = records.filter((item) =>
      isToday(item.dayStartTime ?? item.startTime ?? item.createdAt),
    );
    const record =
      todayRecords.find((item) => String(item.status ?? '').toUpperCase() === 'ACTIVE') ??
      todayRecords[0] ??
      null;
    const activityRecords = await repositories.activities.findAll(user?.userId ?? '', {
      limit: 200,
    });
    const activities = activityRecords
      .filter((item) => isToday(item.startTime ?? item.createdAt))
      .map((item) => ({
        ...item,
        _id: item._id ?? item.activityId ?? item.uuid,
        activityId: item.activityId ?? item.uuid,
        name: item.name ?? item.activityName ?? 'Activity',
        startTime: item.startTime ?? item.createdAt,
        status: String(item.status ?? '').toUpperCase() === 'ACTIVE' ? 'ongoing' : 'completed',
      }));
    const routeSessions = await repositories.routeSessions.findAll(user?.userId ?? '', {
      limit: 200,
    });
    const activeRouteSession = routeSessions.find(
      (item) =>
        String(item.status ?? '').toUpperCase() === 'ACTIVE' &&
        Boolean(record) &&
        [record?.uuid, record?.workSessionId]
          .filter(Boolean)
          .map(String)
          .includes(String(item.workSessionId ?? '')),
    );
    const legacyRetailingRouteId =
      routeSessions.length === 0 && record?.activityName === 'Retailing'
        ? record?.routeId
        : undefined;
    const routeId = String(activeRouteSession?.routeId ?? legacyRetailingRouteId ?? '');
    const routeRecord = routeId
      ? await repositories.routes.findById(user?.userId ?? '', routeId)
      : null;
    const selectedRoute = routeId
      ? {
          ...routeRecord,
          routeId,
          name: activeRouteSession?.routeName ?? routeRecord?.name,
          routeName: activeRouteSession?.routeName ?? routeRecord?.name,
          routeSessionId: activeRouteSession?.routeSessionId ?? activeRouteSession?.uuid ?? '',
          workSessionId: activeRouteSession?.workSessionId ?? record?.uuid,
          totalShops: activeRouteSession?.totalShops ?? routeRecord?.outletCount ?? 0,
          vanId: activeRouteSession?.vanId ?? record?.vanId ?? user?.vanId,
        }
      : null;
    const currentActivity = activities.find((item) => item.status === 'ongoing' && !item.endTime);
    const activeActivity = currentActivity
      ? {
          ...currentActivity,
          name: currentActivity.name,
          startTime: currentActivity.startTime ?? currentActivity.createdAt,
        }
      : record &&
          activities.length === 0 &&
          String(record.status ?? '').toUpperCase() === 'ACTIVE' &&
          record.activityName
        ? {
            _id: `work-session-${record.uuid}`,
            name: record.activityName,
            startTime: record.startTime,
            status: 'ongoing',
          }
        : null;
    return {
      success: true,
      statusCode: 200,
      data: record
        ? {
            ...record,
            workSessionId: record.uuid,
            activeActivity,
            selectedRoute,
            todayActivities: activities.length
              ? activities
              : activeActivity
                ? [activeActivity]
                : [],
          }
        : null,
      offline: true,
    } as ApiResponse<any>;
  },
  getTodayActivities: async (workSessionId) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<any>(`/activity`, {
        params: { workSessionId },
      }) as Promise<ApiResponse<any>>;
    }
    const records = await repositories.activities.findAll(user?.userId ?? '', { limit: 200 });
    const data = records
      .filter((item) => !workSessionId || item.workSessionId === workSessionId)
      .map((item) => ({
        ...item,
        _id: item._id ?? item.activityId ?? item.uuid,
        activityId: item.activityId ?? item.uuid,
        name: item.name ?? item.activityName ?? 'Activity',
        startTime: item.startTime ?? item.createdAt,
        status: String(item.status ?? '').toUpperCase() === 'ACTIVE' ? 'ongoing' : 'completed',
      }));
    return { success: true, statusCode: 200, data, offline: true } as ApiResponse<any>;
  },
  createActivity: async (payload) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user)) {
      return api.post<any, CreateActivityPayload>('/activity', payload);
    }
    if (!isOfflineMode()) {
      const response = await api.post<any, CreateActivityPayload>('/activity', payload);
      if (response?.success) return response;
      // Network reachability can change before the listener updates Zustand.
      // Fall through to SQLite so the user's activity change is not lost.
      useOfflineStore.getState().setConnection(false, false);
    }
    const ownerId = user?.userId ?? '';
    const existingActivities = await repositories.activities.findAll(ownerId, { limit: 200 });
    await Promise.all(
      existingActivities
        .filter(
          (item) =>
            item.workSessionId === payload.workSessionId &&
            String(item.status ?? '').toUpperCase() === 'ACTIVE',
        )
        .map((item) =>
          repositories.activities.update(ownerId, item.uuid, {
            status: 'COMPLETED',
            endTime: new Date().toISOString(),
          }),
        ),
    );
    const existingRouteSessions = await repositories.routeSessions.findAll(ownerId, {
      limit: 200,
    });
    await Promise.all(
      existingRouteSessions
        .filter(
          (item) =>
            item.workSessionId === payload.workSessionId &&
            String(item.status ?? '').toUpperCase() === 'ACTIVE',
        )
        .map((item) =>
          repositories.routeSessions.update(ownerId, item.uuid, {
            status: 'COMPLETED',
            isActive: false,
            endTime: new Date().toISOString(),
          }),
        ),
    );
    const record = await repositories.activities.create(ownerId, {
      ...payload,
      userId: user?.userId,
      userName: user?.name,
      startTime: new Date().toISOString(),
      status: 'ACTIVE',
    } as unknown as Record<string, unknown>);
    if (payload.routeId) {
      const now = new Date().toISOString();
      await repositories.routeSessions.create(ownerId, {
        workSessionId: payload.workSessionId,
        userId: user?.userId,
        userName: user?.name,
        vanId: payload.vanId ?? user?.vanId,
        vanName: payload.vanName,
        routeId: payload.routeId,
        routeName: payload.routeName,
        customerCategoryId: payload.customerCategoryId,
        totalShops: payload.totalShops ?? 0,
        startTime: now,
        sessionDate: now,
        status: 'ACTIVE',
        isActive: true,
      });
    }
    return {
      success: true,
      statusCode: 202,
      message: 'Activity saved locally',
      data: { ...record, activityId: record.uuid },
      offline: true,
    } as ApiResponse<any>;
  },
  getRoutes: async (vanId) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user)) {
      return api.get<any>('/route');
    }
    if (!isOfflineMode()) {
      // Route-to-van assignments live on the van document. The generic route
      // listing does not accept vanId and rejects it as a non-whitelisted query.
      return api.get<any>('/van/mapped-routes');
    }
    const data = await repositories.routes.findAll(user?.userId ?? '', { limit: 200 });
    return {
      success: true,
      statusCode: 200,
      data: {
        vanId,
        routes: data.map((record) => ({
          routeId: record.routeId ?? record.uuid,
          ...(record.assignment && typeof record.assignment === 'object'
            ? (record.assignment as Record<string, unknown>)
            : {}),
          route: record,
        })),
      },
    } as ApiResponse<any>;
  },
  getVanMappedRoutes: async () => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<any>(`/van/mapped-routes`, {}) as Promise<ApiResponse<any>>;
    }

    const records = await repositories.routes.findAll(user?.userId ?? '', { limit: 200 });
    if (!records.length) {
      // The HTTP layer restores the login-prefetched snapshot while offline.
      return api.get<any>(`/van/mapped-routes`, {}) as Promise<ApiResponse<any>>;
    }
    const routes = records.map((record) => {
      const assignment =
        record.assignment && typeof record.assignment === 'object'
          ? (record.assignment as Record<string, unknown>)
          : {};
      return {
        routeId: record.routeId ?? record.uuid,
        ...assignment,
        route: record,
      };
    });

    return {
      success: true,
      statusCode: 200,
      data: { vanId: user?.vanId, routes },
      offline: true,
    } as ApiResponse<any>;
  },
  getVan: async (userId: string) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<any>(`/van`, { params: { limit: 1, page: 1, userId } });
    }
    const data = await repositories.vans.findAll(user?.userId ?? '', { limit: 1 });
    return {
      success: true,
      statusCode: 200,
      data,
      offline: true,
    } as ApiResponse<any>;
  },
  getVans: async (params) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<any>(`/van`, { params: { limit: 50, page: 1, ...(params || {}) } });
    }
    const data = await repositories.vans.findAll(user?.userId ?? '', { limit: 50 });
    return {
      success: true,
      statusCode: 200,
      data,
      meta: { total: data.length, page: 1, limit: 50 },
      offline: true,
    } as ApiResponse<any>;
  },
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

    const user = useAuthStore.getState().user;
    if (isSalesman(user) && isOfflineMode()) {
      const workSessionId = useAuthStore.getState().workSessionId;
      if (!workSessionId)
        return {
          success: false,
          statusCode: 404,
          message: 'No active work session',
          data: null,
        } as ApiResponse<any>;
      const ownerId = user?.userId ?? '';
      const endedAt = new Date().toISOString();
      const [activities, routeSessions] = await Promise.all([
        repositories.activities.findAll(ownerId, { limit: 200 }),
        repositories.routeSessions.findAll(ownerId, { limit: 200 }),
      ]);
      await Promise.all([
        ...activities
          .filter(
            (item) =>
              item.workSessionId === workSessionId &&
              String(item.status ?? '').toUpperCase() === 'ACTIVE',
          )
          .map((item) =>
            repositories.activities.update(ownerId, item.uuid, {
              status: 'COMPLETED',
              endTime: endedAt,
            }),
          ),
        ...routeSessions
          .filter(
            (item) =>
              item.workSessionId === workSessionId &&
              String(item.status ?? '').toUpperCase() === 'ACTIVE',
          )
          .map((item) =>
            repositories.routeSessions.update(ownerId, item.uuid, {
              status: 'COMPLETED',
              isActive: false,
              endTime: endedAt,
            }),
          ),
      ]);
      const record = await repositories.attendance.update(ownerId, workSessionId, {
        ...payload,
        status: 'COMPLETED',
        dayEndTime: endedAt,
        endTime: endedAt,
      });
      await stopSalesmanBackgroundLocation();
      return {
        success: true,
        statusCode: 202,
        message: 'Day completion saved locally',
        data: record,
      } as ApiResponse<any>;
    }
    const response = (await api.post(
      '/work-session/complete',
      payload,
      config,
    )) as ApiResponse<any>;

    if (response?.success) {
      await stopSalesmanBackgroundLocation();
      // Pull the completed work session/activity immediately. Otherwise the
      // local database still contains the pre-settlement ACTIVE records and
      // shows an ongoing activity after switching offline.
      await syncService.sync().catch(() => undefined);
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
  getEmployeeStats: async (employeeId: string) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<any>(`/employee/${employeeId}/stats`, {}) as Promise<ApiResponse<any>>;
    }

    const ownerId = user?.userId ?? employeeId;
    const [visits, orders] = await Promise.all([
      repositories.visits.findAll(ownerId, { limit: 200 }),
      repositories.orders.findAll(ownerId, { limit: 200 }),
    ]);
    const today = new Date();
    const isToday = (value: unknown) => {
      if (!value) return false;
      const date = new Date(String(value));
      return (
        !Number.isNaN(date.getTime()) &&
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    };
    const todayVisits = visits.filter((item) => isToday(item.checkInTime ?? item.createdAt));
    const completedVisits = todayVisits.filter(
      (item) => String(item.status ?? '').toUpperCase() === 'COMPLETED',
    );
    const todayOrders = orders.filter((item) => isToday(item.date ?? item.createdAt));
    const sum = (key: string) =>
      todayOrders.reduce((total, order) => total + Number(order[key] ?? 0), 0);

    return {
      success: true,
      statusCode: 200,
      data: {
        visits: completedVisits.length,
        totalVisits: todayVisits.length,
        tc: completedVisits.length,
        pc: todayOrders.length,
        orders: {
          count: todayOrders.length,
          value: sum('totalValue'),
          cases: sum('totalCases'),
          weight: sum('totalWeight'),
          pending: todayOrders.filter(
            (item) => String(item.status ?? '').toUpperCase() === 'PENDING',
          ).length,
        },
        incentives: { earned: 0, target: 0, nextMilestone: 0 },
      },
      offline: true,
    } as ApiResponse<any>;
  },
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
