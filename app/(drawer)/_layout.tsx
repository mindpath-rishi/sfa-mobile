import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Drawer } from 'expo-router/drawer';
import { useTheme } from '@/shared/hooks/useTheme';
import { View, Text, Platform, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { router, useSegments } from 'expo-router';
import { useAuthStore } from '@/core/store/auth.store';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { Header } from '@/core/components/Header';
import { AppModal, AppText, ConfirmationModal } from '@/core/components';
import { vanService } from '@/shared/services/van.service';
import { homeService } from '@/features/home/services/home.service';
import { useRouteStore } from '@/core/store/route.store';
import { DayEndSummaryModal } from '@/features/home/components/models/DayEndSummaryModal';
import { toast } from '@/core/utils';
import { useAppEventsStore } from '@/core/store/appEvents.store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRoleId } from '@/core/navigation/role.utils';

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
  return clean[0] === 'home';
};

const isDetailScreen = (segments: string[]) => {
  const clean = getCleanSegments(segments);
  return clean.length > 1;
};

const SALESMAN_DRAWER_ROUTES = new Set([
  '(tabs)',
  'my-pocket',
  'stock',
  'route',
  'my-target',
  'switch-route',
  'topup',
  'checkin',
  // 'stock-count',
]);

const MANAGER_DRAWER_ROUTES = new Set([
  '(tabs)',
  'manager-targets',
  'team-coverage',
  'beat-o-meter',
  'survey-analytics',
]);

const SHARED_TAB_ROUTES = new Set(['home', 'profile']);
const MANAGER_TAB_ROUTES = new Set(['daily-summary', 'quick-viz']);

/* ============================
 * MODERN DRAWER HEADER
 * ============================ */

const ModernDrawerHeader = ({
  colors,
  userName = 'Rahul Sharma',
  userRole = 'Sales Manager',
}: any) => {
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

// const CustomDrawerContent = (props: any) => {
//   const { colors } = useTheme();
//   const logout = useAuthStore((s) => s.logout);
//   const user = useAuthStore((s) => s.user);
//   const { workSessionId, setWorkSessionId } = useAuthStore();

//   const [showSettlementConfirm, setShowSettlementConfirm] = useState(false);
//   const [dayEndSummary, setDayEndSummary] = useState<any>(null);
//   const [showDayEndSummary, setShowDayEndSummary] = useState(false);
//   const [showSettlementOptions, setShowSettlementOptions] = useState(false);
//   const [showFinalConfirm, setShowFinalConfirm] = useState(false);
//   const [carryForwardStock, setCarryForwardStock] = useState(true);
//   const settleInFlightRef = useRef(false);
//   const bumpDashboardRefresh = useAppEventsStore((s) => s.bumpDashboardRefresh);

//   const fetchDayEndSummary = useCallback(async () => {
//     try {
//       const vanIdToUse =
//         useRouteStore.getState().van?.vanId || (user as any)?.vanId || (user as any)?.defaultVanId;

//       if (!vanIdToUse) {
//         toast.error('Van not found. Please start your day first.');
//         return;
//       }

//       const res: any = await vanService.fetchTodayStockSummary({
//         vanId: vanIdToUse,
//         workSessionId,
//       });
//       setDayEndSummary(res?.data);
//       setShowDayEndSummary(true);
//     } catch (error) {
//       console.error('Error fetching day end summary:', error);
//       toast.error('Failed to load day end summary. Please try again.');
//     }
//   }, [user]);

//   const submitSettlement = useCallback(async () => {
//     if (settleInFlightRef.current) return;
//     settleInFlightRef.current = true;
//     try {
//       const response: any = await homeService.dayComplete(carryForwardStock as any);
//       if (response?.success || response?.statusCode === 200) {
//         toast.success('Your day successfully completed');
//         setShowFinalConfirm(false);
//         setShowSettlementOptions(false);
//         setShowDayEndSummary(false);
//         bumpDashboardRefresh();
//         setWorkSessionId(null);
//         router.replace('/(drawer)/(tabs)/home');
//         return;
//       }
//       toast.error(response?.message || 'Failed to complete day');
//     } catch (error) {
//       console.error('Error completing day:', error);
//       toast.error('Failed to complete day. Please try again.');
//     } finally {
//       settleInFlightRef.current = false;
//     }
//   }, [carryForwardStock]);

//   const handleVanSettlementPress = useCallback(async () => {
//     try {
//       const statusRes: any = await homeService.getDayStatus('');
//       const status = statusRes?.data?.status;
//       if (status !== 'ACTIVE') {
//         toast.error('Day not started. Please start day before Van Settlement.');
//         return;
//       }

//       setCarryForwardStock(true);
//       setShowSettlementConfirm(true);
//     } catch (error) {
//       console.error('Error checking day status:', error);
//       toast.error('Unable to check day status. Please try again.');
//     }
//   }, []);

//   // Filter out hidden screens from the drawer list (collection hidden)
//   const filteredProps = {
//     ...props,
//     state: {
//       ...props.state,
//       routes: props.state.routes.filter((route: any) => {
//         // Hide 'collection' from drawer
//         return route.name !== 'collection';
//       }),
//     },
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: colors.background }}>
//       <ModernDrawerHeader colors={colors} />

