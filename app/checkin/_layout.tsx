// SaleLayout.tsx
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { Header, HeaderProps } from '@/core/components/Header';
import { useFilterContext } from '@/shared/contexts/FilterContext';
import { useMemo } from 'react';

type ScreenOptions = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showMenu?: boolean;
  headerSize?: HeaderProps['size'];
  rightIcon?: string;
  secondRightIcon?: string;
  onRightPress?: () => void;
  onSecondRightPress?: () => void;
  elevated?: boolean;
  centeredTitle?: boolean;
  showBorder?: boolean;
  showSearch?: boolean;
  showFilter?: boolean;
  filterActive?: boolean;
  filterCount?: number;
  onFilterPress?: () => void;
  badgeCount?: number;
  useCustomerTitle?: boolean;
};

export default function SaleLayout() {
  const { colors } = useTheme();
  const { productsFilterCount } = useFilterContext();
  const params = useLocalSearchParams();

  // Get customer name from params - single source of truth
  const customerName = useMemo(() => {
    return (params.customerName as string) || (params.name as string) || null;
  }, [params.customerName, params.name]);

  const createScreenOptions = (options: ScreenOptions) => options;

  return (
    <Stack
      screenOptions={{
        header: ({ options, navigation }) => {
          const customOptions = options as ScreenOptions;

          // Determine title - use customer name if requested and available
          let title = customOptions.title;
          if (customOptions.useCustomerTitle && customerName) {
            title = customerName;
          }

          const shouldShowFilter = customOptions.showFilter ?? false;
          const filterCount = customOptions.filterCount ?? productsFilterCount;
          const filterActive = customOptions.filterActive ?? filterCount > 0;

          return (
            <Header
              title={title}
              subtitle={customOptions.subtitle}
              showBack={
                customOptions.showBack !== undefined
                  ? customOptions.showBack
                  : navigation.canGoBack()
              }
              showMenu={customOptions.showMenu || false}
              onRightPress={customOptions.onRightPress}
              onSecondRightPress={customOptions.onSecondRightPress}
              elevated={customOptions.elevated !== undefined ? customOptions.elevated : true}
              centeredTitle={
                customOptions.centeredTitle !== undefined ? customOptions.centeredTitle : true
              }
              showBorder={customOptions.showBorder !== undefined ? customOptions.showBorder : true}
              showSearch={customOptions.showSearch || false}
              showFilter={shouldShowFilter}
              filterActive={filterActive}
              filterCount={filterCount}
              onFilterPress={customOptions.onFilterPress}
              badgeCount={customOptions.badgeCount}
            />
          );
        },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={createScreenOptions({
          title: 'Sale Summary',
          showMenu: true,
          showFilter: true,
          centeredTitle: false,
          onFilterPress: () => console.log('Filter pressed'),
        })}
      />

      {/* Non-sale screens - all use customer name as title */}
      <Stack.Screen
        name="nonsale/second-step"
        options={createScreenOptions({
          useCustomerTitle: true,
          showBack: true,
          centeredTitle: false,
        })}
      />

      <Stack.Screen
        name="nonsale/final-step"
        options={createScreenOptions({
          useCustomerTitle: true,
          showBack: true,
          centeredTitle: false,
        })}
      />
    </Stack>
  );
}
