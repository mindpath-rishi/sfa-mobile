// DayEndSummaryModal.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  Animated,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppModal, AppText } from '@/core/components';
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

  const [activeTab, setActiveTab] = useState<'overview' | 'products'>('overview');
  const fadeAnim = useState(new Animated.Value(0))[0];

  const formatCurrency = useCallback((value: number) => {
    return `K ${value.toLocaleString()}`;
  }, []);

  const formatStock = useCallback((cases: number, pieces: number) => {
    if (cases === 0 && pieces === 0) return '-';
    return `${cases}C ${pieces}P`;
  }, []);

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
      color: '#6B7280',
    },
    {
      label: 'Topup',
      cases: received.cases,
      pieces: received.pieces,
      value: received.value,
      color: '#3B82F6',
    },
    {
      label: 'Sold',
      cases: sold.cases,
      pieces: sold.pieces,
      value: sold.value,
      color: '#F59E0B',
    },
    {
      label: 'Closing',
      cases: closing.cases,
      pieces: closing.pieces,
      value: closing.value,
      color: '#10B981',
    },
  ];

  const StatsCard = ({ title, icon, data: statsData, color }: any) => (
    <View
      style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}
    >
      <View style={styles.statsCardHeader}>
        <View style={[styles.statsCardIcon, { backgroundColor: color + '15' }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        <AppText style={[styles.statsCardTitle, { color: colors.textPrimary }]}>{title}</AppText>
      </View>
      <View style={styles.statsCardGrid}>
        {statsData.map((item: any, index: number) => (
          <View key={index} style={styles.statsCardItem}>
            <View style={[styles.statsCardItemIcon, { backgroundColor: color + '10' }]}>
              <MaterialCommunityIcons name={item.icon} size={18} color={color} />
            </View>
            <View>
              <AppText style={[styles.statsCardItemLabel, { color: colors.textSecondary }]}>
                {item.label}
              </AppText>
              <AppText style={[styles.statsCardItemValue, { color: color }]}>{item.value}</AppText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const soldData = [
    { label: 'Sold Cases', value: sold.cases, icon: 'cube-outline' },
    { label: 'Sold Pieces', value: sold.pieces, icon: 'layers-outline' },
    { label: 'Sale Value', value: formatCurrency(sold.value), icon: 'cash' },
    { label: 'Sold Weight', value: `${sold.weight.toFixed(2)} kg`, icon: 'weight-kilogram' },
  ];

  const closingData = [
    { label: 'Closing Cases', value: closing.cases, icon: 'cube-outline' },
    { label: 'Closing Pieces', value: closing.pieces, icon: 'layers-outline' },
    { label: 'Stock Value', value: formatCurrency(closing.value), icon: 'currency-usd' },
    { label: 'Total Weight', value: `${closing.weight.toFixed(2)} kg`, icon: 'weight-kilogram' },
  ];

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
                    <AppText style={[styles.financialValueText, { color: stat.color }]}>
                      {stat.value > 0 ? formatCurrency(stat.value) : '-'}
                    </AppText>
                  </View>
                ))}
              </View>

              <StatsCard title="Sold Details" icon="trending-up" data={soldData} color="#F59E0B" />
              <StatsCard title="Closing Stock" icon="package-variant" data={closingData} color="#10B981" />
            </Animated.View>
          </ScrollView>
        ) : (
          <FlatList
            data={data.products}
            keyExtractor={(item) => item.productId}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
            renderItem={({ item, index }) => (
              <Animated.View
                style={[
                  styles.productCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.divider,
                    opacity: fadeAnim,
                  },
                ]}
              >
                <View style={styles.productRow}>
                  <View style={styles.productIndex}>
                    <AppText style={[styles.productIndexText, { color: colors.primary }]}>
                      {index + 1}
                    </AppText>
                  </View>
                  <View style={styles.productDetails}>
                    <AppText
                      style={[styles.productName, { color: colors.textPrimary }]}
                      numberOfLines={2}
                    >
                      {item.productName}
                    </AppText>
                    <AppText style={[styles.productCode, { color: colors.textSecondary }]}>
                      {item.productId}
                    </AppText>
                  </View>
                </View>

                <View style={styles.productStats}>
                  <View style={styles.productStat}>
                    <AppText style={[styles.productStatLabel, { color: colors.textSecondary }]}>
                      Opening
                    </AppText>
                    <AppText style={[styles.productStatValue, { color: '#6B7280' }]}>
                      {formatStock(item.openingCases, item.openingPieces)}
                    </AppText>
                    <AppText style={[styles.productStatSub, { color: colors.textTertiary }]}>
                      {item.openingItems} items
                    </AppText>
                  </View>
                  <View style={styles.productStat}>
                    <AppText style={[styles.productStatLabel, { color: colors.textSecondary }]}>
                      Received
                    </AppText>
                    <AppText style={[styles.productStatValue, { color: '#3B82F6' }]}>
                      {formatStock(item.inCases, item.inPieces)}
                    </AppText>
                    <AppText style={[styles.productStatSub, { color: colors.textTertiary }]}>
                      {item.receivedItems} items
                    </AppText>
                  </View>
                  <View style={styles.productStat}>
                    <AppText style={[styles.productStatLabel, { color: colors.textSecondary }]}>
                      Sold
                    </AppText>
                    <AppText style={[styles.productStatValue, { color: '#F59E0B' }]}>
                      {formatStock(item.outCases, item.outPieces)}
                    </AppText>
                  </View>
                  <View style={styles.productStat}>
                    <AppText style={[styles.productStatLabel, { color: colors.textSecondary }]}>
                      Closing
                    </AppText>
                    <AppText style={[styles.productStatValue, { color: '#10B981' }]}>
                      {formatStock(item.closingCases, item.closingPieces)}
                    </AppText>
                    <AppText style={[styles.productStatSub, { color: colors.textTertiary }]}>
                      {item.closingItems} items
                    </AppText>
                  </View>
                </View>

                <View style={styles.productValueRow}>
                  <View style={styles.productValueItem}>
                    <MaterialCommunityIcons name="cash" size={14} color="#F59E0B" />
                    <AppText style={[styles.productValueLabel, { color: colors.textSecondary }]}>
                      Sale Value
                    </AppText>
                    <AppText style={[styles.productValueAmount, { color: '#F59E0B' }]}>
                      {formatCurrency(item.soldValue)}
                    </AppText>
                  </View>
                  <View style={styles.productValueItem}>
                    <MaterialCommunityIcons name="currency-usd" size={14} color="#10B981" />
                    <AppText style={[styles.productValueLabel, { color: colors.textSecondary }]}>
                      Stock Value
                    </AppText>
                    <AppText style={[styles.productValueAmount, { color: '#10B981' }]}>
                      {formatCurrency(item.closingValue)}
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
                  No products found
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