//       <DrawerContentScrollView
//         {...filteredProps}
//         contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 8 }}
//       >
//         <DrawerItemList {...filteredProps} />
//       </DrawerContentScrollView>

//       {/* Logout Section with Divider */}
//       <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginBottom: 20 }}>
//         <DrawerItem
//           label="Van Settlement"
//           labelStyle={{ fontWeight: '500', color: 'red' }}
//           icon={({ size }) => <MaterialCommunityIcons name="power" size={size} color="red" />}
//           onPress={() => {
//             props.navigation?.closeDrawer?.();
//             void handleVanSettlementPress();
//           }}
//           style={{
//             borderRadius: 12,
//             marginHorizontal: 8,
//             marginTop: 8,
//           }}
//         />
//       </View>

//       <ConfirmationModal
//         visible={showSettlementConfirm}
//         title="Van Settlement"
//         message="Do you want to settlement of van?"
//         confirmText="Yes, Continue"
//         cancelText="Cancel"
//         type="info"
//         onCancel={() => setShowSettlementConfirm(false)}
//         onConfirm={() => {
//           setShowSettlementConfirm(false);
//           void fetchDayEndSummary();
//         }}
//       />

//       <DayEndSummaryModal
//         visible={showDayEndSummary}
//         data={dayEndSummary}
//         onClose={() => setShowDayEndSummary(false)}
//         onProceed={() => {
//           setShowDayEndSummary(false);
//           setShowSettlementOptions(true);
//         }}
//       />

//       <AppModal
//         visible={showSettlementOptions}
//         onClose={() => setShowSettlementOptions(false)}
//         position="center"
//         animation="fade"
//         showBackdrop={true}
//         closeOnBackdropPress={true}
//         showHeader={false}
//       >
//         <View style={{ padding: 16 }}>
//           <AppText style={{ fontSize: 16, fontWeight: '800', marginBottom: 8 }}>
//             Settlement Options
//           </AppText>
//           <AppText style={{ fontSize: 12, opacity: 0.8, marginBottom: 14 }}>
//             Choose how you want to handle remaining stock.
//           </AppText>

//           <TouchableOpacity
//             onPress={() => setCarryForwardStock(true)}
//             activeOpacity={0.8}
//             style={{
//               flexDirection: 'row',
//               alignItems: 'center',
//               padding: 12,
//               borderRadius: 12,
//               borderWidth: 1,
//               borderColor: carryForwardStock ? colors.primary : colors.border,
//               backgroundColor: carryForwardStock ? colors.primary + '10' : colors.surface,
//               marginBottom: 10,
//             }}
//           >
//             <Ionicons
//               name={carryForwardStock ? 'radio-button-on' : 'radio-button-off'}
//               size={18}
//               color={carryForwardStock ? colors.primary : colors.textSecondary}
//             />
//             <View style={{ marginLeft: 10, flex: 1 }}>
//               <AppText style={{ fontSize: 14, fontWeight: '700' }}>Carry Forward Stock</AppText>
//               <AppText style={{ fontSize: 12, opacity: 0.75 }}>
//                 Keep remaining stock in van for next day.
//               </AppText>
//             </View>
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => setCarryForwardStock(false)}
//             activeOpacity={0.8}
//             style={{
//               flexDirection: 'row',
//               alignItems: 'center',
//               padding: 12,
//               borderRadius: 12,
//               borderWidth: 1,
//               borderColor: !carryForwardStock ? colors.primary : colors.border,
//               backgroundColor: !carryForwardStock ? colors.primary + '10' : colors.surface,
//             }}
//           >
//             <Ionicons
//               name={!carryForwardStock ? 'radio-button-on' : 'radio-button-off'}
//               size={18}
//               color={!carryForwardStock ? colors.primary : colors.textSecondary}
//             />
//             <View style={{ marginLeft: 10, flex: 1 }}>
//               <AppText style={{ fontSize: 14, fontWeight: '700' }}>Unload Stock</AppText>
//               <AppText style={{ fontSize: 12, opacity: 0.75 }}>
//                 Return all remaining stock to warehouse.
//               </AppText>
//             </View>
//           </TouchableOpacity>

