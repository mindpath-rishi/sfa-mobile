// components/NonSaleReasonStep.tsx
import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Customer } from '../../types/checkin.types';

import { useNonSaleReasonStepStyles } from '../../styles/NonSaleReasonStep.styles';
import { CustomerInfoCard } from '../checkin/CustomerCardInfo';
import { CategoryHeader } from '../checkin/CategoryHeader';
import { ReasonListItem } from '../checkin/ReasonListItem';
import { BottomNavigationButton } from '../checkin/BottomNavigationButton';

const REASON_CATEGORIES = [
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

const FURTHER_REASONS: any = {
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

interface NonSaleReasonStepProps {
  customer: Customer;
  selectedCategory: string | null;
  selectedReason: string | null;
  onReasonSelect: (reasonId: string) => void;
  onBack: () => void;
}

export const SecondSetp: React.FC<NonSaleReasonStepProps> = ({
  customer,
  selectedCategory,
  selectedReason,
  onReasonSelect,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const styles = useNonSaleReasonStepStyles();

  const reasons: any = selectedCategory ? FURTHER_REASONS[selectedCategory] || [] : [];
  const selectedCategoryData = REASON_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.customerInfo}>
          <CustomerInfoCard customer={customer} showDivider={false} />
        </View>

        {selectedCategoryData && (
          <View style={styles.categoryHeader}>
            <CategoryHeader category={selectedCategoryData} />
          </View>
        )}

        <View style={styles.reasonsList}>
          {reasons.map((reason: any) => (
            <ReasonListItem
              key={reason.id}
              id={reason.id}
              label={reason.label}
              isSelected={selectedReason === reason.id}
              onSelect={onReasonSelect}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bottomButtonContainer, { paddingBottom: insets.bottom || 16 }]}>
        <BottomNavigationButton onPress={onBack} iconName="arrow-back" label="Back to Categories" />
      </View>
    </View>
  );
};
