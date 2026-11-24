import type { ApiResponse } from '@/core/network/api.types';
import { api } from '@/core/network';
import { isSalesman } from '@/core/navigation/role.utils';
import { isOfflineMode, useOfflineStore } from '@/core/offline/offline.store';
import { useAuthStore } from '@/core/store/auth.store';
import { repositories } from '@/repositories';
import { getApplicableSchemeRecords } from '@/shared/services/scheme.service';
import { getVanCategoryIds, useRouteStore } from '@/core/store/route.store';

/* ================= TYPES ================= */

export interface FetchProductParams {
  limit: number;
  page: number;
  searchText?: string;
  categoryIds?: string;
  brandIds?: string;
  customerCategoryId?: string;
  includeUnpricedProducts?: boolean | string;
  status?: 'ACTIVE' | 'INACTIVE';
  inStockOnly?: boolean | string;
  minPrice?: string;
  vanId?: string;
  routeId?: string;
  provinceId?: string;
  includeSchemes?: boolean | string;
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
 * Product master and price lists only change when a sync download lands, so reuse them
 * until the sync watermark moves instead of re-reading SQLite on every page, search or
 * filter change. Stock is always read fresh because local sales change it.
 */
const MAX_MASTER_DATA_CACHE_ENTRIES = 20;
const masterDataCache = new Map<string, Promise<Record<string, any>[]>>();

const loadCachedMasterData = (
  repository: typeof repositories.products | typeof repositories.categories,
  ownerId: string,
  search?: string,
) => {
  const { lastSyncTime } = useOfflineStore.getState();
  const key = [repository.entity, ownerId, search ?? '', lastSyncTime ?? ''].join('|');

  let cached = masterDataCache.get(key);
  if (!cached) {
    if (masterDataCache.size >= MAX_MASTER_DATA_CACHE_ENTRIES) masterDataCache.clear();
    cached = loadAll(repository, ownerId, search).catch((error) => {
      masterDataCache.delete(key);
      throw error;
    });
    masterDataCache.set(key, cached);
  }

  return cached;
};

/** Cached product master, shared by screens/services that need a product lookup. */
export const loadCachedProducts = (ownerId: string) =>
  loadCachedMasterData(repositories.products, ownerId);

export const loadCachedCategories = (ownerId: string) =>
  loadCachedMasterData(repositories.categories, ownerId);

/**
 * Thin service layer (only API calls)
 */
export const productService: ProductService = {
  fetchProducts: async (params: FetchProductParams) => {
    const customerCategoryId = params.customerCategoryId?.trim();
    const requestParams = {
      ...params,
      ...(customerCategoryId ? { customerCategoryId } : {}),
    };
    if (!customerCategoryId) delete requestParams.customerCategoryId;
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<any>('/product', { params: requestParams });
    }
    const ownerId = user?.userId ?? '';
    const [allProducts, priceCandidates, stock] = await Promise.all([
      loadCachedMasterData(repositories.products, ownerId),
      loadCachedMasterData(repositories.priceLists, ownerId, customerCategoryId),
      loadAll(repositories.stock, ownerId),
    ]);

    const now = Date.now();
    const prices = priceCandidates
      .filter((price) => !customerCategoryId || price.categoryCode === customerCategoryId)
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
    // Index once: scanning all stock per product was O(products × stock) per fetch.
    const stockByProduct = new Map<string, Record<string, any>[]>();
    for (const item of stock) {
      const key = String(item.productId);
      const bucket = stockByProduct.get(key);
      if (bucket) bucket.push(item);
      else stockByProduct.set(key, [item]);
    }
    const inventoryForProduct = (productId: string) => {
      const candidates = stockByProduct.get(String(productId)) ?? [];
      if (!params.vanId) return candidates[0];
      return (
        candidates.find((item) => String(item.vanId) === String(params.vanId)) ??
        candidates.find((item) => !item.vanId)
      );
    };
    const categoryIds = new Set(params.categoryIds?.split(',').filter(Boolean) ?? []);
    const brandIds = new Set(params.brandIds?.split(',').filter(Boolean) ?? []);
    const query = params.searchText?.trim().toLocaleLowerCase();
    const includeUnpricedProducts = String(params.includeUnpricedProducts) === 'true';
    const requireStock = String(params.inStockOnly) === 'true';
    const minimumPrice = Number(params.minPrice ?? 0);
    const vanCategoryIds = new Set(getVanCategoryIds(useRouteStore.getState().van));
    const filteredProducts = allProducts.filter((product) => {
      const price = priceByProduct.get(product.productId);
      const inventory = inventoryForProduct(product.productId);
      if (
        params.vanId &&
        (!vanCategoryIds.size ||
          (!vanCategoryIds.has(String(product.categoryId)) &&
            !vanCategoryIds.has(String(product.parentCategoryId))))
      )
        return false;
      if (params.status && product.status !== params.status) return false;
      if (customerCategoryId && !includeUnpricedProducts && !price) return false;
      const casePrice = Number(price?.casePriceInclVat ?? product.casePrice ?? 0);
      const piecePrice = Number(price?.piecePriceInclVat ?? product.piecePrice ?? 0);
      if (minimumPrice > 0 && (casePrice < minimumPrice || piecePrice <= 0)) return false;
      const availableStock = Number(inventory?.quantity ?? product.stock ?? 0);
      if (requireStock && availableStock <= 0) return false;
      if (
        categoryIds.size &&
        !categoryIds.has(product.categoryId) &&
        !categoryIds.has(product.parentCategoryId)
      )
        return false;
      if (brandIds.size && !brandIds.has(product.brand)) return false;
      if (
        query &&
        ![product.name, product.productId, product.productSysCode, product.sku, product.brand].some(
          (value) =>
            String(value ?? '')
              .toLocaleLowerCase()
              .includes(query),
        )
      )
        return false;
      return true;
    });
    const start = (params.page - 1) * params.limit;
    const data = filteredProducts.slice(start, start + params.limit);
    const products = await Promise.all(
      data.map(async (product) => {
        const price = priceByProduct.get(product.productId);
        const inventory = inventoryForProduct(product.productId);
        return {
          ...product,
          casePrice: price?.casePriceInclVat ?? product.casePrice,
          piecePrice: price?.piecePriceInclVat ?? product.piecePrice,
          stock: inventory?.quantity ?? product.stock ?? 0,
          inventory,
          applicableSchemes:
            String(params.includeSchemes) === 'true'
              ? await getApplicableSchemeRecords({
                  productId: product.productId,
                  categoryId: product.categoryId,
                  parentCategoryId: product.parentCategoryId,
                })
              : [],
        };
      }),
    );
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
