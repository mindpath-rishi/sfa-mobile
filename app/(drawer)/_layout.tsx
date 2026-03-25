import { Drawer } from 'expo-router/drawer';
import { Header } from '@/core/components/Header';
import { useTheme } from '@/shared/hooks/useTheme';
import { View, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { useFilterContext } from '@/shared/contexts/FilterContext';

// Custom Drawer Content
const CustomDrawerContent = (props: any) => {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Drawer Header */}
      <View
        style={{
          padding: 20,
          paddingTop: 40,
          backgroundColor: colors.primary,
        }}
      >
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: colors.surface,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 24, color: colors.primary, fontWeight: '600' }}>RS</Text>
        </View>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Rahul Sharma</Text>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
          Senior Sales Representative
        </Text>
      </View>

      {/* Drawer Items */}
      <DrawerContentScrollView {...props} style={{ flex: 1 }}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Drawer Footer */}
      <View
        style={{
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <DrawerItem
          label="Logout"
          icon={({ color, size }) => <Ionicons name="log-out-outline" size={size} color={color} />}
          onPress={() => {
            router.replace('/(auth)');
          }}
        />
        <Text
          style={{
            color: colors.textTertiary,
            fontSize: 12,
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          Version 2.0.0
        </Text>
      </View>
    </View>
  );
};

// Define header props for each screen with proper typing
const getHeaderProps = (
  routeName: string,
  title: string,
  activeFilterCount?: number,
  onFilterPress?: () => void,
) => {
  const showBack = routeName !== '(tabs)';

  // Common props for all screens
  const commonProps = {
    title,
    showMenu: !showBack,
    showBack,
    elevated: true,
    size: 'md' as const,
    centeredTitle: Platform.OS === 'ios',
  };

  // Screen-specific props with proper Ionicons typing
  switch (routeName) {
    case 'customers':
      return {
        ...commonProps,
        rightIcon: 'add' as const,
        secondRightIcon: 'scan' as const,
        onRightPress: () => router.push('/customers/add'),
        onSecondRightPress: () => router.push('/customers/scan'),
        // Filter icon
        showFilter: true,
        filterActive: (activeFilterCount || 0) > 0,
        filterCount: activeFilterCount || 0,
        onFilterPress: onFilterPress,
        filterPosition: 'right' as const,
        filterIcon: 'options-outline' as const,
        filterActiveIcon: 'options' as const,
      };

    case 'products':
      return {
        ...commonProps,
        // Add icon
        rightIcon: 'add' as const,
        onRightPress: () => router.push('/products/add'),

        // Filter icon
        showFilter: true,
        filterActive: (activeFilterCount || 0) > 0,
        filterCount: activeFilterCount || 0,
        onFilterPress: onFilterPress,
        filterPosition: 'right' as const,
        filterIcon: 'options-outline' as const,
        filterActiveIcon: 'options' as const,

        // Remove second icon to avoid clutter
        secondRightIcon: undefined,
        onSecondRightPress: undefined,
      };

    case 'beats':
      return {
        ...commonProps,
        rightIcon: 'calendar' as const,
        secondRightIcon: 'map' as const,
        onRightPress: () => router.push('/beats/calendar'),
        onSecondRightPress: () => router.push('/beats/optimize'),
        badgeCount: 2,
        showFilter: false,
      };

    case 'reports':
      return {
        ...commonProps,
        rightIcon: 'download' as const,
        secondRightIcon: 'share-social' as const,
        onRightPress: () => router.push('/reports/download'),
        onSecondRightPress: () => router.push('/reports/share'),
        showFilter: true,
        filterIcon: 'calendar-outline' as const,
        filterActiveIcon: 'calendar' as const,
        filterPosition: 'right' as const,
        filterActive: (activeFilterCount || 0) > 0,
        filterCount: activeFilterCount || 0,
        onFilterPress: onFilterPress,
      };

    case 'settings':
      return {
        ...commonProps,
        rightIcon: 'refresh' as const,
        onRightPress: () => console.log('Refresh settings'),
        showFilter: false,
      };

    case '(tabs)':
      return {
        ...commonProps,
        rightIcon: 'notifications' as const,
        secondRightIcon: 'chatbubbles' as const,
        onRightPress: () => router.push('/notifications'),
        onSecondRightPress: () => router.push('/messages'),
        badgeCount: 5,
        showFilter: false,
      };

    default:
      return {
        ...commonProps,
        showFilter: false,
      };
  }
};

export default function DrawerLayout() {
  const { colors } = useTheme();

  // Use the filter context
  const {
    productsFilterCount,
    customersFilterCount, // Add this
    reportsFilterCount,
  } = useFilterContext();

  const handleProductsFilterPress = () => {
    console.log('🔍 Open products filter modal');
    router.push('/products?openFilters=true');
  };

  const handleCustomersFilterPress = () => {
    // Add this handler
    console.log('🔍 Open customers filter modal');
    router.push('/customers?openFilters=true');
  };

  const handleReportsFilterPress = () => {
    console.log('🔍 Open reports filter modal');
    router.push('/reports?openFilters=true');
  };

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => ({
        header: ({ options }) => {
          let onFilterPress;
          let activeFilterCount = 0;

          switch (route.name) {
            case 'products':
              onFilterPress = handleProductsFilterPress;
              activeFilterCount = productsFilterCount;
              break;
            case 'customers': // Add this case
              onFilterPress = handleCustomersFilterPress;
              activeFilterCount = customersFilterCount;
              break;
            case 'reports':
              onFilterPress = handleReportsFilterPress;
              activeFilterCount = reportsFilterCount;
              break;
          }

          const headerProps = getHeaderProps(
            route.name,
            options.title as string,
            activeFilterCount,
            onFilterPress,
          );

          // Log to debug (optional)
          if (route.name === 'products' || route.name === 'customers') {
            console.log(`${route.name} header props:`, {
              ...headerProps,
              filterCount: activeFilterCount,
            });
          }

          return <Header {...headerProps} />;
        },
        drawerStyle: {
          backgroundColor: colors.surface,
          width: 280,
        },
        drawerLabelStyle: {
          color: colors.textPrimary,
          fontSize: 15,
          fontWeight: '500',
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerActiveBackgroundColor: colors.primary + '20',
        drawerIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case '(tabs)':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'customers':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'products':
              iconName = focused ? 'cube' : 'cube-outline';
              break;
            case 'beats':
              iconName = focused ? 'map' : 'map-outline';
              break;
            case 'reports':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
            case 'settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Dashboard',
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="customers"
        options={{
          title: 'Customers',
        }}
      />

      <Drawer.Screen
        name="products"
        options={{
          title: 'Products',
        }}
      />

      <Drawer.Screen
        name="beats"
        options={{
          title: 'My Routes',
        }}
      />

      <Drawer.Screen
        name="reports"
        options={{
          title: 'Reports',
        }}
      />

      <Drawer.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Drawer>
  );
}
