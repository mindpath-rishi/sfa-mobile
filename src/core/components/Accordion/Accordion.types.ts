// src/core/components/Accordion/Accordion.types.ts
import { ViewStyle, TextStyle } from 'react-native';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  multiple?: boolean;
  defaultExpanded?: string[];
  variant?: 'default' | 'bordered' | 'separated';
  showIcon?: boolean;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  itemStyle?: ViewStyle;
  titleStyle?: TextStyle;
  contentStyle?: ViewStyle;
  testID?: string;
}
