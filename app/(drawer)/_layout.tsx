// app/(drawer)/_layout.tsx

import React, { useCallback } from 'react';
import { Drawer } from 'expo-router/drawer';
import { useTheme } from '@/shared/hooks/useTheme';
import { View, Text, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { router, useFocusEffect, useSegments } from 'expo-router';
import { useAuthStore } from '@/core/store/auth.store';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { Header } from '@/core/components/Header';

/* ============================
 * HEADER CONFIG MAP
 * ============================ */

/* ============================
 * HELPERS
 * ============================ */

const getCleanSegments = (segments: string[]) => segments.filter((s) => !s.startsWith('('));

const getRouteName = (segments: string[]) => {
  const clean = getCleanSegments(segments);

  if (segments.includes('(tabs)')) {
    return clean[0] || 'home';
  }

  return clean[0] || 'home';
};

const isProfileScreen = (segments: string[]) => {
  const clean = getCleanSegments(segments);
  return clean[0] === 'profile';
};

const isDetailScreen = (segments: string[]) => {
  const clean = getCleanSegments(segments);
  return clean.some((seg) =>
    ['[id]', 'detail', 'edit', 'approve', 'create', 'visit'].includes(seg),
  );
};

/* ============================
 * MODERN DRAWER HEADER
 * ============================ */

const ModernDrawerHeader = ({ colors, userName = 'Rahul Sharma', userRole = 'Sales Manager' }) => {
  return (
    <View
      style={{
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 48,
        backgroundColor: colors.primary,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 8,
      }}
    >
      {/* Avatar with gradient effect */}
      <View
        style={{
          width: 70,
          height: 70,
          borderRadius: 35,
          backgroundColor: 'rgba(255,255,255,0.2)',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
          borderWidth: 3,
          borderColor: 'rgba(255,255,255,0.5)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Text style={{ fontSize: 28, color: 'white', fontWeight: '600' }}>
          {userName.charAt(0)}
        </Text>
      </View>

      {/* User Info */}
      <Text style={{ color: 'white', fontSize: 20, fontWeight: '700', marginBottom: 4 }}>
        {userName}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <MaterialCommunityIcons name="briefcase-outline" size={14} color="rgba(255,255,255,0.8)" />
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{userRole}</Text>
      </View>
    </View>
  );
};

/* ============================
 * CUSTOM DRAWER CONTENT
 * ============================ */

const CustomDrawerContent = (props: any) => {
  const { colors } = useTheme();
  const logout = useAuthStore((s) => s.logout);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ModernDrawerHeader colors={colors} />

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 8 }}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Logout Section with Divider */}
      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginBottom: 20 }}>
        <DrawerItem
          label="Logout"
          labelStyle={{ fontWeight: '500' }}
          icon={({ color, size }) => (
            <MaterialCommunityIcons name="logout-variant" size={size} color={color} />
          )}
          onPress={async () => {
            await logout();
            router.replace('/(auth)');
          }}
          style={{
            borderRadius: 12,
            marginHorizontal: 8,
            marginTop: 8,
          }}
        />
      </View>
    </View>
  );
};

/* ============================
 * MAIN DRAWER
 * ============================ */

