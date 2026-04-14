// DayEndSummaryModal.tsx
import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { View, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppModal, AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { useDayEndSummaryModalStyles } from '../../styles/DayEndSummaryModal.styles';
import { LinearGradient } from 'expo-linear-gradient';

interface DayEndSummaryModalProps {
  visible: boolean;
  data?: {
    summary: {
      totalProducts: number;
      stock: {
        openingQty: number;
        openingCases: number;
        openingPieces: number;
        inQty: number;
        inCases: number;
        inPieces: number;
        outQty: number;
        outCases: number;
        outPieces: number;
        adjustmentQty: number;
        closingQty: number;
        closingCases: number;
        closingPieces: number;
      };
      value: {
        totalValue: number;
        totalWeight: number;
        saleTotal: number;
        leftStockTotal: number;
      };
      analytics: {
        totalStockMoved: number;
        expectedClosing: number;
        variance: number;
      };
    };
    products: Array<{
      productId: string;
      productName: string;
      unitQtyInCase: number;
      openingQty: number;
      openingCases: number;
      openingPieces: number;
      inQty: number;
      inCases: number;
      inPieces: number;
      outQty: number;
      outCases: number;
      outPieces: number;
      closingQty: number;
      closingCases: number;
      closingPieces: number;
      totalValue: number;
      totalWeight: number;
      saleValue: number;
      leftStockValue: number;
    }>;
  };
  onClose: () => void;
  onProceed?: () => void;
}

export const DayEndSummaryModal: React.FC<DayEndSummaryModalProps> = ({
  visible,
  data,
  onClose,
  onProceed,
}) => {
  const styles = useDayEndSummaryModalStyles();
  const { colors } = useTheme();

  const opacityAnim = useState(new Animated.Value(0))[0];

  const formatCurrency = useCallback((value: number) => {
    if (value >= 1000000) {
      return `ZMW ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `ZMW ${(value / 1000).toFixed(1)}K`;
    }
    return `ZMW ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, []);

  const formatStock = useCallback((cases: number, pieces: number) => {
    const parts = [];
    if (cases > 0) parts.push(`${cases} Case${cases > 1 ? 's' : ''}`);
    if (pieces > 0) parts.push(`${pieces} Pcs`);
    return parts.length > 0 ? parts.join(' • ') : '-';
  }, []);

  useEffect(() => {
    if (visible && data) {
      opacityAnim.setValue(0);
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, data, opacityAnim]);

  const summaryStats = useMemo(() => {
    if (!data?.summary) return [];

    const { stock, value } = data.summary;

    return [
      {
        id: 'sold',
        label: 'Quantity Sold',
        value: formatStock(stock.outCases, stock.outPieces),
        icon: 'trending-up',
        color: colors.warning,
      },
      {
        id: 'sales',
        label: 'Sales Value',
        value: formatCurrency(value.saleTotal),
        icon: 'cash',
        color: colors.success,
      },
      {
        id: 'remaining',
        label: 'Remaining Stock',
        value: formatStock(stock.closingCases, stock.closingPieces),
        icon: 'check-circle',
        color: colors.info,
      },
      {
        id: 'remainingValue',
        label: 'Remaining Value',
        value: formatCurrency(value.leftStockTotal),
        icon: 'currency-usd',
        color: colors.info,
      },
    ];
  }, [data, colors, formatCurrency, formatStock]);

  const renderSummaryCard = ({ item }: { item: (typeof summaryStats)[0] }) => (
    <Animated.View
      style={[
        styles.summaryCard,
        {
          opacity: opacityAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
          transform: [
            {
              translateY: opacityAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [15, 0],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={[colors.surface, colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.summaryGradient}
      >
        <View style={[styles.summaryIcon, { backgroundColor: item.color + '10' }]}>
          <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
        </View>
        <View style={styles.summaryContent}>
          <AppText style={[styles.summaryValue, { color: item.color }]}>{item.value}</AppText>
          <AppText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            {item.label}
          </AppText>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderProductItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      style={[
        styles.productItem,
        {
          opacity: opacityAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
          transform: [
            {
              translateY: opacityAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.productHeader}>
        <View style={styles.productNumber}>
          <AppText style={[styles.productNumberText, { color: colors.primary }]}>
            {index + 1}
          </AppText>
        </View>
        <View style={styles.productInfo}>
          <AppText style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>
            {item.productName}
          </AppText>
          <View style={styles.productMeta}>
            <MaterialCommunityIcons name="barcode" size={11} color={colors.textTertiary} />
            <AppText style={[styles.productId, { color: colors.textSecondary }]}>
              {item.productId}
            </AppText>
            <View style={styles.dot} />
            <MaterialCommunityIcons name="cube-outline" size={11} color={colors.textTertiary} />
            <AppText style={[styles.productUnit, { color: colors.textSecondary }]}>
              {item.unitQtyInCase} Pcs/Case
            </AppText>
          </View>
        </View>
      </View>

      {/* Stats Row - Sold & Remaining */}
      <View style={styles.statsRow}>
        <View style={[styles.statChip, { backgroundColor: colors.warning + '8' }]}>
          <MaterialCommunityIcons name="arrow-up-bold" size={12} color={colors.warning} />
          <AppText style={[styles.statChipLabel, { color: colors.textSecondary }]}>Sold</AppText>
          <AppText style={[styles.statChipValue, { color: colors.warning }]}>
            {formatStock(item.outCases, item.outPieces)}
          </AppText>
        </View>
        <View style={[styles.statChip, { backgroundColor: colors.success + '8' }]}>
          <MaterialCommunityIcons name="check-circle" size={12} color={colors.success} />
          <AppText style={[styles.statChipLabel, { color: colors.textSecondary }]}>Left</AppText>
          <AppText style={[styles.statChipValue, { color: colors.success }]}>
            {formatStock(item.closingCases, item.closingPieces)}
          </AppText>
        </View>
      </View>

      {/* Value Row - Sale Value & Left Value */}
      <View style={styles.valueRow}>
        <View style={styles.valueChip}>
          <MaterialCommunityIcons name="cash" size={12} color={colors.success} />
          <AppText style={[styles.valueChipLabel, { color: colors.textSecondary }]}>Sale</AppText>
          <AppText style={[styles.valueChipAmount, { color: colors.success }]}>
            {formatCurrency(item.saleValue)}
          </AppText>
        </View>
        <View style={styles.valueChip}>
          <MaterialCommunityIcons name="currency-usd" size={12} color={colors.info} />
          <AppText style={[styles.valueChipLabel, { color: colors.textSecondary }]}>
            Left Value
          </AppText>
          <AppText style={[styles.valueChipAmount, { color: colors.info }]}>
            {formatCurrency(item.leftStockValue)}
          </AppText>
        </View>
      </View>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
        <MaterialCommunityIcons
          name="clipboard-list-outline"
          size={48}
          color={colors.textSecondary}
        />
      </View>
      <AppText style={[styles.emptyTitle, { color: colors.textSecondary }]}>
        No Data Available
      </AppText>
      <AppText style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
        No sales recorded for this period
      </AppText>
    </View>
  );

  const renderContent = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {/* Date Header */}
      {/* <View style={styles.dateSection}>
        <LinearGradient
          colors={[colors.primary + '10', colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.dateBadge}
        >
          <MaterialCommunityIcons name="calendar-today" size={16} color={colors.primary} />
          <AppText style={[styles.dateText, { color: colors.textPrimary }]}>
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </AppText>
        </LinearGradient>
      </View> */}

      {/* Summary Grid */}
      <View style={styles.summaryGrid}>
        {summaryStats.map((item) => (
          <React.Fragment key={item.id}>{renderSummaryCard({ item })}</React.Fragment>
        ))}
      </View>

      {/* Products Section */}
      <View style={styles.productsSection}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="format-list-bulleted" size={18} color={colors.primary} />
          <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Products</AppText>
          <View style={[styles.productBadge, { backgroundColor: colors.primary + '10' }]}>
            <AppText style={[styles.productBadgeText, { color: colors.primary }]}>
              {data?.products?.length || 0}
            </AppText>
          </View>
        </View>

        {data?.products && data.products.length > 0 ? (
          <View style={styles.productsList}>
            {data.products.map((item, index) => (
              <View key={item.productId}>{renderProductItem({ item, index })}</View>
            ))}
          </View>
        ) : (
          renderEmptyState()
        )}
      </View>
    </ScrollView>
  );

  const renderFooter = () => (
    <View style={[styles.footer, { borderTopColor: colors.border }]}>
      <TouchableOpacity
        onPress={onClose}
        style={[styles.closeButton, { borderColor: colors.border }]}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="close" size={18} color={colors.textSecondary} />
        <AppText style={[styles.closeButtonText, { color: colors.textSecondary }]}>Close</AppText>
      </TouchableOpacity>

      {onProceed && (
        <TouchableOpacity onPress={onProceed} style={styles.confirmButton} activeOpacity={0.85}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark || colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.confirmGradient}
          >
            <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />
            <AppText style={styles.confirmButtonText}>Confirm</AppText>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Day End Summary"
      size="full"
      position="bottom"
      animation="slide"
      showCloseButton={true}
      showBackdrop={true}
      closeOnBackdropPress={true}
      keyboardAvoiding={true}
      scrollable={false}
      contentStyle={styles.modalContent}
      style={styles.modalContainer}
    >
      {renderContent()}
      {renderFooter()}
    </AppModal>
  );
};
