// types/checkin.types.ts

import { Product } from '@/features/product/types/product.types';

export type TabType = 'sale' | 'non-sale' | 'collection';
export type NonSaleStep = 'main' | 'reason' | 'further-reason';

export interface Customer {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  route?: string;
}

export interface ReasonCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
}

export interface FurtherReason {
  id: string;
  label: string;
}

export interface NonSalePayload {
  customer: Customer;
  category: string | null;
  reason: string | null;
  furtherReason: string | null;
  timestamp: string;
}

export interface ReasonCategoriesMap {
  [key: string]: FurtherReason[];
}

export interface CheckInScreenParams {
  id?: string;
  customerId?: string;
  name?: string;
  customerName?: string;
  address?: string;
  phone?: string;
  route?: string;
  tab?: TabType;
}

export interface ProductsScreenRef {
  openFilters?: () => void;
}

export interface CheckInScreenProps {
  // Props if any
}

export interface CheckInScreenParams {
  name?: string;
  customerName?: string;
  id?: string;
  customerId?: string;
  address?: string;
  phone?: string;
  route?: string;
  tab?: TabType;
}

export interface CartItem {
  productId: string;
  product: Product;
  type: 'cases' | 'units';
  quantity: number;
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
