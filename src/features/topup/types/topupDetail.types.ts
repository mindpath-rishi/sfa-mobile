import { Topup, TopupItem } from "./topup.types";

export interface TopupDetail extends Topup {}

export type ActiveTab = 'overview' | 'products';

export interface HeaderProps {
  detail: TopupDetail;
  colors: any;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export interface OverviewProps {
  detail: TopupDetail;
  colors: any;
}

export interface ProductsProps {
  items: TopupItem[];
  colors: any;
}
