// app/checkin/reason.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, BackHandler } from 'react-native';
import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { AppButton, SectionHeader } from '@/core/components';
import { BottomBar } from '../components/nonsale/BottomBar';
import { SelectedCategoryBadge } from '../components/nonsale/SelectedItemBadge';
import { ReasonCard } from '../components/nonsale/ReasonCard';
import { EmptyState } from '@/core/components/EmptyState';

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

export default function NonSaleReasonScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams() as ReasonScreenParams;
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const categoryId = params.categoryId || 'shop';
  const categoryTitle = params.categoryTitle || 'SHOP RELATED ISSUE';
  const categoryColor = params.categoryColor || '#FFEAA7';
  const categoryIcon = params.categoryIcon || 'storefront-outline';
  const reasons = FURTHER_REASONS[categoryId] || [];

  // Set default selected reason
  useEffect(() => {
    if (reasons.length > 0 && !selectedReason) {
      setSelectedReason(reasons[0].id);
    }
  }, [reasons, selectedReason]);

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

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    if (!selectedReason) {
      Alert.alert('Selection Required', 'Please select a reason to continue');
      return;
    }

    const selectedReasonLabel = reasons.find((r) => r.id === selectedReason)?.label;

    router.push({
      pathname: '/checkin/nonsale/final-step',
      params: {
        categoryId,
        categoryTitle,
        categoryColor,
        categoryIcon,
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
        <SelectedCategoryBadge
          categoryId={categoryId}
          categoryTitle={categoryTitle}
          categoryColor={categoryColor}
          categoryIcon={categoryIcon}
          onPressChange={handleBack}
        />

        <SectionHeader title="Select a reason" variant="compact" />

        {reasons.length > 0 ? (
          reasons.map((reason) => (
            <ReasonCard
              key={reason.id}
              id={reason.id}
              label={reason.label}
              isSelected={selectedReason === reason.id}
              onPress={() => handleReasonSelect(reason.id)}
            />
          ))
        ) : (
          <EmptyState title="No reasons available for this category" />
        )}
      </ScrollView>

      <BottomBar>
        <AppButton
          title="Next"
          onPress={handleNext}
          disabled={!selectedReason}
          size="large"
          rightIcon={<Ionicons name="arrow-forward" size={20} color="white" />}
        />
      </BottomBar>
    </View>
  );
}
