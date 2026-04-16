// src/core/components/Header/Header.types.ts
import { ReactNode } from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface HeaderProps {
  // Basic props
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showMenu?: boolean;

  // Icons
  rightIcon?: keyof typeof Ionicons.glyphMap;
  secondRightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  onSecondRightPress?: () => void;

  // Custom components
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  centerComponent?: ReactNode;

  // Styling
  elevated?: boolean;
  centeredTitle?: boolean;
  transparent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showBorder?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;

  // Search
  showSearch?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (text: string) => void;
  onSearchSubmit?: () => void;

  // Badge
  badgeCount?: number;
  badgeColor?: string;

  // Avatar
  avatar?: boolean;
  avatarText?: string;

  // Testing
  testID?: string;

  // Filter props for customers and products
  showFilter?: boolean;
  filterActive?: boolean;
  filterCount?: number;
  onFilterPress?: () => void;
  filterIcon?: keyof typeof Ionicons.glyphMap;
  filterActiveIcon?: keyof typeof Ionicons.glyphMap;
  filterPosition?: 'left' | 'right';
  headerBackgroundColor?: string;
}
