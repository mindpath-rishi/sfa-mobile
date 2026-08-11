export interface GeoTag {
  lat: number;
  lng: number;
}

export interface Address {
  line1: string;
  line2: string;
  _id: string;
  isDeleted: boolean;
}

export interface Outlet {
  _id: string;
  customerId: string;
  name: string;
  ownerName: string;
  phoneNumber: string;
  address: Address;
  geoTag: GeoTag;
  segmentation: string;
  status: 'ACTIVE' | 'INACTIVE' | 'VERIFICATION_PENDING' | 'REJECTED';
  lastVisitedAt: string;
  lastOrderDate?: string | null;
  sequence: number;
  visitStatus?: 'ACTIVE' | 'COMPLETED' | 'NOT_VISITED';
  orderValue?: number;
  priority?: 'high' | 'medium' | 'low';
  distance?: number;
  isBlocked?: boolean;
  blockReason?: string;
  hasSale?: boolean;
  quantity?: number;
  productiveCall?: boolean;
}
