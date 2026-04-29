import { CartSummary } from "../types/createTopup.types";

export const MESSAGES = {
  NO_ITEMS: 'No Items',
  NO_ITEMS_DESC: 'Please add items to your top-up request',
  NO_VAN: 'No van selected',
  FETCH_STOCK_ERROR: 'Error fetching van stock',
} as const;

export const DEFAULT_CART_SUMMARY: CartSummary = {
  totalUnits: 0,
  totalValue: 0,
  totalItems: 0,
  totalWeight: 0,
  totalCases: 0,
  totalPieces: 0,
};