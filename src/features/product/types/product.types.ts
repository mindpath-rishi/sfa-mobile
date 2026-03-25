export interface ProductVariant {
  name: string;
  price: number;
  stock: number;
}

// features/products/types/product.types.ts
export interface CartItem {
  type: 'cases' | 'units';
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  subCategory: string;
  brand: string;
  description: string;
  price: number;
  mrp: number;
  discount: number;
  unit: string;
  stock: number;
  minStock: number;
  maxStock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  image: string | null;
  tags: string[];
  variants: ProductVariant[];
  scheme: string | null;
  margin: number;
  gst: number;
  hsn: string;
  manufacturer: string;
  expiryDate: string;
  ratings: number;
  reviews: number;
  lastOrdered: string;
  reorderPoint: number;
}

export interface Category {
  name: string;
  count: number;
  icon?: string;
}

export interface FilterOption {
  id: string;
  label: string;
  count: number;
}

export type ViewMode = 'grid' | 'list';
export type DisplayMode = 'products' | 'categories';
export type ProductStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type UnitType = 'cases' | 'units' | 'cartons' | 'dozens';

export interface UnitOption {
  type: UnitType;
  label: string;
  multiplier: number;
  price: number;
  stock: number;
}