//           <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
//             <TouchableOpacity
//               onPress={() => {
//                 setShowSettlementOptions(false);
//                 setShowDayEndSummary(true);
//               }}
//               style={{
//                 flex: 1,
//                 paddingVertical: 12,
//                 borderRadius: 12,
//                 borderWidth: 1,
//                 borderColor: colors.border,
//                 alignItems: 'center',
//               }}
//             >
//               <AppText style={{ fontWeight: '700', color: colors.textSecondary }}>Back</AppText>
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={() => {
//                 setShowSettlementOptions(false);
//                 setShowFinalConfirm(true);
//               }}
//               style={{
//                 flex: 1,
//                 paddingVertical: 12,
//                 borderRadius: 12,
//                 backgroundColor: colors.primary,
//                 alignItems: 'center',
//               }}
//             >
//               <AppText style={{ fontWeight: '800', color: '#fff' }}>Continue</AppText>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </AppModal>

//       <ConfirmationModal
//         visible={showFinalConfirm}
//         title="Final Confirmation"
//         message={
//           carryForwardStock
//             ? 'Confirm van settlement with Carry Forward Stock?'
//             : 'Confirm van settlement with Unload Stock?'
//         }
//         confirmText="Submit"
//         cancelText="Cancel"
//         type="warning"
//         onCancel={() => setShowFinalConfirm(false)}
//         onConfirm={() => void submitSettlement()}
//       />
//     </View>
//   );
// };

const CustomDrawerContent = (props: any) => {
  const { colors } = useTheme();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const { workSessionId, setWorkSessionId } = useAuthStore();
  const roleId = getRoleId(user);
  const allowedRoutes = roleId === 'SALESMAN' ? SALESMAN_DRAWER_ROUTES : MANAGER_DRAWER_ROUTES;

  const [showSettlementConfirm, setShowSettlementConfirm] = useState(false);
  const [dayEndSummary, setDayEndSummary] = useState<any>(null);
  const [showDayEndSummary, setShowDayEndSummary] = useState(false);
  const [showSettlementOptions, setShowSettlementOptions] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [carryForwardStock, setCarryForwardStock] = useState(true);
  const settleInFlightRef = useRef(false);
  const bumpDashboardRefresh = useAppEventsStore((s) => s.bumpDashboardRefresh);

  const fetchDayEndSummary = useCallback(async () => {
    try {
      const vanIdToUse =
        useRouteStore.getState().van?.vanId || (user as any)?.vanId || (user as any)?.defaultVanId;

      if (!vanIdToUse) {
        toast.error('Van not found. Please start your day first.');
        return;
      }

      const res: any = await vanService.fetchTodayStockSummary({
        vanId: vanIdToUse,
        workSessionId,
      });
      setDayEndSummary(res?.data);
      setShowDayEndSummary(true);
    } catch (error) {
      console.error('Error fetching day end summary:', error);
      toast.error('Failed to load day end summary. Please try again.');
    }
  }, [user]);

  const submitSettlement = useCallback(async () => {
    if (settleInFlightRef.current) return;
    settleInFlightRef.current = true;
    try {
      const response: any = await homeService.dayComplete(carryForwardStock as any);
      if (response?.success || response?.statusCode === 200) {
        toast.success('Your day successfully completed');
        setShowFinalConfirm(false);
        setShowSettlementOptions(false);
        setShowDayEndSummary(false);
        bumpDashboardRefresh();
        setWorkSessionId(null);
        router.replace('/(drawer)/(tabs)/home');
        return;
      }
      toast.error(response?.message || 'Failed to complete day');
    } catch (error) {
      console.error('Error completing day:', error);
      toast.error('Failed to complete day. Please try again.');
    } finally {
      settleInFlightRef.current = false;
    }
  }, [carryForwardStock]);

  const handleVanSettlementPress = useCallback(async () => {
    try {
      const statusRes: any = await homeService.getDayStatus('');
      const status = statusRes?.data?.status;
      if (status !== 'ACTIVE') {
        toast.error('Day not started. Please start day before Van Settlement.');
        return;
      }

      setCarryForwardStock(true);
      setShowSettlementConfirm(true);
    } catch (error) {
      console.error('Error checking day status:', error);
      toast.error('Unable to check day status. Please try again.');
    }
  }, []);

  const filteredRoutes = props.state.routes.filter((route: any) => allowedRoutes.has(route.name));
  const filteredRouteKeys = new Set(filteredRoutes.map((route: any) => route.key));
  const currentRouteKey = props.state.routes[props.state.index]?.key;
  const filteredIndex = Math.max(
    0,
    filteredRoutes.findIndex((route: any) => route.key === currentRouteKey),
  );

  const filteredProps = {
    ...props,
    state: {
      ...props.state,
      index: filteredIndex,
      routeNames: props.state.routeNames?.filter((routeName: string) =>
        allowedRoutes.has(routeName),
      ),
      routes: filteredRoutes,
      history: props.state.history?.filter((item: any) => {
        if (item.type !== 'route') return true;
        return filteredRouteKeys.has(item.key);
      }),
    },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <View style={{ flex: 1 }}>
        <ModernDrawerHeader
          colors={colors}
          userName={user?.name || 'Field User'}
          userRole={roleId === 'SALESMAN' ? 'Salesman' : 'Manager'}
        />

        <DrawerContentScrollView
          {...filteredProps}
          contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 8 }}
        >
          <DrawerItemList {...filteredProps} />
        </DrawerContentScrollView>

        {roleId == 'SALESMAN' && (
          <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginBottom: 20 }}>
            <DrawerItem
              label="Van Settlement"
              labelStyle={{ fontWeight: '500', color: 'red' }}
              icon={({ size }) => <MaterialCommunityIcons name="power" size={size} color="red" />}
              onPress={() => {
                props.navigation?.closeDrawer?.();
                void handleVanSettlementPress();
              }}
              style={{
                borderRadius: 12,
                marginHorizontal: 8,
                marginTop: 8,
              }}
            />
          </View>
        )}

        <ConfirmationModal
          visible={showSettlementConfirm}
          title="Van Settlement"
          message="Do you want to settlement of van?"
          confirmText="Yes, Continue"
          cancelText="Cancel"
          type="info"
          onCancel={() => setShowSettlementConfirm(false)}
          onConfirm={() => {
            setShowSettlementConfirm(false);
            void fetchDayEndSummary();
          }}
        />

        <DayEndSummaryModal
          visible={showDayEndSummary}
          data={dayEndSummary}
          onClose={() => setShowDayEndSummary(false)}
          onProceed={() => {
            setShowDayEndSummary(false);
            setShowSettlementOptions(true);
          }}
        />

        <AppModal
          visible={showSettlementOptions}
          onClose={() => setShowSettlementOptions(false)}
          position="center"
          animation="fade"
          showBackdrop={true}
          closeOnBackdropPress={true}
          showHeader={false}
        >
          <View style={{ padding: 16 }}>
            <AppText style={{ fontSize: 16, fontWeight: '800', marginBottom: 8 }}>
              Settlement Options
            </AppText>
            <AppText style={{ fontSize: 12, opacity: 0.8, marginBottom: 14 }}>
              Choose how you want to handle remaining stock.
            </AppText>

            <TouchableOpacity
              onPress={() => setCarryForwardStock(true)}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: carryForwardStock ? colors.primary : colors.border,
                backgroundColor: carryForwardStock ? colors.primary + '10' : colors.surface,
                marginBottom: 10,
              }}
            >
              <Ionicons
                name={carryForwardStock ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color={carryForwardStock ? colors.primary : colors.textSecondary}
              />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <AppText style={{ fontSize: 14, fontWeight: '700' }}>Carry Forward Stock</AppText>
                <AppText style={{ fontSize: 12, opacity: 0.75 }}>
                  Keep remaining stock in van for next day.
                </AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCarryForwardStock(false)}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: !carryForwardStock ? colors.primary : colors.border,
                backgroundColor: !carryForwardStock ? colors.primary + '10' : colors.surface,
              }}
            >
              <Ionicons
                name={!carryForwardStock ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color={!carryForwardStock ? colors.primary : colors.textSecondary}
              />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <AppText style={{ fontSize: 14, fontWeight: '700' }}>Unload Stock</AppText>
                <AppText style={{ fontSize: 12, opacity: 0.75 }}>
                  Return all remaining stock to warehouse.
                </AppText>
              </View>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowSettlementOptions(false);
                  setShowDayEndSummary(true);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                }}
              >
                <AppText style={{ fontWeight: '700', color: colors.textSecondary }}>Back</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowSettlementOptions(false);
                  setShowFinalConfirm(true);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                }}
              >
                <AppText style={{ fontWeight: '800', color: '#fff' }}>Continue</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </AppModal>

        <ConfirmationModal
          visible={showFinalConfirm}
          title="Final Confirmation"
          message={
            carryForwardStock
              ? 'Confirm van settlement with Carry Forward Stock?'
              : 'Confirm van settlement with Unload Stock?'
          }
          confirmText="Submit"
          cancelText="Cancel"
          type="warning"
          onCancel={() => setShowFinalConfirm(false)}
          onConfirm={() => void submitSettlement()}
        />
      </View>
    </SafeAreaView>
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
  const user = useAuthStore((state) => state.user);
  const roleId = getRoleId(user);
  const drawerAllowedRoutes =
    roleId === 'SALESMAN' ? SALESMAN_DRAWER_ROUTES : MANAGER_DRAWER_ROUTES;

  const HEADER_MAP: Record<string, any> = {
    home: {
      title: '',
      showMenu: true,
      showBack: false,
      backgroundColor: colors.primary,
      hidden: false,
    },

    stock: {
      title: 'Stock',
      showMenu: false,
      showFilter: false,
      showBack: true,
      backgroundColor: colors.primary,
    },

    'my-target': {
      title: 'My Target',
      showMenu: false,
      showFilter: false,
      showBack: true,
      backgroundColor: colors.primary,
    },

    'manager-targets': {
      title: 'Primary Targets',
      showMenu: false,
      showFilter: false,
      showBack: true,
      backgroundColor: colors.primary,
    },

    'team-coverage': {
      title: 'Team Coverage',
      showMenu: false,
      showFilter: false,
      showBack: true,
      backgroundColor: colors.primary,
    },

    'beat-o-meter': {
      title: 'Beat-O-Meter',
      showMenu: false,
      showSearch: true,
      showFilter: false,
      showBack: true,
      backgroundColor: colors.primary,
    },

    'survey-analytics': {
      title: 'Survey Analytics',
      showMenu: false,
      showFilter: false,
      showBack: true,
      backgroundColor: colors.primary,
    },

    'switch-route': {
      title: 'Change Route',
      showMenu: false,
      showFilter: false,
      showBack: true,
      backgroundColor: colors.primary,
    },
    'my-pocket': {
      title: 'My Pocket',
      showMenu: false,
      showFilter: false,
      showBack: true,
      backgroundColor: colors.primary,
    },

    collection: {
      title: 'Collection',
      showMenu: false,
      showFilter: true,
      showBack: true,
      backgroundColor: colors.primary,
    },

    'stock-count': {
      title: 'Van Settlement',
      showMenu: false,
      showFilter: false,
      showBack: true,
      backgroundColor: colors.primary,
    },

    route: {
      title: 'My Route',
      showMenu: false,
      showFilter: true,
      showBack: true,
      rightIcon: 'map',
      rightIcon2: 'plus',
      showRightIcon: true,
      showLeftIcon: true,
      backgroundColor: colors.primary,
    },

    checkin: {
      title: 'Check In',
      showMenu: false,
      showFilter: false,
      showBack: true,
      backgroundColor: colors.primary,
    },
  };

  /* ============================
   * HEADER CONFIG
   * ============================ */

  useEffect(() => {
    if (isProfile) {
      const routeName = getRouteName(segments);
      const config = HEADER_MAP[routeName];

      if (config) {
        setHeader(config);
      }
    }
  }, [segments]);

  useEffect(() => {
    const routeName = getRouteName(segments);
    const isTabRoute = segments.includes('(tabs)');
    const canViewTabRoute =
      SHARED_TAB_ROUTES.has(routeName) ||
      (roleId === 'MANAGER' && MANAGER_TAB_ROUTES.has(routeName));

    if (isTabRoute) {
      if (!canViewTabRoute) {
        router.replace('/(drawer)/(tabs)/home');
      }
      return;
    }

    if (!drawerAllowedRoutes.has(routeName)) {
      router.replace('/(drawer)/(tabs)/home');
    }
  }, [drawerAllowedRoutes, roleId, segments]);

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
        'my-target': {
          component: MaterialCommunityIcons,
          focusedIcon: 'target',
          unfocusedIcon: 'target',
        },
        'switch-route': {
          component: MaterialCommunityIcons,
          focusedIcon: 'swap-horizontal-circle',
          unfocusedIcon: 'swap-horizontal-circle-outline',
        },
        'my-pocket': {
          component: MaterialCommunityIcons,
          focusedIcon: 'pocket',
          unfocusedIcon: 'pocket',
        },
        'stock-count': {
          component: MaterialCommunityIcons,
          focusedIcon: 'package-variant',
          unfocusedIcon: 'package-variant',
        },
        'manager-targets': {
          component: MaterialCommunityIcons,
          focusedIcon: 'target',
          unfocusedIcon: 'target',
        },
        'team-coverage': {
          component: MaterialCommunityIcons,
          focusedIcon: 'account-group',
          unfocusedIcon: 'account-group-outline',
        },
        'beat-o-meter': {
          component: MaterialCommunityIcons,
          focusedIcon: 'speedometer',
          unfocusedIcon: 'speedometer',
        },
        'survey-analytics': {
          component: MaterialCommunityIcons,
          focusedIcon: 'clipboard-text-search',
          unfocusedIcon: 'clipboard-text-search-outline',
        },
        checkin: {
          component: MaterialCommunityIcons,
          focusedIcon: 'clipboard-check',
          unfocusedIcon: 'clipboard-check-outline',
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
        name="my-pocket"
        options={{
          title: 'My Pcoket',
          drawerLabel: 'My Pocket',
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
        name="route"
        options={{
          title: 'Route Management',
          drawerLabel: 'My Route',
        }}
      />

      {/* My Target Screen - Added */}
      <Drawer.Screen
        name="my-target"
        options={{
          title: 'My Target',
          drawerLabel: 'My Target',
        }}
      />

      <Drawer.Screen
        name="switch-route"
        options={{
          title: 'Change Route',
          drawerLabel: 'Change Route',
        }}
      />

      {/* Collection Screen - Hidden from drawer */}
      <Drawer.Screen
        name="collection"
        options={{
          title: 'Cash Collection',
          drawerLabel: () => null,
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          drawerLabel: () => null,
          drawerItemStyle: { display: 'none' },
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
        name="stock-count"
        options={{
          title: 'Van Settlement',
          drawerLabel: 'Van Settlement',
        }}
      />

      <Drawer.Screen
        name="manager-targets"
        options={{
          title: 'Primary Targets',
          drawerLabel: 'Primary Targets',
        }}
      />

      <Drawer.Screen
        name="team-coverage"
        options={{
          title: 'Team Coverage',
          drawerLabel: 'Team Coverage',
        }}
      />

      <Drawer.Screen
        name="beat-o-meter"
        options={{
          title: 'Beat-O-Meter',
          drawerLabel: 'Beat-O-Meter',
        }}
      />

      <Drawer.Screen
        name="survey-analytics"
        options={{
          title: 'Survey Analytics',
          drawerLabel: 'Survey Analytics',
        }}
      />

      <Drawer.Screen
        name="checkin"
        options={{
          title: 'Check In',
          drawerLabel: 'Check In',
        }}
      />
    </Drawer>
  );
}
