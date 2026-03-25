// components/SalesSummary/types.ts
import { Product } from '@/features/product';

export interface CartItem {
  productId: string;
  product: Product;
  type: 'cases' | 'units';
  quantity: number;
}

export interface CartTotals {
  cases: number;
  pieces: number;
  units: number;
  subtotal: number;
  tax: number;
  total: number;
  skuCount: number;
  orderedCount: number;
}

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: {
    cases: number;
    pieces: number;
  };
}
