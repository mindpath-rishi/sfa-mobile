import { useAuthStore } from '@/core/store/auth.store';
import { getVanProvinceId, useRouteStore } from '@/core/store/route.store';
import { repositories } from '@/repositories';
import { api } from '@/core/network';
import { isSalesman } from '@/core/navigation/role.utils';
import { isOfflineMode } from '@/core/offline/offline.store';

/* ======================================================
 * TYPES
 * ====================================================== */

export type SchemeType = 'DISCOUNT_PERCENT' | 'DISCOUNT_VALUE' | 'BUY_X_GET_Y' | 'FREE_ITEM';

export interface SchemeRecord {
  schemeId: string;
  name: string;
  categoryIds?: string[];
  subCategoryIds?: string[];
  productIds?: string[];
  provinceIds?: string[];
  routeIds?: string[];
  vanIds?: string[];
  schemeType: SchemeType;
  minQty?: number;
  discountPercent?: number;
  discountValue?: number;
  buyQty?: number;
  freeQty?: number;
  freeProductId?: string;
  freeProductName?: string;
  startDate: string;
  endDate: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | string;
}

export interface SchemeMatchInput {
  productId: string;
  categoryId?: string;
  parentCategoryId?: string;
  quantity: number;
}

export interface SchemeBenefit {
  schemeId: string;
  schemeName: string;
  schemeType: SchemeType;
  minimumQuantity: number;
  discountPercent?: number;
  discountValue?: number;
  buyQty?: number;
  /** Total monetary discount to subtract from the line's gross value. */
  discountAmount: number;
  freeQty?: number;
  freeProductId?: string;
  freeProductName?: string;
}

/* ======================================================
 * HELPERS
 * ====================================================== */

const isWithinValidity = (scheme: SchemeRecord, date: Date) => {
  const start = scheme.startDate ? new Date(scheme.startDate) : null;
  const end = scheme.endDate ? new Date(scheme.endDate) : null;
  start?.setUTCHours(0, 0, 0, 0);
  end?.setUTCHours(23, 59, 59, 999);
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
};

const matchesDimension = (ids: string[] | undefined, value?: string | null) =>
  Boolean(ids?.length && value && ids.includes(value));

const matchesProduct = (scheme: SchemeRecord, input: SchemeMatchInput) => {
  const hasProductScope = Boolean(
    scheme.productIds?.length || scheme.categoryIds?.length || scheme.subCategoryIds?.length,
  );
  if (!hasProductScope) return true;

  return (
    matchesDimension(scheme.productIds, input.productId) ||
    matchesDimension(scheme.categoryIds, input.categoryId) ||
    matchesDimension(scheme.subCategoryIds, input.categoryId) ||
    matchesDimension(scheme.categoryIds, input.parentCategoryId) ||
    matchesDimension(scheme.subCategoryIds, input.parentCategoryId)
  );
};

const matchesGeography = (
  scheme: SchemeRecord,
  vanId?: string,
  routeId?: string,
  provinceId?: string,
) => {
  const hasGeographyScope = Boolean(
    scheme.vanIds?.length || scheme.routeIds?.length || scheme.provinceIds?.length,
  );
  if (!hasGeographyScope) return true;

  return (
    matchesDimension(scheme.vanIds, vanId) ||
    matchesDimension(scheme.routeIds, routeId) ||
    matchesDimension(scheme.provinceIds, provinceId)
  );
};

const computeDiscount = (
  scheme: SchemeRecord,
  grossValue: number,
  casePrice: number,
): SchemeBenefit => {
  const details = {
    schemeId: scheme.schemeId,
    schemeName: scheme.name,
    schemeType: scheme.schemeType,
    minimumQuantity: scheme.minQty ?? 0,
    discountPercent: scheme.discountPercent,
    discountValue: scheme.discountValue,
    buyQty: scheme.buyQty,
  };

  switch (scheme.schemeType) {
    case 'DISCOUNT_PERCENT':
      return {
        ...details,
        discountAmount: (grossValue * (scheme.discountPercent ?? 0)) / 100,
      };
    case 'DISCOUNT_VALUE':
      return {
        ...details,
        discountAmount: Math.min(scheme.discountValue ?? 0, grossValue),
      };
    case 'BUY_X_GET_Y':
      return {
        ...details,
        discountAmount: Math.min((scheme.freeQty ?? 0) * casePrice, grossValue),
        freeQty: scheme.freeQty,
      };
    case 'FREE_ITEM':
      return {
        ...details,
        discountAmount: 0,
        freeQty: scheme.freeQty,
        freeProductId: scheme.freeProductId,
        freeProductName: scheme.freeProductName,
      };
    default:
      return {
        ...details,
        discountAmount: 0,
      };
  }
};

/* ======================================================
 * SERVICE
 * ====================================================== */

let cachedSchemes: SchemeRecord[] | null = null;
let cachedOwnerId: string | null = null;
let cacheExpiresAt = 0;
let schemeLoadPromise: Promise<SchemeRecord[]> | null = null;

