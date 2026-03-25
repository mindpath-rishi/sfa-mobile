import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNoSalesReasonStyles } from '../styles/NoSalesReason.styles';

// Mock data
const MOCK_CUSTOMER = {
  id: '16295',
  name: 'Zombela',
};

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

export default function NoSalesReasonScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useNoSalesReasonStyles();
  const params = useLocalSearchParams();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const customerId = params.customerId || MOCK_CUSTOMER.id;
  const customerName = params.customerName || MOCK_CUSTOMER.name;

  const handleSelectReason = (reasonId: string) => {
    setSelectedReason(reasonId);
  };

  const handleProceed = () => {
    if (!selectedReason) {
      // Show error or alert
      return;
    }

    // Navigate to further reason screen with selected category
    router.push({
      pathname: '/nonsale/further-reason',
      params: {
        customerId,
        customerName,
        category: selectedReason,
        categoryTitle: REASON_CATEGORIES.find((r) => r.id === selectedReason)?.title,
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>No Sales Reason</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Customer Info */}
        <View style={styles.customerInfo}>
          <Text style={styles.customerId}>
            {customerId}-{customerName}
          </Text>
        </View>

        {/* Reasons Grid */}
        <View style={styles.reasonsGrid}>
          {REASON_CATEGORIES.map((reason) => (
            <TouchableOpacity
              key={reason.id}
              style={[
                styles.reasonCard,
                selectedReason === reason.id && styles.reasonCardSelected,
                { borderColor: selectedReason === reason.id ? reason.color : colors.border + '30' },
              ]}
              onPress={() => handleSelectReason(reason.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.reasonIconContainer, { backgroundColor: reason.color + '20' }]}>
                <Ionicons name={reason.icon as any} size={32} color={reason.color} />
              </View>
              <Text style={styles.reasonTitle}>{reason.title}</Text>
              {selectedReason === reason.id && (
                <View style={[styles.selectedIndicator, { backgroundColor: reason.color }]}>
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
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
          onPress={handleProceed}
          disabled={!selectedReason}
          activeOpacity={0.9}
        >
          <Text style={styles.proceedButtonText}>SELECT ONE →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
