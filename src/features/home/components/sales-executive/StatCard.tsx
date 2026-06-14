// StatCard.tsx - Horizontal Scroll Version
import React from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 220; // Fixed width for horizontal scrolling
const CARD_HEIGHT = 118;

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
  trend?: number;
  progress?: number;
  badge?: number;
  compact?: boolean;
  fullWidth?: boolean;
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
  fullWidth = false,
  loading = false,
  onPress,
}) => {
  const { colors } = useTheme();

  const formatValue = (val: string | number): string => {
    const num = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val;
    if (isNaN(num)) return String(val);
    return num.toLocaleString();
  };

  const getFontSize = (value: string): number => {
    if (value.length > 14) return 14;
    if (value.length > 10) return 16;
    if (value.length > 7) return 20;
    return 24;
  };

  const subtitleParts = subtitle?.includes(':') ? subtitle.split(/:(.*)/s) : null;

  const CardContent = () => (
    <View
      style={[
        styles.card,
        fullWidth && styles.fullWidthCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={color} />
        </View>
      )}

      <View style={[styles.iconContainer, { backgroundColor: color + '12' }]}>
        <MaterialCommunityIcons name={icon as any} size={24} color={color} />
      </View>

      <View style={styles.content}>
        <AppText style={[styles.title, { color: colors.textSecondary }]} numberOfLines={1}>
          {title}
        </AppText>

        <View style={styles.valueSection}>
          <AppText
            style={[styles.value, { fontSize: getFontSize(formatValue(value)) }]}
            color={colors.textPrimary}
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
          <AppText style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={2}>
            {subtitleParts ? (
              <>
                {subtitleParts[0]}:{' '}
                <AppText style={[styles.subtitleValue, { color: colors.textPrimary }]}>
                  {subtitleParts[1]?.trim() ?? ''}
                </AppText>
              </>
            ) : (
              subtitle
            )}
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
        <StatCard key={item.id} {...item} onPress={() => onCardPress?.(item)} />
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
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 0,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  fullWidthCard: {
    width: '100%',
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
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 4,
  },
  valueSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  value: {
    flexBasis: '100%',
    flexShrink: 1,
    fontWeight: '700',
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
    fontSize: 12,
    lineHeight: 17,
  },
  subtitleValue: {
    fontSize: 13,
    fontWeight: '700',
  },
});
