/**
 * Group scheme engine
 * -------------------
 * Pure functions (no app imports) that evaluate GROUP_FREE_QTY and
 * GROUP_FREE_PERCENT schemes across ALL cart lines in a scheme's product group.
 *
 * Rules:
 * - Group  : cart lines whose product / category / sub-category is in the
 *            scheme scope (same matching as line schemes).
 * - Measure: combined cases = caseQty + pieceQty / unitQtyInCase per line.
 * - Qualify: every full `groupMinCases` is one multiple.
 * - GROUP_FREE_QTY     : freeQty x multiples of the fixed free product
 *                        (unit CASE or PIECE).
 * - GROUP_FREE_PERCENT : once qualified, freePercent % of each group line's
 *                        quantity is given free as the same product
 *                        (whole pieces, rounded down per line).
 * - COMBO_FREE_QTY     : every product in `comboItems` must be bought in its
 *                        required quantity (e.g. A x3 + B x1). Multiples =
 *                        the fewest full sets across the combo products;
 *                        freeQty x multiples of the fixed free product.
 * Group schemes give free goods and stack with per-line discount schemes.
 */

export type GroupSchemeType = 'GROUP_FREE_QTY' | 'GROUP_FREE_PERCENT' | 'COMBO_FREE_QTY';

export interface ComboItem {
  productId: string;
  productName?: string;
  /** Quantity required, in `unit` */
  qty: number;
  unit?: 'CASE' | 'PIECE' | string;
}

