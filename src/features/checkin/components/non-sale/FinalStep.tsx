// app/checkin/further-reason.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomerInfoCard } from '../checkin/CustomerCardInfo';

export const FURTHER_REASONS: Record<string, Array<{ id: string; label: string }>> = {
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
    { id: 'new_shop', label: 'New Shop/First Visit' },
  ],
  more: [
    { id: 'weather', label: 'Weather Conditions' },
    { id: 'holiday', label: 'Holiday/Festival' },
    { id: 'bandh', label: 'Bandh/Strike' },
    { id: 'other', label: 'Other Factors' },
  ],
};

interface FurtherReasonParams {
  customerId?: string;
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
  customerRoute?: string;
  categoryId?: string;
  categoryTitle?: string;
  categoryColor?: string;
  categoryIcon?: string;
  reasonId?: string;
  reasonLabel?: string;
}

export default function FinalSetp() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams() as FurtherReasonParams;

  const [selectedFurtherReason, setSelectedFurtherReason] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customer = {
    id: params.customerId || '16295',
    name: params.customerName || 'Zombela',
    address: params.customerAddress,
    phone: params.customerPhone,
    route: params.customerRoute,
  };

  const categoryId = params.categoryId || 'shop';
  const categoryTitle = params.categoryTitle || 'SHOP RELATED ISSUE';
  const categoryColor = params.categoryColor || '#FFEAA7';
  const categoryIcon = params.categoryIcon || 'storefront-outline';
  const reasonId = params.reasonId;
  const reasonLabel = params.reasonLabel;

  const specificReasons = reasonId
    ? FURTHER_REASONS[categoryId]?.filter((r) => r.id === reasonId) || []
    : [];

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.back();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const handleFurtherReasonSelect = (reasonId: string) => {
    setSelectedFurtherReason(reasonId);
  };

  const handleSubmit = async () => {
    if (!selectedFurtherReason) {
      Alert.alert('Selection Required', 'Please select a reason before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customer: {
          id: customer.id,
          name: customer.name,
          address: customer.address,
          phone: customer.phone,
          route: customer.route,
        },
        category: categoryId,
        categoryTitle: categoryTitle,
        reason: reasonId,
        reasonLabel: reasonLabel,
        furtherReason: selectedFurtherReason,
        furtherReasonLabel: specificReasons.find((r) => r.id === selectedFurtherReason)?.label,
        timestamp: new Date().toISOString(),
      };

      console.log('Non-sale submitted:', payload);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert(
        'Success',
        'Non-sale reason submitted successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to check-in screen
              router.dismissAll();
              router.push('/checkin');
            },
          },
        ],
        { cancelable: false },
      );
    } catch (error) {
      console.error('Error submitting non-sale reason:', error);
      Alert.alert('Error', 'Failed to submit reason. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Customer Info */}
        <CustomerInfoCard customer={customer} showDivider={false} />

        {/* Selected Reason Summary */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            marginTop: 8,
            borderWidth: 0.5,
            borderColor: colors.border + '30',
          }}
        >
          <Text style={{ fontSize: 12, color: colors.textTertiary, marginBottom: 8 }}>
            Selected Reason:
          </Text>
          <View
            style={{
              backgroundColor: categoryColor + '10',
              borderRadius: 8,
              padding: 12,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: categoryColor }}>
              {categoryTitle}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
              {reasonLabel}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              alignSelf: 'flex-end',
              marginTop: 8,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 6,
              backgroundColor: colors.surface,
              borderWidth: 0.5,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Specific Reasons */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: 12,
            marginLeft: 4,
          }}
        >
          Select specific reason:
        </Text>

        <View style={{ gap: 8, marginBottom: 24 }}>
          {specificReasons.map((reason) => (
            <TouchableOpacity
              key={reason.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor:
                  selectedFurtherReason === reason.id ? colors.primary : colors.border + '30',
              }}
              onPress={() => handleFurtherReasonSelect(reason.id)}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: selectedFurtherReason === reason.id ? colors.primary : colors.textPrimary,
                  flex: 1,
                }}
              >
                {reason.label}
              </Text>
              {selectedFurtherReason === reason.id && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: !selectedFurtherReason || isSubmitting ? 0.5 : 1,
          }}
          onPress={handleSubmit}
          activeOpacity={0.9}
          disabled={!selectedFurtherReason || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
              Submit No Sale Reason
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
