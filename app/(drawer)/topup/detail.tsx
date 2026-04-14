// VanInventoryTopupDetailPage.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';

import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { useVanInventoryTopupDetailStyles } from '@/shared/styles/TopupDetail.styles';

interface TopupItem {
  vanInventoryTopupId: string;
  productId: string;
  productName: string;
  requestedCaseQty: number;
  requestedPieceQty: number;
  requestedQty: number;
  approvedCaseQty: number;
  approvedPieceQty: number;
  approvedQty: number;
  piecePrice: number;
  casePrice: number;
  pieceNetWeight: number;
  caseNetWeight: number;
  requestedWeight: number;
  requestedValue: number;
  approvedWeight: number;
  approvedValue: number;
  unitQtyInCase: number;
  remark?: string;
}

interface TopupHeader {
  vanInventoryTopupId: string;
  vanId: string;
  vanName: string;
  employeeId: string;
  warehouseId: string;
  date: string;
  totalRequestedQty: number;
  totalRequestedWeight: number;
  totalRequestedValue: number;
  totalApprovedQty: number;
  totalApprovedWeight: number;
  totalApprovedValue: number;
  remark?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export const VanInventoryTopupDetailPage: React.FC = () => {
  const styles = useVanInventoryTopupDetailStyles();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: string };

  const [header, setHeader] = useState<TopupHeader | null>(null);
  const [items, setItems] = useState<TopupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'requested' | 'approved'>('requested');

