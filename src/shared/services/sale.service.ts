import { api } from '@/core/network';
import type { ApiResponse } from '@/core/network/api.types';
import { isSalesman } from '@/core/navigation/role.utils';
import { isOfflineMode } from '@/core/offline/offline.store';
import { useAuthStore } from '@/core/store/auth.store';
import { repositories } from '@/repositories';
import { createSchemaId } from '@/utils/uuid';

/* ======================================================
 * TYPES
 * ====================================================== */

export interface CreateSalePayload {
  vanId: string;
  vanName?: string;
  compCode?: string;
  categoryId?: string;
  parentCategoryId?: string;
  customerId?: string;
  customerName?: string;
  date: Date;
  totalCases: number;
  netCases?: number;
  totalPieces: number;
  totalQty: number;
  totalWeight: number;
  totalValue: number;
  type: 'CASH' | 'CREDIT';
  paymentMode: string;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus?: 'PAID' | 'UNPAID' | 'PARTIAL';
  remark?: string;
  items: Array<{
    productId: string;
    productName?: string;
    compCode?: string;
    categoryId?: string;
    parentCategoryId?: string;
    customerCategoryId: string;
    caseQty: number;
    pieceQty: number;
    quantity: number;
    casePrice: number;
    piecePrice: number;
    caseNetWeight?: number;
    pieceNetWeight?: number;
    totalNetWeight: number;
    totalValue: number;
    unitQtyInCase: number;
    netCases?: number;
  }>;
}

const toFixed4 = (value: number) => Number((Number(value) || 0).toFixed(4));

const loadAllLocalRecords = async (repository: typeof repositories.stock, ownerId: string) => {
  const records: Record<string, any>[] = [];
  const limit = 200;
  for (let page = 1; ; page += 1) {
    const batch = await repository.findAll(ownerId, { page, limit });
    records.push(...batch);
    if (batch.length < limit) return records;
  }
};

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

/** Keep offline records consistent with the calculations applied by SaleService.create. */
const calculateSalePayload = (payload: CreateSalePayload): CreateSalePayload => {
  const items = payload.items.map((item) => {
    const caseQty = Number(item.caseQty) || 0;
    const pieceQty = Number(item.pieceQty) || 0;
    const unitQtyInCase = Number(item.unitQtyInCase) || 1;
    const casePrice = Number(item.casePrice) || 0;
    const piecePrice = Number(item.piecePrice ?? casePrice / unitQtyInCase) || 0;
    const pieceNetWeight = Number(item.pieceNetWeight) || 0;
    const quantity = caseQty * unitQtyInCase + pieceQty;

    return {
      ...item,
      caseQty,
      pieceQty,
      unitQtyInCase,
      casePrice: toFixed4(casePrice),
      piecePrice: toFixed4(piecePrice),
      quantity,
      netCases: toFixed4(quantity / unitQtyInCase),
      totalNetWeight: toFixed4(quantity * pieceNetWeight),
      totalValue: toFixed4(caseQty * casePrice + pieceQty * piecePrice),
    };
  });

  const totalValue = toFixed4(items.reduce((sum, item) => sum + item.totalValue, 0));
  const paidAmount = toFixed4(Number(payload.paidAmount) || 0);
  const pendingAmount = toFixed4(totalValue - paidAmount);

  return {
    ...payload,
    items,
    totalCases: items.reduce((sum, item) => sum + item.caseQty, 0),
    totalPieces: items.reduce((sum, item) => sum + item.pieceQty, 0),
    totalQty: items.reduce((sum, item) => sum + item.quantity, 0),
    totalWeight: toFixed4(items.reduce((sum, item) => sum + item.totalNetWeight, 0)),
    totalValue,
    netCases: toFixed4(items.reduce((sum, item) => sum + (item.netCases ?? 0), 0)),
    paidAmount,
    pendingAmount,
    paymentStatus: pendingAmount <= 0 ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'UNPAID',
  };
};

// netCases is a local reporting value. The create-sale endpoint derives it from
// quantity and unitQtyInCase and rejects it when strict DTO validation is enabled.
const toOnlineSalePayload = (payload: CreateSalePayload) => {
  const { netCases: _netCases, ...sale } = payload;
  return {
    ...sale,
    items: payload.items.map(({ netCases: _itemNetCases, ...item }) => item),
  };
};

export interface FetchSaleQuery {
  page?: number;
  limit?: number;
  searchText?: number;
  vanId?: string;
  customerId?: string;
  employeeId?: string;
}

