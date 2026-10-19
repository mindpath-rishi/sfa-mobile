/**
 * Route screen loading skeleton and empty / error states.
 */
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Skeleton } from '@/core/components';

export const LoadingSkeleton = ({ colors, styles }: any) => (
  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
    <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Skeleton height={14} width={120} borderRadius={7} />
          <Skeleton height={26} width={54} borderRadius={10} />
        </View>
        <Skeleton height={8} width="100%" borderRadius={4} />
        <Skeleton height={12} width={168} borderRadius={6} style={{ marginTop: 12 }} />
      </View>

      <View style={styles.headerMetricsGrid}>
        {[1, 2, 3, 4].map((item) => (
          <React.Fragment key={item}>
            <View style={styles.headerMetricItem}>
              <Skeleton height={16} width={16} variant="circle" />
              <Skeleton height={18} width={44} borderRadius={8} style={{ marginTop: 8 }} />
              <Skeleton height={10} width={38} borderRadius={5} style={{ marginTop: 8 }} />
            </View>
            {item < 4 && <View style={styles.headerMetricDivider} />}
          </React.Fragment>
        ))}
      </View>
    </LinearGradient>

    <View style={styles.searchBarContainer}>
      <Skeleton height={44} width="83%" borderRadius={12} />
      <Skeleton height={44} width={44} borderRadius={12} />
    </View>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
    >
      {[72, 90, 104, 96].map((item) => (
        <Skeleton
          key={item}
          height={34}
          width={item}
          borderRadius={14}
          style={{ marginRight: 12 }}
        />
      ))}
    </ScrollView>

    <View style={styles.outletList}>
      {[1, 2, 3, 4, 5].map((item) => (
        <View key={item} style={styles.expandableCard}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Skeleton height={44} width={44} variant="circle" />
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Skeleton height={16} width="64%" borderRadius={8} />
                  <Skeleton height={24} width={64} borderRadius={8} />
                </View>
                <View style={styles.detailsRow}>
                  <Skeleton height={12} width="58%" borderRadius={6} />
                  <Skeleton height={22} width={72} borderRadius={11} />
                </View>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  </ScrollView>
);

export const EmptyStateComponent = ({
  icon,
  title,
  message,
  actionText,
  onAction,
  colors,
  styles,
}: any) => (
  <View style={styles.emptyState}>
    <Ionicons name={icon} size={64} color={colors.textSecondary} />
    <Text style={[styles.emptyStateTitle, { color: colors.textPrimary }]}>{title}</Text>
    <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>{message}</Text>
    {actionText && onAction && (
      <TouchableOpacity onPress={onAction} style={styles.emptyStateButton}>
        <Text style={[styles.emptyStateButtonText, { color: colors.primary }]}>{actionText}</Text>
      </TouchableOpacity>
    )}
  </View>
);
