import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { LoadSummaryModalProps } from '../../types/loadSummaryModal.types';
import { createLoadSummaryModalStyles } from '../../styles/LoadSummaryModal.styles';
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
  const { colors } = useTheme();
  const styles = createLoadSummaryModalStyles(colors);
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

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

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

  const isOutOfStock = useCallback((item: any) => {
    return (!item.cases || item.cases === 0) && (!item.pieces || item.pieces === 0);
  }, []);

  const getVanStock = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!van?.vanId) {
        setVanStock([]);
        return;
      }

      const response = await vanService.fetchVanStocks(van.vanId);
      const resData = response?.data;

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
      <View style={styles.statsContainer}>
        {/* Cases Card */}
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
          <View style={[styles.statIconWrapper, { backgroundColor: '#3B82F610' }]}>
            <MaterialCommunityIcons name="cube-outline" size={24} color="#3B82F6" />
          </View>
          <View>
            <AppText style={[styles.statValue, { color: '#3B82F6' }]}>{summary.totalCases}</AppText>
            <AppText style={[styles.statLabel, { color: colors.textSecondary }]}>Cases</AppText>
          </View>
        </View>

        {/* Pieces Card */}
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
          <View style={[styles.statIconWrapper, { backgroundColor: '#10B98110' }]}>
            <MaterialCommunityIcons name="layers-outline" size={24} color="#10B981" />
          </View>
          <View>
            <AppText style={[styles.statValue, { color: '#10B981' }]}>{summary.totalPiece}</AppText>
            <AppText style={[styles.statLabel, { color: colors.textSecondary }]}>Pieces</AppText>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderSkuRow = ({ item, index }: { item: any; index: number }) => {
    const outOfStock = isOutOfStock(item);

    return (
      <Animated.View
        style={[
          styles.skuRow,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            backgroundColor: colors.surface,
            borderBottomColor: colors.divider,
          },
        ]}
      >
        <View style={styles.skuRowLeft}>
          <View style={styles.skuIndex}>
            <AppText style={[styles.skuIndexText, { color: colors.textTertiary }]}>
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

        <View style={styles.skuRowRight}>
          {outOfStock ? (
            <View style={[styles.outOfStockChip, { backgroundColor: colors.error + '10' }]}>
              <MaterialCommunityIcons name="alert-circle" size={12} color={colors.error} />
              <AppText style={[styles.outOfStockChipText, { color: colors.error }]}>
                Out of Stock
              </AppText>
            </View>
          ) : (
            <View style={styles.stockInfo}>
              <AppText style={[styles.stockText, { color: colors.textPrimary }]}>
                {item.cases}C / {item.pieces}P
              </AppText>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderSectionHeader = () => (
    <Animated.View
      style={[
        styles.sectionHeader,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          borderBottomColor: colors.divider,
        },
      ]}
    >
      <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Inventory Items
      </AppText>
      <View style={[styles.totalBadge, { backgroundColor: colors.primary + '10' }]}>
        <MaterialCommunityIcons name="package" size={14} color={colors.primary} />
        <AppText style={[styles.totalBadgeText, { color: colors.primary }]}>
          {vanStock.length}
        </AppText>
      </View>
    </Animated.View>
  );

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
        No Inventory Items
      </AppText>
      <AppText style={[styles.emptyStateSubtext, { color: colors.textTertiary }]}>
        Your van inventory is currently empty
      </AppText>
    </Animated.View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText style={[styles.loadingText, { color: colors.textSecondary }]}>
        Loading inventory...
      </AppText>
    </View>
  );

  const renderFooter = () => (
    <Animated.View
      style={[
        styles.footer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: colors.surface,
          borderTopColor: colors.divider,
        },
      ]}
    >
      <View style={styles.footerSummary}>
        <View style={styles.footerSummaryItem}>
          <View style={[styles.footerSummaryIcon, { backgroundColor: '#F59E0B10' }]}>
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

        <View style={[styles.footerSummaryDivider, { backgroundColor: colors.divider }]} />

        <View style={styles.footerSummaryItem}>
          <View style={[styles.footerSummaryIcon, { backgroundColor: '#8B5CF610' }]}>
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

      <View style={styles.footerActions}>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.cancelButton, { borderColor: colors.divider }]}
          activeOpacity={0.7}
        >
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
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Opening Balance"
      size="full"
      position="bottom"
      animation="slide"
      showCloseButton={true}
      showBackdrop={true}
      closeOnBackdropPress={false}
      keyboardAvoiding={true}
      scrollable={false}
      contentStyle={styles.modalContent}
      style={styles.modalContainer}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {renderStatsBar()}

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
                showsVerticalScrollIndicator={false}
                initialNumToRender={12}
                maxToRenderPerBatch={15}
                removeClippedSubviews={true}
              />
            </>
          ) : (
            renderEmptyState()
          )}
        </View>

        {renderFooter()}
      </SafeAreaView>
    </AppModal>
  );
};