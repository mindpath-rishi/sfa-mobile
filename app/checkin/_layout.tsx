// SaleLayout.tsx
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { Header, HeaderProps } from '@/core/components/Header';
import { useFilterContext } from '@/shared/contexts/FilterContext';
import { useMemo } from 'react';

type ScreenOptions = {
  headerShown?: boolean;

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

  const customerName = useMemo(() => {
    return (params.customerName as string) || (params.name as string) || null;
  }, [params.customerName, params.name]);

  const createScreenOptions = (options: ScreenOptions) => options;

  return (
    <Stack
      screenOptions={{
        header: ({ options, navigation }) => {
          const customOptions = options as ScreenOptions;

          /* ======================================================
           * ✅ RELIABLE HEADER HIDE
           * ====================================================== */
          if (customOptions.headerShown === false) {
            return null;
          }

          /* ======================================================
           * TITLE LOGIC
           * ====================================================== */
          let title = customOptions.title;
          if (customOptions.useCustomerTitle && customerName) {
            title = customerName;
          }

          /* ======================================================
           * FILTER LOGIC
           * ====================================================== */
          const shouldShowFilter = customOptions.showFilter ?? false;
          const filterCount = customOptions.filterCount ?? productsFilterCount;
          const filterActive = customOptions.filterActive ?? filterCount > 0;

          /* ======================================================
           * HEADER UI
           * ====================================================== */
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
              elevated={customOptions.elevated ?? true}
              centeredTitle={customOptions.centeredTitle ?? true}
              showBorder={customOptions.showBorder ?? true}
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
      {/* ================= INDEX ================= */}
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

      {/* ================= NON SALE ================= */}
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

      {/* ================= SHARE INVOICE ================= */}
      <Stack.Screen
        name="shareinvoice"
        options={createScreenOptions({
          headerShown: false, // ✅ works perfectly now
        })}
      />
    </Stack>
  );
}
