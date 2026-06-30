import { api } from '@/core/network';
import type { ApiResponse } from '@/core/network/api.types';
import { isSalesman } from '@/core/navigation/role.utils';
import { isOfflineMode } from '@/core/offline/offline.store';
import { useAuthStore } from '@/core/store/auth.store';
import { repositories } from '@/repositories';
import { captureCurrentLocation, type CapturedLocation } from '@/shared/services/location.service';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { createUuid } from '@/utils/uuid';

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
  employeeId?: string;
  vanId: string;
  outletId: string;
  sequence?: number;
  visitType?: 'ON_SITE' | 'OFF_SITE';
  checkInLocation?: CapturedLocation;
}

/**
 * Route API contract
 */
export interface OutletService {
  getRouteOutlets(params: GetRouteOutletsParams): Promise<ApiResponse<any>>;
  getOutletDetail(customerId: string): Promise<ApiResponse<any>>;
  getOutletMedia(customerId: string): Promise<ApiResponse<any>>;
  startVisit(payload: StartVisitPayload): Promise<ApiResponse<any>>;
  visitStatus(payload: VisitStatusParams): Promise<ApiResponse<any>>;
  completeVisit(visitId: string | undefined): Promise<ApiResponse<any>>;
  createCustomer(payload: any): Promise<ApiResponse<any>>;
  uploadCustomerImage(
    customerId: string,
    uri: string,
    isPrimary?: boolean,
  ): Promise<ApiResponse<any>>;
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

