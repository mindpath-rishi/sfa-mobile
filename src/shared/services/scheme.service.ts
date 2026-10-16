import { useAuthStore } from '@/core/store/auth.store';
import { getVanProvinceId, useRouteStore } from '@/core/store/route.store';
import { repositories } from '@/repositories';
import { api } from '@/core/network';
import { isSalesman } from '@/core/navigation/role.utils';
import { isOfflineMode } from '@/core/offline/offline.store';
import { isGroupSchemeType } from './group-scheme.engine';

/* ======================================================
 * TYPES
 * ====================================================== */

export type SchemeType =
  | 'DISCOUNT_PERCENT'
  | 'DISCOUNT_VALUE'
  | 'BUY_X_GET_Y'
  | 'BUY_ONE_GET_ONE'
  | 'FREE_ITEM'
  | 'GROUP_FREE_QTY'
  | 'COMBO_FREE_QTY';

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
  minQtyUnit?: 'CASE' | 'PIECE';
  discountPercent?: number;
  discountValue?: number;
  buyQty?: number;
  buyUnit?: 'CASE' | 'PIECE';
  freeQty?: number;
  freeProductId?: string;
  freeProductName?: string;
  /** Group schemes: combined cases of the group per benefit multiple */
  groupMinCases?: number;
  /** Group schemes: unit of groupMinCases; cases when not set */
  groupMinUnit?: 'CASE' | 'PIECE';
  /** GROUP_FREE_QTY / COMBO_FREE_QTY: unit of freeQty */
  freeUnit?: 'CASE' | 'PIECE';
  /** COMBO_FREE_QTY: products and quantities that must all be bought */
  comboItems?: import('./group-scheme.engine').ComboItem[];
  startDate: string;
  endDate: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | string;
}

export interface SchemeMatchInput {
  productId: string;
  productName?: string;
  categoryId?: string;
  parentCategoryId?: string;
  quantity: number;
  caseQty?: number;
  pieceQty?: number;
  unitQtyInCase?: number;
}

export interface SchemeBenefit {
  schemeId: string;
  schemeName: string;
  schemeType: SchemeType;
  minimumQuantity: number;
  minimumQuantityUnit?: 'CASE' | 'PIECE';
  discountPercent?: number;
  discountValue?: number;
  buyQty?: number;
  buyUnit?: 'CASE' | 'PIECE';
  freeUnit?: 'CASE' | 'PIECE';
  /** Total monetary discount to subtract from the line's gross value. */
  discountAmount: number;
  freeQty?: number;
  freeProductId?: string;
  freeProductName?: string;
  /**
   * Cart lines: every scheme applied to the line. The line benefit itself is
   * the combined result (discounts added up, capped at the line value).
   */
  appliedSchemes?: SchemeBenefit[];
}

/** Each applied scheme of a line benefit (a single benefit is its own list). */
export const appliedSchemesOf = (benefit?: SchemeBenefit | null): SchemeBenefit[] =>
  benefit ? benefit.appliedSchemes ?? [benefit] : [];

/** Every scheme applied across cart lines. */
export const allAppliedSchemes = (benefits: Record<string, SchemeBenefit>) =>
  Object.values(benefits).flatMap(appliedSchemesOf);

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

// A scheme applies only to its selected products
const matchesProduct = (scheme: SchemeRecord, input: SchemeMatchInput) =>
  matchesDimension(scheme.productIds, input.productId);

const matchesGeography = (
  scheme: SchemeRecord,
  vanId?: string,
  routeId?: string,
  provinceId?: string,
) => {
  // At least one location dimension must be selected. Selected dimensions
  // all have to match; empty dimensions add no filter.
  const hasGeographyScope = Boolean(
    scheme.provinceIds?.length || scheme.routeIds?.length || scheme.vanIds?.length,
  );
  if (!hasGeographyScope) return false;
  const dimensionMatches = (ids: string[] | undefined, value?: string | null) =>
    !ids?.length || matchesDimension(ids, value);

  return (
    dimensionMatches(scheme.vanIds, vanId) &&
    dimensionMatches(scheme.routeIds, routeId) &&
    dimensionMatches(scheme.provinceIds, provinceId)
  );
};

