// DayEndSummaryModal.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, TouchableOpacity, FlatList, Animated, SafeAreaView, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppModal, AppText, SearchBar } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { useDayEndSummaryModalStyles } from '../../styles/DayEndSummaryModal.styles';

interface DayEndSummaryModalProps {
  visible: boolean;
  data?: {
    summary: {
      opening: {
        qty: number;
        cases: number;
        pieces: number;
        items: number;
        value: number;
        weight: number;
      };
      received: {
        qty: number;
        cases: number;
        pieces: number;
        items: number;
        value: number;
        weight: number;
      };
      sold: {
        qty: number;
        cases: number;
        pieces: number;
        items: number;
        value: number;
        weight: number;
      };
      closing: {
        qty: number;
        cases: number;
        pieces: number;
        items: number;
        value: number;
        weight: number;
      };
    };
    products: Array<{
      productId: string;
      productName: string;
      unitQtyInCase: number;
      openingQty: number;
      openingCases: number;
      openingPieces: number;
      openingValue: number;
      openingWeight: number;
      openingItems: number;
      inQty: number;
      inCases: number;
      inPieces: number;
      receivedValue: number;
      receivedWeight: number;
      receivedItems: number;
      outQty: number;
      outCases: number;
      outPieces: number;
      soldValue: number;
      soldWeight: number;
      soldItems: number;
      closingQty: number;
      closingCases: number;
      closingPieces: number;
      closingValue: number;
      closingWeight: number;
      closingItems: number;
    }>;
  };
  topupSettlementAlerts?: Array<{
    id: string;
    reference: string;
    status: 'SUBMITTED' | 'APPROVED';
    requestedCases?: number;
    requestedPieces?: number;
    approvedCases?: number;
    approvedPieces?: number;
  }>;
  onClose: () => void;
  onProceed?: () => void;
}

