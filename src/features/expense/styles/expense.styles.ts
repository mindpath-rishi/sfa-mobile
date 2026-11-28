import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export const useExpenseStyles = () => {
  const { colors } = useTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: { padding: 16, paddingBottom: 32, gap: 12 },
        card: {
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 14,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        cardTitle: { color: colors.textPrimary, marginBottom: 10 },
        row: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 6,
        },
        label: { color: colors.textSecondary },
        value: { color: colors.textPrimary },
        divider: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.divider,
          marginVertical: 6,
        },
        totalValue: { color: colors.primary },
        chip: {
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 999,
          alignSelf: 'flex-start',
        },
        chipText: { fontSize: 11 },
        notice: {
          backgroundColor: colors.warning + '18',
          borderRadius: 10,
          padding: 12,
        },
        noticeText: { color: colors.warningDark ?? colors.warning },
        muted: { color: colors.textTertiary },
        historyItem: {
          paddingVertical: 10,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.divider,
          gap: 4,
        },
      }),
    [colors],
  );
};
