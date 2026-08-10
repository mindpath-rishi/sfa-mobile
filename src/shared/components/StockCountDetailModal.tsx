// shared/components/StockCountDetailModal.tsx
import React from 'react';
import { View, Modal, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppText } from '@/core/components';
import { format } from 'date-fns';

interface StockCountDetailModalProps {
  visible: boolean;
  stockCount: any;
  detailItems: any[];
  isLoading: boolean;
  onClose: () => void;
}

export const StockCountDetailModal: React.FC<StockCountDetailModalProps> = ({
  visible,
  stockCount,
  detailItems,
  isLoading,
  onClose,
}) => {
  const { colors } = useTheme();

  if (!stockCount) return null;

  const formatCurrency = (value: number) => `K ${value.toLocaleString()}`;
  const formatWeight = (weight: number) => `${weight.toFixed(1)} kg`;
  const formatDate = (date: string) => format(new Date(date), 'dd MMM yyyy');
  const formatDateTime = (date: string) => format(new Date(date), 'dd MMM, hh:mm a');

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { color: '#10B981', bg: '#10B98112', label: 'Approved' };
      case 'SUBMITTED':
        return { color: '#3B82F6', bg: '#3B82F612', label: 'Submitted' };
      case 'IN_PROGRESS':
        return { color: '#F59E0B', bg: '#F59E0B12', label: 'In Progress' };
      case 'REJECTED':
        return { color: '#EF4444', bg: '#EF444412', label: 'Rejected' };
      default:
        return { color: '#8B5CF6', bg: '#8B5CF612', label: 'Draft' };
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return '#10B981';
    if (variance < 0) return '#EF4444';
    return '#6B7280';
  };

  const statusConfig = getStatusConfig(stockCount.status);
  const varianceColor = getVarianceColor(stockCount.varianceQty);

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            marginTop: 60,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.divider,
            }}
          >
            <AppText style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>
              Stock Count Details
            </AppText>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            <View style={{ padding: 20 }}>
              {/* Header Info */}
              <View style={{ marginBottom: 20 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <AppText style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                    {stockCount.stockCountId}
                  </AppText>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                      backgroundColor: statusConfig.bg,
                    }}
                  >
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: statusConfig.color,
                      }}
                    />
                    <AppText style={{ fontSize: 12, fontWeight: '600', color: statusConfig.color }}>
                      {statusConfig.label}
                    </AppText>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 16, marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
                    <AppText style={{ fontSize: 13, color: colors.textSecondary }}>
                      {formatDate(stockCount.date)}
                    </AppText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
                    <AppText style={{ fontSize: 13, color: colors.textSecondary }}>
                      {formatDateTime(stockCount.createdAt)}
                    </AppText>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Ionicons name="business-outline" size={14} color={colors.textTertiary} />
                  <AppText style={{ fontSize: 13, color: colors.textSecondary }}>
                    {stockCount.vanName || 'N/A'}
                  </AppText>
                </View>
                
                {/* Carry Forward Stock - Added Here */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name="archive-arrow-up" size={14} color={colors.textTertiary} />
                  <AppText style={{ fontSize: 13, color: colors.textSecondary }}>
                    Carry Forward Stock: 
                  </AppText>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 12,
                      backgroundColor: stockCount.carryForwardStock 
                        ? '#10B98112' 
                        : '#EF444412',
                    }}
                  >
                    <AppText
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: stockCount.carryForwardStock ? '#10B981' : '#EF4444',
                      }}
                    >
                      {stockCount.carryForwardStock ? 'Yes' : 'No'}
                    </AppText>
                  </View>
                </View>
              </View>

              {/* Van Stock Summary */}
              <View
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <AppText
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.primary,
                    marginBottom: 12,
                  }}
                >
                  Van Stock
                </AppText>
                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 }}
                >
                  <View style={{ alignItems: 'center' }}>
                    <AppText style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary }}>
                      {stockCount?.systemCase + stockCount?.systemPiece}
                    </AppText>
                    <AppText style={{ fontSize: 11, color: colors.textTertiary }}>Items</AppText>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <AppText style={{ fontSize: 20, fontWeight: 'bold', color: colors.info }}>
                      {stockCount.systemCase}
                    </AppText>
                    <AppText style={{ fontSize: 11, color: colors.textTertiary }}>Cases</AppText>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <AppText style={{ fontSize: 20, fontWeight: 'bold', color: colors.success }}>
                      {stockCount.systemPiece}
                    </AppText>
                    <AppText style={{ fontSize: 11, color: colors.textTertiary }}>Pieces</AppText>
                  </View>
                </View>
                <AppText style={{ fontSize: 12, color: colors.textTertiary, textAlign: 'center' }}>
                  {formatWeight(stockCount.systemWeight)} · {formatCurrency(stockCount.systemValue)}
                </AppText>
              </View>

              {/* Counted Stock Summary */}
              <View
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <AppText
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.warning,
                    marginBottom: 12,
                  }}
                >
                  Counted Stock
                </AppText>
                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 }}
                >
                  <View style={{ alignItems: 'center' }}>
                    <AppText style={{ fontSize: 20, fontWeight: 'bold', color: colors.warning }}>
                      {stockCount.countedQty}
                    </AppText>
                    <AppText style={{ fontSize: 11, color: colors.textTertiary }}>Items</AppText>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <AppText style={{ fontSize: 20, fontWeight: 'bold', color: colors.info }}>
                      {stockCount.countedCase}
                    </AppText>
                    <AppText style={{ fontSize: 11, color: colors.textTertiary }}>Cases</AppText>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <AppText style={{ fontSize: 20, fontWeight: 'bold', color: colors.success }}>
                      {stockCount.countedPiece}
                    </AppText>
                    <AppText style={{ fontSize: 11, color: colors.textTertiary }}>Pieces</AppText>
                  </View>
                </View>
                <AppText style={{ fontSize: 12, color: colors.textTertiary, textAlign: 'center' }}>
                  {formatWeight(stockCount.countedWeight)} ·{' '}
                  {formatCurrency(stockCount.countedValue)}
                </AppText>
              </View>

              {/* Variance Summary */}
              <View
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}
                >
                  <MaterialCommunityIcons
                    name={
                      stockCount.varianceQty > 0
                        ? 'trending-up'
                        : stockCount.varianceQty < 0
                          ? 'trending-down'
                          : 'minus'
                    }
                    size={20}
                    color={varianceColor}
                  />
                  <AppText style={{ fontSize: 14, fontWeight: '600', color: varianceColor }}>
                    Variance Summary
                  </AppText>
                </View>
                <View style={{ marginBottom: 8 }}>
                  <AppText style={{ fontSize: 16, fontWeight: 'bold', color: varianceColor }}>
                    {stockCount.varianceQty > 0 ? '+' : ''}
                    {stockCount.varianceQty} items
                  </AppText>
                  <AppText style={{ fontSize: 12, color: colors.textTertiary }}>
                    Cases: {stockCount.varianceCase > 0 ? '+' : ''}
                    {stockCount.varianceCase} · Pieces: {stockCount.variancePiece > 0 ? '+' : ''}
                    {stockCount.variancePiece}
                  </AppText>
                  <AppText style={{ fontSize: 12, color: colors.textTertiary }}>
                    {stockCount.varianceWeight > 0 ? '+' : ''}
                    {formatWeight(Math.abs(stockCount.varianceWeight))} ·
                    {stockCount.varianceValue > 0 ? '+' : ''}
                    {formatCurrency(Math.abs(stockCount.varianceValue))}
                  </AppText>
                </View>
              </View>

              {/* Products List */}
              <View>
                <AppText
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.textPrimary,
                    marginBottom: 12,
                  }}
                >
                  Products ({detailItems.length})
                </AppText>
                {isLoading ? (
                  <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                  detailItems.map((item, idx) => (
                    <View
                      key={idx}
                      style={{
                        backgroundColor: colors.background,
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 8,
                      }}
                    >
                      <AppText
                        style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: colors.textPrimary,
                          marginBottom: 8,
                        }}
                      >
                        {item.productName}
                      </AppText>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 4,
                        }}
                      >
                        <AppText style={{ fontSize: 12, color: colors.textTertiary }}>
                          System:
                        </AppText>
                        <AppText style={{ fontSize: 12, color: colors.textSecondary }}>
                          {item.systemCases} cases, {item.systemPieces} pieces
                        </AppText>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 4,
                        }}
                      >
                        <AppText style={{ fontSize: 12, color: colors.textTertiary }}>
                          Counted:
                        </AppText>
                        <AppText style={{ fontSize: 12, color: colors.textSecondary }}>
                          {item.countedCases} cases, {item.countedPieces} pieces
                        </AppText>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <AppText style={{ fontSize: 12, color: colors.textTertiary }}>
                          Variance:
                        </AppText>
                        <AppText
                          style={{
                            fontSize: 12,
                            fontWeight: '600',
                            color: getVarianceColor(item.varianceQty),
                          }}
                        >
                          {item.varianceQty > 0 ? '+' : ''}
                          {item.varianceQty} items
                        </AppText>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};