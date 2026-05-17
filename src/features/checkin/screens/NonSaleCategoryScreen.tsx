// components/non-sale/NonSaleCategoryScreen.tsx
import React, { useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Customer } from '../types/checkin.types';
import { AppCard, SectionHeader } from '@/core/components';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useAuthStore } from '@/core/store/auth.store';
import { useOutletStore } from '@/core/store/outlet.store';

export const REASON_CATEGORIES = [
  {
    id: 'product',
    title: 'PRODUCT\nRELATED ISSUE',
    icon: 'cube-outline',
    color: '#FF6B6B',
  },
  {
    id: 'distributor',
    title: 'DISTRIBUTOR\nRELATED ISSUE',
    icon: 'business-outline',
    color: '#4ECDC4',
  },
  {
    id: 'company',
    title: 'COMPANY\nRELATED ISSUE',
    icon: 'flag-outline',
    color: '#45B7D1',
  },
  {
    id: 'competitor',
    title: 'COMPETITOR\nRELATED ISSUE',
    icon: 'trophy-outline',
    color: '#96CEB4',
  },
  {
    id: 'shop',
    title: 'SHOP\nRELATED ISSUE',
    icon: 'storefront-outline',
    color: '#FFEAA7',
  },
  {
    id: 'more',
    title: 'MORE\nFACTORS',
    icon: 'options-outline',
    color: '#D4A5A5',
  },
];

interface NonSaleCategoryScreenProps {
  // customer: Customer;
  onCategorySelect?: (category: (typeof REASON_CATEGORIES)[0]) => void;
}

export const NonSaleCategoryScreen: React.FC<NonSaleCategoryScreenProps> = ({
  onCategorySelect,
}) => {
  const { colors } = useTheme();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { setHeader } = useHeader();
  const selectedOutlet = useOutletStore((s) => s.selectedOutlet);

  useFocusEffect(
    React.useCallback(() => {
      setHeader({
        title: selectedOutlet?.name,
        showBack: true,
        showMenu: false,
      });
    }, []),
  );

  const handleCategorySelect = (category: (typeof REASON_CATEGORIES)[0]) => {
    setSelectedCategoryId(category.id);

    if (onCategorySelect) {
      onCategorySelect(category);
    } else {
      // Add a small delay to show the selected state before navigation
      setTimeout(() => {
        router.push({
          pathname: '/checkin/nonsale/second-step',
          params: {
            // customerId: customer.id,
            // customerName: customer.name,
            // customerAddress: customer.address,
            // customerPhone: customer.phone,
            // customerRoute: customer.route,
            categoryId: category.id,
            categoryTitle: category.title.replace('\n', ' '),
            categoryColor: category.color,
            categoryIcon: category.icon,
          },
        });
      }, 150);
    }
  };

  const renderCategoryCard = ({ item }: { item: (typeof REASON_CATEGORIES)[0] }) => (
    <AppCard
      variant="outlined"
      selected={selectedCategoryId === item.id}
      selectedVariant="primary"
      onPress={() => handleCategorySelect(item)}
      padding="lg"
      radius="lg"
      style={{ flex: 1, margin: 6 }}
    >
      <View style={{ alignItems: 'center', justifyContent: 'center', padding: 8 }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: item.color + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <Ionicons name={item.icon as any} size={32} color={item.color} />
        </View>
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: colors.textPrimary,
            textAlign: 'center',
            lineHeight: 16,
          }}
        >
          {item.title}
        </Text>
      </View>
    </AppCard>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={REASON_CATEGORIES}
        renderItem={renderCategoryCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={
          <View style={{ padding: 16, paddingBottom: 8 }}>
            <SectionHeader title="Select a category" variant="compact" />
          </View>
        }
        contentContainerStyle={{ paddingBottom: 32 }}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          gap: 12,
          marginBottom: 12,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
