import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';

interface Props {
  searchQuery: string;
}

export const EmptyState: React.FC<Props> = ({ searchQuery }) => {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.border + '30',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Ionicons name="people" size={40} color={colors.textTertiary} />
      </View>
      <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
        No Customers Found
      </Text>
      <Text
        style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center', marginBottom: 16 }}
      >
        {searchQuery ? `No results for "${searchQuery}"` : "You haven't added any customers yet"}
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>Add New Customer</Text>
      </TouchableOpacity>
    </View>
  );
};
