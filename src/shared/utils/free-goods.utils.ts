/**
 * Free goods on a sale (mirror of sfa-service/src/shared/utils/free-goods.utils.ts)
 * Free SKUs from line schemes and group schemes: shown at price 0 on the billing
 * confirmation and deducted from van stock like sold goods.
 */

export type FreeGood = {
  productId: string;
  productName?: string;
  qty: number;
  unit: 'CASE' | 'PIECE';
};

type SchemeLike = {
  freeQty?: number;
  freeUnit?: 'CASE' | 'PIECE' | string;
  freeProductId?: string;
  freeProductName?: string;
};

type ItemLike = {
  productId?: string;
  productName?: string;
  appliedSchemes?: SchemeLike[];
  schemeFreeQty?: number;
  schemeFreeUnit?: 'CASE' | 'PIECE' | string;
  schemeFreeProductId?: string;
  schemeFreeProductName?: string;
};

type GroupLike = SchemeLike & {
  lines?: { productId?: string; productName?: string; freeQty?: number }[];
};

export function collectFreeGoods(items: ItemLike[] = [], groupSchemes: GroupLike[] = []): FreeGood[] {
  const goods = new Map<string, FreeGood>();
  const add = (productId: string | undefined, productName: string | undefined, qty: unknown, unit: unknown) => {
    const amount = Math.max(Number(qty) || 0, 0);
    if (!productId || amount <= 0) return;
    const resolvedUnit: 'CASE' | 'PIECE' = unit === 'PIECE' ? 'PIECE' : 'CASE';
    const key = `${productId}::${resolvedUnit}`;
    const existing = goods.get(key);
    if (existing) existing.qty += amount;
    else goods.set(key, { productId, productName, qty: amount, unit: resolvedUnit });
  };

  for (const item of items) {
    const schemes: SchemeLike[] = item.appliedSchemes?.length
      ? item.appliedSchemes
      : [
          {
            freeQty: item.schemeFreeQty,
            freeUnit: item.schemeFreeUnit,
            freeProductId: item.schemeFreeProductId,
            freeProductName: item.schemeFreeProductName,
          },
        ];
    for (const scheme of schemes) {
      add(
        scheme.freeProductId || item.productId,
        scheme.freeProductName || (scheme.freeProductId ? undefined : item.productName),
        scheme.freeQty,
        scheme.freeUnit,
      );
    }
  }

  for (const scheme of groupSchemes) {
    if (scheme.freeProductId) {
      add(scheme.freeProductId, scheme.freeProductName, scheme.freeQty, scheme.freeUnit);
    }
    for (const line of scheme.lines ?? []) {
      add(line.productId, line.productName, line.freeQty, scheme.freeUnit);
    }
  }

  return Array.from(goods.values());
}

export const freeGoodPieces = (good: FreeGood, unitQtyInCase: number) =>
  good.unit === 'PIECE' ? good.qty : good.qty * Math.max(Number(unitQtyInCase) || 1, 1);