  /* ============================
   * HELPERS
   * ============================ */

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

  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return 'Invalid date';
    }
  }, []);

  const formatDateTime = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
    } catch {
      return 'Invalid date';
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#10B981';
      case 'SUBMITTED':
        return '#3B82F6';
      case 'REJECTED':
        return '#EF4444';
      case 'DRAFT':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'check-circle';
      case 'SUBMITTED':
        return 'clock-outline';
      case 'REJECTED':
        return 'close-circle';
      case 'DRAFT':
        return 'file-document-outline';
      default:
        return 'help-circle';
    }
  }, []);

  const getStatusBackgroundColor = useCallback((status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#10B981';
      case 'SUBMITTED':
        return '#3B82F6';
      case 'REJECTED':
        return '#EF4444';
      case 'DRAFT':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  }, []);

  /* ============================
   * API CALLS
   * ============================ */

  const fetchTopupDetail = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setIsLoading(true);
        }

        // Mock API calls - Replace with actual service calls
        const [headerData, itemsData] = await Promise.all([
          mockGetTopupHeader(id),
          mockGetTopupItems(id),
        ]);

        setHeader(headerData);
        setItems(itemsData);
      } catch (error) {
        console.log('Error fetching topup detail:', error);
        Alert.alert('Error', 'Failed to load top-up details');
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  useEffect(() => {
    fetchTopupDetail();
  }, [fetchTopupDetail]);

  const onRefresh = useCallback(() => {
    fetchTopupDetail(true);
  }, [fetchTopupDetail]);

  const handleApprove = useCallback(() => {
    Alert.alert(
      'Approve Top-up',
      'Are you sure you want to approve this top-up? This will update inventory levels.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            // Call approve API
            console.log('Approving top-up:', id);
            Alert.alert('Success', 'Top-up approved successfully');
            fetchTopupDetail(true);
          },
        },
      ],
    );
  }, [id, fetchTopupDetail]);

  const handleReject = useCallback(() => {
    Alert.alert('Reject Top-up', 'Are you sure you want to reject this top-up?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          // Call reject API
          console.log('Rejecting top-up:', id);
          Alert.alert('Success', 'Top-up rejected');
          fetchTopupDetail(true);
        },
      },
    ]);
  }, [id, fetchTopupDetail]);

  const handleEdit = useCallback(() => {
    // navigation.navigate('VanInventoryTopupEdit', { id });
  }, [navigation, id]);

  const handleSubmit = useCallback(() => {
    Alert.alert('Submit Top-up', 'Are you sure you want to submit this top-up for approval?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Submit',
        onPress: async () => {
          // Call submit API
          console.log('Submitting top-up:', id);
          Alert.alert('Success', 'Top-up submitted successfully');
          fetchTopupDetail(true);
        },
      },
    ]);
  }, [id, fetchTopupDetail]);

  /* ============================
   * RENDER HEADER SECTION
   * ============================ */

  const renderHeader = () => {
    if (!header) return null;

    return (
      <View style={styles.headerSection}>
        {/* Top-up ID and Status */}
        <View style={styles.idStatusRow}>
          <View style={styles.idContainer}>
            <MaterialCommunityIcons name="ticket" size={20} color={colors.primary} />
            <AppText style={[styles.topupId, { color: colors.textPrimary }]}>
              {header.vanInventoryTopupId}
            </AppText>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusBackgroundColor(header.status) + '15' },
            ]}
          >
            <MaterialCommunityIcons
              name={getStatusIcon(header.status) as any}
              size={14}
              color={getStatusColor(header.status)}
            />
            <AppText style={[styles.statusText, { color: getStatusColor(header.status) }]}>
              {header.status}
            </AppText>
          </View>
        </View>

        {/* Van and Warehouse Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="truck" size={18} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <AppText style={[styles.infoLabel, { color: colors.textSecondary }]}>Van</AppText>
                <AppText style={[styles.infoValue, { color: colors.textPrimary }]}>
                  {header.vanName}
                </AppText>
                <AppText style={[styles.infoSub, { color: colors.textTertiary }]}>
                  ID: {header.vanId}
                </AppText>
              </View>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="warehouse" size={18} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <AppText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Warehouse
                </AppText>
                <AppText style={[styles.infoValue, { color: colors.textPrimary }]}>
                  {header.warehouseId}
                </AppText>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="calendar" size={18} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <AppText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Business Date
                </AppText>
                <AppText style={[styles.infoValue, { color: colors.textPrimary }]}>
                  {formatDate(header.date)}
                </AppText>
              </View>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="account" size={18} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <AppText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Employee
                </AppText>
                <AppText style={[styles.infoValue, { color: colors.textPrimary }]}>
                  {header.employeeId}
                </AppText>
              </View>
            </View>
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <AppText style={[styles.summaryTitle, { color: colors.textPrimary }]}>Summary</AppText>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <MaterialCommunityIcons name="package-variant" size={20} color={colors.primary} />
              <AppText style={[styles.summaryValue, { color: colors.primary }]}>
                {activeTab === 'requested' ? header.totalRequestedQty : header.totalApprovedQty}
              </AppText>
              <AppText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Total Quantity
              </AppText>
            </View>
            <View style={styles.summaryCard}>
              <MaterialCommunityIcons name="weight" size={20} color={colors.warning} />
              <AppText style={[styles.summaryValue, { color: colors.warning }]}>
                {formatWeight(
                  activeTab === 'requested'
                    ? header.totalRequestedWeight
                    : header.totalApprovedWeight,
                )}
              </AppText>
              <AppText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Total Weight
              </AppText>
            </View>
            <View style={styles.summaryCard}>
              <MaterialCommunityIcons name="currency-inr" size={20} color={colors.success} />
              <AppText style={[styles.summaryValue, { color: colors.success }]}>
                {formatCurrency(
                  activeTab === 'requested'
                    ? header.totalRequestedValue
                    : header.totalApprovedValue,
                )}
              </AppText>
              <AppText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Total Value
              </AppText>
            </View>
          </View>
        </View>

        {/* Remark */}
        {header.remark && (
          <View style={styles.remarkContainer}>
            <MaterialCommunityIcons name="note-text" size={18} color={colors.textSecondary} />
            <AppText style={[styles.remarkText, { color: colors.textSecondary }]}>
              {header.remark}
            </AppText>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          <AppText style={[styles.timelineTitle, { color: colors.textPrimary }]}>Timeline</AppText>
          <View style={styles.timelineItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textSecondary} />
            <View style={styles.timelineContent}>
              <AppText style={[styles.timelineLabel, { color: colors.textSecondary }]}>
                Created
              </AppText>
              <AppText style={[styles.timelineValue, { color: colors.textPrimary }]}>
                {formatDateTime(header.createdAt)}
              </AppText>
            </View>
          </View>
          <View style={styles.timelineItem}>
            <MaterialCommunityIcons name="update" size={16} color={colors.textSecondary} />
            <View style={styles.timelineContent}>
              <AppText style={[styles.timelineLabel, { color: colors.textSecondary }]}>
                Last Updated
              </AppText>
              <AppText style={[styles.timelineValue, { color: colors.textPrimary }]}>
                {formatDateTime(header.updatedAt)}
              </AppText>
            </View>
          </View>
        </View>
      </View>
    );
  };

  /* ============================
   * RENDER LINE ITEM
   * ============================ */

  const renderLineItem = ({ item, index }: { item: TopupItem; index: number }) => {
    const isRequested = activeTab === 'requested';
    const qty = isRequested ? item.requestedQty : item.approvedQty;
    const caseQty = isRequested ? item.requestedCaseQty : item.approvedCaseQty;
    const pieceQty = isRequested ? item.requestedPieceQty : item.approvedPieceQty;
    const weight = isRequested ? item.requestedWeight : item.approvedWeight;
    const value = isRequested ? item.requestedValue : item.approvedValue;

    return (
      <View
        style={[
          styles.lineItemCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.lineItemHeader}>
          <View style={styles.lineItemIndex}>
            <AppText style={[styles.lineItemIndexText, { color: colors.primary }]}>
              {index + 1}
            </AppText>
          </View>
          <View style={styles.lineItemInfo}>
            <AppText style={[styles.productName, { color: colors.textPrimary }]}>
              {item.productName}
            </AppText>
            <AppText style={[styles.productId, { color: colors.textSecondary }]}>
              ID: {item.productId}
            </AppText>
          </View>
        </View>

        <View style={styles.lineItemDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailCell}>
              <AppText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Quantity
              </AppText>
              <AppText style={[styles.detailValue, { color: colors.textPrimary }]}>
                {qty} units
              </AppText>
              {(caseQty > 0 || pieceQty > 0) && (
                <AppText style={[styles.detailSub, { color: colors.textTertiary }]}>
                  {caseQty} cases / {pieceQty} pieces
                </AppText>
              )}
            </View>
            <View style={styles.detailCell}>
              <AppText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Weight
              </AppText>
              <AppText style={[styles.detailValue, { color: colors.warning }]}>
                {formatWeight(weight)}
              </AppText>
            </View>
            <View style={styles.detailCell}>
              <AppText style={[styles.detailLabel, { color: colors.textSecondary }]}>Value</AppText>
              <AppText style={[styles.detailValue, { color: colors.success }]}>
                {formatCurrency(value)}
              </AppText>
            </View>
          </View>

          <View style={styles.pricingRow}>
            <View style={styles.pricingCell}>
              <AppText style={[styles.pricingLabel, { color: colors.textTertiary }]}>
                Piece Price
              </AppText>
              <AppText style={[styles.pricingValue, { color: colors.textSecondary }]}>
                {formatCurrency(item.piecePrice)}
              </AppText>
            </View>
            <View style={styles.pricingCell}>
              <AppText style={[styles.pricingLabel, { color: colors.textTertiary }]}>
                Case Price
              </AppText>
              <AppText style={[styles.pricingValue, { color: colors.textSecondary }]}>
                {formatCurrency(item.casePrice)}
              </AppText>
            </View>
            <View style={styles.pricingCell}>
              <AppText style={[styles.pricingLabel, { color: colors.textTertiary }]}>
                Units/Case
              </AppText>
              <AppText style={[styles.pricingValue, { color: colors.textSecondary }]}>
                {item.unitQtyInCase}
              </AppText>
            </View>
          </View>

          {item.remark && (
            <View style={styles.itemRemarkContainer}>
              <MaterialCommunityIcons name="note-outline" size={12} color={colors.textTertiary} />
              <AppText style={[styles.itemRemarkText, { color: colors.textTertiary }]}>
                {item.remark}
              </AppText>
            </View>
          )}
        </View>
      </View>
    );
  };

  /* ============================
   * RENDER ACTION BUTTONS
   * ============================ */

  const renderActionButtons = () => {
    if (!header) return null;

    switch (header.status) {
      case 'DRAFT':
        return (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.editButton, { borderColor: colors.border }]}
              onPress={handleEdit}
            >
              <MaterialCommunityIcons name="pencil" size={20} color={colors.primary} />
              <AppText style={[styles.editButtonText, { color: colors.primary }]}>Edit</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
            >
              <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
              <AppText style={styles.submitButtonText}>Submit for Approval</AppText>
            </TouchableOpacity>
          </View>
        );
      case 'SUBMITTED':
        return (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[
                styles.rejectButton,
                { borderColor: colors.error, backgroundColor: colors.error + '10' },
              ]}
              onPress={handleReject}
            >
              <MaterialCommunityIcons name="close" size={20} color={colors.error} />
              <AppText style={[styles.rejectButtonText, { color: colors.error }]}>Reject</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.approveButton, { backgroundColor: colors.success }]}
              onPress={handleApprove}
            >
              <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
              <AppText style={styles.approveButtonText}>Approve</AppText>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  /* ============================
   * RENDER TABS
   * ============================ */

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'requested' && styles.activeTab,
          { borderBottomColor: activeTab === 'requested' ? colors.primary : colors.border },
        ]}
        onPress={() => setActiveTab('requested')}
      >
        <AppText
          style={[
            styles.tabText,
            { color: activeTab === 'requested' ? colors.primary : colors.textSecondary },
          ]}
        >
          Requested
        </AppText>
        {header && (
          <View style={[styles.tabBadge, { backgroundColor: colors.primary + '15' }]}>
            <AppText style={[styles.tabBadgeText, { color: colors.primary }]}>
              {items.length}
            </AppText>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'approved' && styles.activeTab,
          { borderBottomColor: activeTab === 'approved' ? colors.primary : colors.border },
        ]}
        onPress={() => setActiveTab('approved')}
      >
        <AppText
          style={[
            styles.tabText,
            { color: activeTab === 'approved' ? colors.primary : colors.textSecondary },
          ]}
        >
          Approved
        </AppText>
        {header && header.totalApprovedQty > 0 && (
          <View style={[styles.tabBadge, { backgroundColor: colors.success + '15' }]}>
            <AppText style={[styles.tabBadgeText, { color: colors.success }]}>
              {items.filter((i) => i.approvedQty > 0).length}
            </AppText>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  /* ============================
   * RENDER LOADING STATE
   * ============================ */

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading top-up details...
        </AppText>
      </View>
    );
  }

  /* ============================
   * MAIN RENDER
   * ============================ */

  return (
    <View style={styles.pageContainer}>
      <FlatList
        data={items}
        renderItem={renderLineItem}
        keyExtractor={(item) => `${item.productId}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={[styles.pageHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <AppText style={[styles.pageTitle, { color: colors.textPrimary }]}>
                Top-up Details
              </AppText>
              <View style={styles.placeholder} />
            </View>

            {renderHeader()}
            {renderTabs()}
          </>
        }
        ListFooterComponent={
          <>
            {renderActionButtons()}
            <View style={styles.footerSpacer} />
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="package-variant" size={48} color={colors.textSecondary} />
            <AppText style={[styles.emptyText, { color: colors.textSecondary }]}>
              No items found
            </AppText>
          </View>
        }
      />
    </View>
  );
};

// Mock API functions (Replace with actual service calls)
const mockGetTopupHeader = async (id: string): Promise<TopupHeader> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    vanInventoryTopupId: id,
    vanId: 'VAN-001',
    vanName: 'Van 1 - North Zone',
    employeeId: 'EMP-001',
    warehouseId: 'WH-001',
    date: new Date().toISOString(),
    totalRequestedQty: 150,
    totalRequestedWeight: 1250.5,
    totalRequestedValue: 125000,
    totalApprovedQty: 150,
    totalApprovedWeight: 1250.5,
    totalApprovedValue: 125000,
    remark: 'Monthly restock request',
    status: 'APPROVED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

const mockGetTopupItems = async (id: string): Promise<TopupItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      vanInventoryTopupId: id,
      productId: 'PROD-001',
      productName: 'Premium Rice - 5kg',
      requestedCaseQty: 10,
      requestedPieceQty: 5,
      requestedQty: 105,
      approvedCaseQty: 10,
      approvedPieceQty: 5,
      approvedQty: 105,
      piecePrice: 500,
      casePrice: 5000,
      pieceNetWeight: 5,
      caseNetWeight: 50,
      requestedWeight: 525,
      requestedValue: 52500,
      approvedWeight: 525,
      approvedValue: 52500,
      unitQtyInCase: 10,
      remark: 'High demand product',
    },
    {
      vanInventoryTopupId: id,
      productId: 'PROD-002',
      productName: 'Whole Wheat Flour - 10kg',
      requestedCaseQty: 5,
      requestedPieceQty: 3,
      requestedQty: 53,
      approvedCaseQty: 5,
      approvedPieceQty: 3,
      approvedQty: 53,
      piecePrice: 400,
      casePrice: 4000,
      pieceNetWeight: 10,
      caseNetWeight: 100,
      requestedWeight: 530,
      requestedValue: 21200,
      approvedWeight: 530,
      approvedValue: 21200,
      unitQtyInCase: 10,
    },
    {
      vanInventoryTopupId: id,
      productId: 'PROD-003',
      productName: 'Cooking Oil - 1L',
      requestedCaseQty: 20,
      requestedPieceQty: 0,
      requestedQty: 200,
      approvedCaseQty: 20,
      approvedPieceQty: 0,
      approvedQty: 200,
      piecePrice: 120,
      casePrice: 1200,
      pieceNetWeight: 1,
      caseNetWeight: 10,
      requestedWeight: 200,
      requestedValue: 24000,
      approvedWeight: 200,
      approvedValue: 24000,
      unitQtyInCase: 10,
    },
  ];
};

export default VanInventoryTopupDetailPage;
