// StatCardStyles.ts
import { StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const useStatCardStyles = ({ color, trend, compact }: any) => {
  const { colors } = useTheme();
  // Fixed card dimensions
  const cardWidth = compact ? SCREEN_WIDTH * 0.42 : SCREEN_WIDTH * 0.44;
  const cardHeight = compact ? 100 : 110;

  const styles = StyleSheet.create({
    card: {
      width: cardWidth,
      height: cardHeight,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: compact ? 10 : 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.surface + 'E6',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    iconContainer: {
      width: compact ? 44 : 48,
      height: compact ? 44 : 48,
      borderRadius: compact ? 10 : 12,
      backgroundColor: `${color}12`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    content: {
      flex: 1,
      height: '100%',
      justifyContent: 'center',
    },
    title: {
      fontSize: compact ? 10 : 11,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: 4,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      flexWrap: 'nowrap',
      gap: 6,
    },
    value: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      flexShrink: 1,
    },
    subtitle: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    trendContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: trend && trend > 0 ? colors.success + '12' : colors.error + '12',
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 10,
      gap: 2,
    },
    trendText: {
      fontSize: 9,
      fontWeight: '600',
      color: trend && trend > 0 ? colors.success : colors.error,
    },
  });

  return styles;
};
