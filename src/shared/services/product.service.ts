import type { ApiResponse } from '@/core/network/api.types';
import { api } from '@/core/network';
import { isSalesman } from '@/core/navigation/role.utils';
import { isOfflineMode } from '@/core/offline/offline.store';
import { useAuthStore } from '@/core/store/auth.store';
import { repositories } from '@/repositories';

/* ================= TYPES ================= */

export interface FetchProductParams {
  limit: number;
  page: number;
  searchText?: string;
  categoryIds?: string;
  brandIds?: string;
  customerCategoryId: string;
}

/* ================= SERVICE ================= */

export interface ProductService {
  fetchProducts: (params: FetchProductParams) => Promise<ApiResponse<any>>;
}

const loadAll = async (
  repository: typeof repositories.products,
  ownerId: string,
  search?: string,
) => {
  const records: Record<string, any>[] = [];
  const limit = 200;
  let page = 1;

  while (true) {
    const batch = await repository.findAll(ownerId, { search, page, limit });
    records.push(...batch);
    if (batch.length < limit) return records;
    page += 1;
  }
};

/**
 * Thin service layer (only API calls)
 */
export const productService: ProductService = {
  fetchProducts: async (params: FetchProductParams) => {
    const customerCategoryId = params.customerCategoryId?.trim();
    if (!customerCategoryId) {
      throw new Error('Customer category is required to fetch products');
    }

    const requestParams = { ...params, customerCategoryId };
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<any>('/product', { params: requestParams });
    }
    const ownerId = user?.userId ?? '';
    const [allProducts, priceCandidates, stock] = await Promise.all([
      loadAll(repositories.products, ownerId),
      loadAll(repositories.priceLists, ownerId, customerCategoryId),
      loadAll(repositories.stock, ownerId),
    ]);

    const now = Date.now();
    const prices = priceCandidates
      .filter((price) => price.categoryCode === customerCategoryId)
      .filter((price) => {
        const effectiveTime = new Date(price.effectiveDate).getTime();
        return Number.isFinite(effectiveTime) && effectiveTime <= now && !price.isDeleted;
      })
      .sort(
        (first, second) =>
          new Date(second.effectiveDate).getTime() - new Date(first.effectiveDate).getTime(),
      );
    const priceByProduct = new Map<string, Record<string, any>>();
    for (const price of prices) {
      if (!priceByProduct.has(price.productId)) priceByProduct.set(price.productId, price);
    }
    const stockByProduct = new Map(stock.map((item) => [item.productId, item]));
    const categoryIds = new Set(params.categoryIds?.split(',').filter(Boolean) ?? []);
    const brandIds = new Set(params.brandIds?.split(',').filter(Boolean) ?? []);
    const query = params.searchText?.trim().toLocaleLowerCase();
    const filteredProducts = allProducts.filter((product) => {
      if (!priceByProduct.has(product.productId)) return false;
      if (categoryIds.size && !categoryIds.has(product.categoryId) && !categoryIds.has(product.parentCategoryId)) return false;
      if (brandIds.size && !brandIds.has(product.brand)) return false;
      if (query && ![product.name, product.productId, product.productSysCode, product.sku, product.brand]
        .some((value) => String(value ?? '').toLocaleLowerCase().includes(query))) return false;
      return true;
    });
    const start = (params.page - 1) * params.limit;
    const data = filteredProducts.slice(start, start + params.limit);
    const products = data.map((product) => {
      const price = priceByProduct.get(product.productId);
      const inventory = stockByProduct.get(product.productId);
      return {
        ...product,
        casePrice: price?.casePriceInclVat ?? product.casePrice,
        piecePrice: price?.piecePriceInclVat ?? product.piecePrice,
        stock: inventory?.quantity ?? product.stock ?? 0,
        inventory,
      };
    });
    return {
      success: true,
      statusCode: 200,
      data: products,
      meta: {
        total: filteredProducts.length,
        page: params.page,
        limit: params.limit,
      },
    } as ApiResponse<any>;
  },
};
