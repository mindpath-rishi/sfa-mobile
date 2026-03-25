// src/core/components/Accordion/Accordion.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../Text/Text';
import { AccordionProps } from './Accordion.types';
import { useAccordionStyles } from './Accordion.styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const Accordion: React.FC<AccordionProps> = ({
  items,
  multiple = false,
  defaultExpanded = [],
  variant = 'default',
  showIcon = true,
  iconPosition = 'right',
  style,
  itemStyle,
  titleStyle,
  contentStyle,
  testID = 'accordion',
}) => {
  const { colors } = useTheme();
  const styles = useAccordionStyles(variant, style);
  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpanded);

  const toggleItem = (id: string) => {
    if (multiple) {
      setExpandedIds((prev) =>
        prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
      );
    } else {
      setExpandedIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  const renderIcon = (isExpanded: boolean) => {
    if (!showIcon) return null;

    return (
      <Ionicons
        name={isExpanded ? 'chevron-up' : 'chevron-down'}
        size={20}
        color={colors.textSecondary}
        style={styles.icon}
      />
    );
  };

  return (
    <View style={styles.container} testID={testID}>
      {items.map((item, index) => {
        const isExpanded = expandedIds.includes(item.id);
        const isLast = index === items.length - 1;

        return (
          <View key={item.id} style={[styles.itemContainer, itemStyle]}>
            <TouchableOpacity
              onPress={() => toggleItem(item.id)}
              activeOpacity={0.7}
              testID={`${testID}-item-${item.id}`}
            >
              <View style={styles.header}>
                <View style={styles.titleContainer}>
                  {showIcon && iconPosition === 'left' && renderIcon(isExpanded)}
                  <Text style={[styles.title, titleStyle]}>{item.title}</Text>
                </View>

                {showIcon && iconPosition === 'right' && renderIcon(isExpanded)}
              </View>
            </TouchableOpacity>

            {isExpanded && <View style={[styles.content, contentStyle]}>{item.content}</View>}

            {!isLast && variant === 'default' && <View style={styles.divider} />}
          </View>
        );
      })}
    </View>
  );
};
