// stock.utils.ts

import { StockItem, StockSummary } from '../types/stock.types';
import { formatCurrency, formatWeight } from '@/shared/utils/number.utils';

// Re-export formatters
export { formatCurrency, formatWeight };

export const formatStock = (cases: number = 0, pieces: number = 0): string => {
  if (cases === 0 && pieces === 0) return 'Out';
  if (cases === 0) return `${pieces}P`;
  if (pieces === 0) return `${cases}C`;
  return `${cases}C ${pieces}P`;
};

export const isOutOfStock = (item: StockItem): boolean => {
  return (!item.cases || item.cases === 0) && (!item.pieces || item.pieces === 0);
};

export const calculateStockSummary = (items: StockItem[]): StockSummary => {
  return {
    totalCases: items.reduce((sum, item) => sum + (item.cases || 0), 0),
    totalPiece: items.reduce((sum, item) => sum + (item.pieces || 0), 0),
    totalValue: items.reduce((sum, item) => sum + (item.totalValue || 0), 0),
    totalNetWeight: items.reduce((sum, item) => sum + (item.netWeight || 0), 0),
    totalItems: items.length,
  };
};

export const filterStockBySearch = (items: StockItem[], query: string): StockItem[] => {
  if (!query) return items;
  const term = query.toLowerCase();
  return items.filter(
    item => 
      item.name?.toLowerCase().includes(term) ||
      item.productId?.toLowerCase().includes(term)
  );
};