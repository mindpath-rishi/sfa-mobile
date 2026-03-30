// components/ui/SectionHeader/SectionHeader.tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppText } from '@/core/components';
import { useSectionHeaderStyles } from './SectionHeader.styles';
import { SectionHeaderProps } from './SectionHeader.types';

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  variant = 'default',
  alignment = 'left',
  showCount = false,
  count,
  showViewAll = false,
  viewAllText = 'View All',
  onViewAll,
  subtitle,
  leftIcon,
  rightIcon,
  style,
  titleStyle,
  subtitleStyle,
  countStyle,
  countTextStyle,
  viewAllStyle,
  testID = 'section-header',
}) => {
  const styles = useSectionHeaderStyles(variant, alignment);

  const getTitleStyle = () => {
    switch (variant) {
      case 'large':
        return styles.largeTitle;
      case 'small':
        return styles.smallTitle;
      case 'compact':
        return styles.compactTitle;
      default:
        return styles.defaultTitle;
    }
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.contentContainer}>
        <View style={styles.leftSection}>
          {leftIcon && <View style={[styles.icon, styles.leftIcon]}>{leftIcon}</View>}

          <View>
            <View style={styles.titleContainer}>
              <AppText style={[getTitleStyle(), titleStyle]}>{title}</AppText>
              {showCount && count !== undefined && (
                <View style={[styles.countBadge, countStyle]}>
                  <AppText style={[styles.countText, countTextStyle]}>{count}</AppText>
                </View>
              )}
            </View>

            {subtitle && <AppText style={[styles.subtitleText, subtitleStyle]}>{subtitle}</AppText>}
          </View>
        </View>

        <View style={styles.rightSection}>
          {rightIcon && <View style={[styles.icon, styles.rightIcon]}>{rightIcon}</View>}

          {showViewAll && onViewAll && (
            <TouchableOpacity onPress={onViewAll} activeOpacity={0.7} style={styles.viewAllButton}>
              <AppText style={[styles.viewAllText, viewAllStyle]}>{viewAllText}</AppText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};
