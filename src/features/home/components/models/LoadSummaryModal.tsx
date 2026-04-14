// LoadSummaryModal.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, TouchableOpacity, FlatList, ActivityIndicator, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { LoadSummaryModalProps } from '../../types/loadSummaryModal.types';
import { useLoadSummaryModalStyles } from '../../styles/LoadSummaryModal.styles';
import { Modal } from '@/core/components/Modal/Modal';
import { vanService } from '@/shared/services/van.service';
import { useRouteStore } from '@/core/store/route.store';
import { AppModal, AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';

export const LoadSummaryModal: React.FC<LoadSummaryModalProps> = ({
  visible,
  data,
  onClose,
  onProceed,
}) => {
  const styles = useLoadSummaryModalStyles();
  const { colors } = useTheme();
  const van = useRouteStore.getState().van;

  const [vanStock, setVanStock] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalCases: 0,
    totalPiece: 0,
    totalValue: 0,
    totalNetWeight: 0,
  });

  // Animation for content entrance
  const opacityAnim = useState(new Animated.Value(0))[0];

  /* ============================
   * HELPERS
   * ============================ */

  const formatStock = useCallback((cases = 0, pieces = 0) => {
    return `${cases} Cases ${pieces} Pcs`;
  }, []);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value);
  }, []);

  const formatWeight = useCallback((weight: number) => {
    return `${weight.toFixed(2)} kg`;
  }, []);

  // Check if item is out of stock
  const isOutOfStock = useCallback((item: any) => {
    return (!item.cases || item.cases === 0) && (!item.pieces || item.pieces === 0);
  }, []);

  // Memoized summary stats for quick reference
  const summaryStats = useMemo(
    () => [
      {
        id: 'cases',
        label: 'Total Cases',
        value: summary.totalCases,
        icon: 'package-variant',
        color: colors.primary,
      },
      {
        id: 'pieces',
        label: 'Total Pieces',
        value: summary.totalPiece,
        icon: 'package-multiple',
        color: colors.success,
      },
      {
        id: 'value',
        label: 'Total Value',
        value: formatCurrency(summary.totalValue),
        icon: 'currency-inr',
        color: colors.warning,
      },
      {
        id: 'weight',
        label: 'Net Weight',
        value: formatWeight(summary.totalNetWeight),
        icon: 'weight',
        color: colors.info,
      },
    ],
    [summary, formatCurrency, formatWeight, colors],
  );

  /* ============================
   * API CALL
   * ============================ */

  const getVanStock = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!van?.vanId) {
        setVanStock([]);
        return;
      }

      const response = await vanService.fetchVanStocks(van.vanId);
      const resData = response?.data;

      setSummary({
        totalCases: resData?.totalCases || 0,
        totalPiece: resData?.totalPieces || 0,
        totalValue: resData?.totalValue || 0,
        totalNetWeight: resData?.totalNetWeight || 0,
      });

      // Sort products by name for better UX
      const sortedProducts = (resData?.products || []).sort((a: any, b: any) =>
        a.name.localeCompare(b.name),
      );
      setVanStock(sortedProducts);

      // Trigger animation
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.log('Error fetching van stock:', error);
      setVanStock([]);
    } finally {
      setIsLoading(false);
    }
  }, [van, opacityAnim]);

  useEffect(() => {
    if (visible) {
      opacityAnim.setValue(0);
      getVanStock();
    }
  }, [visible, getVanStock, opacityAnim]);

  /* ============================
   * RENDER SUMMARY STAT CARD
   * ============================ */

  const renderSummaryStat = ({
    item,
    index,
  }: {
    item: (typeof summaryStats)[0];
    index: number;
  }) => (
    <Animated.View
      style={[
        styles.statCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: opacityAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
          transform: [
            {
              translateY: opacityAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.statIconContainer}>
        <View style={[styles.statIconWrapper, { backgroundColor: item.color + '15' }]}>
          <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
        </View>
      </View>

      <View style={styles.statContent}>
        <AppText style={[styles.statLabel, { color: colors.textSecondary }]}>{item.label}</AppText>
        <AppText style={[styles.statValue, { color: item.color }]}>
          {typeof item.value === 'number' ? item.value.toLocaleString('en-IN') : item.value}
        </AppText>
      </View>
    </Animated.View>
  );

  /* ============================
   * RENDER SKU ITEM - WITH STOCK AVAILABILITY
   * ============================ */

  const renderSkuItem = ({ item, index }: { item: any; index: number }) => {
    const outOfStock = isOutOfStock(item);

    return (
      <Animated.View
        style={[
          styles.skuCard,
          {
            backgroundColor: colors.surface,
            borderColor: outOfStock ? colors.error + '40' : colors.border,
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
        {/* SKU Header - Compact Layout */}
        <View style={styles.skuHeaderCompact}>
          <View style={styles.skuLeftSection}>
            {/* Index Badge */}
            <View
              style={[
                styles.skuIndexBadgeCompact,
                {
                  backgroundColor: outOfStock ? colors.error + '15' : colors.primary + '15',
                  borderColor: outOfStock ? colors.error + '30' : colors.primary + '30',
                },
              ]}
            >
              <AppText
                style={[
                  styles.skuIndexTextCompact,
                  { color: outOfStock ? colors.error : colors.primary },
                ]}
              >
                {index + 1}
              </AppText>
            </View>

            {/* Product Info */}
            <View style={styles.skuProductInfo}>
              <AppText
                style={[
                  styles.skuNameCompact,
                  { color: outOfStock ? colors.textSecondary : colors.textPrimary },
                ]}
                numberOfLines={2}
              >
                {item.name}
              </AppText>
              {item.productSysCode && (
                <AppText style={[styles.skuCodeCompact, { color: colors.textSecondary }]}>
                  {item.productSysCode}
                </AppText>
              )}
            </View>
          </View>

          {/* Status Badge - Show Out of Stock or In Stock */}
          <View
            style={[
              styles.skuStatusBadge,
              { backgroundColor: outOfStock ? colors.error + '10' : colors.success + '10' },
            ]}
          >
            <MaterialCommunityIcons
              name={outOfStock ? 'close-circle' : 'check-circle'}
              size={14}
              color={outOfStock ? colors.error : colors.success}
            />
          </View>
        </View>

        {/* SKU Details Grid - Compact 2-Column Layout */}
        <View style={styles.skuDetailsGrid}>
          {/* Left Column - Stock */}
          <View style={styles.skuDetailItem}>
            <AppText style={[styles.skuDetailLabel, { color: colors.textSecondary }]}>
              Stock
            </AppText>
            {outOfStock ? (
              <View style={styles.outOfStockBadge}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={14}
                  color={colors.error}
                />
                <AppText style={[styles.outOfStockText, { color: colors.error }]}>
                  Out of Stock
                </AppText>
              </View>
            ) : (
              <AppText style={[styles.skuDetailValue, { color: colors.textPrimary }]}>
                {formatStock(item.cases, item.pieces)}
              </AppText>
            )}
          </View>

          {/* Right Column - Price (if available) */}
          {item.price ? (
            <View style={styles.skuDetailItem}>
              <AppText style={[styles.skuDetailLabel, { color: colors.textSecondary }]}>
                Price
              </AppText>
              <AppText
                style={[
                  styles.skuDetailValue,
                  { color: outOfStock ? colors.textSecondary : colors.primary, fontWeight: '600' },
                ]}
              >
                {formatCurrency(item.price)}
              </AppText>
            </View>
          ) : (
            <View style={styles.skuDetailItem}>
              <AppText style={[styles.skuDetailLabel, { color: colors.textSecondary }]}>
                Status
              </AppText>
              <AppText
                style={[
                  styles.skuDetailValue,
                  { color: outOfStock ? colors.error : colors.success },
                ]}
              >
                {outOfStock ? 'Unavailable' : 'Available'}
              </AppText>
            </View>
          )}
        </View>

        {/* Out of Stock Overlay Effect */}
        {outOfStock && (
          <View style={[styles.outOfStockOverlay, { backgroundColor: colors.error + '05' }]} />
        )}
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
        <MaterialCommunityIcons
          name="inbox-multiple-outline"
          size={44}
          color={colors.textSecondary}
        />
      </View>
      <AppText style={[styles.emptyStateText, { color: colors.textSecondary }]}>
        No products loaded
      </AppText>
      <AppText style={[styles.emptyStateSubtext, { color: colors.textTertiary }]}>
        Check van inventory
      </AppText>
    </View>
  );

  /* ============================
   * RENDER LOADING STATE
   * ============================ */

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText style={[styles.loadingText, { color: colors.textSecondary }]}>
        Loading van stock...
      </AppText>
    </View>
  );

  /* ============================
   * RENDER MODAL CONTENT
   * ============================ */

  const renderModalContent = () => (
    <View style={styles.modalInnerContainer}>
      {/* Summary Metrics Section */}
      <View style={styles.summarySection}>
        <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Summary Metrics
        </AppText>

        {isLoading ? (
          renderLoadingState()
        ) : (
          <FlatList
            data={summaryStats}
            renderItem={renderSummaryStat}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.statsGrid}
            scrollEnabled={false}
            contentContainerStyle={styles.statsContainer}
          />
        )}
      </View>

      {/* SKU Details Section - Scrollable */}
      <View style={styles.skuSection}>
        <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          SKU Details
          <AppText style={[styles.skuCountBadge, { color: colors.primary }]}>
            {' '}
            ({vanStock.length})
          </AppText>
        </AppText>

        {isLoading ? null : vanStock.length > 0 ? (
          <FlatList
            data={vanStock}
            renderItem={renderSkuItem}
            keyExtractor={(item) => item.productId || item.id}
            contentContainerStyle={styles.skuListContainer}
            showsVerticalScrollIndicator={true}
            scrollEnabled={true}
            initialNumToRender={8}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews={true}
            windowSize={10}
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </View>
  );

  /* ============================
   * RENDER FOOTER
   * ============================ */

  const renderFooter = () => (
    <View style={styles.footer}>
      <TouchableOpacity
        onPress={onClose}
        style={[styles.cancelButton, { borderColor: colors.border }]}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        activeOpacity={0.7}
      >
        <AppText style={[styles.cancelButtonText, { color: colors.textSecondary }]}>CANCEL</AppText>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onProceed}
        style={[styles.proceedButton, { backgroundColor: colors.primary }]}
        activeOpacity={0.85}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
        <AppText style={styles.proceedButtonText}>PROCEED</AppText>
      </TouchableOpacity>
    </View>
  );

  /* ============================
   * RENDER
   * ============================ */

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Load Summary"
      size="xl"
      position="center"
      animation="scale"
      showCloseButton={true}
      showBackdrop={true}
      closeOnBackdropPress={true}
      keyboardAvoiding={true}
      scrollable={true}
    >
      {/* Main Content */}
      {renderModalContent()}

      {/* Footer with Actions */}
      {renderFooter()}
    </AppModal>
  );
};
