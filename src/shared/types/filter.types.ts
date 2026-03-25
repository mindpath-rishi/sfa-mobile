import { Ionicons } from '@expo/vector-icons';

export interface FilterOption {
  id: string;
  label: string;
  value: any;
  count?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
}

export interface FilterSection {
  id: string;
  title: string;
  type: 'single' | 'multiple' | 'toggle' | 'range' | 'date' | 'search';
  options?: FilterOption[];
  selectedIds?: string[];
  selectedId?: string;
  toggleValue?: boolean;
  rangeValue?: { min: number | string; max: number | string };
  min?: number;
  max?: number;
  step?: number;
  searchValue?: string;
  searchPlaceholder?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  expanded?: boolean;
}

export interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  sections: FilterSection[];
  onApply: (sections: FilterSection[]) => void;
  onReset?: () => void;
  title?: string;
  showCount?: boolean;
  applyButtonText?: string;
  resetButtonText?: string;
  cancelButtonText?: string;
  maxHeight?: number;
}
