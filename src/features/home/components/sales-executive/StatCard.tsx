// StatCard.tsx - Horizontal Scroll Version
import React from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/core/components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 160; // Fixed width for horizontal scrolling
const CARD_HEIGHT = 110;

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
  // Format large numbers
  const formatValue = (val: string | number): string => {
    const num = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val;
    if (isNaN(num)) return String(val);
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const getFontSize = (value: string): number => {
    if (value.length > 10) return 16;
    if (value.length > 7) return 18;
    return 22;
  };

  const CardContent = () => (
    <View style={[styles.card, { backgroundColor: '#FFF' }]}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={color} />
        </View>
      )}

      <View style={[styles.iconContainer, { backgroundColor: color + '12' }]}>
        <MaterialCommunityIcons name={icon as any} size={24} color={color} />
      </View>

      <View style={styles.content}>
        <AppText style={styles.title} numberOfLines={1}>
          {title}
        </AppText>
        
        <View style={styles.valueSection}>
          <AppText 
            style={[styles.value, { fontSize: getFontSize(formatValue(value)) }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
          >
            {formatValue(value)}
          </AppText>
          
          {trend !== undefined && trend !== 0 && (
            <View style={styles.trendWrapper}>
              <MaterialCommunityIcons
                name={trend > 0 ? 'arrow-up' : 'arrow-down'}
                size={10}
                color={trend > 0 ? '#10B981' : '#EF4444'}
              />
              <AppText style={[styles.trendText, { color: trend > 0 ? '#10B981' : '#EF4444' }]}>
                {Math.abs(trend)}%
              </AppText>
            </View>
          )}
        </View>
        
        {subtitle && (
          <AppText style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </AppText>
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

// Horizontal Scroll Container Component
interface StatCardScrollProps {
  data: Array<Omit<StatCardProps, 'onPress'> & { id: string }>;
  onCardPress?: (item: any) => void;
  showsHorizontalScrollIndicator?: boolean;
  contentContainerStyle?: any;
}

export const StatCardScroll: React.FC<StatCardScrollProps> = ({
  data,
  onCardPress,
  showsHorizontalScrollIndicator = false,
  contentContainerStyle,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      contentContainerStyle={[styles.scrollContainer, contentContainerStyle]}
      decelerationRate="fast"
      snapToInterval={CARD_WIDTH + 12}
      snapToAlignment="start"
    >
      {data.map((item) => (
        <StatCard
          key={item.id}
          {...item}
          onPress={() => onCardPress?.(item)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  valueSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  value: {
    fontWeight: '700',
    color: '#111827',
  },
  trendWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  trendText: {
    fontSize: 9,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 9,
    color: '#9CA3AF',
  },
});