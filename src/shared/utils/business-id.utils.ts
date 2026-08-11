const DEFAULT_ID_KEYS = [
  'categoryId',
  'parentCategoryId',
  'productCategoryId',
  'customerCategoryId',
  'productId',
  'id',
  '_id',
  'value',
  'code',
  'uuid',
] as const;

export const toBusinessId = (
  value: unknown,
  preferredKeys: readonly string[] = [],
  depth = 0,
): string => {
  if (value === null || value === undefined || depth > 2) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'bigint') return String(value);

  if (Array.isArray(value)) {
    for (const entry of value) {
      const id = toBusinessId(entry, preferredKeys, depth + 1);
      if (id) return id;
    }
    return '';
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of [...preferredKeys, ...DEFAULT_ID_KEYS]) {
      const id = toBusinessId(record[key], preferredKeys, depth + 1);
      if (id) return id;
    }
  }

  return '';
};
