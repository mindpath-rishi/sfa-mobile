// SalesExecutiveScreen.tsx (Fixed)
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, ScrollView, RefreshControl, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { useCameraPermissions } from 'expo-camera';

// Components
import { StartDayButton } from '../components/sales-executive/StartDayButton';
import { Footer } from '../components/sales-executive/Footer';
import { CurrentActivityCard } from '../components/sales-executive/CurrentActivityCard';
import { QuickActionsSection } from '../components/sales-executive/QuickActionSection';
import { StatsOverviewSection } from '../components/sales-executive/StatusOverviewSection';
import { MonthlyBudgetSection } from '../components/sales-executive/MonthyBudgetSection';
import { TodayActivitiesSection } from '../components/sales-executive/TodayActivitySection';
import { StartDayModal } from '../components/models/StartDayModal';
import { VanChangeModal } from '../components/models/VanChangedModel';
import { RouteSelectionModal } from '../components/models/RouteSelectionModal';
import { ChangeActivityModal } from '../components/models/ChangeActivityModal';
import { LoadSummaryModal } from '../components/models/LoadSummaryModal';

// Constants
import {
  MOCK_DATA,
  QUICK_ACTIONS,
  ACTIVITY_TYPES,
  OTHER_WORK_OPTIONS,
  RETAILING_ROUTES,
  ASSIGNED_VAN,
  LOAD_SUMMARY_DATA,
} from '../constants/mockData';

// Types
import { OtherWorkOption } from '../types/salesExecutive.types';
import { Route } from '../types/route.types';
import { Van } from '../types/van.types';
import { ActivityType, TodayActivity } from '../types/activity.types';
import { CameraModal } from '@/core/components/Camera/CameraModal';
import { CameraRef } from '@/core/components/Camera/Camera.types';
import { CreateActivityPayload, DayStartPayload } from '../types/home.types';
import { homeService } from '../services/home.service';
import { set } from 'react-hook-form';
import { useAuthStore } from '@/core/store/auth.store';

