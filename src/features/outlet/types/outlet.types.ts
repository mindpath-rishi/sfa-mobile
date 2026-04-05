export interface Outlet {
  id: string;

  // Core Info
  customerId: string;
  name: string;
  ownerName: string;
  phoneNumber: string;

  // Classification
  customerTypeId: string;
  customerCategoryId: string;
  channelId: string;
  marketId: string;
  provinceId: string;
  segmentation: string;

  // Address (updated structure)
  address: Address;

  // Geo Location
  geoTag: GeoTag;

  // Status
  status: OutletStatus;
  isDeleted: boolean;

  // Optional UI Fields (keep if needed)
  email?: string;
  lastVisit?: string;
  nextVisit?: string;
  totalOrders?: number;
  totalValue?: string;
  outstanding?: number;
  creditLimit?: number;
  creditDays?: number;
  distance?: string | number;
  avatar?: string | null;
  tags?: string[];
  recentActivity?: Activity[];
  contacts?: Contact[];
}

export interface Address {
  line1: string;
  line2?: string;
}

export interface GeoTag {
  lat: number;
  lng: number;
}

export interface Activity {
  type: 'order' | 'payment' | 'visit';
  date: string;
  amount?: string;
  by?: string;
}

export interface Contact {
  name: string;
  role: string;
  phone: string;
}

export interface FilterOption {
  id: string;
  label: string;
  count: number;
}

export type ViewMode = 'grid' | 'list';
export type OutletStatus = 'ACTIVE' | 'INACTIVE';
