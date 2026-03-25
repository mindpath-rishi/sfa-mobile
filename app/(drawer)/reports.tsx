import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export default function ReportsScreen() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '600' }}>
          Sales Report
        </Text>
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Total Sales: $12,345</Text>
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
        }}
      >
        <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '600' }}>
          User Activity
        </Text>
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Active Users: 1,234</Text>
      </View>
    </View>
  );
}
