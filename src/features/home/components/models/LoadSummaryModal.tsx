import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoadSummaryModalProps } from '../../types/loadSummaryModal.types';
import { useLoadSummaryModalStyles } from '../../styles/LoadSummaryModal.styles';

export const LoadSummaryModal: React.FC<LoadSummaryModalProps> = ({
  visible,
  data,
  onClose,
  onProceed,
}) => {
  const styles = useLoadSummaryModalStyles();

  const renderSkuItem = ({ item }: { item: any }) => (
    <View style={styles.skuCard}>
      <View style={styles.skuHeader}>
        <Text style={styles.skuName} numberOfLines={1}>
          {item.sku}
        </Text>
        {item.code ? <Text style={styles.skuCode}>#{item.code}</Text> : null}
      </View>

      <View style={styles.stockRow}>
        <Text style={styles.stockLabel}>Carry Forward Stock</Text>
        <Text style={styles.stockValue}>{item.carryForward || '0 Cases 0 Pcs'}</Text>
      </View>

      <View style={styles.stockRow}>
        <Text style={styles.stockLabel}>Fresh Stock</Text>
        <Text style={styles.stockValue}>{item.freshStock || '0 Cases 0 Pcs'}</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent={false} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Load Summary</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.loadNumberBadge}>
            <Text style={styles.loadNumberText}>{data.loadNumber}</Text>
          </View>
        </View>

        {/* Summary Card - Two Column Layout */}
        <View style={styles.content}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Quantity</Text>
              <Text style={styles.summaryValue}>{data.totalQuantity}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItemRight}>
              <Text style={styles.summaryLabel}>Total Value</Text>
              <Text style={styles.summaryValue}>{data.totalValue}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>SKU Details</Text>

          {/* SKU List */}
          <FlatList
            data={data.skuDetails}
            renderItem={renderSkuItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.skuList}
            showsVerticalScrollIndicator={false}
            initialNumToRender={8}
            maxToRenderPerBatch={10}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={onProceed} style={styles.proceedButton}>
            <Text style={styles.proceedButtonText}>PROCEED TO RETAILING</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
