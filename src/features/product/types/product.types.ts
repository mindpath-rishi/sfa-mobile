/* ======================================================
 * PRODUCT VARIANT
 * ====================================================== */

export interface ProductVariant {
  name: string;
  price: number;
  stock: number;
}

/* ======================================================
 * CART (UI SELECTOR INPUT ONLY)
 * Used in ProductUnitSelector
 * ====================================================== */

export interface CartItem {
  type: 'cases' | 'units';
  quantity: number;
}

/* ======================================================
 * CART (FINAL STRUCTURE - STORED IN STATE)
 * One product = one item
 * ====================================================== */

export interface CartItemWithDetails {
  productId: string;
  productName: string;

  // Pricing
  casePrice: number;
  piecePrice: number;

  // Unit config
  unitQtyInCase: number;

  // Quantities
  caseQty: number;
  pieceQty: number;
  caseNetWeight?: number; // Weight per case (calculated as unitQtyInCase * netWeightPerUnit)
  pieceNetWeight?: number; // Weight per piece (same as netWeightPerUnit)
  stock: number;
}

/* ======================================================
 * PRODUCT (MATCHES BACKEND)
 * ====================================================== */

export interface Product {
  productId: string; // ✅ FIXED (was id)
  name: string;
  sku: string;

  category: string;
  subCategory: string;
  brand: string;

  description: string;

  // Pricing
  casePrice: number;
  piecePrice: number;

  // Unit config
  unitQtyInCase: number;
  unitSize: any;

  // Stock
  stock: number;
  minStock?: number;
  maxStock?: number;

  // Pricing extras
  mrp: number;
  discount: number;

  // Status
  status: 'in_stock' | 'low_stock' | 'out_of_stock';

  // Optional fields
  image?: string | null;
  tags?: string[];
  variants?: ProductVariant[];

  scheme?: string | null;
  margin?: number;
  gst?: number;
  hsn?: string;
  manufacturer?: string;
  expiryDate?: string;

  ratings?: number;
  reviews?: number;
  lastOrdered?: string;
  reorderPoint?: number;
  caseNetWeight?: number;
  pieceNetWeight?: number;
}

/* ======================================================
 * CATEGORY
 * ====================================================== */

export interface Category {
  name: string;
  count: number;
  icon?: string;
}

/* ======================================================
 * FILTER
 * ====================================================== */

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

/* ======================================================
 * UI TYPES
 * ====================================================== */

export type ViewMode = 'grid' | 'list';
export type DisplayMode = 'products' | 'categories';
export type ProductStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

/* ======================================================
 * UNIT TYPES
 * ====================================================== */

export type UnitType = 'cases' | 'units' | 'cartons' | 'dozens';

export interface UnitOption {
  type: UnitType;
  label: string;
  multiplier: number;
  price: number;
  stock: number;
}
