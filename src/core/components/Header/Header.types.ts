// src/core/components/Header/Header.types.ts

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showFilter?: boolean;
  showSearch?: boolean;
  showSearchBar?: boolean; // New: Show search bar below header
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (text: string) => void;
  onSearchClear?: () => void;
  onSearchPress?: () => void;
  filterActive?: boolean;
  filterCount?: number;
  onFilterPress?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  badgeCount?: number;
  elevated?: boolean;
  centeredTitle?: boolean;
  transparent?: boolean;
  size?: 'small' | 'medium' | 'large';
  showBorder?: boolean;
  headerBackgroundColor?: string;
  style?: any;
  
  // New props for modern gradient design
  useGradient?: boolean;
  gradientColors?: string[];
  
  // Deprecated/legacy
  [key: string]: any;
}