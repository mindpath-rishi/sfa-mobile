import { api } from '@/core/network';
import type { ApiResponse } from '@/core/network/api.types';
import { isSalesman } from '@/core/navigation/role.utils';
import { isOfflineMode } from '@/core/offline/offline.store';
import { useAuthStore } from '@/core/store/auth.store';
import { repositories } from '@/repositories';
import { createUuid } from '@/utils/uuid';

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
    if (!isSalesman(user) || !isOfflineMode()) return api.post<any>('/sales', calculatedPayload);
    // Match the backend IdGenerator.generate('OR', 6) format exactly.
    const saleId = `OR-${createUuid().replace(/-/g, '').slice(0, 6).toUpperCase()}`;
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
    const record = await repositories.collections.create(user?.userId ?? '', {
      ...payload,
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
