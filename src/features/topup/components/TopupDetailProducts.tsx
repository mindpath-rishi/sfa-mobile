import React from 'react';
import { View, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/core/components';
import { createTopupDetailStyles } from '../styles/topupDetail.styles';
import { ProductsProps } from '../types/topupDetail.types';
import { TopupItem } from '../types/topup.types';
import { formatCurrency } from '@/shared/utils/currenty.utils';
import { formatWeight } from '../utils/topup.utils';

export const TopupDetailProducts: React.FC<ProductsProps> = ({ items, colors }) => {
  const styles = createTopupDetailStyles(colors);

  const renderProductItem = ({ item, index }: { item: TopupItem; index: number }) => {
    const cases = item.requestedCaseQty;
    const pieces = item.requestedPieceQty;
    const value = item.requestedValue;
    const weight = item.requestedWeight;

    return (
      <View style={[styles.productRow, { borderBottomColor: colors.divider }]}>
        <View style={styles.productLeft}>
          <View style={[styles.productIndex, { backgroundColor: colors.primary + '10' }]}>
            <AppText style={[styles.productIndexText, { color: colors.primary }]}>
              {index + 1}
            </AppText>
          </View>
        </View>
        <View style={styles.productCenter}>
          <AppText style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>
            {item.productName}
          </AppText>
          <View style={styles.productDetails}>
            {cases > 0 && (
              <View style={styles.productDetail}>
                <MaterialCommunityIcons name="cube-outline" size={12} color={colors.textTertiary} />
                <AppText style={[styles.productDetailText, { color: colors.textSecondary }]}>
                  {cases} cases
                </AppText>
              </View>
            )}
            {pieces > 0 && (
              <View style={styles.productDetail}>
                <MaterialCommunityIcons
                  name="layers-outline"
                  size={12}
                  color={colors.textTertiary}
                />
                <AppText style={[styles.productDetailText, { color: colors.textSecondary }]}>
                  {pieces} pcs
                </AppText>
              </View>
            )}
          </View>
        </View>
        <View style={styles.productRight}>
          <AppText style={[styles.productValue, { color: colors.warning }]}>
            {formatCurrency(value)}
          </AppText>
          <AppText style={[styles.productWeight, { color: colors.textTertiary }]}>
            {formatWeight(weight)}
          </AppText>
        </View>
      </View>
    );
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="cube-outline" size={48} color={colors.textTertiary} />
        <AppText style={[styles.emptyText, { color: colors.textSecondary }]}>
          No items found
        </AppText>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      renderItem={renderProductItem}
      keyExtractor={(item) => item._id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
};
