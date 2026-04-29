import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/core/components';

type StatusChipProps = {
  label: string;
  color: string;
  backgroundColor?: string;
  showDot?: boolean;
  testID?: string;
};

export function StatusChip({
  label,
  color,
  backgroundColor,
  showDot = true,
  testID = 'status-chip',
}: StatusChipProps) {
  return (
    <View
      testID={testID}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        backgroundColor: backgroundColor ?? `${color}12`,
      }}
    >
      {showDot ? (
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
      ) : null}
      <AppText style={{ fontSize: 10, fontWeight: '600', color }}>{label}</AppText>
    </View>
  );
}

