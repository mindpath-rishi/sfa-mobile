import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { AppButton, SectionHeader } from '@/core/components';
import { EmptyState } from '@/core/components/EmptyState';
import { useLoaderStore } from '@/core/loader/loader.store';
import { useAuthStore } from '@/core/store/auth.store';
import { useOutletStore } from '@/core/store/outlet.store';
import { useRouteStore } from '@/core/store/route.store';
import { toast } from '@/core/utils';
import { useTheme } from '@/shared/hooks/useTheme';
import { outletService } from '@/features/outlet/services/outlet.service';
import { nonSaleService } from '@/features/outlet/services/non-sale.service';

import { BottomBar } from '../components/nonsale/BottomBar';
import { ReasonCard } from '../components/nonsale/ReasonCard';
import { SelectedCategoryBadge } from '../components/nonsale/SelectedItemBadge';

type FurtherReason = {
  id: string;
  label: string;
};

export const FURTHER_REASONS: Record<string, FurtherReason[]> = {
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

const waitForUi = () => new Promise((resolve) => setTimeout(resolve, 50));

export const NonSaleFinalScreen: React.FC = () => {
  const { colors } = useTheme();
  const params = useLocalSearchParams();

  const activeVisit = useOutletStore((s) => s.activeVisit);
  const selectedOutlet = useOutletStore((s) => s.selectedOutlet);
  const activeInteraction = useOutletStore((s) => s.activeInteraction);
  const clearVisit = useOutletStore((s) => s.clearVisit);

  const van = useRouteStore((s) => s.van);
  const selectedRoute = useRouteStore((s) => s.selectedRoute);
  const user = useAuthStore((s) => s.user);

  const showLoader = useLoaderStore((s) => s.show);
  const hideLoader = useLoaderStore((s) => s.hide);

  const submitLockRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryTitle = useMemo(
    () => (params.categoryTitle as string) || 'SHOP RELATED ISSUE',
    [params.categoryTitle],
  );

  const categoryColor = useMemo(
    () => (params.categoryColor as string) || '#FFEAA7',
    [params.categoryColor],
  );

  const categoryIcon = useMemo(
    () => (params.categoryIcon as string) || 'storefront-outline',
    [params.categoryIcon],
  );

  const categoryId = useMemo(() => (params.categoryId as string) || 'shop', [params.categoryId]);

  const reasonId = useMemo(() => params.reasonId as string | undefined, [params.reasonId]);

  const reasonLabel = useMemo(() => (params.reasonLabel as string) || '', [params.reasonLabel]);

  const specificReasons = useMemo(() => {
    if (!reasonId) return [];

    return FURTHER_REASONS[categoryId]?.filter((reason) => reason.id === reasonId) ?? [];
  }, [categoryId, reasonId]);

  const defaultReasonId = specificReasons[0]?.id ?? null;
  const [selectedReason, setSelectedReason] = useState<string | null>(defaultReasonId);

  useEffect(() => {
    setSelectedReason(defaultReasonId);
  }, [defaultReasonId]);

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });

    return () => backHandler.remove();
  }, [handleBack]);

  const handleSubmit = useCallback(async () => {
    if (submitLockRef.current || isSubmitting) return;

    const finalReasonId = selectedReason || reasonId;

    if (!finalReasonId || specificReasons.length === 0) {
      toast.error('Reason required', 'Please select a valid No Sale reason.');
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      let visit = activeVisit;

      if (!visit) {
        const canStartVisit =
          selectedOutlet?.customerId &&
          activeInteraction &&
          activeInteraction.customerId === selectedOutlet.customerId &&
          selectedRoute?.routeSessionId &&
          selectedRoute.workSessionId &&
          van?.vanId;

        if (!canStartVisit) {
          toast.error('Visit unavailable', 'Return to the outlet and capture arrival GPS first.');
          return;
        }

        showLoader({ message: 'Starting outlet visit...' });
        await waitForUi();

        const visitResponse = await outletService.startVisit(
          {
            routeSessionId: selectedRoute.routeSessionId,
            workSessionId: selectedRoute.workSessionId,
            vanId: van.vanId,
            outletId: selectedOutlet.customerId,
            visitType: activeInteraction.visitType,
            interactionId: activeInteraction.interactionId,
          },
          { showLoader: false },
        );

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

        const outletStore = useOutletStore.getState();

        outletStore.setActiveVisit(visit);
        outletStore.setActiveInteraction({
          ...activeInteraction,
          status: 'CONVERTED',
        });
      }

      const payload: any = {
        visitId: visit.visitId,
        vanId: van?.vanId ?? user?.vanId,
        outletId: visit.outlet.customerId,
        reasonId: finalReasonId,
        reasonCategoryId: categoryId,
        remark: reasonLabel,
      };

      showLoader({ message: 'Saving no sale...' });
      await waitForUi();

      const response = await nonSaleService.markNonSale(payload);

      if (!response.success) {
        toast.error('No Sale failed', response.message || 'Unable to save No Sale data.');
        return;
      }

      /**
       * Online no-sale creation already completes the visit on backend.
       * Offline records need separate local visit completion.
       */
      if (response.offline) {
        showLoader({ message: 'Completing outlet visit...' });
        await waitForUi();

        const completionResponse = await outletService.completeVisit(visit.visitId);

        if (!completionResponse.success) {
          toast.error(
            'Visit completion failed',
            completionResponse.message || 'No Sale was saved, but the local visit was not closed.',
          );
          return;
        }
      }

      showLoader({ message: 'Updating route...' });
      await waitForUi();

      clearVisit();
      router.replace('/route');
    } catch (error) {
      toast.error(
        'No Sale failed',
        error instanceof Error ? error.message : 'Unable to save No Sale data.',
      );
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
      hideLoader();
    }
  }, [
    activeInteraction,
    activeVisit,
    categoryId,
    clearVisit,
    hideLoader,
    isSubmitting,
    reasonId,
    reasonLabel,
    selectedOutlet,
    selectedReason,
    selectedRoute,
    showLoader,
    specificReasons.length,
    user?.vanId,
    van?.vanId,
  ]);

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
          disabled={!selectedReason || specificReasons.length === 0 || isSubmitting}
          size="large"
        />
      </BottomBar>
    </View>
  );
};
