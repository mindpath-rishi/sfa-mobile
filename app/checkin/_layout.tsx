// SaleLayout.tsx
import { Stack, useNavigation } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { Header, HeaderProps } from '@/core/components/Header';
import { useFilterContext } from '@/shared/contexts/FilterContext';
import { useCallback } from 'react';

// Define extended options type
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
};

export default function SaleLayout() {
  const { colors } = useTheme();
  const { productsFilterCount } = useFilterContext();

  // Helper function to create screen options with type safety
  const createScreenOptions = (options: ScreenOptions) => options;

  return (
    <Stack
      screenOptions={{
        header: ({ options, navigation }) => {
          const customOptions = options as ScreenOptions;

          // Determine if filter should be shown on this screen
          const shouldShowFilter = customOptions.showFilter ?? false;
          const filterCount = customOptions.filterCount ?? productsFilterCount;
          const filterActive = customOptions.filterActive ?? filterCount > 0;

          return (
            <Header
              title={customOptions.title || 'Sale'}
              subtitle={customOptions.subtitle}
              showBack={
                customOptions.showBack !== undefined
                  ? customOptions.showBack
                  : navigation.canGoBack()
              }
              showMenu={customOptions.showMenu || false}
              // rightIcon={customOptions.rightIcon}
              // secondRightIcon={customOptions.secondRightIcon}
              onRightPress={customOptions.onRightPress}
              onSecondRightPress={customOptions.onSecondRightPress}
              elevated={customOptions.elevated !== undefined ? customOptions.elevated : true}
              centeredTitle={
                customOptions.centeredTitle !== undefined ? customOptions.centeredTitle : true
              }
              // size={customOptions.headerSize || 'md'}
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
          title: 'Sale',
          showMenu: true,
          headerSize: 'lg',
          rightIcon: 'search',
          showFilter: true, // Enable filter on index screen
          centeredTitle: false,
          onFilterPress: () => {
            // This will be overridden by the screen's own handler
            console.log('Filter pressed from layout');
          },
        })}
      />

      <Stack.Screen
        name="new"
        options={createScreenOptions({
          title: 'New Sale',
          showBack: true,
          rightIcon: 'save',
          secondRightIcon: 'close',
          centeredTitle: false,
        })}
      />

      <Stack.Screen
        name="salesSummary"
        options={createScreenOptions({
          title: 'Sales Summary',
          showBack: true,
          headerSize: 'sm',
          rightIcon: 'print',
          centeredTitle: false,
          elevated: false,
        })}
      />

      <Stack.Screen
        name="[id]"
        options={createScreenOptions({
          title: 'Sale Details',
          showBack: true,
          rightIcon: 'share',
          secondRightIcon: 'ellipsis-vertical',
          badgeCount: 1,
          centeredTitle: false,
        })}
      />
    </Stack>
  );
}
