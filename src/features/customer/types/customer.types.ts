export interface Customer {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  type: string;
  category: string;
  status: 'active' | 'inactive';
  lastVisit: string;
  nextVisit: string;
  totalOrders: number;
  totalValue: string;
  outstanding: string;
  creditLimit: string;
  creditDays: number;
  location: string;
  distance: string;
  avatar: string | null;
  tags: string[];
  recentActivity: Activity[];
  contacts: Contact[];
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
export type CustomerStatus = 'active' | 'inactive';
