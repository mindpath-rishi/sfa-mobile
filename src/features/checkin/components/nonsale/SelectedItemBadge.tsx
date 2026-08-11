// components/checkin/SelectedCategoryBadge.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';

interface SelectedCategoryBadgeProps {
  categoryId: string;
  categoryTitle: string;
  categoryColor: string;
  categoryIcon: string;
  onPressChange: () => void;
}

export const SelectedCategoryBadge: React.FC<SelectedCategoryBadgeProps> = ({
  categoryTitle,
  categoryColor,
  categoryIcon,
  onPressChange,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: categoryColor + '10',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
        marginTop: 8,
        borderWidth: 0.5,
        borderColor: categoryColor + '30',
      }}
    >
      {/* Left section - Icon and Category Info */}
      <View
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, marginRight: 12 }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: categoryColor + '20',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0, // Prevent icon from shrinking
          }}
        >
          <Ionicons name={categoryIcon as any} size={28} color={categoryColor} />
        </View>

        <View style={{ flex: 1, flexShrink: 1 }}>
          {/* Allow text container to shrink */}
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>Selected Category</Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: categoryColor,
              flexShrink: 1, // Allow text to shrink
              flexWrap: 'wrap', // Wrap long text
            }}
            numberOfLines={2} // Limit to 2 lines max
          >
            {categoryTitle}
          </Text>
        </View>
      </View>

      {/* Right section - Change Button */}
      <TouchableOpacity
        onPress={onPressChange}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
          backgroundColor: colors.surface,
          borderWidth: 0.5,
          borderColor: colors.border,
          flexShrink: 0,
        }}
      >
        <Text style={{ fontSize: 12, color: colors.textSecondary }}>Change</Text>
      </TouchableOpacity>
    </View>
  );
};
