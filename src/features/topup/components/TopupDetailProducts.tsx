import React from 'react';
import { View, FlatList, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/core/components';
import { createTopupDetailStyles } from '../styles/topupDetail.styles';
import { ProductsProps } from '../types/topupDetail.types';
import { TopupItem } from '../types/topup.types';
import { formatCurrency } from '@/shared/utils/currenty.utils';

export const TopupDetailProducts: React.FC<ProductsProps> = ({ items, colors }) => {
  const styles = createTopupDetailStyles(colors);

  const renderProductItem = ({ item, index }: { item: TopupItem; index: number }) => {
    const requestedCases = item.requestedCaseQty || 0;
    const requestedPieces = item.requestedPieceQty || 0;
    const requestedValue = item.requestedValue || 0;

    const approvedCases = item.approvedCaseQty || 0;
    const approvedPieces = item.approvedPieceQty || 0;
    const approvedValue = item.approvedValue || 0;

    const hasApproved = approvedCases > 0 || approvedPieces > 0;
    const isFullyApproved =
      hasApproved && approvedCases === requestedCases && approvedPieces === requestedPieces;

    // Format as "1C,1P"
    const requestedShort = `${requestedCases}C,${requestedPieces}P`;
    const approvedShort = `${approvedCases}C,${approvedPieces}P`;

    return (
      <View style={styles.productItem}>
        <View style={styles.productHeader}>
          <View style={[styles.productIndex, { backgroundColor: colors.primary + '10' }]}>
            <AppText style={[styles.productIndexText, { color: colors.primary }]}>
              {index + 1}
            </AppText>
          </View>
          <AppText style={styles.productName} numberOfLines={2}>
            {item.productName}
          </AppText>
          {hasApproved && (
            <View
              style={[
                styles.productStatusBadge,
                {
                  backgroundColor: isFullyApproved ? colors.success + '15' : colors.warning + '15',
                },
              ]}
            >
              <AppText
                style={[
                  styles.productStatusText,
                  { color: isFullyApproved ? colors.success : colors.warning },
                ]}
              >
                {isFullyApproved ? '✓' : '~'}
              </AppText>
            </View>
          )}
        </View>

        {/* Single line: Req: 1C,1P → App: 1C,1P */}
        <View style={styles.productSingleLine}>
          <View style={styles.productReqSection}>
            <MaterialCommunityIcons name="cube-outline" size={10} color={colors.textTertiary} />
            <AppText style={styles.productReqText}>{requestedShort}</AppText>
            <AppText style={styles.productPriceText}>{formatCurrency(requestedValue)}</AppText>
          </View>

          {hasApproved && (
            <>
              <Ionicons name="arrow-forward" size={10} color={colors.textTertiary} />
              <View style={styles.productAppSection}>
                <MaterialCommunityIcons name="check-circle" size={10} color={colors.success} />
                <AppText style={[styles.productAppText, { color: colors.success }]}>
                  {approvedShort}
                </AppText>
                <AppText style={[styles.productPriceText, { color: colors.success }]}>
                  {formatCurrency(approvedValue)}
                </AppText>
              </View>
            </>
          )}
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
      keyExtractor={(item, index) => item._id || index.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.productsList}
      initialNumToRender={15}
      maxToRenderPerBatch={15}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
};
