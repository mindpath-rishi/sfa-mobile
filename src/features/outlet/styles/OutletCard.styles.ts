import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useOutletCardStyles = () => {
  const { colors } = useTheme();
  const styleGenerator = createStyles((utils) => ({
    container: {
      marginHorizontal: utils.spacing[3],
      marginVertical: utils.spacing[1],
    } as ViewStyle,

    card: {
      backgroundColor: colors.background,
      borderRadius: 20,
      overflow: 'hidden',
    } as ViewStyle,

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[3],
    } as ViewStyle,

    body: {
      flex: 1,
      minWidth: 0,
      gap: utils.spacing[1],
    } as ViewStyle,

    // ── Name row ──────────────────────────────
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: utils.spacing[2],
    } as ViewStyle,

    name: {
      fontSize: 14,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
      flex: 1,
      letterSpacing: -0.2,
    } as TextStyle,

    statusPill: {
      paddingHorizontal: 9,
      paddingVertical: 2,
      borderRadius: 20,
      flexShrink: 0,
    } as ViewStyle,

    statusLabel: {
      fontSize: 11,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    // ── Location row ──────────────────────────
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    } as ViewStyle,

    locationText: {
      fontSize: 12,
      color: colors.textSecondary,
      flex: 1,
    } as TextStyle,

    distancePill: {
      backgroundColor: colors.primary + '14',
      paddingHorizontal: 7,
      paddingVertical: 1,
      borderRadius: 5,
      flexShrink: 0,
    } as ViewStyle,

    distanceText: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,

    // ── Chips row ─────────────────────────────
    chipsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    } as ViewStyle,

    chipFixed: {
      backgroundColor: colors.surface || colors.border + '28',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 5,
      flexShrink: 0,
    } as ViewStyle,

    chipFlex: {
      backgroundColor: colors.surface || colors.border + '28',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 5,
      flex: 1,
      minWidth: 0,
    } as ViewStyle,

    chipText: {
      fontSize: 11,
      color: colors.textTertiary,
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