/** Loads active schemes from the salesman's synchronized repository. */
const loadOfflineActiveSchemes = async (): Promise<SchemeRecord[]> => {
  const user = useAuthStore.getState().user;
  const ownerId = user?.userId ?? '';
  const now = Date.now();
  if (cachedSchemes && cachedOwnerId === ownerId && cacheExpiresAt > now) {
    return cachedSchemes;
  }
  if (schemeLoadPromise) return schemeLoadPromise;

  schemeLoadPromise = (async () => {
    const records: SchemeRecord[] = [];
    const limit = 200;
    for (let page = 1; ; page += 1) {
      const batch = (await repositories.schemes.findAll(ownerId, {
        page,
        limit,
      })) as unknown as SchemeRecord[];
      records.push(...batch);
      if (batch.length < limit) break;
    }

    cachedSchemes = records.filter((scheme) => (scheme.status ?? 'ACTIVE') === 'ACTIVE');
    cachedOwnerId = ownerId;
    cacheExpiresAt = Date.now() + 5_000;
    return cachedSchemes;
  })();

  try {
    return await schemeLoadPromise;
  } finally {
    schemeLoadPromise = null;
  }
};

export const invalidateSchemeCache = () => {
  cachedSchemes = null;
  cacheExpiresAt = 0;
};

export const getApplicableSchemeRecords = async (
  input: Omit<SchemeMatchInput, 'quantity'>,
  date: Date = new Date(),
): Promise<SchemeRecord[]> => {
  const { van, selectedRoute } = useRouteStore.getState();
  const vanId = van?.vanId;
  const routeId = selectedRoute?.routeId;
  const provinceId = getVanProvinceId(van);
  const user = useAuthStore.getState().user;

  let schemes: SchemeRecord[];
  if (isSalesman(user) && isOfflineMode()) {
    schemes = await loadOfflineActiveSchemes();
  } else {
    const response = await api.get<SchemeRecord[]>('/scheme/applicable', {
      params: {
        productId: input.productId,
        categoryId: input.categoryId,
        subCategoryId: input.parentCategoryId,
        provinceId,
        routeId,
        vanId,
        date: date.toISOString(),
      },
      cache: false,
      showLoader: false,
    });
    schemes = response?.data || [];
  }

  return schemes.filter(
    (scheme) =>
      isWithinValidity(scheme, date) &&
      matchesProduct(scheme, { ...input, quantity: 0 }) &&
      matchesGeography(scheme, vanId, routeId, provinceId),
  );
};

export const getApplicableSchemeBenefitFromRecords = (
  input: SchemeMatchInput,
  grossValue: number,
  casePrice: number,
  schemes: SchemeRecord[],
  date: Date = new Date(),
): SchemeBenefit | null => {
  if (input.quantity <= 0 || grossValue <= 0) return null;

  const eligible = schemes.filter(
    (scheme) =>
      isWithinValidity(scheme, date) &&
      input.quantity >= (scheme.minQty ?? 0) &&
      matchesProduct(scheme, input),
  );
  if (!eligible.length) return null;

  return eligible
    .map((scheme) => computeDiscount(scheme, grossValue, casePrice))
    .reduce((best, current) => (current.discountAmount > best.discountAmount ? current : best));
};

export const getSchemePreviewFromRecords = (
  schemes: SchemeRecord[],
  casePrice: number,
  piecePrice: number,
): SchemeBenefit | null => {
  if (!schemes.length) return null;

  return schemes
    .map((scheme) => {
      const minimumQuantity = Math.max(scheme.minQty ?? 0, 1);
      return computeDiscount(scheme, minimumQuantity * Math.max(piecePrice, 0), casePrice);
    })
    .reduce((best, current) => (current.discountAmount > best.discountAmount ? current : best));
};

/**
 * Resolves the single best-value scheme benefit applicable to a cart line,
 * scoped by product/category, and by the salesman's current van/route/province.
 */
export const getApplicableSchemeBenefit = async (
  input: SchemeMatchInput,
  grossValue: number,
  casePrice: number,
  date: Date = new Date(),
): Promise<SchemeBenefit | null> => {
  const schemes = await getApplicableSchemeRecords(input, date);
  return getApplicableSchemeBenefitFromRecords(input, grossValue, casePrice, schemes, date);
};

/**
 * Resolves a scheme for display before a product has been added to the cart.
 * Quantity qualification is intentionally deferred; checkout still uses
 * getApplicableSchemeBenefit() and applies a discount only after minQty is met.
 */
export const getApplicableSchemePreview = async (
  input: Omit<SchemeMatchInput, 'quantity'>,
  casePrice: number,
  piecePrice: number,
  date: Date = new Date(),
): Promise<SchemeBenefit | null> => {
  const schemes = await getApplicableSchemeRecords(input, date);
  return getSchemePreviewFromRecords(schemes, casePrice, piecePrice);
};
