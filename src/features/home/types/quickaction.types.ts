import { Ionicons } from '@expo/vector-icons';

export interface QuickAction {
  // id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  color: string;
  badge?: number;
}

export interface QuickActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
  badge?: number;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  testID?: string;
}

export interface QuickActionsSectionProps {
  actions: QuickAction[];
  onPressAction: (route: string) => void;
}
