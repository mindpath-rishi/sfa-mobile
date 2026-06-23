import { api } from '@/core/network';
import type { ApiResponse } from '@/core/network/api.types';

/* ================= TYPES ================= */

export interface FetchProductParams {
  limit: number;
  page: number;
  searchText?: string;
  categoryIds?: string;
  brandIds?: string;
  customerCategoryId?: string;
}

/* ================= SERVICE ================= */

export interface ProductService {
  fetchProducts: (params: FetchProductParams) => Promise<ApiResponse<any>>;
}

/**
 * Thin service layer (only API calls)
 */
export const productService: ProductService = {
  fetchProducts: (params: FetchProductParams) =>
    api.get<any>('/product', {
      params,
    }) as Promise<ApiResponse<any>>,
};
