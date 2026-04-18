import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { LoadSummaryModalProps } from '../../types/loadSummaryModal.types';
import { useLoadSummaryModalStyles } from '../../styles/LoadSummaryModal.styles';
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
    totalItems: 0,
  });

  // Animation for content entrance
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  /* ============================
   * HELPERS
   * ============================ */

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const formatWeight = useCallback((weight: number) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(2)} tonnes`;
    }
    return `${weight.toFixed(1)} kg`;
  }, []);

  const formatCompactWeight = useCallback((weight: number) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)}t`;
    }
    return `${weight.toFixed(0)}kg`;
  }, []);

  const isOutOfStock = useCallback((item: any) => {
    return (!item.cases || item.cases === 0) && (!item.pieces || item.pieces === 0);
  }, []);

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

      // Calculate total items (sum of cases and pieces)
      const totalItems = (resData?.products || []).reduce((sum: number, product: any) => {
        const productItems = (product.cases || 0) + (product.pieces || 0);
        return sum + productItems;
      }, 0);

      setSummary({
        totalCases: resData?.totalCases || 0,
        totalPiece: resData?.totalPieces || 0,
        totalValue: resData?.totalValue || 0,
        totalNetWeight: resData?.totalNetWeight || 0,
        totalItems: totalItems,
      });

      const sortedProducts = (resData?.products || []).sort((a: any, b: any) =>
        a.name.localeCompare(b.name),
      );
      setVanStock(sortedProducts);

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    } catch (error) {
      console.log('Error fetching van stock:', error);
      setVanStock([]);
    } finally {
      setIsLoading(false);
    }
  }, [van, fadeAnim, slideAnim]);

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
      getVanStock();
    }
  }, [visible, getVanStock, fadeAnim, slideAnim]);

  /* ============================
   * RENDER STATS BAR - Only Cases, Pieces & Total Items
   * ============================ */

  const renderStatsBar = () => (
    <Animated.View
      style={[
        styles.statsBar,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsScrollContent}
      >
        {/* Total Items */}
        <View style={styles.statsBarItem}>
          <View style={[styles.statsIconWrapper, { backgroundColor: colors.primary + '10' }]}>
            <MaterialCommunityIcons name="package-check" size={20} color={colors.primary} />
          </View>
          <View>
            <AppText style={styles.statsValue}>{summary.totalItems}</AppText>
            <AppText style={styles.statsLabel}>Total Items</AppText>
          </View>
        </View>

        <View style={styles.statsDivider} />

        {/* Cases */}
        <View style={styles.statsBarItem}>
          <View style={[styles.statsIconWrapper, { backgroundColor: '#3B82F6' + '10' }]}>
            <MaterialCommunityIcons name="package-variant" size={20} color="#3B82F6" />
          </View>
          <View>
            <AppText style={styles.statsValue}>{summary.totalCases}</AppText>
            <AppText style={styles.statsLabel}>Cases</AppText>
          </View>
        </View>

        <View style={styles.statsDivider} />

        {/* Pieces */}
        <View style={styles.statsBarItem}>
          <View style={[styles.statsIconWrapper, { backgroundColor: '#10B981' + '10' }]}>
            <MaterialCommunityIcons name="package-multiple" size={20} color="#10B981" />
          </View>
          <View>
            <AppText style={styles.statsValue}>{summary.totalPiece}</AppText>
            <AppText style={styles.statsLabel}>Pieces</AppText>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );

  /* ============================
   * RENDER SKU ROW - Enhanced with Value & Weight
   * ============================ */

  const renderSkuRow = ({ item, index }: { item: any; index: number }) => {
    const outOfStock = isOutOfStock(item);
    const itemWeight = item.cases * (item.caseWeight || 0) + item.pieces * (item.pieceWeight || 0);
    const itemValue = item.price * (item.cases * (item.unitQtyInCase || 1) + item.pieces);
    const totalItemCount = (item.cases || 0) + (item.pieces || 0);

    return (
      <Animated.View
        style={[
          styles.skuRow,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Left Section - Index and Name */}
        <View style={styles.skuRowLeft}>
          <View style={styles.skuIndex}>
            <AppText style={[styles.skuIndexText, { color: colors.textSecondary }]}>
              {index + 1}
            </AppText>
          </View>

          <View style={styles.skuInfo}>
            <AppText
              style={[
                styles.skuName,
                { color: outOfStock ? colors.textSecondary : colors.textPrimary },
              ]}
              numberOfLines={2}
            >
              {item.name}
            </AppText>
            {item.productSysCode && (
              <AppText style={[styles.skuCode, { color: colors.textTertiary }]}>
                {item.productSysCode}
              </AppText>
            )}
          </View>
        </View>

        {/* Right Section - Stock Info with Value & Weight */}
        <View style={styles.skuRowRight}>
          {outOfStock ? (
            <View style={styles.outOfStockChip}>
              <MaterialCommunityIcons name="alert-circle" size={12} color={colors.error} />
              <AppText style={[styles.outOfStockChipText, { color: colors.error }]}>
                Out of Stock
              </AppText>
            </View>
          ) : (
            <>
              {/* Item Count Badge */}
              <View style={styles.itemCountChip}>
                <MaterialCommunityIcons name="package" size={12} color={colors.primary} />
                <AppText style={[styles.itemCountText, { color: colors.primary }]}>
                  {totalItemCount} items
                </AppText>
              </View>

              {/* Stock Quantity */}
              <View style={styles.stockChip}>
                {/* <MaterialCommunityIcons name="box" size={10} color="#6B7280" /> */}
                <AppText style={[styles.stockChipText, { color: colors.textSecondary }]}>
                  {item.cases}C / {item.pieces}P
                </AppText>
              </View>

              {/* Item Value */}
              {item.price && (
                <AppText style={[styles.skuValue, { color: '#F59E0B' }]}>
                  {formatCurrency(item.price)}
                </AppText>
              )}

              {/* Item Weight */}
              {item.caseWeight || item.pieceWeight ? (
                <AppText style={[styles.skuWeight, { color: '#8B5CF6' }]}>
                  {formatCompactWeight(itemWeight)}
                </AppText>
              ) : null}
            </>
          )}
        </View>
      </Animated.View>
    );
  };

  /* ============================
   * RENDER SECTION HEADER - Opening Balance
   * ============================ */

  const renderSectionHeader = () => (
    <Animated.View
      style={[
        styles.sectionHeader,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View>
        <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Total</AppText>
        {/* <AppText style={[styles.sectionSubtitle, { color: colors.textTertiary }]}>
          Current van inventory stock
        </AppText> */}
      </View>
      <View style={[styles.totalBadge, { backgroundColor: colors.primary + '10' }]}>
        <MaterialCommunityIcons name="package" size={14} color={colors.primary} />
        <AppText style={[styles.totalBadgeText, { color: colors.primary }]}>
          {vanStock.length} SKUs
        </AppText>
      </View>
    </Animated.View>
  );

  /* ============================
   * RENDER EMPTY STATE
   * ============================ */

  const renderEmptyState = () => (
    <Animated.View
      style={[
        styles.emptyState,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <MaterialCommunityIcons name="inbox-multiple-outline" size={64} color={colors.textTertiary} />
      <AppText style={[styles.emptyStateText, { color: colors.textSecondary }]}>
        No Opening Balance
      </AppText>
      <AppText style={[styles.emptyStateSubtext, { color: colors.textTertiary }]}>
        Your van inventory is empty
      </AppText>
    </Animated.View>
  );

  /* ============================
   * RENDER LOADING STATE
   * ============================ */

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText style={[styles.loadingText, { color: colors.textSecondary }]}>
        Loading opening balance...
      </AppText>
    </View>
  );

  /* ============================
   * RENDER FOOTER - With Total Value and Total Weight Preview
   * ============================ */

  const renderFooter = () => (
    <Animated.View
      style={[
        styles.footer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Summary Preview with Total Value and Total Weight */}
      <View style={styles.footerSummary}>
        <View style={styles.footerSummaryItem}>
          <View style={[styles.footerSummaryIcon, { backgroundColor: '#F59E0B' + '10' }]}>
            <MaterialCommunityIcons name="currency-usd" size={18} color="#F59E0B" />
          </View>
          <View>
            <AppText style={[styles.footerSummaryLabel, { color: colors.textSecondary }]}>
              Total Value
            </AppText>
            <AppText style={[styles.footerSummaryValue, { color: '#F59E0B' }]}>
              {formatCurrency(summary.totalValue)}
            </AppText>
          </View>
        </View>

        <View style={styles.footerSummaryDivider} />

        <View style={styles.footerSummaryItem}>
          <View style={[styles.footerSummaryIcon, { backgroundColor: '#8B5CF6' + '10' }]}>
            <MaterialCommunityIcons name="weight-kilogram" size={18} color="#8B5CF6" />
          </View>
          <View>
            <AppText style={[styles.footerSummaryLabel, { color: colors.textSecondary }]}>
              Total Weight
            </AppText>
            <AppText style={[styles.footerSummaryValue, { color: '#8B5CF6' }]}>
              {formatWeight(summary.totalNetWeight)}
            </AppText>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.footerActions}>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.cancelButton, { borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
          <AppText style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
            Cancel
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onProceed}
          style={[styles.proceedButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <AppText style={styles.proceedButtonText}>Proceed</AppText>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  /* ============================
   * MAIN RENDER
   * ============================ */

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Delivery Van 1 - Opening Balance"
      size="full"
      position="center"
      animation="slide"
      showCloseButton={true}
      showBackdrop={true}
      closeOnBackdropPress={false}
      keyboardAvoiding={true}
      scrollable={false}
      hideCloseButton={true}
      contentStyle={styles.modalContent}
      style={styles.modalContainer}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Stats Bar */}
        {renderStatsBar()}

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {isLoading ? (
            renderLoadingState()
          ) : vanStock.length > 0 ? (
            <>
              {renderSectionHeader()}
              <FlatList
                data={vanStock}
                renderItem={renderSkuRow}
                keyExtractor={(item) => item.productId || item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={true}
                initialNumToRender={12}
                maxToRenderPerBatch={15}
                removeClippedSubviews={true}
              />
            </>
          ) : (
            renderEmptyState()
          )}
        </View>

        {/* Footer */}
        {renderFooter()}
      </SafeAreaView>
    </AppModal>
  );
};

// LoadSummaryModal.styles.ts
import { StyleSheet, ViewStyle } from 'react-native';
