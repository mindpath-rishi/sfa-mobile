// app/(drawer)/_layout.tsx
import { Drawer } from 'expo-router/drawer';
import { Header } from '@/core/components/Header';
import { useTheme } from '@/shared/hooks/useTheme';
import { View, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { router, useSegments } from 'expo-router';
import { useFilterContext } from '@/shared/contexts/FilterContext';
import { useAuthStore } from '@/core/store/auth.store';

/* ============================
 * CUSTOM DRAWER CONTENT
 * ============================ */

const CustomDrawerContent = (props: any) => {
  const { colors } = useTheme();
  const logout = useAuthStore((s) => s.logout);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* USER INFO */}
      <View style={{ padding: 20, paddingTop: 40, backgroundColor: colors.primary }}>
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

      {/* MENU */}
      <DrawerContentScrollView {...props} style={{ flex: 1 }}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* FOOTER */}
      <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: colors.border }}>
        <DrawerItem
          label="Logout"
          icon={({ color, size }) => <Ionicons name="log-out-outline" size={size} color={color} />}
          onPress={async () => {
            await logout();
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

/* ============================
 * DETAIL SCREEN DETECTION (FIXED)
 * ============================ */

const isDetailScreen = (segments: string[]) => {
  const detailScreens = ['[id]', 'detail', 'edit', 'approve', 'create'];

  return segments.some((seg) => detailScreens.includes(seg));
};

/* ============================
 * HEADER CONFIG
 * ============================ */

const getHeaderProps = (
  routeName: string,
  segments: string[],
  title: string,
  activeFilterCount?: number,
  onFilterPress?: () => void,
  onRightPress?: () => void,
) => {
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
    case 'outlets':
      return {
        ...commonProps,
        // rightIcon: 'add' as const,
        onRightPress,
        showFilter: false,
        filterActive: (activeFilterCount || 0) > 0,
        filterCount: activeFilterCount || 0,
        onFilterPress,
      };

    case 'products':
      return {
        ...commonProps,
        rightIcon: 'add' as const,
        onRightPress: () => router.push('/products/add'),
        showFilter: true,
        filterActive: (activeFilterCount || 0) > 0,
        filterCount: activeFilterCount || 0,
        onFilterPress,
      };

    case 'beats':
      return {
        ...commonProps,
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
        onFilterPress,
      };

    default:
      return commonProps;
  }
};

/* ============================
 * MAIN DRAWER
 * ============================ */

export default function DrawerLayout() {
  const { colors } = useTheme();
  const segments = useSegments();

  const {
    productsFilterCount,
    outletsFilterCount,
    reportsFilterCount,
    openOutletFilter,
    openProductFilter,
  } = useFilterContext();

  const isDetail = isDetailScreen(segments);

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => ({
        /* 🔥 FIX: Hide header on detail screens */
        header: ({ options }) => {
          if (isDetail) return null;

          let onFilterPress;
          let activeFilterCount = 0;

          switch (route.name) {
            case 'products':
              onFilterPress = openProductFilter;
              activeFilterCount = productsFilterCount;
              break;
            case 'outlets':
              onFilterPress = openOutletFilter;
              activeFilterCount = outletsFilterCount;
              break;
            case 'reports':
              activeFilterCount = reportsFilterCount;
              break;
          }

          const headerProps = getHeaderProps(
            route.name,
            segments,
            options.title as string,
            activeFilterCount,
            onFilterPress,
          );

          return <Header {...headerProps} />;
        },

        /* ================= UI ================= */
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

        /* 🔥 FIX: Disable drawer swipe on detail */
        swipeEnabled: !isDetail,
        drawerType: isDetail ? 'front' : 'slide',

        /* ================= ICONS ================= */
        drawerIcon: ({ color, size, focused }) => {
          const icons: Record<string, string> = {
            '(tabs)': focused ? 'home' : 'home-outline',
            outlets: focused ? 'people' : 'people-outline',
            products: focused ? 'cube' : 'cube-outline',
            beats: focused ? 'map' : 'map-outline',
            reports: focused ? 'bar-chart' : 'bar-chart-outline',
            settings: focused ? 'settings' : 'settings-outline',
            stock: focused ? 'archive' : 'archive-outline',
            topup: focused ? 'add-circle' : 'add-circle-outline',
            collection: focused ? 'wallet' : 'wallet-outline',
          };

          return (
            <Ionicons
              name={(icons[route.name] || 'help-outline') as any}
              size={size}
              color={color}
            />
          );
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
        name="outlets"
        options={{ title: 'Outlets', drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen
        name="products"
        options={{ title: 'Products', drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen name="beats" options={{ title: 'My Routes' }} />
      <Drawer.Screen
        name="reports"
        options={{ title: 'Reports', drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen name="stock" options={{ title: 'Stock' }} />
      <Drawer.Screen name="topup" options={{ title: 'Topup' }} />
      <Drawer.Screen name="collection" options={{ title: 'Collection' }} />
      <Drawer.Screen
        name="settings"
        options={{ title: 'Settings', drawerItemStyle: { display: 'none' } }}
      />
    </Drawer>
  );
}