/* ======================================================
 * SERVICE
 * ====================================================== */

export interface SaleService {
  createSale: (
    payload: CreateSalePayload,
    options: { showLoader: boolean },
  ) => Promise<ApiResponse<any>>;
  fetchSales: (params: FetchSaleQuery) => Promise<ApiResponse<any>>;
  fetchPayments: (params: FetchSaleQuery) => Promise<ApiResponse<any>>;
  createPayment: (payload: any) => Promise<ApiResponse<any>>;
  getCategoryWiseSales: (params: any) => Promise<ApiResponse<any>>;
  getCategoryWiseSalesDetail: (params: any) => Promise<ApiResponse<any>>;
}

/**
 * Thin service layer (only API calls)
 */
export const saleService: SaleService = {
  // createSale: async (payload: CreateSalePayload, { showLoader }: { showLoader: boolean }) => {
  //   const calculatedPayload = calculateSalePayload(payload);
  //   const user = useAuthStore.getState().user;
  //   if (!isSalesman(user) || !isOfflineMode())
  //     return api.post<any>(
  //       '/sales',
  //       toOnlineSalePayload(calculatedPayload),
  //       showLoader ? { showLoader } : undefined,
  //     );
  //   const ownerId = user?.userId ?? '';
  //   const [stockRecords, dailyStockRecords] = await Promise.all([
  //     loadAllLocalRecords(repositories.stock, ownerId),
  //     loadAllLocalRecords(repositories.vanDailyStock, ownerId),
  //   ]);
  //   const stockUpdates = calculatedPayload.items.map((item) => {
  //     const stock = stockRecords.find(
  //       (record) =>
  //         String(record.productId) === String(item.productId) &&
  //         (!record.vanId || String(record.vanId) === String(calculatedPayload.vanId)),
  //     );
  //     if (!stock)
  //       throw new Error(`Offline stock not found for ${item.productName || item.productId}`);

  //     const available = Number(stock.quantity) || 0;
  //     if (available < item.quantity) {
  //       throw new Error(
  //         `Insufficient stock for ${item.productName || item.productId}. Available: ${available}, required: ${item.quantity}`,
  //       );
  //     }

  //     const remaining = available - item.quantity;
  //     const unitQtyInCase = Math.max(Number(item.unitQtyInCase) || 1, 1);
  //     return {
  //       stock,
  //       changes: {
  //         quantity: remaining,
  //         cases: Math.floor(remaining / unitQtyInCase),
  //         pieces: remaining % unitQtyInCase,
  //       },
  //       dailyStock: dailyStockRecords.find(
  //         (record) =>
  //           String(record.productId) === String(item.productId) &&
  //           (!record.vanId || String(record.vanId) === String(calculatedPayload.vanId)) &&
  //           isToday(record.date),
  //       ),
  //       soldQuantity: item.quantity,
  //     };
  //   });
  //   // Match the backend SID followed by an 8-digit number.
  //   const saleId = createSchemaId('Sale');
  //   const order = await repositories.orders.create(user?.userId ?? '', {
  //     ...calculatedPayload,
  //     uuid: saleId,
  //     saleId,
  //     employees: [{ employeeId: user?.userId, employeeName: user?.name, role: user?.role }],
  //   } as unknown as Record<string, unknown>);
  //   // Expo SQLite uses one connection here. Starting multiple repository
  //   // transactions with Promise.all causes intermittent "transaction within a
  //   // transaction" failures in offline mode, so persist line items in order.
  //   for (const item of calculatedPayload.items) {
  //     await repositories.orderItems.create(user?.userId ?? '', {
  //       ...item,
  //       saleId: order.uuid,
  //     });
  //     const transactionId = createSchemaId('InventoryTransaction');
  //     await repositories.inventoryTransactions.create(user?.userId ?? '', {
  //       uuid: transactionId,
  //       transactionId,
  //       productId: item.productId,
  //       vanId: calculatedPayload.vanId,
  //       employeeId: user?.userId,
  //       transactionType: 'SALE',
  //       direction: 'OUT',
  //       quantity: item.quantity,
  //       cases: item.caseQty,
  //       pieces: item.pieceQty,
  //       referenceNo: saleId,
  //       remark: 'Stock deducted from offline sale',
  //       transactionDate: calculatedPayload.date,
  //       status: 'POSTED',
  //     });
  //   }
  //   for (const update of stockUpdates) {
  //     await repositories.stock.updateLocal(ownerId, update.stock.uuid, update.changes);
  //     if (update.dailyStock) {
  //       await repositories.vanDailyStock.updateLocal(ownerId, update.dailyStock.uuid, {
  //         outQty: (Number(update.dailyStock.outQty) || 0) + update.soldQuantity,
  //         closingQty: Math.max(
  //           0,
  //           (Number(update.dailyStock.closingQty) || 0) - update.soldQuantity,
  //         ),
  //       });
  //     }
  //   }
  //   return {
  //     success: true,
  //     statusCode: 202,
  //     message: 'Order saved locally',
  //     data: { saleId: order.uuid, uuid: order.uuid },
  //   } as ApiResponse<any>;
  // },

  //   createSale: async (
  //   payload: CreateSalePayload,
  //   { showLoader }: { showLoader: boolean },
  // ) => {
  //   const calculatedPayload = calculateSalePayload(payload);
  //   const user = useAuthStore.getState().user;

  //   /**
  //    * ======================================================
  //    * ONLINE MODE
  //    * ======================================================
  //    */
  //   if (!isSalesman(user) || !isOfflineMode()) {
  //     return api.post<any>(
  //       '/sales',
  //       toOnlineSalePayload(calculatedPayload),
  //       showLoader ? { showLoader } : undefined,
  //     );
  //   }

  //   /**
  //    * ======================================================
  //    * OFFLINE MODE
  //    *
  //    * Best practice:
  //    * - stock table is downloaded/server snapshot
  //    * - vanDailyStock is offline live stock
  //    * - inventoryTransactions is sync ledger for server stock deduction
  //    * ======================================================
  //    */
  //   const ownerId = user?.userId ?? '';
  //   const employeeId = user?.userId ?? '';
  //   const vanId = calculatedPayload.vanId;
  //   const saleDate = calculatedPayload.date || new Date().toISOString();

  //   const workSessionId =
  //     calculatedPayload.workSessionId ||
  //     useAuthStore.getState().workSessionId ||
  //     '';

  //   if (!ownerId) {
  //     throw new Error('User is required for offline sale');
  //   }

  //   if (!vanId) {
  //     throw new Error('Van is required for offline sale');
  //   }

  //   if (!workSessionId) {
  //     throw new Error('Work session is required. Please start your day first.');
  //   }

  //   const toNumber = (value: unknown, fallback = 0) => {
  //     const num = Number(value);

  //     return Number.isFinite(num) ? num : fallback;
  //   };

  //   const getSoldQuantity = (item: any) => {
  //     const quantity = toNumber(item.quantity);

  //     if (quantity > 0) return quantity;

  //     const caseQty = toNumber(item.caseQty);
  //     const pieceQty = toNumber(item.pieceQty);
  //     const unitQtyInCase = Math.max(toNumber(item.unitQtyInCase, 1), 1);

  //     return caseQty * unitQtyInCase + pieceQty;
  //   };

  //   /**
  //    * ======================================================
  //    * LOAD LOCAL LIVE STOCK
  //    * ======================================================
  //    */
  //   const dailyStockRecords = await loadAllLocalRecords(
  //     repositories.vanDailyStock,
  //     ownerId,
  //   );

  //   /**
  //    * ======================================================
  //    * GROUP SALE ITEMS PRODUCT-WISE
  //    *
  //    * Important:
  //    * If same product appears multiple times, stock should be checked
  //    * against total sold quantity, not item-by-item.
  //    * ======================================================
  //    */
  //   const productSalesMap = new Map<
  //     string,
  //     {
  //       productId: string;
  //       productName?: string;
  //       soldQuantity: number;
  //       caseQty: number;
  //       pieceQty: number;
  //       unitQtyInCase: number;
  //     }
  //   >();

  //   for (const item of calculatedPayload.items) {
  //     const productId = String(item.productId || '');

  //     if (!productId) {
  //       throw new Error('Product id is required');
  //     }

  //     const soldQuantity = getSoldQuantity(item);

  //     if (soldQuantity <= 0) {
  //       continue;
  //     }

  //     const caseQty = toNumber(item.caseQty);
  //     const pieceQty = toNumber(item.pieceQty);
  //     const unitQtyInCase = Math.max(toNumber(item.unitQtyInCase, 1), 1);

  //     const existing = productSalesMap.get(productId);

  //     if (existing) {
  //       existing.soldQuantity += soldQuantity;
  //       existing.caseQty += caseQty;
  //       existing.pieceQty += pieceQty;
  //     } else {
  //       productSalesMap.set(productId, {
  //         productId,
  //         productName: item.productName,
  //         soldQuantity,
  //         caseQty,
  //         pieceQty,
  //         unitQtyInCase,
  //       });
  //     }
  //   }

  //   /**
  //    * ======================================================
  //    * VALIDATE STOCK AGAINST VAN DAILY STOCK
  //    * ======================================================
  //    */
  //   const stockUpdates = Array.from(productSalesMap.values()).map((saleItem) => {
  //     const dailyStock = dailyStockRecords.find(
  //       (record: any) =>
  //         String(record.productId || '') === String(saleItem.productId) &&
  //         String(record.vanId || '') === String(vanId) &&
  //         String(record.workSessionId || '') === String(workSessionId) &&
  //         isToday(record.date),
  //     );

  //     if (!dailyStock) {
  //       throw new Error(
  //         `Offline stock not initialized for ${
  //           saleItem.productName || saleItem.productId
  //         }. Please start day again or sync stock.`,
  //       );
  //     }

  //     const available = toNumber(dailyStock.closingQty);

  //     if (available < saleItem.soldQuantity) {
  //       throw new Error(
  //         `Insufficient stock for ${
  //           saleItem.productName || saleItem.productId
  //         }. Available: ${available}, required: ${saleItem.soldQuantity}`,
  //       );
  //     }

  //     return {
  //       dailyStock,
  //       productId: saleItem.productId,
  //       soldQuantity: saleItem.soldQuantity,
  //       caseQty: saleItem.caseQty,
  //       pieceQty: saleItem.pieceQty,
  //       remainingQty: available - saleItem.soldQuantity,
  //     };
  //   });

  //   /**
  //    * ======================================================
  //    * CREATE SALE
  //    * ======================================================
  //    */
  //   const saleId = createSchemaId('Sale');

  //   const order = await repositories.orders.create(ownerId, {
  //     ...calculatedPayload,

  //     uuid: saleId,
  //     saleId,
  //     workSessionId,

  //     employees: [
  //       {
  //         employeeId: user?.userId,
  //         employeeName: user?.name,
  //         role: user?.role,
  //       },
  //     ],
  //   } as unknown as Record<string, unknown>);

  //   /**
  //    * ======================================================
  //    * CREATE SALE ITEMS + INVENTORY TRANSACTIONS
  //    *
  //    * Keep sequential because Expo SQLite can fail when Promise.all starts
  //    * multiple repository transactions on one connection.
  //    * ======================================================
  //    */
  //   for (const item of calculatedPayload.items) {
  //     await repositories.orderItems.create(ownerId, {
  //       ...item,
  //       saleId,
  //     } as unknown as Record<string, unknown>);

  //     const soldQuantity = getSoldQuantity(item);

  //     if (soldQuantity <= 0) {
  //       continue;
  //     }

  //     const transactionId = createSchemaId('InventoryTransaction');

  //     await repositories.inventoryTransactions.create(ownerId, {
  //       uuid: transactionId,
  //       transactionId,

  //       productId: item.productId,
  //       vanId,
  //       employeeId,

  //       workSessionId,
  //       saleId,
  //       referenceNo: saleId,

  //       transactionType: 'SALE',
  //       direction: 'OUT',

  //       quantity: soldQuantity,
  //       cases: toNumber(item.caseQty),
  //       pieces: toNumber(item.pieceQty),

  //       remark: 'Stock deducted from offline sale',
  //       transactionDate: saleDate,

  //       /**
  //        * Business status is POSTED.
  //        * Sync pending state is handled by sync_queue, not this field.
  //        */
  //       status: 'POSTED',
  //     } as unknown as Record<string, unknown>);
  //   }

  //   /**
  //    * ======================================================
  //    * UPDATE LOCAL LIVE STOCK
  //    *
  //    * Use updateLocal() so it does not create a separate sync queue item.
  //    * Server stock will be reduced from inventoryTransactions during sync.
  //    * ======================================================
  //    */
  //   for (const update of stockUpdates) {
  //     await repositories.vanDailyStock.updateLocal(ownerId, update.dailyStock.uuid, {
  //       outQty: toNumber(update.dailyStock.outQty) + update.soldQuantity,
  //       closingQty: Math.max(0, update.remainingQty),
  //     } as unknown as Record<string, unknown>);
  //   }

  //   return {
  //     success: true,
  //     statusCode: 202,
  //     message: 'Order saved locally',
  //     data: {
  //       saleId,
  //       uuid: saleId,
  //     },
  //     offline: true,
  //   } as ApiResponse<any>;
  // },
  createSale: async (payload: CreateSalePayload, { showLoader }: { showLoader: boolean }) => {
    const calculatedPayload = payload;
    const user = useAuthStore.getState().user;

    /**
     * ======================================================
     * ONLINE MODE
     * ======================================================
     */
    // if (!isSalesman(user) || !isOfflineMode()) {
    //   return api.post<any>('/sales', calculatedPayload, showLoader ? { showLoader } : undefined);
    // }

    /**
     * ======================================================
     * OFFLINE MODE
     * ======================================================
     */
    const ownerId = user?.userId ?? '';
    const employeeId = user?.userId ?? '';
    const vanId = String(calculatedPayload.vanId || '');
    const saleDate = calculatedPayload.date || new Date().toISOString();

    const workSessionId = String(useAuthStore.getState().workSessionId || '');

    if (!ownerId) {
      throw new Error('User is required for offline sale');
    }

    if (!vanId) {
      throw new Error('Van is required for offline sale');
    }

    if (!workSessionId) {
      throw new Error('Work session is required. Please start your day first.');
    }

    const toNumber = (value: unknown, fallback = 0) => {
      const num = Number(value);
      return Number.isFinite(num) ? num : fallback;
    };

    const getSoldQuantity = (item: any) => {
      const quantity = toNumber(item.quantity);

      if (quantity > 0) return quantity;

      const caseQty = toNumber(item.caseQty);
      const pieceQty = toNumber(item.pieceQty);
      const unitQtyInCase = Math.max(toNumber(item.unitQtyInCase, 1), 1);

      return caseQty * unitQtyInCase + pieceQty;
    };

    /**
     * ======================================================
     * LOAD LOCAL LIVE STOCK
     * ======================================================
     */
    const dailyStockRecords = await loadAllLocalRecords(repositories.vanDailyStock, ownerId);

    /**
     * ======================================================
     * GROUP SALE ITEMS PRODUCT-WISE
     * ======================================================
     */
    const productSalesMap = new Map<
      string,
      {
        productId: string;
        productName?: string;
        soldQuantity: number;
        caseQty: number;
        pieceQty: number;
        unitQtyInCase: number;
      }
    >();

    console.log(calculatedPayload.items, '==============35====================');
    for (const item of calculatedPayload.items) {
      const productId = String(item.productId || '');

      if (!productId) {
        throw new Error('Product id is required');
      }

      const soldQuantity = getSoldQuantity(item);

      if (soldQuantity <= 0) {
        continue;
      }

      const caseQty = toNumber(item.caseQty);
      const pieceQty = toNumber(item.pieceQty);
      const unitQtyInCase = Math.max(toNumber(item.unitQtyInCase, 1), 1);

      const existing = productSalesMap.get(productId);

      if (existing) {
        existing.soldQuantity += soldQuantity;
        existing.caseQty += caseQty;
        existing.pieceQty += pieceQty;
      } else {
        productSalesMap.set(productId, {
          productId,
          productName: item.productName,
          soldQuantity,
          caseQty,
          pieceQty,
          unitQtyInCase,
        });
      }
    }

    /**
     * ======================================================
     * VALIDATE STOCK AGAINST VAN DAILY STOCK
     *
     * Important:
     * Do not use isToday(record.date) here.
     * Daily stock date can be stored as previous UTC date for IST midnight.
     * workSessionId is the safest match.
     * ======================================================
     */
    const stockUpdates = Array.from(productSalesMap.values()).map((saleItem) => {
      const dailyStock = dailyStockRecords.find(
        (record: any) =>
          String(record.productId || '') === String(saleItem.productId) &&
          String(record.vanId || '') === String(vanId) &&
          String(record.workSessionId || '') === String(workSessionId) &&
          record.isDeleted !== true &&
          !record.deletedAt,
      );

      if (!dailyStock) {
        throw new Error(
          `Offline stock not initialized for ${
            saleItem.productName || saleItem.productId
          }. Please start day again or sync stock.`,
        );
      }

      const available = toNumber(dailyStock.closingQty);

      if (available < saleItem.soldQuantity) {
        throw new Error(
          `Insufficient stock for ${
            saleItem.productName || saleItem.productId
          }. Available: ${available}, required: ${saleItem.soldQuantity}`,
        );
      }

      return {
        dailyStock,
        productId: saleItem.productId,
        soldQuantity: saleItem.soldQuantity,
        caseQty: saleItem.caseQty,
        pieceQty: saleItem.pieceQty,
        remainingQty: available - saleItem.soldQuantity,
      };
    });

    /**
     * ======================================================
     * CREATE SALE
     * ======================================================
     */
    const saleId = createSchemaId('Sale');

    const order = await repositories.orders.create(ownerId, {
      ...calculatedPayload,

      uuid: saleId,
      saleId,
      workSessionId,

      employees: [
        {
          employeeId: user?.userId,
          employeeName: user?.name,
          role: user?.role,
        },
      ],
    } as unknown as Record<string, unknown>);

    /**
     * ======================================================
     * CREATE SALE ITEMS + INVENTORY TRANSACTIONS
     * ======================================================
     */
    for (const item of calculatedPayload.items) {
      await repositories.orderItems.create(ownerId, {
        ...item,
        saleId,
      } as unknown as Record<string, unknown>);

      const soldQuantity = getSoldQuantity(item);

      if (soldQuantity <= 0) {
        continue;
      }

      const transactionId = createSchemaId('InventoryTransaction');

      await repositories.inventoryTransactions.create(ownerId, {
        uuid: transactionId,
        transactionId,

        productId: item.productId,
        vanId,
        employeeId,

        workSessionId,
        saleId,
        referenceNo: saleId,

        transactionType: 'SALE',
        direction: 'OUT',

        quantity: soldQuantity,
        cases: toNumber(item.caseQty),
        pieces: toNumber(item.pieceQty),

        remark: 'Stock deducted from offline sale',
        transactionDate: saleDate,

        /**
         * Business status is POSTED.
         * Sync pending state is handled by sync_queue.
         */
        status: 'POSTED',
      } as unknown as Record<string, unknown>);
    }

    /**
     * ======================================================
     * UPDATE LOCAL LIVE STOCK
     * ======================================================
     */
    for (const update of stockUpdates) {
      await repositories.vanDailyStock.updateLocal(ownerId, update.dailyStock.uuid, {
        outQty: toNumber(update.dailyStock.outQty) + update.soldQuantity,
        closingQty: Math.max(0, update.remainingQty),
      } as unknown as Record<string, unknown>);
    }

    return {
      success: true,
      statusCode: 202,
      message: 'Order saved locally',
      data: {
        saleId,
        uuid: saleId,
      },
      offline: true,
    } as ApiResponse<any>;
  },
  fetchSales: async (params: FetchSaleQuery) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) return api.get<any>('/sales', { params });
    const data = await repositories.orders.findAll(user?.userId ?? '', {
      page: params.page,
      limit: params.limit,
      search: params.customerId,
    });
    return {
      success: true,
      statusCode: 200,
      data,
      meta: { total: data.length, page: params.page ?? 1, limit: params.limit ?? 50 },
    } as ApiResponse<any>;
  },

  fetchPayments: async (params: FetchSaleQuery) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) return api.get<any>('/payment', { params });
    const data = await repositories.collections.findAll(user?.userId ?? '', {
      page: params.page,
      limit: params.limit,
      search: params.customerId,
    });
    return {
      success: true,
      statusCode: 200,
      data,
      meta: { total: data.length, page: params.page ?? 1, limit: params.limit ?? 50 },
    } as ApiResponse<any>;
  },

  createPayment: async (payload: any = {}) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) return api.post<any>('/payment', payload);
    const paymentId = createSchemaId('Payment');
    const record = await repositories.collections.create(user?.userId ?? '', {
      ...payload,
      uuid: paymentId,
      paymentId,
      employeeId: user?.userId,
    });
    return {
      success: true,
      statusCode: 202,
      message: 'Collection saved locally',
      data: record,
    } as ApiResponse<any>;
  },

  getCategoryWiseSales: (params: any) =>
    api.get<any>('/sales/category-wise', { params }) as Promise<ApiResponse<any>>,

  getCategoryWiseSalesDetail: (params: any) =>
    api.get<any>('/sales/category-wise/detail', { params }) as Promise<ApiResponse<any>>,
};
