import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Skeleton } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';

type PageSkeletonProps = {
  variant?: 'list' | 'detail' | 'dashboard';
  rows?: number;
};

export const PageSkeleton = ({ variant = 'list', rows = 5 }: PageSkeletonProps) => {
  const { colors } = useTheme();

  if (variant === 'detail') {
    return (
      <ScrollView
        style={[styles.screen, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Skeleton height={150} width="100%" borderRadius={20} />
        <View style={styles.tabs}>
          <Skeleton height={36} width="46%" borderRadius={18} />
          <Skeleton height={36} width="46%" borderRadius={18} />
        </View>
        <Skeleton height={18} width="42%" borderRadius={8} />
        <Skeleton height={120} width="100%" borderRadius={14} />
        <Skeleton height={18} width="34%" borderRadius={8} />
        <View style={styles.grid}>
          <Skeleton height={96} width="48%" borderRadius={14} />
          <Skeleton height={96} width="48%" borderRadius={14} />
        </View>
      </ScrollView>
    );
  }

  if (variant === 'dashboard') {
    return (
      <ScrollView
        style={[styles.screen, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Skeleton height={82} width="100%" borderRadius={16} />
        <View style={styles.grid}>
          <Skeleton height={110} width="48%" borderRadius={14} />
          <Skeleton height={110} width="48%" borderRadius={14} />
        </View>
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} height={126} width="100%" borderRadius={14} />
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Skeleton height={44} width="100%" borderRadius={12} />
        {Array.from({ length: rows }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.listCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Skeleton height={48} width={48} variant="circle" />
            <View style={styles.listText}>
              <Skeleton height={16} width="72%" borderRadius={7} />
              <Skeleton height={12} width="48%" borderRadius={6} />
              <Skeleton height={10} width="88%" borderRadius={5} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 14 },
  tabs: { flexDirection: 'row', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  listCard: {
    minHeight: 96,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listText: { flex: 1, gap: 9 },
});