export default function DrawerLayout() {
  const { colors } = useTheme();
  const segments = useSegments();
  const { setHeader } = useHeader();

  const isDetail = isDetailScreen(segments);
  const isProfile = isProfileScreen(segments);

  const HEADER_MAP: Record<string, any> = {
    home: {
      title: '',
      showMenu: true,
      showBack: false,
      // backgroundColor: colors.primary + '13',
    },

    stock: {
      title: 'Stock',
      showMenu: false,
      showFilter: false,
      showBack: true,
    },
    topup: {
      title: 'Topup',
      showMenu: false,
      showFilter: false,
      showBack: false,
    },
    collection: {
      title: 'Collection',
      showMenu: false,
      showFilter: false,
      showBack: true,
    },

    route: {
      title: 'My Route',
      showMenu: false,
      showFilter: true,
      showBack: true,
    },
  };

  /* ============================
   * HEADER CONFIG
   * ============================ */

  useFocusEffect(
    useCallback(() => {
      if (isProfile || isDetail) {
        setHeader({ hidden: true });
        return;
      }

      const routeName = getRouteName(segments);

      const config = HEADER_MAP[routeName];

      if (config) {
        setHeader({
          hidden: config?.hidden,
          title: config.title,
          showMenu: config.showMenu ?? true,
          showBack: config.showBack ?? false,
          showFilter: config.showFilter ?? false,
          backgroundColor: colors.primary,
        });
      }
    }, [segments]),
  );

  /* ============================
   * MODERN ICON MAP
   * ============================ */

  const getModernIcon = (routeName: string, focused: boolean, color: string, size: number) => {
    const iconMap: Record<string, { component: any; focusedIcon: string; unfocusedIcon: string }> =
      {
        '(tabs)': {
          component: Feather,
          focusedIcon: 'home',
          unfocusedIcon: 'home',
        },
        outlets: {
          component: MaterialCommunityIcons,
          focusedIcon: 'storefront',
          unfocusedIcon: 'storefront-outline',
        },
        route: {
          component: MaterialCommunityIcons,
          focusedIcon: 'storefront',
          unfocusedIcon: 'storefront-outline',
        },
        products: {
          component: MaterialCommunityIcons,
          focusedIcon: 'package-variant',
          unfocusedIcon: 'package-variant-closed',
        },
        reports: {
          component: Feather,
          focusedIcon: 'bar-chart-2',
          unfocusedIcon: 'bar-chart-2',
        },
        stock: {
          component: MaterialCommunityIcons,
          focusedIcon: 'storefront',
          unfocusedIcon: 'storefront',
        },
        topup: {
          component: MaterialCommunityIcons,
          focusedIcon: 'cash-refund',
          unfocusedIcon: 'cash-refund',
        },
        collection: {
          component: MaterialCommunityIcons,
          focusedIcon: 'cash-multiple',
          unfocusedIcon: 'cash-multiple',
        },
        'stock-count': {
          component: MaterialCommunityIcons,
          focusedIcon: 'package-variant',
          unfocusedIcon: 'package-variant',
        },
      };

    const config = iconMap[routeName];
    if (!config) {
      return <Ionicons name="help-outline" size={size} color={color} />;
    }

    const IconComponent = config.component;
    const iconName = focused ? config.focusedIcon : config.unfocusedIcon;

    return <IconComponent name={iconName as any} size={size} color={color} />;
  };

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => ({
        header: () => {
          if (isProfile || isDetail) return null;
          return <Header />;
        },

        drawerStyle: {
          backgroundColor: colors.surface,
          width: 300,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        },

        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerActiveBackgroundColor: colors.primary + '15',

        drawerItemStyle: {
          borderRadius: 12,
          marginHorizontal: 8,
          marginVertical: 4,
        },

        drawerLabelStyle: {
          fontWeight: '500',
          fontSize: 15,
          marginLeft: -8,
        },

        drawerIcon: ({ color, size, focused }) => {
          return getModernIcon(route.name, focused, color, size);
        },
      })}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Dashboard',
          drawerLabel: 'Dashboard',
        }}
      />
      <Drawer.Screen
        name="stock"
        options={{
          title: 'Stock Management',
          drawerLabel: 'Stock',
        }}
      />
      <Drawer.Screen
        name="topup"
        options={{
          title: 'Topup',
          drawerLabel: 'Topup',
        }}
      />
      <Drawer.Screen
        name="route"
        options={{
          title: 'Route Management',
          drawerLabel: 'My Route',
        }}
      />

      <Drawer.Screen
        name="collection"
        options={{
          title: 'Cash Collection',
          drawerLabel: 'Collection',
        }}
      />
      <Drawer.Screen
        name="stock-count"
        options={{
          title: 'Stock Settlement',
          drawerLabel: 'Stock Settlement',
        }}
      />
    </Drawer>
  );
}
