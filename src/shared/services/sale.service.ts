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
  createSale: (payload: CreateSalePayload) => Promise<ApiResponse<any>>;
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
  createSale: async (payload: CreateSalePayload) => {
    const calculatedPayload = calculateSalePayload(payload);
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode())
      return api.post<any>('/sales', toOnlineSalePayload(calculatedPayload));
    const ownerId = user?.userId ?? '';
    const [stockRecords, dailyStockRecords] = await Promise.all([
      loadAllLocalRecords(repositories.stock, ownerId),
      loadAllLocalRecords(repositories.vanDailyStock, ownerId),
    ]);
    const stockUpdates = calculatedPayload.items.map((item) => {
      const stock = stockRecords.find(
        (record) =>
          String(record.productId) === String(item.productId) &&
          (!record.vanId || String(record.vanId) === String(calculatedPayload.vanId)),
      );
      if (!stock)
        throw new Error(`Offline stock not found for ${item.productName || item.productId}`);

      const available = Number(stock.quantity) || 0;
      if (available < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.productName || item.productId}. Available: ${available}, required: ${item.quantity}`,
        );
      }

      const remaining = available - item.quantity;
      const unitQtyInCase = Math.max(Number(item.unitQtyInCase) || 1, 1);
      return {
        stock,
        changes: {
          quantity: remaining,
          cases: Math.floor(remaining / unitQtyInCase),
          pieces: remaining % unitQtyInCase,
        },
        dailyStock: dailyStockRecords.find(
          (record) =>
            String(record.productId) === String(item.productId) &&
            (!record.vanId || String(record.vanId) === String(calculatedPayload.vanId)) &&
            isToday(record.date),
        ),
        soldQuantity: item.quantity,
      };
    });
    // Match the backend SID followed by an 8-digit number.
    const saleId = createSchemaId('Sale');
    const order = await repositories.orders.create(user?.userId ?? '', {
      ...calculatedPayload,
      uuid: saleId,
      saleId,
      employees: [{ employeeId: user?.userId, employeeName: user?.name, role: user?.role }],
    } as unknown as Record<string, unknown>);
    // Expo SQLite uses one connection here. Starting multiple repository
    // transactions with Promise.all causes intermittent "transaction within a
    // transaction" failures in offline mode, so persist line items in order.
    for (const item of calculatedPayload.items) {
      await repositories.orderItems.create(user?.userId ?? '', {
        ...item,
        saleId: order.uuid,
      });
      const transactionId = createSchemaId('InventoryTransaction');
      await repositories.inventoryTransactions.create(user?.userId ?? '', {
        uuid: transactionId,
        transactionId,
        productId: item.productId,
        vanId: calculatedPayload.vanId,
        employeeId: user?.userId,
        transactionType: 'SALE',
        direction: 'OUT',
        quantity: item.quantity,
        cases: item.caseQty,
        pieces: item.pieceQty,
        referenceNo: saleId,
        remark: 'Stock deducted from offline sale',
        transactionDate: calculatedPayload.date,
        status: 'POSTED',
      });
    }
    for (const update of stockUpdates) {
      await repositories.stock.updateLocal(ownerId, update.stock.uuid, update.changes);
      if (update.dailyStock) {
        await repositories.vanDailyStock.updateLocal(ownerId, update.dailyStock.uuid, {
          outQty: (Number(update.dailyStock.outQty) || 0) + update.soldQuantity,
          closingQty: Math.max(
            0,
            (Number(update.dailyStock.closingQty) || 0) - update.soldQuantity,
          ),
        });
      }
    }
    return {
      success: true,
      statusCode: 202,
      message: 'Order saved locally',
      data: { saleId: order.uuid, uuid: order.uuid },
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
