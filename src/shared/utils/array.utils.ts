// shared/utils/array.utils.ts

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce(
    (groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<string, T[]>,
  );
};


export const sortBy = <T>(
  array: T[],
  iteratee: keyof T | ((item: T) => string | number),
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  const sorted = [...array];

  sorted.sort((a, b) => {
    const aValue =
      typeof iteratee === 'function' ? iteratee(a) : a[iteratee];
    const bValue =
      typeof iteratee === 'function' ? iteratee(b) : b[iteratee];

    // handle null/undefined
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    // normalize strings
    const valA =
      typeof aValue === 'string' ? aValue.toLowerCase() : aValue;
    const valB =
      typeof bValue === 'string' ? bValue.toLowerCase() : bValue;

    if (valA === valB) return 0;

    const result = valA > valB ? 1 : -1;
    return order === 'asc' ? result : -result;
  });

  return sorted;
};

export const filterBySearch = <T>(array: T[], searchTerm: string, keys: (keyof T)[]): T[] => {
  if (!searchTerm || searchTerm.length < 2) return array;

  const term = searchTerm.toLowerCase();
  return array.filter((item) =>
    keys.some((key) => {
      const value = item[key];
      return value && String(value).toLowerCase().includes(term);
    }),
  );
};

export const paginate = <T>(array: T[], page: number, limit: number): T[] => {
  const start = (page - 1) * limit;
  const end = start + limit;
  return array.slice(start, end);
};

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

export const sumBy = <T>(array: T[], iteratee: keyof T | ((item: T) => number)): number => {
  return array.reduce((sum, item) => {
    const value = typeof iteratee === 'function' ? iteratee(item) : item[iteratee];

    return sum + (typeof value === 'number' ? value : 0);
  }, 0);
};

export const averageBy = <T>(array: T[], key: keyof T): number => {
  if (array.length === 0) return 0;
  const total = sumBy(array, key);
  return total / array.length;
};

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};
