import React, { useEffect, useState, useCallback } from 'react';
import { Alert, View, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Loader, AppText } from '@/core/components';
import { EmptyState } from '@/core/components/EmptyState';
import { useTheme } from '@/shared/hooks/useTheme';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { vanService } from '@/shared/services/van.service';
import { formatCurrency } from '@/shared/utils/currenty.utils';
import { formatWeight } from '@/shared/utils/weight.utils';

import { TopupDetailHeader } from '../components/TopupDetailHeader';
import { TopupDetailProducts } from '../components/TopupDetailProducts';
import { createTopupDetailStyles } from '../styles/topupDetail.styles';
import { ActiveTab, TopupDetail } from '../types/topupDetail.types';
import { TopupItem } from '../types/topup.types';
import { TopupDetailOverview } from '../components/TopupDetailOverview';

export const VanInventoryTopupDetail: React.FC = () => {
  const { colors } = useTheme();
  const styles = createTopupDetailStyles(colors);
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route?.params as { id: string };

  const [detail, setDetail] = useState<TopupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const { setHeader } = useHeader();

  const fetchDetail = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setIsLoading(true);

      const response = await vanService.fetchInventoryTopupRequest(id);

      if (response?.success && response?.data) {
        setDetail(response.data);
      } else {
        Alert.alert('Error', response?.message || 'Failed to load details');
      }
    } catch (error) {
      console.error('Error fetching topup detail:', error);
      Alert.alert('Error', 'Failed to load top-up details');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      setHeader({
        hidden: true,
      });
    }, [setHeader]),
  );

  const handleTabChange = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
  }, []);

  if (isLoading) {
    return <Loader fullScreen overlay label="Loading details..." />;
  }

  if (!detail) {
    return (
      <EmptyState
        title="No Data Found"
        description="The top-up request you're looking for doesn't exist or has been removed."
        icon="document-text-outline"
        actionLabel="Go Back"
        onAction={() => navigation.goBack()}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <TopupDetailHeader
        detail={detail}
        colors={colors}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {activeTab === 'overview' ? (
        <TopupDetailOverview detail={detail} colors={colors} />
      ) : (
        <TopupDetailProducts items={detail.items} colors={colors} />
      )}
    </SafeAreaView>
  );
};

export default VanInventoryTopupDetail;
