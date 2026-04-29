import { api } from '@/core/network';
import type { ApiResponse } from '@/core/network/api.types';

/* ================= TYPES ================= */

export interface FetchCategoryParams {
  limit: number;
  page: number;
  searchText?: string;
}

export interface Category {
  categoryId: string;
  name: string;
}

export interface CategoryListResponse {
  data: Category[];
  total: number;
}

/* ================= SERVICE ================= */

export interface CategoryService {
  fetchCategory: (params: FetchCategoryParams) => Promise<ApiResponse<any>>;
}

/**
 * Thin service layer (only API calls)
 */
export const categoryService: CategoryService = {
  fetchCategory: (params: FetchCategoryParams) =>
    api.get<any>('/product-category', {
      params,
    }) as Promise<ApiResponse<any>>,
};