    const user = useAuthStore.getState().user;
    if (isSalesman(user) && isOfflineMode()) {
      // Filter the complete local assignment set before applying page limits.
      // Paginating first can produce an empty page when this route's outlets
      // happen to be stored after outlets assigned to another route.
      const records: Record<string, any>[] = [];
      const localPageSize = 200;
      for (let localPage = 1; ; localPage += 1) {
        const batch = await repositories.outlets.findAll(user?.userId ?? '', {
          page: localPage,
          limit: localPageSize,
          search: searchText,
        });
        records.push(...batch);
        if (batch.length < localPageSize) break;
      }
      const [visits, orders, nonSales] = await Promise.all([
        repositories.visits.findAll(user?.userId ?? '', { limit: 200 }),
        repositories.orders.findAll(user?.userId ?? '', { limit: 200 }),
        repositories.nonSales.findAll(user?.userId ?? '', { limit: 200 }),
      ]);
      const isToday = (value: unknown) => {
        const date = value ? new Date(String(value)) : null;
        const today = new Date();
        return Boolean(
          date &&
          !Number.isNaN(date.getTime()) &&
          date.getFullYear() === today.getFullYear() &&
          date.getMonth() === today.getMonth() &&
          date.getDate() === today.getDate(),
        );
      };
      const completedVisits = visits.filter(
        (visit) =>
          String(visit.status ?? '').toUpperCase() === 'COMPLETED' &&
          isToday(visit.checkOutTime ?? visit.checkInTime ?? visit.createdAt) &&
          (!routeSessionId || String(visit.routeSessionId ?? '') === String(routeSessionId)),
      );
      const visitByOutlet = new Map(
        completedVisits.map((visit) => [String(visit.outletId ?? visit.customerId ?? ''), visit]),
      );
      const orderByVisit = new Map(orders.map((order) => [String(order.visitId ?? ''), order]));
      const nonSaleByVisit = new Map(nonSales.map((item) => [String(item.visitId ?? ''), item]));
      const assignedRecords = records.filter((record) => {
        if (Array.isArray(record.routeIds) && record.routeIds.length) {
          return record.routeIds.map(String).includes(String(routeId));
        }
        return String(record.routeId ?? '') === String(routeId);
      });
      const enrichedRecords = assignedRecords.map((record) => {
        const visit = visitByOutlet.get(String(record.customerId ?? record.uuid));
        const visitId = String(visit?.visitId ?? visit?.uuid ?? '');
        const sale = orderByVisit.get(visitId);
        const nonSale = nonSaleByVisit.get(visitId);
        return {
          ...record,
          isVisited: Boolean(visit),
          visitedAt: visit?.checkOutTime ?? visit?.checkInTime,
          visitStatus: visit ? 'COMPLETED' : 'NOT_VISITED',
          hasSale: Boolean(sale),
          sale,
          hasNonSale: Boolean(nonSale),
          isNonSale: Boolean(visit && nonSale),
        };
      });
      const visitedRecords = enrichedRecords.filter((record) => record.isVisited);
      const productiveRecords = enrichedRecords.filter((record) => record.isVisited && record.sale);
      const totalOrderValue = productiveRecords.reduce(
        (total, record) => total + Number(record.sale?.totalValue ?? 0),
        0,
      );
      const totalCases = productiveRecords.reduce(
        (total, record) => total + Number(record.sale?.netCases ?? record.sale?.totalCases ?? 0),
        0,
      );
      const summary = {
        totalOrderValue,
        totalCases,
        totalVisitedShop: visitedRecords.length,
        totalProductiveCall: productiveRecords.length,
        LPSC: visitedRecords.length ? Number((totalCases / visitedRecords.length).toFixed(2)) : 0,
      };
      const offset = (page - 1) * limit;
      const data = enrichedRecords.slice(offset, offset + limit);
      return {
        success: true,
        statusCode: 200,
        data: { data, summary },
        meta: { total: enrichedRecords.length, page, limit },
      } as ApiResponse<any>;
    }
    return api.get<any>(`/route/${routeId}/customers`, {
      params: queryParams,
    }) as Promise<ApiResponse<any>>;
  },

  getOutletDetail: async (customerId) => {
    const user = useAuthStore.getState().user;
    if (isSalesman(user) && isOfflineMode()) {
      const data = await repositories.outlets.findById(user?.userId ?? '', customerId);
      return { success: Boolean(data), statusCode: data ? 200 : 404, data } as ApiResponse<any>;
    }
    return api.get<any>(`/customer/${customerId}`, {}) as Promise<ApiResponse<any>>;
  },
  getOutletMedia: async (customerId) => {
    const user = useAuthStore.getState().user;
    if (isSalesman(user) && isOfflineMode()) {
      return { success: true, statusCode: 200, data: [] } as ApiResponse<any>;
    }
    return api.get<any>('media', {
      params: { ownerType: 'CUSTOMER', ownerId: customerId, mediaType: 'IMAGE', limit: 20 },
    }) as Promise<ApiResponse<any>>;
  },
  startVisit: async (payload: StartVisitPayload) => {
    const checkInLocation = payload.checkInLocation || (await captureCurrentLocation());
    const user = useAuthStore.getState().user;
    if (isSalesman(user) && isOfflineMode()) {
      const customer = await repositories.outlets.findById(user?.userId ?? '', payload.outletId);
      if (customer?.status !== 'ACTIVE') {
        throw new Error('Visits can only be created for verified, active customers');
      }
      const record = await repositories.visits.create(user?.userId ?? '', {
        ...payload,
        employeeId: user?.userId,
        checkInLocation,
        checkInTime: new Date().toISOString(),
        status: 'ACTIVE',
      });
      return {
        success: true,
        statusCode: 202,
        message: 'Visit saved locally',
        data: { ...record, visitId: record.uuid },
      } as ApiResponse<any>;
    }
    return api.post<any>('shop-visit', {
      ...payload,
      checkInLocation,
    }) as Promise<ApiResponse<any>>;
  },

  visitStatus: async (params: VisitStatusParams) => {
    const user = useAuthStore.getState().user;
    if (isSalesman(user) && isOfflineMode()) {
      const visits = await repositories.visits.findAll(user?.userId ?? '', { limit: 200 });
      const data = visits.find(
        (visit) =>
          visit.outletId === params.outletId &&
          ['ACTIVE', 'IN_PROGRESS'].includes(String(visit.status ?? '').toUpperCase()),
      );
      return {
        success: true,
        statusCode: 200,
        data: data ? { ...data, visitId: data.uuid, status: 'ACTIVE' } : null,
      } as ApiResponse<any>;
    }
    return api.get<any>(`shop-visit/status`, { params }) as Promise<ApiResponse<any>>;
  },

  completeVisit: async (visitId?: string) => {
    const checkOutLocation = await captureCurrentLocation();
    const user = useAuthStore.getState().user;
    if (isSalesman(user) && isOfflineMode() && visitId) {
      const record = await repositories.visits.update(user?.userId ?? '', visitId, {
        status: 'COMPLETED',
        checkOutTime: new Date().toISOString(),
        checkOutLocation,
      });
      return {
        success: true,
        statusCode: 202,
        message: 'Visit completion saved locally',
        data: record,
      } as ApiResponse<any>;
    }
    return api.patch<any>(`shop-visit/${visitId}`, {
      status: 'COMPLETED',
      checkOutTime: new Date().toISOString(),
      checkOutLocation,
    }) as Promise<ApiResponse<any>>;
  },

  createCustomer: async (payload: any) => {
    const pendingPayload = { ...payload, status: 'VERIFICATION_PENDING' };
    const user = useAuthStore.getState().user;
    if (isSalesman(user) && isOfflineMode()) {
      const offlinePayload = {
        ...pendingPayload,
        customerId: Number(pendingPayload.customerId) || Date.now(),
      };
      const record = await repositories.customers.create(user?.userId ?? '', offlinePayload);
      return {
        success: true,
        statusCode: 202,
        message: 'Customer saved locally',
        data: record,
      } as ApiResponse<any>;
    }
    return api.post<any>(`customer`, pendingPayload) as Promise<ApiResponse<any>>;
  },

  uploadCustomerImage: async (customerId: string, uri: string, isPrimary = true) => {
    const user = useAuthStore.getState().user;
    if (isSalesman(user) && isOfflineMode()) {
      const cleanUri = uri.split('?')[0];
      const extension = cleanUri.includes('.') ? cleanUri.split('.').pop() || 'jpg' : 'jpg';
      const mediaId = createUuid();
      let storedUri = uri;

      if (Platform.OS !== 'web' && FileSystem.documentDirectory) {
        const directory = `${FileSystem.documentDirectory}offline-media/`;
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
        storedUri = `${directory}${mediaId}.${extension}`;
        await FileSystem.copyAsync({ from: uri, to: storedUri });
      }

      const record = await repositories.mediaUploads.create(user?.userId ?? '', {
        customerId: String(customerId),
        uri: storedUri,
        extension,
        isPrimary,
      });
      return {
        success: true,
        statusCode: 202,
        message: 'Outlet image saved for sync',
        data: record,
      } as ApiResponse<any>;
    }

    const formData = new FormData();
    const cleanUri = uri.split('?')[0];
    const extension = cleanUri.includes('.') ? cleanUri.split('.').pop() || 'jpg' : 'jpg';
    const mimeType = extension.toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';
    const fileName = `outlet-${customerId}-${Date.now()}.${extension}`;

    if (Platform.OS === 'web') {
      const blob = await fetch(uri).then((response) => response.blob());
      formData.append('file', blob, fileName);
    } else {
      formData.append('file', { uri, name: fileName, type: mimeType } as any);
    }
    formData.append('ownerType', 'CUSTOMER');
    formData.append('ownerId', customerId);
    formData.append('mediaType', 'IMAGE');
    formData.append('purpose', isPrimary ? 'PROFILE' : 'PROOF');
    formData.append('title', 'Outlet Photo');
    formData.append('isPrimary', String(isPrimary));

    return api.post<any>('media/upload', formData) as Promise<ApiResponse<any>>;
  },

  getVisitHistory: async (payload: any) => {
    return api.get<any>(`shop-visit`, { params: payload }) as Promise<ApiResponse<any>>;
  },

  changeRoute: async (payload: any) => {
    const user = useAuthStore.getState().user;
    if (isSalesman(user) && isOfflineMode()) {
      const now = new Date().toISOString();
      const record = await repositories.routeSessions.create(user?.userId ?? '', {
        ...payload,
        userId: user?.userId,
        userName: user?.name,
        vanId: user?.vanId,
        startTime: now,
        sessionDate: now,
        status: 'ACTIVE',
        isActive: true,
      });

      return {
        success: true,
        statusCode: 202,
        message: 'Route change saved locally',
        data: { ...record, routeSessionId: record.uuid },
        offline: true,
      } as ApiResponse<any>;
    }
    return api.post<any>(`route-session`, payload) as Promise<ApiResponse<any>>;
  },
};
