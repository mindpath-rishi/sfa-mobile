import { api, ApiRequestConfig, ApiResponse } from '@/core/network';
import { isSalesman } from '@/core/navigation/role.utils';
import { isOfflineMode } from '@/core/offline/offline.store';
import { useAuthStore } from '@/core/store/auth.store';
import { repositories } from '@/repositories';

export interface VanService {
  fetchVanStocks: (vanId: string | undefined, params: any) => Promise<ApiResponse<any>>;
  createInventoryTopupRequest: (payload: any) => Promise<ApiResponse<any>>;
  fetchInventoryTopupRequests: (payload: any) => Promise<ApiResponse<any>>;
  fetchTodayStockSummary: (payload: any, config?: ApiRequestConfig) => Promise<ApiResponse<any>>;
  fetchInventoryTopupRequest: (topupId: string) => Promise<ApiResponse<any>>;
  fetchInventoryTransactions: (params?: Record<string, any>) => Promise<ApiResponse<any>>;
  acceptInventoryTopupRequest: (topupId: string) => Promise<ApiResponse<any>>;
  rejectInventoryTopupRequest: (topupId: string, payload?: any) => Promise<ApiResponse<any>>;
}

export const vanService: VanService = {
  fetchVanStocks: async (vanId: string | undefined, params) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<any>(`/van-inventory/van/${vanId}`, { params });
    }

    const loadAll = async (repository: typeof repositories.stock) => {
      const records: Record<string, any>[] = [];
      for (let page = 1; ; page += 1) {
        const batch = await repository.findAll(user?.userId ?? '', { page, limit: 200 });
        records.push(...batch);
        if (batch.length < 200) return records;
      }
    };
    const [records, productRecords] = await Promise.all([
      loadAll(repositories.stock),
      loadAll(repositories.products),
    ]);
    const productById = new Map(
      productRecords.map((product) => [String(product.productId), product]),
    );
    // Prefer explicitly van-scoped rows. Older snapshots did not contain vanId,
    // so retain those only when the sync supplied no rows for this van at all.
    const hasVanScopedRecords = Boolean(
      vanId && records.some((record) => String(record.vanId) === String(vanId)),
    );

    const search = String(params?.searchText ?? '')
      .trim()
      .toLowerCase();
    const filtered = records.filter((record) => {
      if (
        vanId &&
        (hasVanScopedRecords
          ? String(record.vanId) !== String(vanId)
          : record.vanId && String(record.vanId) !== String(vanId))
      )
        return false;
      const product = productById.get(String(record.productId));
      if (!search) return true;
      return [
        record.name,
        record.productName,
        product?.name,
        product?.productName,
        record.productId,
        record.productSysCode,
      ].some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(search),
      );
    });
    const products = filtered.map((record) => {
      const product = productById.get(String(record.productId));
      const quantity = Number(record.quantity) || 0;
      const unitQtyInCase = Math.max(
        Number(record.unitQtyInCase ?? product?.unitQtyInCase) || 1,
        1,
      );
      return {
        ...product,
        ...record,
        name:
          record.name ||
          record.productName ||
          product?.name ||
          product?.productName ||
          record.productId,
        productName:
          record.productName || product?.productName || product?.name || record.productId,
        unitQtyInCase,
        cases: record.cases ?? Math.floor(quantity / unitQtyInCase),
        pieces: record.pieces ?? quantity % unitQtyInCase,
        price: Number(record.price ?? record.casePrice) || 0,
        netWeight: Number(record.netWeight ?? record.pieceNetWeight) || 0,
      };
    });
    const page = Math.max(Number(params?.page) || 1, 1);
    const limit = Math.max(Number(params?.limit) || 20, 1);
    const pageProducts = products.slice((page - 1) * limit, page * limit);

    return {
      success: true,
      statusCode: 200,
      data: {
        products: pageProducts,
        total: products.length,
        totalCases: products.reduce((sum, item) => sum + Number(item.cases || 0), 0),
        totalPieces: products.reduce((sum, item) => sum + Number(item.pieces || 0), 0),
        totalValue: products.reduce(
          (sum, item) => sum + Number(item.cases || 0) * Number(item.price || 0),
          0,
        ),
        totalNetWeight: products.reduce(
          (sum, item) =>
            sum +
            (Number(item.cases || 0) * Number(item.unitQtyInCase || 1) + Number(item.pieces || 0)) *
              Number(item.netWeight || 0),
          0,
        ),
        page,
        limit,
      },
      offline: true,
    } as ApiResponse<any>;
  },

  createInventoryTopupRequest: (payload: any) =>
    api.post<any>('/van-inventory-topup', payload) as Promise<ApiResponse<any>>,

  fetchInventoryTopupRequests: (params: any) =>
    api.get<any>('/van-inventory-topup', { params }) as Promise<ApiResponse<any>>,

  fetchInventoryTopupRequest: (topupId: string) =>
    api.get<any>(`/van-inventory-topup/${topupId}`) as Promise<ApiResponse<any>>,

  fetchInventoryTransactions: async (params: Record<string, any> = {}) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<any>('/inventory-transaction', { params });
    }

    const ownerId = user?.userId ?? '';
    const records: Record<string, any>[] = [];
    for (let page = 1; ; page += 1) {
      const batch = await repositories.inventoryTransactions.findAll(ownerId, {
        page,
        limit: 200,
      });
      records.push(...batch);
      if (batch.length < 200) break;
    }

    const search = String(params.searchText ?? '')
      .trim()
      .toLowerCase();
    const dateFrom = params.startDate ? new Date(params.startDate).getTime() : null;
    const dateTo = params.endDate ? new Date(params.endDate).getTime() : null;
    const filtered = records
      .filter((record) => {
        if (params.transactionId && String(record.transactionId) !== String(params.transactionId))
          return false;
        if (params.productId && String(record.productId) !== String(params.productId)) return false;
        if (params.vanId && String(record.vanId) !== String(params.vanId)) return false;
        if (params.employeeId && String(record.employeeId) !== String(params.employeeId))
          return false;
        if (params.warehouseId && String(record.warehouseId) !== String(params.warehouseId))
          return false;
        if (params.transactionType && record.transactionType !== params.transactionType)
          return false;
        if (params.direction && record.direction !== params.direction) return false;
        if (params.status && record.status !== params.status) return false;
        if (params.quantity !== undefined && Number(record.quantity) !== Number(params.quantity))
          return false;
        const transactionTime = new Date(record.transactionDate ?? record.createdAt).getTime();
        if (dateFrom !== null && transactionTime < dateFrom) return false;
        if (dateTo !== null && transactionTime > dateTo) return false;
        if (
          search &&
          ![record.transactionId, record.productId, record.referenceNo, record.remark].some(
            (value) =>
              String(value ?? '')
                .toLowerCase()
                .includes(search),
          )
        )
          return false;
        return true;
      })
      .sort(
        (left, right) =>
          new Date(right.transactionDate ?? right.createdAt).getTime() -
          new Date(left.transactionDate ?? left.createdAt).getTime(),
      );

    const page = Math.max(Number(params.page) || 1, 1);
    const limit = Math.max(Number(params.limit) || 20, 1);
    const data = filtered.slice((page - 1) * limit, page * limit);
    return {
      success: true,
      statusCode: 200,
      data,
      meta: { total: filtered.length, page, limit },
      offline: true,
    } as ApiResponse<any>;
  },

  acceptInventoryTopupRequest: (topupId: string) =>
    api.patch<any>(`/van-inventory-topup/${topupId}/accept`, {}) as Promise<ApiResponse<any>>,

  rejectInventoryTopupRequest: (topupId: string, payload: any = {}) =>
    api.patch<any>(`/van-inventory-topup/${topupId}/reject`, payload) as Promise<ApiResponse<any>>,

  fetchTodayStockSummary: (params: any, config?: ApiRequestConfig) =>
    api.get<any>('/van-daily-stock/summary', {
      params,
      cache: false,
      timeoutMs: 20_000,
      ...config,
    }) as Promise<ApiResponse<any>>,
};