const computeDiscount = (
  scheme: SchemeRecord,
  grossValue: number,
  casePrice: number,
  piecePrice: number,
  earnedFreeQty = scheme.freeQty ?? 0,
): SchemeBenefit => {
  const details = {
    schemeId: scheme.schemeId,
    schemeName: scheme.name,
    schemeType: scheme.schemeType,
    minimumQuantity: scheme.minQty ?? 0,
    minimumQuantityUnit: scheme.minQtyUnit,
    discountPercent: scheme.discountPercent,
    discountValue: scheme.discountValue,
    buyQty: scheme.buyQty,
    buyUnit: scheme.buyUnit,
    freeUnit: scheme.freeUnit,
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
        discountAmount: 0,
        freeQty: earnedFreeQty,
        freeProductId: scheme.freeProductId,
        freeProductName: scheme.freeProductName,
      };
    case 'BUY_ONE_GET_ONE':
      return {
        ...details,
        discountAmount: 0,
        freeQty: earnedFreeQty,
        freeUnit: scheme.buyUnit,
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

/** Buy X Get Y and Buy One Get One qualify on the bought quantity in buyUnit. */
const isBuyGetScheme = (scheme: SchemeRecord) =>
  scheme.schemeType === 'BUY_X_GET_Y' || scheme.schemeType === 'BUY_ONE_GET_ONE';

/** Buy One Get One is always buy 1, get 1 of the same product. */
const buyThreshold = (scheme: SchemeRecord) =>
  scheme.schemeType === 'BUY_ONE_GET_ONE' ? 1 : scheme.buyQty ?? 0;

/**
 * Every line scheme the cart line qualifies for. All of them apply together:
 * each discount is worked out on the line's gross value.
 */
export const getApplicableSchemeBenefitsFromRecords = (
  input: SchemeMatchInput,
  grossValue: number,
  casePrice: number,
  schemes: SchemeRecord[],
  date: Date = new Date(),
): SchemeBenefit[] => {
  if (input.quantity <= 0 || grossValue <= 0) return [];

  const quantityIn = (unit?: string) =>
    unit === 'CASE'
      ? (input.caseQty ?? 0) + (input.pieceQty ?? 0) / Math.max(input.unitQtyInCase ?? 1, 1)
      : input.quantity;

  const eligible = schemes.filter(
    (scheme) =>
      !isGroupSchemeType(scheme.schemeType) &&
      isWithinValidity(scheme, date) &&
      (isBuyGetScheme(scheme)
        ? buyThreshold(scheme) > 0 &&
          Math.floor(quantityIn(scheme.buyUnit) / buyThreshold(scheme)) > 0
        : quantityIn(scheme.minQtyUnit) >= (scheme.minQty ?? 0)) &&
      matchesProduct(scheme, input),
  );

  return eligible
    .map((scheme) => {
      const multiples = isBuyGetScheme(scheme)
        ? Math.floor(quantityIn(scheme.buyUnit) / Math.max(buyThreshold(scheme), 1))
        : 1;
      const freeQtyPerMultiple = scheme.schemeType === 'BUY_ONE_GET_ONE' ? 1 : scheme.freeQty ?? 0;
      const benefit = computeDiscount(
        scheme,
        grossValue,
        casePrice,
        casePrice / Math.max(input.unitQtyInCase ?? 1, 1),
        freeQtyPerMultiple * multiples,
      );
      // The free item of Buy One Get One is the product being bought
      return scheme.schemeType === 'BUY_ONE_GET_ONE'
        ? {
            ...benefit,
            freeProductId: input.productId,
            freeProductName: input.productName || input.productId,
          }
        : benefit;
    })
    .sort((first, second) => second.discountAmount - first.discountAmount);
};

/**
 * Combined line benefit of all applicable schemes: the largest discount
 * scheme describes the line, discountAmount is the sum (capped at the line
 * value) and appliedSchemes lists every scheme.
 */
export const getApplicableSchemeBenefitFromRecords = (
  input: SchemeMatchInput,
  grossValue: number,
  casePrice: number,
  schemes: SchemeRecord[],
  date: Date = new Date(),
): SchemeBenefit | null => {
  const benefits = getApplicableSchemeBenefitsFromRecords(
    input,
    grossValue,
    casePrice,
    schemes,
    date,
  );
  if (!benefits.length) return null;

  const discountAmount = Math.min(
    benefits.reduce((sum, benefit) => sum + benefit.discountAmount, 0),
    grossValue,
  );
  return { ...benefits[0], discountAmount, appliedSchemes: benefits };
};

export const getSchemePreviewFromRecords = (
  schemes: SchemeRecord[],
  casePrice: number,
  piecePrice: number,
): SchemeBenefit | null => {
  const lineSchemes = schemes.filter((scheme) => !isGroupSchemeType(scheme.schemeType));
  if (!lineSchemes.length) return null;

  return lineSchemes
    .map((scheme) => {
      const minimumQuantity = Math.max(scheme.minQty ?? 0, 1);
      const threshold = isBuyGetScheme(scheme)
        ? Math.max(buyThreshold(scheme), 1)
        : minimumQuantity;
      const thresholdUnit = isBuyGetScheme(scheme) ? scheme.buyUnit : scheme.minQtyUnit;
      const previewGrossValue =
        threshold *
        Math.max(thresholdUnit === 'CASE' ? casePrice : piecePrice, 0);
      return computeDiscount(scheme, previewGrossValue, casePrice, piecePrice);
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
