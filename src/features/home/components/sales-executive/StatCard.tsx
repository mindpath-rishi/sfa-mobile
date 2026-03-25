import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatCardProps } from '../../types/stat.types';
import { useStatCardStyles } from '../../styles/StatCardtyles';
import { AppText } from '@/core/components';

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
  const styles = useStatCardStyles({ color, trend });

  return (
    <Animated.View entering={FadeInDown.delay(100).springify()} style={{ flex: 1 }}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon as any} size={16} color={color} />
          </View>
          <AppText style={styles.title}>{title}</AppText>
        </View>

        <View style={styles.valueRow}>
          <AppText style={styles.value}>{value}</AppText>

          {trend !== undefined && (
            <View style={styles.trendBadge}>
              <AppText style={styles.trendIcon}>{trend > 0 ? '↑' : '↓'}</AppText>
              <AppText style={styles.trendText}>{Math.abs(trend)}%</AppText>
            </View>
          )}
        </View>

        <View style={[styles.footerLine, { backgroundColor: color + '30' }]} />
      </View>
    </Animated.View>
  );
};
