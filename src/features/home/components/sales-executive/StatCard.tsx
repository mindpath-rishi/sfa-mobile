// StatCard.tsx
import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/core/components';
import { useStatCardStyles } from '../../styles/StatCardtyles';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
  trend?: number;
  loading?: boolean;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  loading = false,
  onPress,
}) => {
  const styles = useStatCardStyles({ color, trend });

  const CardContent = () => (
    <View style={styles.card}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={color} />
        </View>
      )}

      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon as any} size={28} color={color} />
      </View>

      <View style={styles.content}>
        <AppText style={styles.title}>{title}</AppText>
        <AppText style={styles.value}>{value}</AppText>

        {subtitle && <AppText style={styles.subtitle}>{subtitle}</AppText>}

        {trend !== undefined && trend !== 0 && (
          <View style={styles.trendContainer}>
            <MaterialCommunityIcons
              name={trend > 0 ? 'arrow-up' : 'arrow-down'}
              size={14}
              color={trend > 0 ? '#10B981' : '#EF4444'}
            />
            <AppText style={[styles.trendText, { color: trend > 0 ? '#10B981' : '#EF4444' }]}>
              {trend > 0 ? '+' : ''}
              {trend}%
            </AppText>
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};
