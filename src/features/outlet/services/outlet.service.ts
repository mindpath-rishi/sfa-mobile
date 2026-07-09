import { api } from '@/core/network';
import type { ApiResponse } from '@/core/network/api.types';
import { uploadFormData } from '@/core/network/upload';
import { isSalesman } from '@/core/navigation/role.utils';
import { isOfflineMode } from '@/core/offline/offline.store';
import { useAuthStore } from '@/core/store/auth.store';
import { repositories } from '@/repositories';
import { captureCurrentLocation, type CapturedLocation } from '@/shared/services/location.service';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { createSchemaId } from '@/utils/uuid';
import { getDistance } from '@/shared/utils/geofence.utils';

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
  interactionId?: string;
}

export interface StartInteractionPayload {
  customerId: string;
  routeSessionId: string;
  workSessionId: string;
  vanId: string;
  customerLocation: { latitude: number; longitude: number };
  configuredRadiusMeters: number;
}

/**
 * Route API contract
 */
export interface OutletService {
  getRouteOutlets(params: GetRouteOutletsParams): Promise<ApiResponse<any>>;
  getOutletDetail(customerId: string): Promise<ApiResponse<any>>;
  getOutletMedia(customerId: string): Promise<ApiResponse<any>>;
  startVisit(
    payload: StartVisitPayload,
    { showLoader }: { showLoader: boolean },
  ): Promise<ApiResponse<any>>;
  startInteraction(payload: StartInteractionPayload): Promise<ApiResponse<any>>;
  abandonInteraction(interactionId: string): Promise<ApiResponse<any>>;
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
  startInteraction: async (payload) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user)) throw new Error('Only a salesman can start an interaction');
    const salesmanLocation = await captureCurrentLocation();
    if (!salesmanLocation) throw new Error('Current GPS location is required');

    if (isOfflineMode()) {
      const interactionId = createSchemaId('InteractionLog', 10);
      const distanceMeters = getDistance(
        payload.customerLocation.latitude,
        payload.customerLocation.longitude,
        salesmanLocation.latitude,
        salesmanLocation.longitude,
      );
      const visitType = distanceMeters <= payload.configuredRadiusMeters ? 'ON_SITE' : 'OFF_SITE';
      const arrivalTime = new Date().toISOString();
      const record = await repositories.interactions.create(user?.userId ?? '', {
        ...payload,
        uuid: interactionId,
        interactionId,
        employeeId: user?.userId,
        salesmanLocation,
        arrivalLocation: salesmanLocation,
        distanceMeters,
        visitType,
        arrivalTime,
        status: 'ARRIVED',
      });
      return {
        success: true,
        statusCode: 202,
        data: { ...record, interactionId },
      } as ApiResponse<any>;
    }

    return api.post<any>('shop-visit/interaction', { ...payload, salesmanLocation });
  },

  abandonInteraction: async (interactionId) => {
    const user = useAuthStore.getState().user;
    if (isSalesman(user) && isOfflineMode()) {
      const record = await repositories.interactions.update(user?.userId ?? '', interactionId, {
        status: 'ABANDONED',
        abandonedAt: new Date().toISOString(),
      });
      return { success: true, statusCode: 202, data: record } as ApiResponse<any>;
    }
    return api.patch<any>(`shop-visit/interaction/${interactionId}/abandon`, {});
  },

  getRouteOutlets: async (params) => {
    const { routeId, page = 1, limit = 10, searchText, filters = {}, routeSessionId } = params;

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
      const userId = user?.userId ?? '';
      const records: Record<string, any>[] = [];
      const localPageSize = 200;

      for (let localPage = 1; ; localPage += 1) {
        const batch = await repositories.outlets.findAll(userId, {
          page: localPage,
          limit: localPageSize,
          search: searchText,
        });

        records.push(...batch);

        if (batch.length < localPageSize) break;
      }

      const legacyCustomers = await repositories.customers.findAll(userId, {
        limit: localPageSize,
        search: searchText,
      });

      for (const legacyCustomer of legacyCustomers) {
        if (legacyCustomer.syncStatus === 'SYNCED') continue;

        const legacyId = String(legacyCustomer.customerId ?? legacyCustomer.uuid ?? '');
        const alreadyIncluded = records.some(
          (record) => String(record.customerId ?? record.uuid ?? '') === legacyId,
        );

        if (!alreadyIncluded) records.push(legacyCustomer);
      }

      const [visits, orders, nonSales] = await Promise.all([
        repositories.visits.findAll(userId, { limit: 1000 }),
        repositories.orders.findAll(userId, { limit: 1000 }),
        repositories.nonSales.findAll(userId, { limit: 1000 }),
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

      const getTime = (value: unknown) => {
        const time = new Date(String(value ?? 0)).getTime();
        return Number.isNaN(time) ? 0 : time;
      };

      const getOutletId = (record: Record<string, any>) =>
        String(record.customerId ?? record.outletId ?? record.uuid ?? '');

      const getVisitOutletId = (visit: Record<string, any>) =>
        String(visit.outletId ?? visit.customerId ?? '');

      const getVisitId = (visit: Record<string, any>) => String(visit.visitId ?? visit.uuid ?? '');

      const getOrderVisitId = (order: Record<string, any>) =>
        String(order.visitId ?? order.shopVisitId ?? '');

      const getNonSaleVisitId = (item: Record<string, any>) =>
        String(item.visitId ?? item.shopVisitId ?? '');

      const getOrderValue = (order: Record<string, any>) =>
        Number(
          order.totalValue ??
            order.grandTotal ??
            order.netAmount ??
            order.totalAmount ??
            order.amount ??
            0,
        );

      const getOrderCases = (order: Record<string, any>) =>
        Number(order.netCases ?? order.totalCases ?? order.caseQty ?? order.cases ?? 0);

      const completedVisits = visits
        .filter(
          (visit) =>
            String(visit.status ?? '').toUpperCase() === 'COMPLETED' &&
            isToday(visit.checkOutTime ?? visit.checkInTime ?? visit.createdAt) &&
            (!routeSessionId || String(visit.routeSessionId ?? '') === String(routeSessionId)),
        )
        .sort((a, b) => {
          const aTime = getTime(a.createdAt ?? a.checkOutTime ?? a.checkInTime);
          const bTime = getTime(b.createdAt ?? b.checkOutTime ?? b.checkInTime);

          return bTime - aTime;
        });

      /**
       * Important:
       * Keep ALL completed visits by outlet for summary.
       * Latest visit is used only for row display.
       */
      const visitsByOutlet = new Map<string, any[]>();

      for (const visit of completedVisits) {
        const outletId = getVisitOutletId(visit);

        if (!outletId) continue;

        const existing = visitsByOutlet.get(outletId) ?? [];
        existing.push(visit);
        visitsByOutlet.set(outletId, existing);
      }

      const sortedOrders = [...orders].sort((a, b) => {
        const aTime = getTime(a.createdAt);
        const bTime = getTime(b.createdAt);

        return bTime - aTime;
      });

      const sortedNonSales = [...nonSales].sort((a, b) => {
        const aTime = getTime(a.createdAt);
        const bTime = getTime(b.createdAt);

        return bTime - aTime;
      });

      /**
       * Important:
       * Keep ALL orders by visit for summary.
       * Latest order is used only for row display.
       */
      const ordersByVisit = new Map<string, any[]>();

      for (const order of sortedOrders) {
        const visitId = getOrderVisitId(order);

        if (!visitId) continue;

        const existing = ordersByVisit.get(visitId) ?? [];
        existing.push(order);
        ordersByVisit.set(visitId, existing);
      }

      /**
       * Keep ALL non-sales by visit.
       */
      const nonSalesByVisit = new Map<string, any[]>();

      for (const item of sortedNonSales) {
        const visitId = getNonSaleVisitId(item);

        if (!visitId) continue;

        const existing = nonSalesByVisit.get(visitId) ?? [];
        existing.push(item);
        nonSalesByVisit.set(visitId, existing);
      }

      const assignedRecords = records.filter((record) => {
        if (Array.isArray(record.routeIds) && record.routeIds.length) {
          return record.routeIds.map(String).includes(String(routeId));
        }

        return String(record.routeId ?? '') === String(routeId);
      });

      const enrichedRecords = assignedRecords.map((record) => {
        const outletId = getOutletId(record);
        const outletVisits = visitsByOutlet.get(outletId) ?? [];
        const latestVisit = outletVisits[0];

        const visitIds = outletVisits.map(getVisitId).filter(Boolean);

        const saleOrders = visitIds.flatMap((visitId) => ordersByVisit.get(visitId) ?? []);
        const nonSaleItems = visitIds.flatMap((visitId) => nonSalesByVisit.get(visitId) ?? []);

        const saleVisitIds = new Set(
          saleOrders.map(getOrderVisitId).filter((visitId) => visitId.length > 0),
        );

        const nonSaleVisitIds = new Set(
          nonSaleItems.map(getNonSaleVisitId).filter((visitId) => visitId.length > 0),
        );

        const latestSale = saleOrders[0];
        const latestNonSale = nonSaleItems[0];

        const isVisited = outletVisits.length > 0;
        const hasSale = saleOrders.length > 0;
        const hasNonSale = nonSaleItems.length > 0;

        /**
         * Sale gets priority.
         * If customer has sale and non-sale both today, row is productive.
         */
        const isNonSale = isVisited && hasNonSale && !hasSale;

        const visitCountForSummary = outletVisits.length;
        const productiveCallCountForSummary = saleVisitIds.size;
        const nonProductiveCallCountForSummary = visitIds.filter(
          (visitId) => !saleVisitIds.has(visitId),
        ).length;

        const nonSaleCallCountForSummary = [...nonSaleVisitIds].filter(
          (visitId) => !saleVisitIds.has(visitId),
        ).length;

        const totalOrderValueForSummary = saleOrders.reduce(
          (total, order) => total + getOrderValue(order),
          0,
        );

        const totalCasesForSummary = saleOrders.reduce(
          (total, order) => total + getOrderCases(order),
          0,
        );

        return {
          ...record,

          isVisited,
          visitedAt: latestVisit?.checkOutTime ?? latestVisit?.checkInTime,
          visitStatus: latestVisit ? 'COMPLETED' : 'NOT_VISITED',

          hasSale,
          sale: latestSale,

          hasNonSale,
          isNonSale,
          nonSaleReason: isNonSale ? (latestNonSale?.reason ?? null) : null,

          /**
           * Useful for UI/debugging.
           */
          visitCount: visitCountForSummary,
          saleVisitCount: productiveCallCountForSummary,

          /**
           * Internal summary fields.
           */
          __summary: {
            visitCount: visitCountForSummary,
            productiveCallCount: productiveCallCountForSummary,
            nonProductiveCallCount: nonProductiveCallCountForSummary,
            nonSaleCallCount: nonSaleCallCountForSummary,
            totalOrderValue: totalOrderValueForSummary,
            totalCases: totalCasesForSummary,
          },
        };
      });

      const totalOrderValue = enrichedRecords.reduce(
        (total, record) => total + Number(record.__summary?.totalOrderValue ?? 0),
        0,
      );

      const totalCases = enrichedRecords.reduce(
        (total, record) => total + Number(record.__summary?.totalCases ?? 0),
        0,
      );

      const totalVisitedShop = enrichedRecords.reduce(
        (total, record) => total + Number(record.__summary?.visitCount ?? 0),
        0,
      );

      const totalProductiveCall = enrichedRecords.reduce(
        (total, record) => total + Number(record.__summary?.productiveCallCount ?? 0),
        0,
      );

      const totalNonProductiveCall = enrichedRecords.reduce(
        (total, record) => total + Number(record.__summary?.nonProductiveCallCount ?? 0),
        0,
      );

      const totalNonSaleCall = enrichedRecords.reduce(
        (total, record) => total + Number(record.__summary?.nonSaleCallCount ?? 0),
        0,
      );

      const summary = {
        totalOrderValue,
        totalCases,
        totalVisitedShop,
        totalProductiveCall,
        totalNonProductiveCall,
        totalNonSaleCall,
        LPSC: totalVisitedShop ? Number((totalCases / totalVisitedShop).toFixed(2)) : 0,
      };

      const offset = (page - 1) * limit;

      const data = enrichedRecords
        .slice(offset, offset + limit)
        .map(({ __summary, ...record }) => record);

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
  startVisit: async (payload: StartVisitPayload, { showLoader }: { showLoader: boolean }) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user)) {
      throw new Error('Only a salesman can start a visit');
    }

    const checkInLocation = payload.checkInLocation || (await captureCurrentLocation());
    if (isOfflineMode()) {
      const customer = await repositories.outlets.findById(user?.userId ?? '', payload.outletId);
      if (customer?.status !== 'ACTIVE') {
        throw new Error('Visits can only be created for verified, active customers');
      }
      const visitId = createSchemaId('ShopVisit');
      const interaction = payload.interactionId
        ? await repositories.interactions.findById(user?.userId ?? '', payload.interactionId)
        : null;
      if (!interaction || interaction.status !== 'ARRIVED') {
        throw new Error('A valid arrived interaction is required');
      }
      const record = await repositories.visits.create(user?.userId ?? '', {
        ...payload,
        uuid: visitId,
        visitId,
        employeeId: user?.userId,
        checkInLocation,
        checkInTime: interaction?.arrivalTime || new Date().toISOString(),
        visitType: interaction?.visitType || payload.visitType,
        distanceMeters: interaction?.distanceMeters,
        customerLocation: interaction?.customerLocation,
        status: 'ACTIVE',
      });
      if (interaction) {
        await repositories.interactions.update(user?.userId ?? '', interaction.uuid, {
          status: 'CONVERTED',
          visitId,
        });
      }
      return {
        success: true,
        statusCode: 202,
        message: 'Visit saved locally',
        data: { ...record, visitId },
      } as ApiResponse<any>;
    }
    return api.post<any>(
      'shop-visit',
      {
        ...payload,
        checkInLocation,
      },
      { showLoader },
    ) as Promise<ApiResponse<any>>;
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
    if (!checkOutLocation) throw new Error('Current GPS location is required to complete a visit');
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
        customerId: String(pendingPayload.customerId || Date.now()),
      };
      const record = await repositories.outlets.create(user?.userId ?? '', offlinePayload);
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
      const mediaId = createSchemaId('Media');
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

    return uploadFormData<any>('media/upload', formData);
  },

  getVisitHistory: async (payload: any) => {
    return api.get<any>(`shop-visit`, { params: payload }) as Promise<ApiResponse<any>>;
  },

  changeRoute: async (payload: any) => {
    const user = useAuthStore.getState().user;
    if (isSalesman(user) && isOfflineMode()) {
      const now = new Date().toISOString();
      const routeSessionId = createSchemaId('RouteSession');
      const record = await repositories.routeSessions.create(user?.userId ?? '', {
        ...payload,
        uuid: routeSessionId,
        routeSessionId,
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
        data: { ...record, routeSessionId },
        offline: true,
      } as ApiResponse<any>;
    }
    return api.post<any>(`route-session`, payload) as Promise<ApiResponse<any>>;
  },
};
