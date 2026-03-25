// components/SalesSummary/hooks/useCartTotals.ts
import { useMemo } from 'react';
import { CartItem } from '../types/sales-summary.types';
import { TAX_RATE, UNITS_PER_CASE } from '../constants';

export const useCartTotals = (cartItems: CartItem[], products: any[]) => {
  return useMemo(() => {
    let cases = 0;
    let pieces = 0;
    let subtotal = 0;

    for (const item of cartItems) {
      if (item.type === 'cases') {
        cases += item.quantity;
        subtotal += item.quantity * UNITS_PER_CASE * item.product.price * 0.95;
      } else {
        pieces += item.quantity;
        subtotal += item.quantity * item.product.price;
      }
    }

    const tax = subtotal * TAX_RATE;
    const totalUnits = cases * UNITS_PER_CASE + pieces;

    return {
      cases,
      pieces,
      units: totalUnits,
      subtotal,
      tax,
      total: subtotal + tax,
      skuCount: products.length,
      orderedCount: cartItems.length,
    };
  }, [cartItems, products]);
};
