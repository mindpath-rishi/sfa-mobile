import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export const TopupCardSkeleton = () => {
  const { colors } = useTheme();

  const skeletonColor = colors.divider + '40';

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginBottom: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.divider,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <View style={{ width: 80, height: 12, backgroundColor: skeletonColor, borderRadius: 6 }} />
        <View style={{ width: 60, height: 14, backgroundColor: skeletonColor, borderRadius: 8 }} />
      </View>

      {/* Amount */}
      <View
        style={{
          width: '40%',
          height: 20,
          backgroundColor: skeletonColor,
          borderRadius: 6,
          marginBottom: 12,
        }}
      />

      {/* Requested / Approved */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View
          style={{
            flex: 1,
            height: 50,
            backgroundColor: skeletonColor,
            borderRadius: 12,
          }}
        />
        <View
          style={{
            flex: 1,
            height: 50,
            backgroundColor: skeletonColor,
            borderRadius: 12,
          }}
        />
      </View>

      {/* Footer */}
      <View style={{ marginTop: 12 }}>
        <View
          style={{
            width: '70%',
            height: 10,
            backgroundColor: skeletonColor,
            borderRadius: 6,
            marginBottom: 6,
          }}
        />
        <View
          style={{
            width: '40%',
            height: 10,
            backgroundColor: skeletonColor,
            borderRadius: 6,
          }}
        />
      </View>
    </View>
  );
};