export default function SalesExecutiveScreen() {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [dayStarted, setDayStarted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [changeModalVisible, setChangeModalVisible] = useState(false);
  const [routeModalVisible, setRouteModalVisible] = useState(false);
  const [vanChangeModalVisible, setVanChangeModalVisible] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [loadSummaryVisible, setLoadSummaryVisible] = useState(false);

  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedActivityColor, setSelectedActivityColor] = useState('');
  const [selectedActivityIcon, setSelectedActivityIcon] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [mappedVan, setMappedVan] = useState<Van>(ASSIGNED_VAN);
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const [showChangeOtherOptions, setShowChangeOtherOptions] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [activityHistory] = useState<any[]>([]);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [pendingActivity, setPendingActivity] = useState<ActivityType | OtherWorkOption | null>(
    null,
  );
  const [isChangingActivity, setIsChangingActivity] = useState(false);
  const [otherWorkStartTime, setOtherWorkStartTime] = useState<string | null>(null);
  const [todayActivities, setTodayActivities] = useState<TodayActivity[]>([]);
  const [vanChangeReason, setVanChangeReason] = useState('');
  const [currentActivity, setCurrentActivity] = useState<string>('');
  const [filteredActivityTypes, setFilteredActivityTypes] = useState(ACTIVITY_TYPES);
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);

  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [workSessionId, setWorkSessionId] = useState<string>('');
  const [filteredOtherWorkOptions, setFilteredOtherWorkOptions] =
    useState<OtherWorkOption[]>(OTHER_WORK_OPTIONS);

  const greeting = new Date().getHours() < 12 ? 'Good Morning' : 'Good Afternoon';
  const user: any = useAuthStore((state) => state.user);
  const [routes, setRoutes] = useState<any>();

  useEffect(() => {
    getDayStatus();
    getVan();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
    getDayStatus();
    getVan();
  };

  const handleStartDayPress = () => {
    setModalVisible(true);
    setShowOtherOptions(false);
    setIsChangingActivity(false);
  };

  const handleChangeActivityPress = () => {
    if (currentActivity === 'Retailing' && selectedRoute) {
      setFilteredActivityTypes(ACTIVITY_TYPES.filter((a) => a.name !== 'Retailing'));
    } else {
      setFilteredActivityTypes(ACTIVITY_TYPES);
      setFilteredOtherWorkOptions(OTHER_WORK_OPTIONS.filter((o) => o.name != currentActivity));
    }
    setChangeModalVisible(true);
    setShowChangeOtherOptions(false);
    setIsChangingActivity(true);
  };

  const handleActivitySelect = (activity: ActivityType) => {
    console.log('Selected Activity:', activity);
    if (activity.name === 'Other Work') {
      setShowOtherOptions(true);
    } else if (activity.name === 'Retailing') {
      getRoutes();
      setSelectedActivity(activity.name);
      setModalVisible(false);
      setVanChangeModalVisible(true);
      setVanChangeReason('');
      setIsChangingActivity(false);
    }
  };

  const handleVanChangeSubmit = () => {
    if (!vanChangeReason) {
      Alert.alert('Error', 'Please select an option');
      return;
    }

    setVanChangeModalVisible(false);

    if (vanChangeReason !== 'No, same van') {
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      // setTodayActivities([vanChangeEntry, ...todayActivities]);
    }

    setRouteModalVisible(true);
  };

  const handleOtherWorkSelect = (option: OtherWorkOption) => {
    console.log('Selected Other Work Option:', option);
    setSelectedActivity(option.name);
    setPendingActivity(option);
    setModalVisible(false);
    setShowOtherOptions(false);
    openCamera();
  };

  const handleRouteSelect = (route: Route) => {
    console.log('Selected Route:', route);
    setSelectedRoute(route);
    setRouteModalVisible(false);
    openCamera();
  };

  const handleChangeActivity = (activity: ActivityType) => {
    if (activity.name === 'Other Work') {
      setShowChangeOtherOptions(true);
    } else if (activity.name === 'Retailing') {
      getRoutes();
      setSelectedActivity(activity.name);
      setChangeModalVisible(false);
      setVanChangeModalVisible(true);
      setVanChangeReason('');
      setIsChangingActivity(true);
    }
  };

  const handleChangeRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    setRouteModalVisible(false);
    openCamera();
  };

  const handleChangeOtherWork = (option: OtherWorkOption) => {
    setSelectedActivity(option.name);
    setPendingActivity(option);
    setChangeModalVisible(false);
    setShowChangeOtherOptions(false);
    openCamera();
  };

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera permission is needed to take your photo');
        return;
      }
    }
    setCameraVisible(true);
  };

  // FIXED: handleCaptureImage - no parameters passed to takePhoto
  const handleCaptureImage = async (photo: any) => {
    if (photo && photo.uri) {
      setUserPhoto(photo.uri);
      setCameraVisible(false);

      if (isChangingActivity) {
        completeActivityChange();
      } else {
        if (selectedRoute) {
          setLoadSummaryVisible(true);
        } else {
          completeDayStart();
        }
      }
    } else {
      console.error('No photo captured');
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const handleLoadSummaryProceed = () => {
    setLoadSummaryVisible(false);
    completeDayStart();
  };

  const completeDayStart = () => {
    const playlod: DayStartPayload = {
      activityName: selectedActivity,
      routeId: selectedRoute?.routeId,
      description: selectedRoute
        ? `Started Retailing - Route: ${selectedRoute.name}, Van: ${ASSIGNED_VAN.name}`
        : `Started ${pendingActivity?.name}`,
      totalShops: selectedRoute?.totalShops,
      routeName: selectedRoute?.name,
    };
    console.log('Day Start Payload:', selectedRoute);
    // return;
    try {
      const response: any = homeService.dayStart(playlod);
      console.log('Day Start Response:', response);
    } catch (error) {}
    return;
    // const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // if (pendingActivity) {
    //   setSelectedActivity(pendingActivity.name);
    //   setSelectedActivityColor(pendingActivity.color);
    //   setSelectedActivityIcon(pendingActivity.icon);
    //   setDayStarted(true);
    //   setStartTime(currentTime);
    //   setOtherWorkStartTime(currentTime);

    //   const newActivity: TodayActivity = {
    //     id: Date.now().toString(),
    //     type: pendingActivity.name.toLowerCase().replace(' ', '_'),
    //     customer: 'Self',
    //     time: currentTime,
    //     status: 'in_progress',
    //     notes: `Started ${pendingActivity.name}`,
    //   };

    //   setTodayActivities([newActivity, ...todayActivities]);

    //   Alert.alert('Day Started', `You're now working on ${pendingActivity.name}`);
    //   setPendingActivity(null);
    // } else if (selectedRoute) {
    //   setSelectedActivity('Retailing');
    //   setSelectedActivityColor('#4158D0');
    //   setSelectedActivityIcon('storefront');
    //   setDayStarted(true);
    //   setStartTime(currentTime);
    //   setOtherWorkStartTime(null);

    //   const newActivity: TodayActivity = {
    //     id: Date.now().toString(),
    //     type: 'retailing',
    //     customer: selectedRoute.name,
    //     time: currentTime,
    //     status: 'in_progress',
    //     notes: `Route: ${selectedRoute.name}, Van: ${ASSIGNED_VAN.name}`,
    //   };

    //   setTodayActivities([newActivity, ...todayActivities]);

    //   Alert.alert(
    //     'Day Started',
    //     `You're now working on Retailing\nRoute: ${selectedRoute?.name}\nVan: ${ASSIGNED_VAN.name}`,
    //   );
    // }
  };

  const completeActivityChange = async () => {
    const playlod: CreateActivityPayload = {
      name: selectedActivity,
      routeId: selectedRoute?.routeId,
      description: selectedRoute
        ? `Started Retailing - Route: ${selectedRoute.name}, Van: ${ASSIGNED_VAN.name}`
        : `Started ${pendingActivity?.name}`,
      totalShops: selectedRoute?.totalShops,
      routeName: selectedRoute?.name,
      workSessionId,
    };

    try {
      const response: any = await homeService.createActivity(playlod);
      if (response.statusCode === 201) {
        getDayStatus();
      }
    } catch (error) {}
    return;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // const completedActivity: TodayActivity = {
    //   id: Date.now().toString(),
    //   type: selectedActivity.toLowerCase().replace(' ', '_'),
    //   customer: selectedActivity === 'Retailing' ? selectedRoute?.name || 'Self' : 'Self',
    //   time: currentTime,
    //   status: 'completed',
    //   notes:
    //     selectedActivity === 'Retailing' && selectedRoute
    //       ? `Route: ${selectedRoute?.name}, Van: ${ASSIGNED_VAN.name}`
    //       : `Completed ${selectedActivity}`,
    // };

    // if (pendingActivity) {
    //   setSelectedActivity(pendingActivity.name);
    //   setSelectedActivityColor(pendingActivity.color);
    //   setSelectedActivityIcon(pendingActivity.icon);
    //   setSelectedRoute(null);
    //   setOtherWorkStartTime(currentTime);

    //   // const newActivity: TodayActivity = {
    //   //   id: (Date.now() + 1).toString(),
    //   //   type: pendingActivity.name.toLowerCase().replace(' ', '_'),
    //   //   customer: 'Self',
    //   //   time: currentTime,
    //   //   status: 'in_progress',
    //   //   notes: `Started ${pendingActivity.name}`,
    //   // };

    //   // setTodayActivities([completedActivity, newActivity, ...todayActivities]);

    //   Alert.alert('Activity Changed', `You're now working on ${pendingActivity.name}`);
    //   setPendingActivity(null);
    // } else if (selectedRoute) {
    //   setSelectedActivity('Retailing');
    //   setSelectedActivityColor('#4158D0');
    //   setSelectedActivityIcon('storefront');
    //   setOtherWorkStartTime(null);

    //   // const newActivity: TodayActivity = {
    //   //   id: (Date.now() + 1).toString(),
    //   //   type: 'retailing',
    //   //   customer: selectedRoute.name,
    //   //   time: currentTime,
    //   //   status: 'in_progress',
    //   //   notes: `Route: ${selectedRoute.name}, Van: ${ASSIGNED_VAN.name}`,
    //   // };

    //   // setTodayActivities([completedActivity, newActivity, ...todayActivities]);

    //   Alert.alert(
    //     'Activity Changed',
    //     `You're now working on Retailing\nRoute: ${selectedRoute?.name}\nVan: ${ASSIGNED_VAN.name}`,
    //   );
    // }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setShowOtherOptions(false);
  };

  const handleCloseChangeModal = () => {
    setChangeModalVisible(false);
    setShowChangeOtherOptions(false);
  };

  const handleCloseRouteModal = () => {
    setRouteModalVisible(false);
  };

  const handleCloseVanChangeModal = () => {
    setVanChangeModalVisible(false);
  };

  const handleCloseLoadSummary = () => {
    setLoadSummaryVisible(false);
  };

  const handleCancelCamera = () => {
    setCameraVisible(false);
    // if (!dayStarted) {
    //   setSelectedRoute(null);
    //   setPendingActivity(null);
    // }
  };

  const handleEndDay = () => {
    Alert.alert('End Day', 'Are you sure you want to end your day?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Day',
        onPress: () => {
          if (dayStarted) {
            const currentTime = new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            // const finalActivity: TodayActivity = {
            //   id: Date.now().toString(),
            //   type: selectedActivity.toLowerCase().replace(' ', '_'),
            //   customer: selectedActivity === 'Retailing' ? selectedRoute?.name || 'Self' : 'Self',
            //   time: currentTime,
            //   status: 'ended',
            //   notes:
            //     selectedActivity === 'Retailing' && selectedRoute
            //       ? `Route: ${selectedRoute?.name}, Van: ${ASSIGNED_VAN.name}`
            //       : `Ended ${selectedActivity}`,
            // };

            // setTodayActivities([finalActivity, ...todayActivities]);
          }

          setDayStarted(false);
          setSelectedActivity('');
          setSelectedRoute(null);
          setUserPhoto(null);
          setOtherWorkStartTime(null);
          setTodayActivities([]);

          Alert.alert('Day Ended', 'Your day has been ended successfully');
        },
        style: 'destructive',
      },
    ]);
  };

  const getDayStatus = async () => {
    try {
      const response: any = await homeService.getDayStatus(workSessionId);
      setDayStarted(response.data.status === 'ACTIVE');
      console.log('Day Status Response:', response);
      if (response.statusCode === 200) {
        setWorkSessionId(response.data.workSessionId || '');
        console.log('Day Status:', response.data.activeActivity);
        setCurrentActivity(response?.data?.activeActivity?.name);
        setTodayActivities(response?.data?.activities || []);
        setStartTime(response?.data?.activeActivity?.startTime);
        setSelectedActivityColor('#4158D0');
        setSelectedActivityIcon('storefront');
        setActiveRoute(response?.data?.selectedRoute);
      }
    } catch (error) {
      console.error('Error fetching day status:', error);
    }
  };

  const getTodayActivities = async (workSessionId: string) => {
    const response: any = await homeService.getTodayActivities(workSessionId);
    if (response.statusCode === 200) {
      setTodayActivities(response.data || []);
      console.log('Today Activities:', response.data);
    }
  };

  const getRoutes = async () => {
    try {
      const response: any = await homeService.getVanMappedRoutes();
      if (response.statusCode === 200) {
        if (response?.data?.routes?.length) {
          setRoutes(
            response.data.routes.map((item: any) => ({
              name: item.route.name,
              routeId: item.routeId,
              totalShops: item.route.associatedUsers?.length || 0,
              distance: item.route.distance || 'N/A',
            })),
          );
        }
        console.log('Routes:', response.data);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const getVan = async () => {
    try {
      const response: any = await homeService.getVan();
      if (response.statusCode === 200) {
        setMappedVan(response.data[0]);
        console.log('Van:', response.data);
      }
    } catch (error) {
      console.error('Error fetching van:', error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Start Day / Current Activity Section */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
          {!dayStarted ? (
            <StartDayButton onPress={handleStartDayPress} />
          ) : (
            <CurrentActivityCard
              selectedActivity={currentActivity}
              selectedActivityColor={selectedActivityColor}
              selectedActivityIcon={selectedActivityIcon}
              startTime={startTime}
              otherWorkStartTime={otherWorkStartTime}
              selectedRoute={activeRoute}
              assignedVan={mappedVan}
              onPressChange={handleChangeActivityPress}
              onPressEnd={handleEndDay}
            />
          )}
        </View>

        {/* Quick Actions Section */}
        <QuickActionsSection
          actions={QUICK_ACTIONS}
          onPressAction={(route: any) => router.push(route as any)}
        />

        {/* Stats Overview */}
        <StatsOverviewSection
          todayVisits={MOCK_DATA.todayVisits}
          totalVisits={MOCK_DATA.totalVisits}
          pendingOrders={MOCK_DATA.pendingOrders}
          collections={MOCK_DATA.collections}
          incentives={MOCK_DATA.incentives}
        />

        {/* Monthly Budget */}
        <MonthlyBudgetSection
          targetAchieved={MOCK_DATA.targetAchieved}
          completedOrders={MOCK_DATA.completedOrders}
          onViewDetails={() => router.push('/targets')}
        />

        {/* Today's Activities */}
        <TodayActivitiesSection activities={todayActivities} />

        {/* Last Updated */}
        <Footer lastUpdated={new Date().toLocaleTimeString()} />
      </ScrollView>

      {/* Modals */}
      <StartDayModal
        visible={modalVisible}
        showOtherOptions={showOtherOptions}
        activityTypes={ACTIVITY_TYPES}
        otherWorkOptions={OTHER_WORK_OPTIONS}
        onClose={handleCloseModal}
        onActivitySelect={handleActivitySelect}
        onOtherWorkSelect={handleOtherWorkSelect}
        onBackToOptions={() => setShowOtherOptions(false)}
      />

      <VanChangeModal
        visible={vanChangeModalVisible}
        vanChangeReason={vanChangeReason}
        onClose={handleCloseVanChangeModal}
        onSelectReason={setVanChangeReason}
        onSubmit={handleVanChangeSubmit}
      />

      <RouteSelectionModal
        visible={routeModalVisible}
        routes={routes}
        assignedVan={mappedVan}
        vanChangeReason={vanChangeReason}
        onClose={handleCloseRouteModal}
        onSelectRoute={isChangingActivity ? handleChangeRouteSelect : handleRouteSelect}
      />

      <ChangeActivityModal
        visible={changeModalVisible}
        showChangeOtherOptions={showChangeOtherOptions}
        selectedActivity={currentActivity}
        activityTypes={filteredActivityTypes}
        otherWorkOptions={filteredOtherWorkOptions}
        onClose={handleCloseChangeModal}
        onActivitySelect={handleChangeActivity}
        onOtherWorkSelect={handleChangeOtherWork}
        onBackToOptions={() => setShowChangeOtherOptions(false)}
      />

      <LoadSummaryModal
        visible={loadSummaryVisible}
        data={LOAD_SUMMARY_DATA}
        onClose={handleCloseLoadSummary}
        onProceed={handleLoadSummaryProceed}
      />

      <CameraModal
        visible={cameraVisible}
        cameraRef={cameraRef}
        onClose={handleCancelCamera}
        onCapture={handleCaptureImage}
        onError={(error) => console.error('Camera error:', error)}
        title="TAKE A SELFIE"
        cameraProps={{
          facing: 'front',
          quality: 0.8,
          autofocus: true,
        }}
      />
    </View>
  );
}