export const DayEndSummaryModal: React.FC<DayEndSummaryModalProps> = ({
  visible,
  data,
  topupSettlementAlerts = [],
  onClose,
  onProceed,
}) => {
  const styles = useDayEndSummaryModalStyles();
  const { colors } = useTheme();

  const [activeTab, setActiveTab] = useState<'overview' | 'products'>('overview');
  const [productSearch, setProductSearch] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];

  const formatCurrency = useCallback((value: number) => {
    return `K ${value.toLocaleString()}`;
  }, []);

  const formatStock = useCallback((cases: number, pieces: number) => {
    if (cases === 0 && pieces === 0) return '-';
    return `${cases}C ${pieces}P`;
  }, []);

  const formatTonnage = useCallback((weightInKg: number) => {
    if (!weightInKg) return '-';
    return `${(weightInKg / 1000).toFixed(3)} T`;
  }, []);

  const submittedTopups = topupSettlementAlerts.filter((item) => item.status === 'SUBMITTED');
  const approvedTopups = topupSettlementAlerts.filter((item) => item.status === 'APPROVED');
  const totalAttentionTopups = submittedTopups.length + approvedTopups.length;
  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return data?.products || [];

    return (data?.products || []).filter((item) => {
      const name = String(item.productName || '').toLowerCase();
      const code = String(item.productId || '').toLowerCase();
      return name.includes(query) || code.includes(query);
    });
  }, [data?.products, productSearch]);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, fadeAnim]);

  if (!data?.summary) return null;

  const { opening, received, sold, closing } = data.summary;

  const stockStats = [
    {
      label: 'Opening',
      cases: opening.cases,
      pieces: opening.pieces,
      value: opening.value,
      weight: opening.weight,
      color: '#6B7280',
    },
    {
      label: 'Topup',
      cases: received.cases,
      pieces: received.pieces,
      value: received.value,
      weight: received.weight,
      color: '#3B82F6',
    },
    {
      label: 'Sold',
      cases: sold.cases,
      pieces: sold.pieces,
      value: sold.value,
      weight: sold.weight,
      color: '#F59E0B',
    },
    {
      label: 'Closing',
      cases: closing.cases,
      pieces: closing.pieces,
      value: closing.value,
      weight: closing.weight,
      color: '#10B981',
    },
  ];

  const SummaryTile = ({ label, value, helper, icon, color }: any) => (
    <View
      style={[styles.summaryTile, { backgroundColor: colors.surface, borderColor: color + '30' }]}
    >
      <View style={[styles.summaryTileIcon, { backgroundColor: color + '12' }]}>
        <MaterialCommunityIcons name={icon} size={18} color={color} />
      </View>
      <View style={styles.summaryTileContent}>
        <AppText style={[styles.summaryTileLabel, { color: colors.textSecondary }]}>
          {label}
        </AppText>
        <AppText style={[styles.summaryTileValue, { color: colors.textPrimary }]}>{value}</AppText>
        <AppText style={[styles.summaryTileHelper, { color }]}>{helper}</AppText>
      </View>
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.tabBar, { borderBottomColor: colors.divider }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
            onPress={() => setActiveTab('overview')}
          >
            <MaterialCommunityIcons
              name="chart-box"
              size={18}
              color={activeTab === 'overview' ? colors.primary : colors.textSecondary}
            />
            <AppText
              style={[
                styles.tabText,
                { color: activeTab === 'overview' ? colors.primary : colors.textSecondary },
              ]}
            >
              Overview
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'products' && styles.tabActive]}
            onPress={() => setActiveTab('products')}
          >
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={18}
              color={activeTab === 'products' ? colors.primary : colors.textSecondary}
            />
            <AppText
              style={[
                styles.tabText,
                { color: activeTab === 'products' ? colors.primary : colors.textSecondary },
              ]}
            >
              Products
            </AppText>
          </TouchableOpacity>
        </View>

        {activeTab === 'overview' ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Animated.View style={{ opacity: fadeAnim }}>
              <View style={styles.summaryHero}>
                <View style={styles.summaryHeroHeader}>
                  <View
                    style={[styles.summaryHeroIcon, { backgroundColor: colors.primary + '12' }]}
                  >
                    <MaterialCommunityIcons
                      name="clipboard-check-outline"
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.summaryHeroTitleBlock}>
                    <AppText style={[styles.summaryHeroTitle, { color: colors.textPrimary }]}>
                      Settlement snapshot
                    </AppText>
                    <AppText style={[styles.summaryHeroSubtitle, { color: colors.textSecondary }]}>
                      Review stock movement before confirming day end
                    </AppText>
                  </View>
                </View>

                <View style={styles.summaryTileGrid}>
                  <SummaryTile
                    label="Closing stock"
                    value={formatStock(closing.cases, closing.pieces)}
                    helper={formatCurrency(closing.value)}
                    icon="package-variant-closed"
                    color="#10B981"
                  />
                  <SummaryTile
                    label="Sold today"
                    value={formatStock(sold.cases, sold.pieces)}
                    helper={formatCurrency(sold.value)}
                    icon="trending-up"
                    color="#F59E0B"
                  />
                  <SummaryTile
                    label="Closing tonnage"
                    value={formatTonnage(closing.weight)}
                    helper="Final van load"
                    icon="weight-kilogram"
                    color="#6366F1"
                  />
                  <SummaryTile
                    label="Top-up checks"
                    value={totalAttentionTopups || '-'}
                    helper={totalAttentionTopups ? 'Needs review' : 'No pending items'}
                    icon="alert-circle-outline"
                    color={totalAttentionTopups ? colors.warning : colors.success}
                  />
                </View>
              </View>

              {topupSettlementAlerts.length > 0 && (
                <View
                  style={[
                    styles.topupAlertCard,
                    { backgroundColor: colors.warning + '10', borderColor: colors.warning + '35' },
                  ]}
                >
                  <View style={styles.topupAlertHeader}>
                    <MaterialCommunityIcons
                      name="alert-circle-outline"
                      size={20}
                      color={colors.warning}
                    />
                    <AppText style={[styles.topupAlertTitle, { color: colors.textPrimary }]}>
                      Top-up request attention
                    </AppText>
                  </View>

                  {submittedTopups.length > 0 && (
                    <View style={styles.topupAlertSection}>
                      <AppText style={[styles.topupAlertMessage, { color: colors.textPrimary }]}>
                        Pending top-up requests
                      </AppText>
                      {submittedTopups.map((item) => (
                        <View
                          key={item.id}
                          style={[styles.topupAlertItem, { backgroundColor: colors.background }]}
                        >
                          <View style={styles.topupAlertItemMain}>
                            <AppText
                              style={[styles.topupAlertReference, { color: colors.textPrimary }]}
                            >
                              {item.reference}
                            </AppText>
                            <AppText
                              style={[styles.topupAlertQty, { color: colors.textSecondary }]}
                            >
                              Requested{' '}
                              {formatStock(item.requestedCases || 0, item.requestedPieces || 0)}
                            </AppText>
                          </View>
                          <View
                            style={[
                              styles.topupStatusBadge,
                              { backgroundColor: colors.warning + '15' },
                            ]}
                          >
                            <AppText style={[styles.topupStatusText, { color: colors.warning }]}>
                              Pending
                            </AppText>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {approvedTopups.length > 0 && (
                    <View style={styles.topupAlertSection}>
                      <AppText style={[styles.topupAlertMessage, { color: colors.textPrimary }]}>
                        Approved top-up requests
                      </AppText>
                      {approvedTopups.map((item) => (
                        <View
                          key={item.id}
                          style={[styles.topupAlertItem, { backgroundColor: colors.background }]}
                        >
                          <View style={styles.topupAlertItemMain}>
                            <AppText
                              style={[styles.topupAlertReference, { color: colors.textPrimary }]}
                            >
                              {item.reference}
                            </AppText>
                            <AppText
                              style={[styles.topupAlertQty, { color: colors.textSecondary }]}
                            >
                              Approved{' '}
                              {formatStock(item.approvedCases || 0, item.approvedPieces || 0)}
                            </AppText>
                          </View>
                          <View
                            style={[
                              styles.topupStatusBadge,
                              { backgroundColor: colors.success + '15' },
                            ]}
                          >
                            <AppText style={[styles.topupStatusText, { color: colors.success }]}>
                              Approved
                            </AppText>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              <View
                style={[
                  styles.card,
                  { backgroundColor: colors.surface, borderColor: colors.divider },
                ]}
              >
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name="chart-line" size={20} color={colors.primary} />
                  <AppText style={[styles.cardTitle, { color: colors.textPrimary }]}>
                    Stock Movement
                  </AppText>
                </View>

                <View style={styles.financialHeader}>
                  <AppText style={[styles.financialHeaderLabel, { color: colors.textSecondary }]}>
                    Type
                  </AppText>
                  <AppText style={[styles.financialHeaderStock, { color: colors.textSecondary }]}>
                    Stock
                  </AppText>
                  <AppText style={[styles.financialHeaderWeight, { color: colors.textSecondary }]}>
                    Tonnage
                  </AppText>
                  <AppText style={[styles.financialHeaderValue, { color: colors.textSecondary }]}>
                    Value
                  </AppText>
                </View>

                {stockStats.map((stat, index) => (
                  <View
                    key={stat.label}
                    style={[
                      styles.financialRow,
                      index !== stockStats.length - 1 && { borderBottomColor: colors.divider },
                    ]}
                  >
                    <View style={styles.financialRowLabel}>
                      <View style={[styles.statDot, { backgroundColor: stat.color }]} />
                      <AppText style={[styles.financialLabelText, { color: colors.textPrimary }]}>
                        {stat.label}
                      </AppText>
                    </View>
                    <AppText style={[styles.financialStockText, { color: stat.color }]}>
                      {formatStock(stat.cases, stat.pieces)}
                    </AppText>
                    <AppText style={[styles.financialWeightText, { color: stat.color }]}>
                      {formatTonnage(stat.weight)}
                    </AppText>
                    <AppText style={[styles.financialValueText, { color: stat.color }]}>
                      {stat.value > 0 ? formatCurrency(stat.value) : '-'}
                    </AppText>
                  </View>
                ))}
              </View>
            </Animated.View>
          </ScrollView>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.productId}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
            ListHeaderComponent={
              <View style={styles.productListHeaderBlock}>
                <SearchBar
                  value={productSearch}
                  onChangeText={setProductSearch}
                  placeholder="Search products"
                  debounceDelay={0}
                  clearable={true}
                  style={styles.productSearchBar}
                  inputStyle={styles.productSearchInput}
                />
                <View
                  style={[
                    styles.productListHeader,
                    { backgroundColor: colors.surface, borderColor: colors.divider },
                  ]}
                >
                  <AppText style={[styles.productListHeaderName, { color: colors.textSecondary }]}>
                    Product
                  </AppText>
                  <AppText style={[styles.productListHeaderQty, { color: colors.textSecondary }]}>
                    Open
                  </AppText>
                  <AppText style={[styles.productListHeaderQty, { color: colors.textSecondary }]}>
                    In
                  </AppText>
                  <AppText style={[styles.productListHeaderQty, { color: colors.textSecondary }]}>
                    Sold
                  </AppText>
                  <AppText style={[styles.productListHeaderQty, { color: colors.textSecondary }]}>
                    Close
                  </AppText>
                </View>
              </View>
            }
            renderItem={({ item, index }) => (
              <Animated.View
                style={[
                  styles.productCompactRow,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.divider,
                    opacity: fadeAnim,
                  },
                ]}
              >
                <View style={styles.productCompactTop}>
                  <AppText style={[styles.productIndexText, { color: colors.primary }]}>
                    {index + 1}
                  </AppText>
                  <View style={styles.productCompactDetails}>
                    <AppText style={[styles.productName, { color: colors.textPrimary }]}>
                      {item.productName}
                    </AppText>
                    <AppText
                      style={[styles.productCode, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {item.productId}
                    </AppText>
                  </View>
                </View>

                <View style={styles.productCompactInfoRow}>
                  <View style={styles.productCompactQtys}>
                    <AppText style={[styles.productCompactQty, { color: '#6B7280' }]}>
                      {formatStock(item.openingCases, item.openingPieces)}
                    </AppText>
                    <AppText style={[styles.productCompactQty, { color: '#3B82F6' }]}>
                      {formatStock(item.inCases, item.inPieces)}
                    </AppText>
                    <AppText style={[styles.productCompactQty, { color: '#F59E0B' }]}>
                      {formatStock(item.outCases, item.outPieces)}
                    </AppText>
                    <AppText style={[styles.productCompactQty, { color: '#10B981' }]}>
                      {formatStock(item.closingCases, item.closingPieces)}
                    </AppText>
                  </View>

                  <View style={styles.productCompactValues}>
                    <AppText
                      style={[styles.productCompactValue, { color: '#F59E0B' }]}
                      numberOfLines={1}
                    >
                      Sale {formatCurrency(item.soldValue)}
                    </AppText>
                    <AppText
                      style={[styles.productCompactValue, { color: '#10B981' }]}
                      numberOfLines={1}
                    >
                      Stock {formatCurrency(item.closingValue)}
                    </AppText>
                  </View>
                </View>
              </Animated.View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="package-variant"
                  size={48}
                  color={colors.textTertiary}
                />
                <AppText style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {productSearch.trim() ? 'No matching products found' : 'No products found'}
                </AppText>
              </View>
            }
          />
        )}

        <View style={[styles.footer, { borderTopColor: colors.divider }]}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.cancelButton, { borderColor: colors.divider }]}
          >
            <AppText style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
              Close
            </AppText>
          </TouchableOpacity>
          {onProceed && (
            <TouchableOpacity
              onPress={onProceed}
              style={[styles.proceedButton, { backgroundColor: colors.primary }]}
            >
              <AppText style={styles.proceedButtonText}>Confirm Day End</AppText>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </AppModal>
  );
};
