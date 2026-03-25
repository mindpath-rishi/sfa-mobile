// app/checkin/reason.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomerInfoCard } from '../components/checkin/CustomerCardInfo';

interface ReasonScreenParams {
  customerId?: string;
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
  customerRoute?: string;
  categoryId?: string;
  categoryTitle?: string;
  categoryColor?: string;
  categoryIcon?: string;
}

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

export default function ReasonScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams() as ReasonScreenParams;

  const [selectedReason, setSelectedReason] = useState<string | null>(null);

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

  const reasons = FURTHER_REASONS[categoryId] || [];

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.back();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const handleReasonSelect = (reasonId: string) => {
    setSelectedReason(reasonId);
  };

  const handleNext = () => {
    if (!selectedReason) {
      Alert.alert('Selection Required', 'Please select a reason to continue');
      return;
    }

    const selectedReasonLabel = reasons.find((r) => r.id === selectedReason)?.label;

    // Navigate to further reason screen
    router.push({
      pathname: '/checkin/nonsale/final-step',
      params: {
        customerId: customer.id,
        customerName: customer.name,
        customerAddress: customer.address,
        customerPhone: customer.phone,
        customerRoute: customer.route,
        categoryId: categoryId,
        categoryTitle: categoryTitle,
        categoryColor: categoryColor,
        categoryIcon: categoryIcon,
        reasonId: selectedReason,
        reasonLabel: selectedReasonLabel,
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Customer Info */}
        <CustomerInfoCard customer={customer} showDivider={false} />

        {/* Selected Category Badge */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: categoryColor + '10',
            borderRadius: 12,
            padding: 12,
            marginBottom: 20,
            marginTop: 8,
            borderWidth: 0.5,
            borderColor: categoryColor + '30',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: categoryColor + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={categoryIcon as any} size={28} color={categoryColor} />
            </View>
            <View>
              <Text style={{ fontSize: 12, color: colors.textTertiary }}>Selected Category</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: categoryColor }}>
                {categoryTitle}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: colors.surface,
              borderWidth: 0.5,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Reasons List */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: 12,
            marginLeft: 4,
          }}
        >
          Select a reason:
        </Text>

        <View style={{ gap: 8 }}>
          {reasons.map((reason) => (
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
                borderColor: selectedReason === reason.id ? colors.primary : colors.border + '30',
              }}
              onPress={() => handleReasonSelect(reason.id)}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: selectedReason === reason.id ? colors.primary : colors.textPrimary,
                  flex: 1,
                }}
              >
                {reason.label}
              </Text>
              {selectedReason === reason.id && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Empty State */}
        {reasons.length === 0 && (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 32,
              gap: 12,
            }}
          >
            <Ionicons name="alert-circle-outline" size={48} color={colors.textTertiary} />
            <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center' }}>
              No reasons available for this category
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: insets.bottom || 16,
          backgroundColor: colors.background,
          borderTopWidth: 0.5,
          borderTopColor: colors.border + '25',
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 14,
            backgroundColor: selectedReason ? colors.primary : colors.surface,
            borderWidth: 0.5,
            borderColor: selectedReason ? colors.primary : colors.border + '40',
          }}
          onPress={handleNext}
          disabled={!selectedReason}
          activeOpacity={0.82}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: selectedReason ? 'white' : colors.textTertiary,
            }}
          >
            Next
          </Text>
          {selectedReason && <Ionicons name="arrow-forward" size={20} color="white" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}
