import type { ApiResponse } from '@/core/network/api.types';
import { api } from '@/core/network';
import { isSalesman } from '@/core/navigation/role.utils';
import { isOfflineMode } from '@/core/offline/offline.store';
import { useAuthStore } from '@/core/store/auth.store';
import { repositories } from '@/repositories';

/* ================= TYPES ================= */

export interface FetchCategoryParams {
  limit: number;
  page: number;
  searchText?: string;
  type?: 'PARENT' | 'CHILD';
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface Category {
  categoryId: string;
  name: string;
  type: 'PARENT' | 'CHILD';
  parentId?: string;
  status?: 'ACTIVE' | 'INACTIVE';
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
  fetchCategory: async (params: FetchCategoryParams) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<any>('/product-category', { params });
    }
    const ownerId = user?.userId ?? '';
    const categories = await repositories.categories.findAll(ownerId, {
      search: params.searchText,
      page: params.page,
      limit: params.limit,
    });
    const data = categories.filter(
      (category) =>
        (!params.type || category.type === params.type) &&
        (!params.status || category.status === params.status),
    );
    return {
      success: true,
      statusCode: 200,
      data,
      meta: { total: data.length, page: params.page, limit: params.limit },
    } as ApiResponse<any>;
  },
};