export interface GroupSchemeDefinition {
  schemeId: string;
  name: string;
  schemeType: string;
  categoryIds?: string[];
  subCategoryIds?: string[];
  productIds?: string[];
  groupMinCases?: number;
  freePercent?: number;
  freeQty?: number;
  freeUnit?: 'CASE' | 'PIECE' | string;
  freeProductId?: string;
  freeProductName?: string;
  /** COMBO_FREE_QTY: products and quantities that must all be bought */
  comboItems?: ComboItem[];
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface GroupCartLine {
  productId: string;
  productName?: string;
  categoryId?: string;
  parentCategoryId?: string;
  caseQty?: number;
  pieceQty?: number;
  unitQtyInCase?: number;
}

export interface GroupSchemeBenefitLine {
  productId: string;
  productName?: string;
  /** Free quantity in pieces (GROUP_FREE_PERCENT) */
  freeQty: number;
}

export interface GroupSchemeBenefit {
  schemeId: string;
  schemeName: string;
  schemeType: GroupSchemeType;
  groupMinCases: number;
  /** Combined cases of the group lines in the cart */
  qualifyingCases: number;
  multiples: number;
  freePercent?: number;
  freeUnit: 'CASE' | 'PIECE';
  /** Total free quantity in `freeUnit` */
  freeQty: number;
  freeProductId?: string;
  freeProductName?: string;
  /** COMBO_FREE_QTY: the required products and quantities per set */
  comboItems?: ComboItem[];
  /** Group lines that counted towards the scheme (with free pieces for %) */
  lines: GroupSchemeBenefitLine[];
}

const EPSILON = 1e-9;

export const isGroupSchemeType = (schemeType?: string): schemeType is GroupSchemeType =>
  schemeType === 'GROUP_FREE_QTY' ||
  schemeType === 'GROUP_FREE_PERCENT' ||
  schemeType === 'COMBO_FREE_QTY';

const includes = (ids: string[] | undefined, value?: string) =>
  Boolean(ids?.length && value && ids.includes(value));

export const isLineInGroup = (scheme: GroupSchemeDefinition, line: GroupCartLine) =>
  includes(scheme.productIds, line.productId) ||
  includes(scheme.categoryIds, line.categoryId) ||
  includes(scheme.subCategoryIds, line.categoryId) ||
  includes(scheme.categoryIds, line.parentCategoryId) ||
  includes(scheme.subCategoryIds, line.parentCategoryId);

const isActiveOn = (scheme: GroupSchemeDefinition, date: Date) => {
  if ((scheme.status ?? 'ACTIVE') !== 'ACTIVE') return false;
  const start = scheme.startDate ? new Date(scheme.startDate) : null;
  const end = scheme.endDate ? new Date(scheme.endDate) : null;
  start?.setUTCHours(0, 0, 0, 0);
  end?.setUTCHours(23, 59, 59, 999);
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
};

const linePieces = (line: GroupCartLine) =>
  Math.max(line.caseQty ?? 0, 0) * Math.max(line.unitQtyInCase ?? 1, 1) +
  Math.max(line.pieceQty ?? 0, 0);

const lineCases = (line: GroupCartLine) =>
  Math.max(line.caseQty ?? 0, 0) +
  Math.max(line.pieceQty ?? 0, 0) / Math.max(line.unitQtyInCase ?? 1, 1);

/** Bought quantity of a combo product, in the combo item's unit */
const boughtInUnit = (lines: GroupCartLine[], item: ComboItem) => {
  const productLines = lines.filter((line) => line.productId === item.productId);
  return item.unit === 'PIECE'
    ? productLines.reduce((sum, line) => sum + linePieces(line), 0)
    : productLines.reduce((sum, line) => sum + lineCases(line), 0);
};

const computeComboBenefit = (
  scheme: GroupSchemeDefinition,
  lines: GroupCartLine[],
): GroupSchemeBenefit | null => {
  const comboItems = (scheme.comboItems ?? []).filter(
    (item) => item.productId && Number(item.qty) > 0,
  );
  const freeQtyPerSet = Math.floor(Number(scheme.freeQty) || 0);
  if (!comboItems.length || freeQtyPerSet <= 0 || !scheme.freeProductId) return null;

  // Full sets bought = the scarcest combo product
  const multiples = Math.min(
    ...comboItems.map((item) => Math.floor(boughtInUnit(lines, item) / Number(item.qty) + EPSILON)),
  );
  if (multiples < 1) return null;

  const comboLines = lines.filter((line) =>
    comboItems.some((item) => item.productId === line.productId),
  );

  return {
    schemeId: scheme.schemeId,
    schemeName: scheme.name,
    schemeType: 'COMBO_FREE_QTY',
    groupMinCases: 0,
    qualifyingCases: Number(comboLines.reduce((sum, line) => sum + lineCases(line), 0).toFixed(4)),
    multiples,
    freeUnit: scheme.freeUnit === 'PIECE' ? 'PIECE' : 'CASE',
    freeQty: freeQtyPerSet * multiples,
    freeProductId: scheme.freeProductId,
    freeProductName: scheme.freeProductName,
    comboItems,
    lines: comboLines.map((line) => ({
      productId: line.productId,
      productName: line.productName,
      freeQty: 0,
    })),
  };
};

export const computeGroupSchemeBenefit = (
  scheme: GroupSchemeDefinition,
  lines: GroupCartLine[],
  date: Date = new Date(),
): GroupSchemeBenefit | null => {
  if (!isGroupSchemeType(scheme.schemeType) || !isActiveOn(scheme, date)) return null;

  if (scheme.schemeType === 'COMBO_FREE_QTY') {
    return computeComboBenefit(
      scheme,
      lines.filter((line) => linePieces(line) > 0),
    );
  }

  const hasScope = Boolean(
    scheme.productIds?.length || scheme.categoryIds?.length || scheme.subCategoryIds?.length,
  );
  const groupMinCases = Number(scheme.groupMinCases) || 0;
  if (!hasScope || groupMinCases <= 0) return null;

  const groupLines = lines.filter((line) => linePieces(line) > 0 && isLineInGroup(scheme, line));
  if (!groupLines.length) return null;

  const qualifyingCases = groupLines.reduce((sum, line) => sum + lineCases(line), 0);
  const multiples = Math.floor(qualifyingCases / groupMinCases + EPSILON);
  if (multiples < 1) return null;

  const base = {
    schemeId: scheme.schemeId,
    schemeName: scheme.name,
    schemeType: scheme.schemeType,
    groupMinCases,
    qualifyingCases: Number(qualifyingCases.toFixed(4)),
    multiples,
  };

  if (scheme.schemeType === 'GROUP_FREE_QTY') {
    const freeQty = Math.floor(Number(scheme.freeQty) || 0) * multiples;
    if (freeQty <= 0 || !scheme.freeProductId) return null;
    return {
      ...base,
      freeUnit: scheme.freeUnit === 'PIECE' ? 'PIECE' : 'CASE',
      freeQty,
      freeProductId: scheme.freeProductId,
      freeProductName: scheme.freeProductName,
      lines: groupLines.map((line) => ({
        productId: line.productId,
        productName: line.productName,
        freeQty: 0,
      })),
    };
  }

  const freePercent = Math.min(Math.max(Number(scheme.freePercent) || 0, 0), 100);
  const benefitLines = groupLines.map((line) => ({
    productId: line.productId,
    productName: line.productName,
    freeQty: Math.floor((linePieces(line) * freePercent) / 100 + EPSILON),
  }));
  const freeQty = benefitLines.reduce((sum, line) => sum + line.freeQty, 0);
  if (freeQty <= 0) return null;

  return {
    ...base,
    freePercent,
    freeUnit: 'PIECE',
    freeQty,
    lines: benefitLines,
  };
};

/**
 * Evaluate every distinct group scheme against the cart.
 * `schemes` may contain duplicates (each cart line carries its own list).
 */
export const computeGroupSchemeBenefits = (
  schemes: GroupSchemeDefinition[],
  lines: GroupCartLine[],
  date: Date = new Date(),
): GroupSchemeBenefit[] => {
  const unique = new Map<string, GroupSchemeDefinition>();
  for (const scheme of schemes) {
    if (isGroupSchemeType(scheme.schemeType) && !unique.has(scheme.schemeId)) {
      unique.set(scheme.schemeId, scheme);
    }
  }

  return [...unique.values()]
    .map((scheme) => computeGroupSchemeBenefit(scheme, lines, date))
    .filter((benefit): benefit is GroupSchemeBenefit => Boolean(benefit));
};
