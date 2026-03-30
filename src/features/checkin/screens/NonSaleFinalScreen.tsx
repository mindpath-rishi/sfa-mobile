// components/non-sale/NonSaleFinalScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, BackHandler } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppButton, SectionHeader } from '@/core/components';
import { BottomBar } from '../components/nonsale/BottomBar';
import { SelectedCategoryBadge } from '../components/nonsale/SelectedItemBadge';
import { ReasonCard } from '../components/nonsale/ReasonCard';
import { EmptyState } from '@/core/components/EmptyState';

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

export const NonSaleFinalScreen: React.FC = () => {
  const { colors } = useTheme();
  const params = useLocalSearchParams();

  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract data from params
  const customer = {
    id: (params.customerId as string) || '16295',
    name: (params.customerName as string) || 'Zombela',
    address: params.customerAddress as string,
    phone: params.customerPhone as string,
    route: params.customerRoute as string,
  };

  const categoryTitle = (params.categoryTitle as string) || 'SHOP RELATED ISSUE';
  const categoryColor = (params.categoryColor as string) || '#FFEAA7';
  const categoryIcon = (params.categoryIcon as string) || 'storefront-outline';
  const categoryId = (params.categoryId as string) || 'shop';
  const reasonId = params.reasonId as string;
  const reasonLabel = params.reasonLabel as string;

  const specificReasons = reasonId
    ? FURTHER_REASONS[categoryId]?.filter((r) => r.id === reasonId) || []
    : [];

  // Set default selected reason
  useEffect(() => {
    if (specificReasons.length > 0 && !selectedReason) {
      setSelectedReason(specificReasons[0].id);
    }
  }, [specificReasons, selectedReason]);

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.back();
      return true;
    });
    return () => backHandler.remove();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Selection Required', 'Please select a reason before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customer,
        category: categoryId,
        categoryTitle,
        reason: reasonId,
        reasonLabel,
        furtherReason: selectedReason,
        furtherReasonLabel: specificReasons.find((r) => r.id === selectedReason)?.label,
        timestamp: new Date().toISOString(),
      };

      console.log('Non-sale submitted:', payload);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert(
        'Success',
        'Non-sale reason submitted successfully',
        [{ text: 'OK', onPress: () => router.push('/checkin') }],
        { cancelable: false },
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit reason. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <SelectedCategoryBadge
          categoryId={categoryId}
          categoryTitle={categoryTitle}
          categoryColor={categoryColor}
          categoryIcon={categoryIcon}
          onPressChange={handleBack}
        />

        <SectionHeader title="Select specific reason:" variant="compact" />

        {specificReasons.length > 0 ? (
          specificReasons.map((reason) => (
            <ReasonCard
              key={reason.id}
              id={reason.id}
              label={reason.label}
              isSelected={selectedReason === reason.id}
              onPress={() => setSelectedReason(reason.id)}
            />
          ))
        ) : (
          <EmptyState title="No further reasons available for this selection" />
        )}
      </ScrollView>

      <BottomBar>
        <AppButton
          title="Submit No Sale Reason"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!selectedReason || specificReasons.length === 0}
          size="large"
        />
      </BottomBar>
    </View>
  );
};
