// app/(drawer)/_layout.tsx
import { Drawer } from 'expo-router/drawer';
import { Header } from '@/core/components/Header';
import { useTheme } from '@/shared/hooks/useTheme';
import { View, Text, Platform, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { router, useSegments, useNavigation } from 'expo-router';
import { useFilterContext } from '@/shared/contexts/FilterContext';
import { useEffect } from 'react';
import { useAuthStore } from '@/core/store/auth.store';

// Custom Drawer Content
const CustomDrawerContent = (props: any) => {
  const { colors } = useTheme();
  const logout = useAuthStore((s) => s.logout);

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
          onPress={async () => {
            await logout(); // ✅ clear token from storage + state
            router.replace('/(auth)'); // ✅ replace (not push)
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

// Helper to check if current screen is a detail screen
const isDetailScreen = (segments: string[]) => {
  console.log('Current segments:', segments);
  if (segments[2] && segments[2] === '[id]') {
    return true;
  }
  return false;
};

// Get header props based on route
const getHeaderProps = (
  routeName: string,
  segments: string[],
  title: string,
  activeFilterCount?: number,
  onFilterPress?: () => void,
) => {
  // const isDetail = isDetailScreen(segments);

  // // For detail screens, show back button
  // if (isDetail) {
  //   return {
  //     title,
  //     showBack: true,
  //     showMenu: false,
  //     elevated: true,
  //     size: 'md' as const,
  //     centeredTitle: Platform.OS === 'ios',
  //     showFilter: false,
  //   };
  // }

  const showBack = routeName !== '(tabs)';

  const commonProps = {
    title,
    showMenu: !showBack,
    showBack,
    elevated: true,
    size: 'md' as const,
    centeredTitle: Platform.OS === 'ios',
  };

  switch (routeName) {
    case 'customers':
      return {
        ...commonProps,
        rightIcon: 'add' as const,
        secondRightIcon: 'scan' as const,
        onRightPress: () => router.push('/customers/add'),
        onSecondRightPress: () => router.push('/customers/scan'),
        showFilter: true,
        filterActive: (activeFilterCount || 0) > 0,
        filterCount: activeFilterCount || 0,
        onFilterPress: onFilterPress,
      };

    case 'products':
      return {
        ...commonProps,
        rightIcon: 'add' as const,
        onRightPress: () => router.push('/products/add'),
        showFilter: true,
        filterActive: (activeFilterCount || 0) > 0,
        filterCount: activeFilterCount || 0,
        onFilterPress: onFilterPress,
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
        filterActive: (activeFilterCount || 0) > 0,
        filterCount: activeFilterCount || 0,
        onFilterPress: onFilterPress,
      };

    default:
      return commonProps;
  }
};

export default function DrawerLayout() {
  const { colors } = useTheme();
  const segments = useSegments();
  const navigation = useNavigation();
  const { productsFilterCount, customersFilterCount, reportsFilterCount } = useFilterContext();

  const handleProductsFilterPress = () => router.push('/products?openFilters=true');
  const handleCustomersFilterPress = () => router.push('/customers?openFilters=true');
  const handleReportsFilterPress = () => router.push('/reports?openFilters=true');

  const isDetail = isDetailScreen(segments);

  // // Handle device back button
  // useEffect(() => {
  //   const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
  //     if (isDetail) {
  //       navigation.goBack();
  //       return true;
  //     }
  //     return false;
  //   });

  //   return () => backHandler.remove();
  // }, [isDetail, navigation]);

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => ({
        header: ({ options }) => {
          let onFilterPress;
          let activeFilterCount = 0;
          const routeName = route.name;

          // ✅ FIX: Only show header for customers index

          const isDetail = isDetailScreen(segments);

          console.log('Is Detail Screen:', isDetail, 'Segments:', segments);

          if (isDetail) {
            return null; // ❌ hide header for all other screens
          }

          switch (routeName) {
            case 'products':
              onFilterPress = handleProductsFilterPress;
              activeFilterCount = productsFilterCount;
              break;
            case 'customers':
              onFilterPress = handleCustomersFilterPress;
              activeFilterCount = customersFilterCount;
              break;
            case 'reports':
              onFilterPress = handleReportsFilterPress;
              activeFilterCount = reportsFilterCount;
              break;
          }

          const headerProps = getHeaderProps(
            routeName,
            segments,
            options.title as string,
            activeFilterCount,
            onFilterPress,
          );

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
        swipeEnabled: !isDetail,
        drawerType: isDetail ? 'front' : 'slide',
        drawerIcon: ({ color, size, focused }) => {
          const icons: Record<string, string> = {
            '(tabs)': focused ? 'home' : 'home-outline',
            customers: focused ? 'people' : 'people-outline',
            products: focused ? 'cube' : 'cube-outline',
            beats: focused ? 'map' : 'map-outline',
            reports: focused ? 'bar-chart' : 'bar-chart-outline',
            settings: focused ? 'settings' : 'settings-outline',
          };
          const iconName = icons[route.name] || 'help-outline';
          return <Ionicons name={iconName as any} size={size} color={color} />;
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
          headerShown: true,
        }}
      />
      <Drawer.Screen name="products" options={{ title: 'Products' }} />
      <Drawer.Screen name="beats" options={{ title: 'My Routes' }} />
      <Drawer.Screen name="reports" options={{ title: 'Reports' }} />
      <Drawer.Screen name="settings" options={{ title: 'Settings' }} />
    </Drawer>
  );
}
