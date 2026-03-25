// components/non-sale/NonSaleMainStep.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { Customer } from '../../types/checkin.types';

// components/non-sale/constants/nonSaleReasons.ts
export const REASON_CATEGORIES = [
  {
    id: 'product',
    title: 'PRODUCT RELATED ISSUE',
    icon: 'cube-outline',
    color: '#FF6B6B',
  },
  {
    id: 'distributor',
    title: 'DISTRIBUTOR RELATED ISSUE',
    icon: 'business-outline',
    color: '#4ECDC4',
  },
  {
    id: 'company',
    title: 'COMPANY RELATED ISSUE',
    icon: 'flag-outline',
    color: '#45B7D1',
  },
  {
    id: 'competitor',
    title: 'COMPETITOR RELATED ISSUE',
    icon: 'trophy-outline',
    color: '#96CEB4',
  },
  {
    id: 'shop',
    title: 'SHOP RELATED ISSUE',
    icon: 'storefront-outline',
    color: '#FFEAA7',
  },
  {
    id: 'more',
    title: 'MORE FACTORS',
    icon: 'options-outline',
    color: '#D4A5A5',
  },
];

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

interface NonSaleMainStepProps {
  customer: Customer;
}

export const FirstStep: React.FC<NonSaleMainStepProps> = ({ customer }) => {
  const { colors } = useTheme();

  const handleCategorySelect = (category: (typeof REASON_CATEGORIES)[0]) => {
    // Navigate to reason screen when category is selected
    router.push({
      pathname: '/checkin/nonsale/second-step',
      params: {
        customerId: customer.id,
        customerName: customer.name,
        customerAddress: customer.address,
        customerPhone: customer.phone,
        customerRoute: customer.route,
        categoryId: category.id,
        categoryTitle: category.title,
        categoryColor: category.color,
        categoryIcon: category.icon,
      },
    });
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      {/* Customer Info Card */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          borderWidth: 0.5,
          borderColor: colors.border + '30',
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>
          {customer.id} - {customer.name}
        </Text>
        {customer.address && (
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
            📍 {customer.address}
          </Text>
        )}
        {customer.phone && (
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
            📞 {customer.phone}
          </Text>
        )}
        {customer.route && (
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
            🚚 Route: {customer.route}
          </Text>
        )}
      </View>

      {/* Header Text */}
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: colors.textSecondary,
          marginBottom: 12,
          marginLeft: 4,
        }}
      >
        Select a category:
      </Text>

      {/* Categories Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {REASON_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={{
              flex: 1,
              minWidth: '45%',
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              borderWidth: 0.5,
              borderColor: colors.border + '30',
            }}
            onPress={() => handleCategorySelect(category)}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: category.color + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Ionicons name={category.icon as any} size={32} color={category.color} />
            </View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: colors.textPrimary,
                textAlign: 'center',
              }}
            >
              {category.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};
