import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, BackHandler } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppButton, SectionHeader } from '@/core/components';
import { BottomBar } from '../components/nonsale/BottomBar';
import { SelectedCategoryBadge } from '../components/nonsale/SelectedItemBadge';
import { ReasonCard } from '../components/nonsale/ReasonCard';
import { EmptyState } from '@/core/components/EmptyState';
import { nonSaleService } from '@/features/outlet/services/non-sale.service';
import { useOutletStore } from '@/core/store/outlet.store';
import { useRouteStore } from '@/core/store/route.store';
import { useAuthStore } from '@/core/store/auth.store';
import { outletService } from '@/features/outlet/services/outlet.service';
import { toast } from '@/core/utils';

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
  const activeVisit = useOutletStore((s) => s.activeVisit);
  const selectedOutlet = useOutletStore((s) => s.selectedOutlet);
  const activeInteraction = useOutletStore((s) => s.activeInteraction);
  const clearVisit = useOutletStore((s) => s.clearVisit);
  const van = useRouteStore((s) => s.van);
  const selectedRoute = useRouteStore((s) => s.selectedRoute);
  const user = useAuthStore((s) => s.user);

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
    setIsSubmitting(true);
    try {
      let visit = activeVisit;
      if (!visit) {
        if (
          !selectedOutlet?.customerId ||
          !activeInteraction ||
          activeInteraction.customerId !== selectedOutlet.customerId ||
          !selectedRoute?.routeSessionId ||
          !selectedRoute.workSessionId ||
          !van?.vanId
        ) {
          toast.error('Visit unavailable', 'Return to the outlet and capture arrival GPS first.');
          return;
        }
        const visitResponse = await outletService.startVisit({
          routeSessionId: selectedRoute.routeSessionId,
          workSessionId: selectedRoute.workSessionId,
          vanId: van.vanId,
          outletId: selectedOutlet.customerId,
          visitType: activeInteraction.visitType,
          interactionId: activeInteraction.interactionId,
        });
        if (!visitResponse.success || !visitResponse.data?.visitId) {
          toast.error('Visit unavailable', visitResponse.message || 'Unable to start visit.');
          return;
        }
        visit = {
          visitId: visitResponse.data.visitId,
          outlet: selectedOutlet,
          checkInTime: new Date(visitResponse.data.checkInTime || activeInteraction.arrivalTime),
          status: 'ACTIVE',
          routeSessionId: selectedRoute.routeSessionId,
          customerId: selectedOutlet.customerId,
          visitType: activeInteraction.visitType,
        };
        useOutletStore.getState().setActiveVisit(visit);
        useOutletStore
          .getState()
          .setActiveInteraction({ ...activeInteraction, status: 'CONVERTED' });
      }

      const payload: any = {
        visitId: visit.visitId,
        vanId: van?.vanId ?? user?.vanId,
        outletId: visit.outlet.customerId,
        reasonId: selectedReason || reasonId,
        reasonCategoryId: categoryId,
        remark: reasonLabel || '',
      };
      const response = await nonSaleService.markNonSale(payload);
      if (!response.success) {
        toast.error('No Sale failed', response.message || 'Unable to save No Sale data.');
        return;
      }

      // Online non-sale creation already completes the visit atomically on the
      // backend. Only offline records need the separate local visit update.
      if (response.offline) {
        const completionResponse = await outletService.completeVisit(visit.visitId);
        if (!completionResponse.success) {
          toast.error(
            'Visit completion failed',
            completionResponse.message || 'No Sale was saved, but the local visit was not closed.',
          );
          return;
        }
      }
      clearVisit();
      router.replace('/route');
    } catch (error) {
      toast.error(
        'No Sale failed',
        error instanceof Error ? error.message : 'Unable to save No Sale data.',
      );
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

        <SectionHeader title="Selected reason:" variant="compact" />

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
