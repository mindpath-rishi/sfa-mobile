// SalesExecutiveScreen.tsx (Fixed)
import React, { useState, useRef } from 'react';
import { View, ScrollView, RefreshControl, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { Header } from '@/core/components/Header';
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
  const [selectedVan] = useState<Van>(ASSIGNED_VAN);
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

  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const greeting = new Date().getHours() < 12 ? 'Good Morning' : 'Good Afternoon';

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const handleStartDayPress = () => {
    setModalVisible(true);
    setShowOtherOptions(false);
    setIsChangingActivity(false);
  };

  const handleChangeActivityPress = () => {
    setChangeModalVisible(true);
    setShowChangeOtherOptions(false);
    setIsChangingActivity(true);
  };

  const handleActivitySelect = (activity: ActivityType) => {
    if (activity.name === 'Other Work') {
      setShowOtherOptions(true);
    } else if (activity.name === 'Retailing') {
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
      const vanChangeEntry: TodayActivity = {
        id: Date.now().toString(),
        type: 'van_change',
        customer: 'System',
        time: currentTime,
        status: 'completed',
        notes: `Van change: ${vanChangeReason}`,
      };
      setTodayActivities([vanChangeEntry, ...todayActivities]);
    }

    setRouteModalVisible(true);
  };

  const handleOtherWorkSelect = (option: OtherWorkOption) => {
    setPendingActivity(option);
    setModalVisible(false);
    setShowOtherOptions(false);
    openCamera();
  };

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    setRouteModalVisible(false);
    openCamera();
  };

  const handleChangeActivity = (activity: ActivityType) => {
    if (activity.name === 'Other Work') {
      setShowChangeOtherOptions(true);
    } else if (activity.name === 'Retailing') {
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
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (pendingActivity) {
      setSelectedActivity(pendingActivity.name);
      setSelectedActivityColor(pendingActivity.color);
      setSelectedActivityIcon(pendingActivity.icon);
      setDayStarted(true);
      setStartTime(currentTime);
      setOtherWorkStartTime(currentTime);

      const newActivity: TodayActivity = {
        id: Date.now().toString(),
        type: pendingActivity.name.toLowerCase().replace(' ', '_'),
        customer: 'Self',
        time: currentTime,
        status: 'in_progress',
        notes: `Started ${pendingActivity.name}`,
      };

      setTodayActivities([newActivity, ...todayActivities]);

      Alert.alert('Day Started', `You're now working on ${pendingActivity.name}`);
      setPendingActivity(null);
    } else if (selectedRoute) {
      setSelectedActivity('Retailing');
      setSelectedActivityColor('#4158D0');
      setSelectedActivityIcon('storefront');
      setDayStarted(true);
      setStartTime(currentTime);
      setOtherWorkStartTime(null);

      const newActivity: TodayActivity = {
        id: Date.now().toString(),
        type: 'retailing',
        customer: selectedRoute.name,
        time: currentTime,
        status: 'in_progress',
        notes: `Route: ${selectedRoute.name}, Van: ${ASSIGNED_VAN.name}`,
      };

      setTodayActivities([newActivity, ...todayActivities]);

      Alert.alert(
        'Day Started',
        `You're now working on Retailing\nRoute: ${selectedRoute?.name}\nVan: ${ASSIGNED_VAN.name}`,
      );
    }
  };

  const completeActivityChange = () => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const completedActivity: TodayActivity = {
      id: Date.now().toString(),
      type: selectedActivity.toLowerCase().replace(' ', '_'),
      customer: selectedActivity === 'Retailing' ? selectedRoute?.name || 'Self' : 'Self',
      time: currentTime,
      status: 'completed',
      notes:
        selectedActivity === 'Retailing' && selectedRoute
          ? `Route: ${selectedRoute?.name}, Van: ${ASSIGNED_VAN.name}`
          : `Completed ${selectedActivity}`,
    };

    if (pendingActivity) {
      setSelectedActivity(pendingActivity.name);
      setSelectedActivityColor(pendingActivity.color);
      setSelectedActivityIcon(pendingActivity.icon);
      setSelectedRoute(null);
      setOtherWorkStartTime(currentTime);

      const newActivity: TodayActivity = {
        id: (Date.now() + 1).toString(),
        type: pendingActivity.name.toLowerCase().replace(' ', '_'),
        customer: 'Self',
        time: currentTime,
        status: 'in_progress',
        notes: `Started ${pendingActivity.name}`,
      };

      setTodayActivities([completedActivity, newActivity, ...todayActivities]);

      Alert.alert('Activity Changed', `You're now working on ${pendingActivity.name}`);
      setPendingActivity(null);
    } else if (selectedRoute) {
      setSelectedActivity('Retailing');
      setSelectedActivityColor('#4158D0');
      setSelectedActivityIcon('storefront');
      setOtherWorkStartTime(null);

      const newActivity: TodayActivity = {
        id: (Date.now() + 1).toString(),
        type: 'retailing',
        customer: selectedRoute.name,
        time: currentTime,
        status: 'in_progress',
        notes: `Route: ${selectedRoute.name}, Van: ${ASSIGNED_VAN.name}`,
      };

      setTodayActivities([completedActivity, newActivity, ...todayActivities]);

      Alert.alert(
        'Activity Changed',
        `You're now working on Retailing\nRoute: ${selectedRoute?.name}\nVan: ${ASSIGNED_VAN.name}`,
      );
    }
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
    if (!dayStarted) {
      setSelectedRoute(null);
      setPendingActivity(null);
    }
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

            const finalActivity: TodayActivity = {
              id: Date.now().toString(),
              type: selectedActivity.toLowerCase().replace(' ', '_'),
              customer: selectedActivity === 'Retailing' ? selectedRoute?.name || 'Self' : 'Self',
              time: currentTime,
              status: 'ended',
              notes:
                selectedActivity === 'Retailing' && selectedRoute
                  ? `Route: ${selectedRoute?.name}, Van: ${ASSIGNED_VAN.name}`
                  : `Ended ${selectedActivity}`,
            };

            setTodayActivities([finalActivity, ...todayActivities]);
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
              selectedActivity={selectedActivity}
              selectedActivityColor={selectedActivityColor}
              selectedActivityIcon={selectedActivityIcon}
              startTime={startTime}
              otherWorkStartTime={otherWorkStartTime}
              selectedRoute={selectedRoute}
              assignedVan={ASSIGNED_VAN}
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
        routes={RETAILING_ROUTES}
        assignedVan={ASSIGNED_VAN}
        vanChangeReason={vanChangeReason}
        onClose={handleCloseRouteModal}
        onSelectRoute={isChangingActivity ? handleChangeRouteSelect : handleRouteSelect}
      />

      <ChangeActivityModal
        visible={changeModalVisible}
        showChangeOtherOptions={showChangeOtherOptions}
        selectedActivity={selectedActivity}
        activityTypes={ACTIVITY_TYPES}
        otherWorkOptions={OTHER_WORK_OPTIONS}
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
