import { api, ApiRequestConfig, ApiResponse } from '@/core/network';
import { isSalesman } from '@/core/navigation/role.utils';
import { isOfflineMode } from '@/core/offline/offline.store';
import { useAuthStore } from '@/core/store/auth.store';
import { repositories } from '@/repositories';
import { isToday } from 'date-fns';

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
  // fetchVanStocks: async (vanId: string | undefined, params) => {
  //   const user = useAuthStore.getState().user;
  //   if (!isSalesman(user) || !isOfflineMode()) {
  //     return api.get<any>(`/van-inventory/van/${vanId}`, { params });
  //   }

  //   const loadAll = async (repository: typeof repositories.stock) => {
  //     const records: Record<string, any>[] = [];
  //     for (let page = 1; ; page += 1) {
  //       const batch = await repository.findAll(user?.userId ?? '', { page, limit: 200 });
  //       records.push(...batch);
  //       if (batch.length < 200) return records;
  //     }
  //   };
  //   const [records, productRecords] = await Promise.all([
  //     loadAll(repositories.stock),
  //     loadAll(repositories.products),
  //   ]);
  //   const productById = new Map(
  //     productRecords.map((product) => [String(product.productId), product]),
  //   );
  //   // Prefer explicitly van-scoped rows. Older snapshots did not contain vanId,
  //   // so retain those only when the sync supplied no rows for this van at all.
  //   const hasVanScopedRecords = Boolean(
  //     vanId && records.some((record) => String(record.vanId) === String(vanId)),
  //   );

  //   const search = String(params?.searchText ?? '')
  //     .trim()
  //     .toLowerCase();
  //   const filtered = records.filter((record) => {
  //     if (
  //       vanId &&
  //       (hasVanScopedRecords
  //         ? String(record.vanId) !== String(vanId)
  //         : record.vanId && String(record.vanId) !== String(vanId))
  //     )
  //       return false;
  //     const product = productById.get(String(record.productId));
  //     if (!search) return true;
  //     return [
  //       record.name,
  //       record.productName,
  //       product?.name,
  //       product?.productName,
  //       record.productId,
  //       record.productSysCode,
  //     ].some((value) =>
  //       String(value ?? '')
  //         .toLowerCase()
  //         .includes(search),
  //     );
  //   });
  //   const products = filtered.map((record) => {
  //     const product = productById.get(String(record.productId));
  //     const quantity = Number(record.quantity) || 0;
  //     const unitQtyInCase = Math.max(
  //       Number(record.unitQtyInCase ?? product?.unitQtyInCase) || 1,
  //       1,
  //     );
  //     return {
  //       ...product,
  //       ...record,
  //       name:
  //         record.name ||
  //         record.productName ||
  //         product?.name ||
  //         product?.productName ||
  //         record.productId,
  //       productName:
  //         record.productName || product?.productName || product?.name || record.productId,
  //       unitQtyInCase,
  //       cases: record.cases ?? Math.floor(quantity / unitQtyInCase),
  //       pieces: record.pieces ?? quantity % unitQtyInCase,
  //       price: Number(record.price ?? record.casePrice) || 0,
  //       netWeight: Number(record.netWeight ?? record.pieceNetWeight) || 0,
  //     };
  //   });
  //   const page = Math.max(Number(params?.page) || 1, 1);
  //   const limit = Math.max(Number(params?.limit) || 20, 1);
  //   const pageProducts = products.slice((page - 1) * limit, page * limit);

  //   return {
  //     success: true,
  //     statusCode: 200,
  //     data: {
  //       products: pageProducts,
  //       total: products.length,
  //       totalCases: products.reduce((sum, item) => sum + Number(item.cases || 0), 0),
  //       totalPieces: products.reduce((sum, item) => sum + Number(item.pieces || 0), 0),
  //       totalValue: products.reduce(
  //         (sum, item) => sum + Number(item.cases || 0) * Number(item.price || 0),
  //         0,
  //       ),
  //       totalNetWeight: products.reduce(
  //         (sum, item) =>
  //           sum +
  //           (Number(item.cases || 0) * Number(item.unitQtyInCase || 1) + Number(item.pieces || 0)) *
  //             Number(item.netWeight || 0),
  //         0,
  //       ),
  //       page,
  //       limit,
  //     },
  //     offline: true,
  //   } as ApiResponse<any>;
  // },
  // fetchVanStocks: async (vanId: string | undefined, params) => {
  //   const user = useAuthStore.getState().user;

  //   /**
  //    * ONLINE MODE
  //    */
  //   if (!isSalesman(user) || !isOfflineMode()) {
  //     return api.get<any>(`/van-inventory/van/${vanId}`, { params });
  //   }

  //   /**
  //    * OFFLINE MODE
  //    *
  //    * Best practice:
  //    * - stock = downloaded/server snapshot
  //    * - vanDailyStock = live offline stock for current work session/day
  //    * - product list should show vanDailyStock.closingQty
  //    */
  //   const ownerId = user?.userId ?? '';

  //   const workSessionId = useAuthStore.getState().workSessionId || params?.workSessionId || '';

  //   if (!ownerId) {
  //     throw new Error('User is required for offline stock');
  //   }

  //   if (!vanId) {
  //     throw new Error('Van is required for offline stock');
  //   }

  //   const loadAll = async (repository: any) => {
  //     const records: Record<string, any>[] = [];

  //     for (let page = 1; ; page += 1) {
  //       const batch = await repository.findAll(ownerId, {
  //         page,
  //         limit: 200,
  //       });

  //       records.push(...batch);

  //       if (batch.length < 200) return records;
  //     }
  //   };

  //   const [dailyStockRecords, productRecords, fallbackStockRecords] = await Promise.all([
  //     loadAll(repositories.vanDailyStock),
  //     loadAll(repositories.products),

  //     /**
  //      * Fallback only.
  //      * Use this when Day Start has not initialized vanDailyStock yet.
  //      */
  //     loadAll(repositories.stock),
  //   ]);

  //   const productById = new Map(
  //     productRecords.map((product) => [String(product.productId), product]),
  //   );

  //   const search = String(params?.searchText ?? '')
  //     .trim()
  //     .toLowerCase();

  //   /**
  //    * ======================================================
  //    * GET LIVE STOCK FROM VAN DAILY STOCK
  //    * ======================================================
  //    */
  //   let liveStockRecords = dailyStockRecords.filter((record) => {
  //     if (String(record.vanId || '') !== String(vanId)) return false;

  //     /**
  //      * Prefer current work session.
  //      */
  //     if (workSessionId && String(record.workSessionId || '') !== String(workSessionId)) {
  //       return false;
  //     }

  //     /**
  //      * Fallback to today if workSessionId is not available.
  //      */
  //     if (!workSessionId && !isToday(record.date)) return false;

  //     return record.isDeleted !== true && !record.deletedAt;
  //   });

  //   /**
  //    * If no current work session stock found, fallback to today's stock.
  //    * This helps when workSessionId was not restored after app restart.
  //    */
  //   if (!liveStockRecords.length) {
  //     liveStockRecords = dailyStockRecords.filter(
  //       (record) =>
  //         String(record.vanId || '') === String(vanId) &&
  //         isToday(record.date) &&
  //         record.isDeleted !== true &&
  //         !record.deletedAt,
  //     );
  //   }

  //   /**
  //    * If Day Start has not created vanDailyStock yet,
  //    * fallback to downloaded stock snapshot.
  //    *
  //    * This should be only fallback, not main live stock source.
  //    */
  //   const shouldUseFallbackStock = liveStockRecords.length === 0;

  //   const sourceRecords = shouldUseFallbackStock
  //     ? fallbackStockRecords.filter((record) => {
  //         if (String(record.vanId || '') !== String(vanId)) return false;
  //         if (record.isDeleted === true || record.deletedAt) return false;
  //         return true;
  //       })
  //     : liveStockRecords;

  //   const filtered = sourceRecords.filter((record) => {
  //     const product = productById.get(String(record.productId));

  //     if (!search) return true;

  //     return [
  //       record.name,
  //       record.productName,
  //       product?.name,
  //       product?.productName,
  //       record.productId,
  //       record.productSysCode,
  //     ].some((value) =>
  //       String(value ?? '')
  //         .toLowerCase()
  //         .includes(search),
  //     );
  //   });

  //   const products = filtered.map((record) => {
  //     const product = productById.get(String(record.productId));

  //     const unitQtyInCase = Math.max(
  //       Number(record.unitQtyInCase ?? product?.unitQtyInCase) || 1,
  //       1,
  //     );

  //     /**
  //      * Main difference:
  //      * live offline quantity comes from vanDailyStock.closingQty.
  //      * fallback stock quantity comes from stock.quantity.
  //      */
  //     const quantity = shouldUseFallbackStock
  //       ? Number(record.quantity) || 0
  //       : Number(record.closingQty) || 0;

  //     const openingQty = shouldUseFallbackStock
  //       ? Number(record.quantity) || 0
  //       : Number(record.openingQty) || 0;

  //     const outQty = shouldUseFallbackStock ? 0 : Number(record.outQty) || 0;
  //     const inQty = shouldUseFallbackStock ? 0 : Number(record.inQty) || 0;
  //     const adjustmentQty = shouldUseFallbackStock ? 0 : Number(record.adjustmentQty) || 0;

  //     const cases = Math.floor(quantity / unitQtyInCase);
  //     const pieces = quantity % unitQtyInCase;

  //     const piecePrice = Number(record.piecePrice ?? product?.piecePrice) || 0;

  //     const casePrice =
  //       Number(record.casePrice ?? product?.casePrice) || piecePrice * unitQtyInCase;

  //     const pieceNetWeight = Number(record.pieceNetWeight ?? product?.pieceNetWeight) || 0;

  //     const caseNetWeight =
  //       Number(record.caseNetWeight ?? product?.caseNetWeight) || pieceNetWeight * unitQtyInCase;

  //     return {
  //       ...product,
  //       ...record,

  //       name:
  //         record.name ||
  //         record.productName ||
  //         product?.name ||
  //         product?.productName ||
  //         record.productId,

  //       productName:
  //         record.productName || product?.productName || product?.name || record.productId,

  //       unitQtyInCase,

  //       /**
  //        * UI fields
  //        */
  //       quantity,
  //       availableQty: quantity,
  //       openingQty,
  //       inQty,
  //       outQty,
  //       adjustmentQty,
  //       closingQty: quantity,

  //       cases,
  //       pieces,

  //       /**
  //        * Pricing/weight fields
  //        */
  //       piecePrice,
  //       casePrice,
  //       price: casePrice,

  //       pieceNetWeight,
  //       caseNetWeight,
  //       netWeight: pieceNetWeight,

  //       /**
  //        * Helpful flag for UI/debugging
  //        */
  //       stockSource: shouldUseFallbackStock ? 'stock' : 'vanDailyStock',
  //     };
  //   });

  //   const page = Math.max(Number(params?.page) || 1, 1);
  //   const limit = Math.max(Number(params?.limit) || 20, 1);

  //   const pageProducts = products.slice((page - 1) * limit, page * limit);

  //   const totalQty = products.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  //   const totalCases = products.reduce((sum, item) => sum + Number(item.cases || 0), 0);

  //   const totalPieces = products.reduce((sum, item) => sum + Number(item.pieces || 0), 0);

  //   const totalValue = products.reduce(
  //     (sum, item) =>
  //       sum +
  //       Number(item.cases || 0) * Number(item.casePrice || item.price || 0) +
  //       Number(item.pieces || 0) * Number(item.piecePrice || 0),
  //     0,
  //   );

  //   const totalNetWeight = products.reduce(
  //     (sum, item) => sum + Number(item.quantity || 0) * Number(item.pieceNetWeight || 0),
  //     0,
  //   );

  //   return {
  //     success: true,
  //     statusCode: 200,
  //     data: {
  //       products: pageProducts,
  //       total: products.length,

  //       totalQty,
  //       totalCases,
  //       totalPieces,
  //       totalValue,
  //       totalNetWeight,

  //       page,
  //       limit,

  //       offline: true,
  //       stockSource: shouldUseFallbackStock ? 'stock' : 'vanDailyStock',
  //     },
  //     offline: true,
  //   } as ApiResponse<any>;
  // },
  fetchVanStocks: async (vanId: string | undefined, params) => {
    const user = useAuthStore.getState().user;

    /**
     * ONLINE MODE
     */
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<any>(`/van-inventory/van/${vanId}`, { params });
    }

    /**
     * OFFLINE MODE
     *
     * stock = downloaded/server snapshot
     * vanDailyStock = live stock for ONE work session
     */
    const ownerId = user?.userId ?? '';

    if (!ownerId) {
      throw new Error('User is required for offline stock');
    }

    if (!vanId) {
      throw new Error('Van is required for offline stock');
    }

    const loadAll = async (repository: any) => {
      const records: Record<string, any>[] = [];

      for (let page = 1; ; page += 1) {
        const batch = await repository.findAll(ownerId, {
          page,
          limit: 200,
        });

        records.push(...batch);

        if (batch.length < 200) return records;
      }
    };

    const toTime = (value: unknown) => {
      const time = value ? new Date(String(value)).getTime() : 0;
      return Number.isFinite(time) ? time : 0;
    };

    const isActiveStatus = (value: unknown) => String(value ?? '').toUpperCase() === 'ACTIVE';

    /**
     * Same calendar-day check only used as fallback.
     */
    const isTodaySafe = (value: unknown) => {
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

    const [dailyStockRecords, productRecords, fallbackStockRecords, attendanceRecords] =
      await Promise.all([
        loadAll(repositories.vanDailyStock),
        loadAll(repositories.products),

        /**
         * Fallback only.
         * Use this when Day Start has not initialized vanDailyStock yet.
         */
        loadAll(repositories.stock),

        /**
         * Needed to restore current workSessionId if Zustand store lost it
         * after app restart.
         */
        loadAll(repositories.attendance),
      ]);

    const productById = new Map(
      productRecords.map((product) => [String(product.productId), product]),
    );

    const search = String(params?.searchText ?? '')
      .trim()
      .toLowerCase();

    /**
     * ======================================================
     * RESOLVE CURRENT WORK SESSION
     *
     * Priority:
     * 1. params.workSessionId
     * 2. authStore.workSessionId
     * 3. ACTIVE attendance for this van
     * 4. latest today vanDailyStock workSessionId
     * ======================================================
     */
    let resolvedWorkSessionId = String(
      params?.workSessionId || useAuthStore.getState().workSessionId || '',
    );

    if (!resolvedWorkSessionId) {
      const activeSession = attendanceRecords
        .filter(
          (record) =>
            String(record.vanId || '') === String(vanId) &&
            String(record.userId || record.ownerId || ownerId) === String(ownerId) &&
            isActiveStatus(record.status) &&
            record.isDeleted !== true &&
            !record.deletedAt,
        )
        .sort(
          (a, b) =>
            toTime(b.dayStartTime || b.startTime || b.createdAt) -
            toTime(a.dayStartTime || a.startTime || a.createdAt),
        )[0];

      resolvedWorkSessionId = String(activeSession?.workSessionId || activeSession?.uuid || '');
    }

    /**
     * If auth store lost workSessionId and attendance is not found,
     * do NOT use all today's daily stock.
     * Pick latest one session only.
     */
    if (!resolvedWorkSessionId) {
      const latestDailyStock = dailyStockRecords
        .filter(
          (record) =>
            String(record.vanId || '') === String(vanId) &&
            isTodaySafe(record.date || record.createdAt) &&
            record.workSessionId &&
            record.isDeleted !== true &&
            !record.deletedAt,
        )
        .sort(
          (a, b) =>
            toTime(b.updatedAt || b.createdAt || b.date) -
            toTime(a.updatedAt || a.createdAt || a.date),
        )[0];

      resolvedWorkSessionId = String(latestDailyStock?.workSessionId || '');
    }

    /**
     * Save restored workSessionId back to store.
     */
    if (resolvedWorkSessionId && !useAuthStore.getState().workSessionId) {
      useAuthStore.getState().setWorkSessionId(resolvedWorkSessionId);
    }

    /**
     * ======================================================
     * GET LIVE STOCK FROM ONE WORK SESSION ONLY
     * ======================================================
     */
    let liveStockRecords = resolvedWorkSessionId
      ? dailyStockRecords.filter(
          (record) =>
            String(record.vanId || '') === String(vanId) &&
            String(record.workSessionId || '') === String(resolvedWorkSessionId) &&
            record.isDeleted !== true &&
            !record.deletedAt,
        )
      : [];

    /**
     * Deduplicate by productId.
     * This protects UI if duplicate local rows exist for same product/session.
     */
    const dailyStockByProduct = new Map<string, any>();

    for (const record of liveStockRecords) {
      const productId = String(record.productId || '');

      if (!productId) continue;

      const existing = dailyStockByProduct.get(productId);

      if (
        !existing ||
        toTime(record.updatedAt || record.createdAt || record.date) >
          toTime(existing.updatedAt || existing.createdAt || existing.date)
      ) {
        dailyStockByProduct.set(productId, record);
      }
    }

    liveStockRecords = Array.from(dailyStockByProduct.values());

    /**
     * If Day Start has not created vanDailyStock yet,
     * fallback to downloaded stock snapshot.
     */
    const shouldUseFallbackStock = liveStockRecords.length === 0;

    const sourceRecords = shouldUseFallbackStock
      ? fallbackStockRecords.filter((record) => {
          if (String(record.vanId || '') !== String(vanId)) return false;
          if (record.isDeleted === true || record.deletedAt) return false;
          return true;
        })
      : liveStockRecords;

    /**
     * Deduplicate fallback stock also.
     * Because inventories may currently have duplicate vanId + productId rows.
     */
    const sourceByProduct = new Map<string, any>();

    for (const record of sourceRecords) {
      const productId = String(record.productId || '');

      if (!productId) continue;

      const existing = sourceByProduct.get(productId);

      if (
        !existing ||
        toTime(record.updatedAt || record.createdAt) >
          toTime(existing.updatedAt || existing.createdAt)
      ) {
        sourceByProduct.set(productId, record);
      }
    }

    const uniqueSourceRecords = Array.from(sourceByProduct.values());

    const filtered = uniqueSourceRecords.filter((record) => {
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

      const unitQtyInCase = Math.max(
        Number(record.unitQtyInCase ?? product?.unitQtyInCase) || 1,
        1,
      );

      /**
       * live offline quantity comes from vanDailyStock.closingQty.
       * fallback stock quantity comes from stock.quantity.
       */
      const quantity = shouldUseFallbackStock
        ? Number(record.quantity) || 0
        : Number(record.closingQty) || 0;

      const openingQty = shouldUseFallbackStock
        ? Number(record.quantity) || 0
        : Number(record.openingQty) || 0;

      const outQty = shouldUseFallbackStock ? 0 : Number(record.outQty) || 0;
      const inQty = shouldUseFallbackStock ? 0 : Number(record.inQty) || 0;
      const adjustmentQty = shouldUseFallbackStock ? 0 : Number(record.adjustmentQty) || 0;

      const cases = Math.floor(quantity / unitQtyInCase);
      const pieces = quantity % unitQtyInCase;

      const piecePrice = Number(record.piecePrice ?? product?.piecePrice) || 0;

      const casePrice =
        Number(record.casePrice ?? product?.casePrice) || piecePrice * unitQtyInCase;

      const pieceNetWeight = Number(record.pieceNetWeight ?? product?.pieceNetWeight) || 0;

      const caseNetWeight =
        Number(record.caseNetWeight ?? product?.caseNetWeight) || pieceNetWeight * unitQtyInCase;

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

        /**
         * UI fields
         */
        quantity,
        availableQty: quantity,
        openingQty,
        inQty,
        outQty,
        adjustmentQty,
        closingQty: quantity,

        cases,
        pieces,

        /**
         * Pricing/weight fields
         */
        piecePrice,
        casePrice,
        price: casePrice,

        pieceNetWeight,
        caseNetWeight,
        netWeight: pieceNetWeight,

        /**
         * Debug fields
         */
        workSessionId: resolvedWorkSessionId || record.workSessionId,
        stockSource: shouldUseFallbackStock ? 'stock' : 'vanDailyStock',
      };
    });

    const page = Math.max(Number(params?.page) || 1, 1);
    const limit = Math.max(Number(params?.limit) || 20, 1);

    const pageProducts = products.slice((page - 1) * limit, page * limit);

    const totalQty = products.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    const totalCases = products.reduce((sum, item) => sum + Number(item.cases || 0), 0);

    const totalPieces = products.reduce((sum, item) => sum + Number(item.pieces || 0), 0);

    const totalValue = products.reduce(
      (sum, item) =>
        sum +
        Number(item.cases || 0) * Number(item.casePrice || item.price || 0) +
        Number(item.pieces || 0) * Number(item.piecePrice || 0),
      0,
    );

    const totalNetWeight = products.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.pieceNetWeight || 0),
      0,
    );

    return {
      success: true,
      statusCode: 200,
      data: {
        products: pageProducts,
        total: products.length,

        totalQty,
        totalCases,
        totalPieces,
        totalValue,
        totalNetWeight,

        page,
        limit,

        offline: true,

        /**
         * Debug
         */
        workSessionId: resolvedWorkSessionId,
        stockSource: shouldUseFallbackStock ? 'stock' : 'vanDailyStock',
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
