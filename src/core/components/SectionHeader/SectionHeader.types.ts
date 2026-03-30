// components/ui/SectionHeader/SectionHeader.types.ts
import { ViewStyle, TextStyle } from 'react-native';

export type SectionHeaderVariant = 'default' | 'large' | 'small' | 'compact';
export type SectionHeaderAlignment = 'left' | 'center' | 'right';

export interface SectionHeaderProps {
  /** Title text */
  title: string;
  /** Visual variant of the header */
  variant?: SectionHeaderVariant;
  /** Text alignment */
  alignment?: SectionHeaderAlignment;
  /** Show count badge */
  showCount?: boolean;
  /** Count number to display */
  count?: number;
  /** Show view all button */
  showViewAll?: boolean;
  /** View all button text */
  viewAllText?: string;
  /** Callback when view all is pressed */
  onViewAll?: () => void;
  /** Optional subtitle */
  subtitle?: string;
  /** Optional icon on the left */
  leftIcon?: React.ReactNode;
  /** Optional icon on the right */
  rightIcon?: React.ReactNode;
  /** Additional styles for the container */
  style?: ViewStyle;
  /** Additional styles for the title text */
  titleStyle?: TextStyle;
  /** Additional styles for the subtitle */
  subtitleStyle?: TextStyle;
  /** Additional styles for the count badge */
  countStyle?: ViewStyle;
  /** Additional styles for the count text */
  countTextStyle?: TextStyle;
  /** Additional styles for view all button */
  viewAllStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

export interface SectionHeaderStyles {
  container: ViewStyle;
  contentContainer: ViewStyle;
  leftSection: ViewStyle;
  titleContainer: ViewStyle;
  baseTitle: TextStyle;
  defaultTitle: TextStyle;
  largeTitle: TextStyle;
  smallTitle: TextStyle;
  compactTitle: TextStyle;
  subtitleText: TextStyle;
  rightSection: ViewStyle;
  countBadge: ViewStyle;
  countText: TextStyle;
  viewAllButton: ViewStyle;
  viewAllText: TextStyle;
  icon: ViewStyle;
  leftIcon: ViewStyle;
  rightIcon: ViewStyle;
}
