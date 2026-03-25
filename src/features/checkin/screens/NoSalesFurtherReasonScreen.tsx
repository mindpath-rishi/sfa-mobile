import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { Card } from '@/core/components/Card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNoSalesReasonStyles } from '../styles/NoSalesReason.styles';

// Mock data
const FURTHER_REASONS = {
  product: [
    { id: 'out_of_stock', label: 'Product Out of Stock' },
    { id: 'expired', label: 'Product Expired' },
    { id: 'damaged', label: 'Product Damaged' },
    { id: 'price_issue', label: 'Price Issue' },
    { id: 'quality_issue', label: 'Quality Issue' },
    { id: 'new_product', label: 'New Product - Not Accepted' },
  ],
  distributor: [
    { id: 'delivery_issue', label: 'Delivery Issue' },
    { id: 'service_issue', label: 'Service Issue' },
    { id: 'communication', label: 'Communication Gap' },
    { id: 'credit_issue', label: 'Credit Issue' },
    { id: 'relationship', label: 'Relationship Issue' },
  ],
  company: [
    { id: 'policy_issue', label: 'Company Policy Issue' },
    { id: 'scheme_issue', label: 'Scheme/Offer Issue' },
    { id: 'support_issue', label: 'Support Issue' },
    { id: 'brand_image', label: 'Brand Image Issue' },
  ],
  competitor: [
    { id: 'better_price', label: 'Better Price from Competitor' },
    { id: 'better_scheme', label: 'Better Scheme/Offer' },
    { id: 'exclusive_deal', label: 'Exclusive Deal' },
    { id: 'competitor_relationship', label: 'Competitor Relationship' },
  ],
  shop: [
    { id: 'key_person_not_available', label: 'Key Person Not Available' },
    { id: 'last_stock_present', label: 'Last Stock Present' },
    { id: 'shop_closed', label: 'Shop Closed' },
    { id: 'direct_order', label: 'Direct Order Placed to Distributor' },
    { id: 'payment_credit_issue', label: 'Payment/Credit Issue' },
    { id: 'new_shop', label: 'New Shop/ First Visit' },
  ],
  more: [
    { id: 'weather', label: 'Weather Conditions' },
    { id: 'holiday', label: 'Holiday/Festival' },
    { id: 'bandh', label: 'Bandh/Strike' },
    { id: 'other', label: 'Other Factors' },
  ],
};

export default function NoSalesFurtherReasonScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useNoSalesReasonStyles();
  const params = useLocalSearchParams();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const customerId = (params.customerId as string) || '16295';
  const customerName = (params.customerName as string) || 'Zombela';
  const category = (params.category as string) || 'shop';
  const categoryTitle = (params.categoryTitle as string) || 'SHOP RELATED ISSUE';

  const reasons = FURTHER_REASONS[category as keyof typeof FURTHER_REASONS] || FURTHER_REASONS.shop;

  const handleSelectReason = (reasonId: string) => {
    setSelectedReason(reasonId);
  };

  const handleSubmit = () => {
    if (!selectedReason) {
      // Show error or alert
      return;
    }

    // Here you would submit the reason to your backend
    console.log('Submitting no-sale reason:', {
      customerId,
      category,
      subReason: selectedReason,
    });

    // Navigate back or show success
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>No Sales Further Reason</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Customer Info */}
        <View style={styles.customerInfo}>
          <Text style={styles.customerId}>
            {customerId}-{customerName}
          </Text>
        </View>

        {/* Category Header */}
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>{categoryTitle}</Text>
        </View>

        {/* Reasons List */}
        <View style={styles.reasonsList}>
          {reasons.map((reason) => (
            <TouchableOpacity
              key={reason.id}
              style={[
                styles.reasonListItem,
                selectedReason === reason.id && styles.reasonListItemSelected,
                {
                  borderColor: selectedReason === reason.id ? colors.primary : colors.border + '30',
                },
              ]}
              onPress={() => handleSelectReason(reason.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.reasonListItemText,
                  selectedReason === reason.id && styles.reasonListItemTextSelected,
                ]}
              >
                {reason.label}
              </Text>
              {selectedReason === reason.id && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity
          style={[
            styles.proceedButton,
            { backgroundColor: selectedReason ? colors.primary : colors.border + '50' },
          ]}
          onPress={handleSubmit}
          disabled={!selectedReason}
          activeOpacity={0.9}
        >
          <Text style={styles.proceedButtonText}>SELECT ONE →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
