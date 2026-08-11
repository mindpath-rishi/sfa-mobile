export interface StockItem {
  id?: string;
  productId: string;
  name: string;
  cases: number;
  pieces: number;
  price: number;
  netWeight?: number;
  totalValue?: number;
}

export interface StockSummary {
  totalCases: number;
  totalPiece: number;
  totalValue: number;
  totalNetWeight: number;
  totalItems: number;
}

export interface StockResponse {
  products: StockItem[];
  total: number;
  totalCases: number;
  totalPieces: number;
  totalValue: number;
  totalNetWeight: number;
  page: number;
  limit: number;
}

export interface StockPageProps {
  loadNumber?: string;
}

// stock.types.ts

export interface StockHeaderProps {
  loadNumber?: string;
  colors: any;
  styles: any;
  searchQuery: string;
  onSearch: (text: string) => void;
  totalItems: number;
}

export interface StockSearchBarProps {
  searchQuery: string;
  onSearch: (text: string) => void;
  onClear: () => void;
  isSearching: boolean;
  totalItems: number;
  colors: any;
  styles: any;
}

export interface StockMetricsProps {
  summary: StockSummary;
  formatCurrency: (value: number) => string;
  colors: any;
  styles: any;
}

export interface StockProductItemProps {
  item: StockItem;
  index: number;
  formatStock: (cases: number, pieces: number) => string;
  formatCurrency: (value: number) => string;
  isOutOfStock: (item: StockItem) => boolean;
  opacityAnim: any;
  colors: any;
  styles: any;
  onPress?: (item: StockItem) => void;
}
