// export const ENTITY_TABLES = {
//   customers: 'customers',
//   outlets: 'outlets',
//   products: 'products',
//   categories: 'categories',
//   customerCategories: 'customer_categories',
//   channels: 'channels',
//   outletTypes: 'outlet_types',
//   segmentations: 'segmentations',
//   priceLists: 'price_lists',
//   vans: 'vans',
//   routes: 'routes',
//   routeSessions: 'route_sessions',
//   salesmen: 'salesmen',
//   stock: 'stock',
//   promotions: 'promotions',
//   orders: 'orders',
//   orderItems: 'order_items',
//   collections: 'collections',
//   attendance: 'attendance',
//   activities: 'activities',
//   visits: 'visits',
//   interactions: 'interactions',
//   nonSales: 'non_sales',
//   leaves: 'leaves',
//   surveys: 'surveys',
//   expenses: 'expenses',
//   returns: 'returns_data',
//   complaints: 'complaints',
//   targets: 'targets',
//   vanDailyStock: 'van_daily_stock',
//   inventoryTransactions: 'inventory_transactions',
//   mediaUploads: 'media_uploads',
// } as const;

// export type EntityName = keyof typeof ENTITY_TABLES;
// export type EntityTable = (typeof ENTITY_TABLES)[EntityName];
// export const MASTER_ENTITIES: EntityName[] = [
//   'customers',
//   'outlets',
//   'products',
//   'categories',
//   'customerCategories',
//   'channels',
//   'outletTypes',
//   'segmentations',
//   'priceLists',
//   'vans',
//   'routes',
//   'routeSessions',
//   'salesmen',
//   'stock',
//   'promotions',
//   'targets',
//   'vanDailyStock',
// ];
// export const TRANSACTION_ENTITIES: EntityName[] = [
//   'orders',
//   'orderItems',
//   'collections',
//   'attendance',
//   'activities',
//   'visits',
//   'interactions',
//   'nonSales',
//   'leaves',
//   'surveys',
//   'expenses',
//   'returns',
//   'complaints',
//   'inventoryTransactions',
//   'mediaUploads',
// ];



export const ENTITY_TABLES = {
  customers: 'customers',
  outlets: 'outlets',
  products: 'products',
  categories: 'categories',
  customerCategories: 'customer_categories',
  channels: 'channels',
  outletTypes: 'outlet_types',
  segmentations: 'segmentations',
  priceLists: 'price_lists',
  vans: 'vans',
  routes: 'routes',
  routeSessions: 'route_sessions',
  salesmen: 'salesmen',
  stock: 'stock',
  promotions: 'promotions',
  schemes: 'schemes',
  orders: 'orders',
  orderItems: 'order_items',
  collections: 'collections',
  attendance: 'attendance',
  activities: 'activities',
  visits: 'visits',
  interactions: 'interactions',
  nonSales: 'non_sales',
  leaves: 'leaves',
  surveys: 'surveys',
  expenses: 'expenses',
  returns: 'returns_data',
  complaints: 'complaints',
  targets: 'targets',
  vanDailyStock: 'van_daily_stock',

  /**
   * ERP closing stock downloaded from backend entity:
   * vanErpClosing -> van_erp_closing
   */
  vanErpClosing: 'van_erp_closing',

  inventoryTransactions: 'inventory_transactions',
  mediaUploads: 'media_uploads',
} as const;

export type EntityName = keyof typeof ENTITY_TABLES;

export type EntityTable = (typeof ENTITY_TABLES)[EntityName];

export const MASTER_ENTITIES: EntityName[] = [
  'customers',
  'outlets',
  'products',
  'categories',
  'customerCategories',
  'channels',
  'outletTypes',
  'segmentations',
  'priceLists',
  'vans',
  'routes',
  'routeSessions',
  'salesmen',
  'stock',
  'promotions',
  'schemes',
  'targets',
  'vanDailyStock',

  /**
   * Read-only master data.
   * Used in offline Day Start to create opening van daily stock.
   */
  'vanErpClosing',
];

export const TRANSACTION_ENTITIES: EntityName[] = [
  'orders',
  'orderItems',
  'collections',
  'attendance',
  'activities',
  'visits',
  'interactions',
  'nonSales',
  'leaves',
  'surveys',
  'expenses',
  'returns',
  'complaints',
  'inventoryTransactions',
  'mediaUploads',
];