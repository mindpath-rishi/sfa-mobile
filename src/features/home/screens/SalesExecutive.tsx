// SalesExecutiveScreen.tsx - Fixed Full Width Van Card
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Components
import { Footer } from '../components/sales-executive/Footer';
import { CurrentActivityCard } from '../components/sales-executive/CurrentActivityCard';
import { QuickActionsSection } from '../components/sales-executive/QuickActionSection';
import { StatsOverviewSection } from '../components/sales-executive/StatusOverviewSection';
import { TodayActivitiesSection } from '../components/sales-executive/TodayActivitySection';
import { UnifiedActionModal } from '../components/models/UnifiedActionModal';
import { LoadSummaryModal } from '../components/models/LoadSummaryModal';

// Constants
import {
  QUICK_ACTIONS,
  ACTIVITY_TYPES,
  OTHER_WORK_OPTIONS,
  ASSIGNED_VAN,
  LOAD_SUMMARY_DATA,
  LEAVE_TYPES,
} from '../constants/mockData';

// Types
import { OtherWorkOption } from '../types/salesExecutive.types';
import { Van } from '../types/van.types';
import { ActivityType, TodayActivity } from '../types/activity.types';
import { CameraModal } from '@/core/components/Camera/CameraModal';
import { CreateActivityPayload, DayStartPayload } from '../types/home.types';
import { homeService } from '../services/home.service';
import { AppText, ConfirmationModal } from '@/core/components';
import { ApiResponse } from '@/core/network';
import { outletService } from '@/features/outlet/services/outlet.service';
import { useOutletStore } from '@/core/store/outlet.store';
import { useVisitGuard } from '@/shared/hooks/useVisitGuard';
import { Route, useRouteStore } from '@/core/store/route.store';
import { vanService } from '@/shared/services/van.service';
import { DayEndSummaryModal } from '../components/models/DayEndSummaryModal';
import { useAuthStore } from '@/core/store/auth.store';
import { toast } from '@/core/utils';
import { DayEndConfirmationModal } from '@/shared/components/models/DayEndConfirmationModal';
import { useFocusEffect } from 'expo-router';
import { useAppEventsStore } from '@/core/store/appEvents.store';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { leaveService } from '@/features/leave/services/leave.service';
import type { LeaveType } from '@/features/leave/types/leave.types';

export default function SalesExecutiveScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [refreshing, setRefreshing] = useState(false);
  const [dayStarted, setDayStarted] = useState(false);
  const [unifiedModalVisible, setUnifiedModalVisible] = useState(false);
  const [unifiedModalType, setUnifiedModalType] = useState<
    | 'van-change'
    | 'van-selection'
    | 'route-selection'
    | 'activity-change'
    | 'other-work'
    | 'leave-type'
  >('van-change');
  const [cameraVisible, setCameraVisible] = useState(false);
  const [loadSummaryVisible, setLoadSummaryVisible] = useState(false);

  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedActivityColor, setSelectedActivityColor] = useState('');
  const [selectedActivityIcon, setSelectedActivityIcon] = useState('');
  const [mappedVan, setMappedVan] = useState<Van>(ASSIGNED_VAN);
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const [showChangeOtherOptions, setShowChangeOtherOptions] = useState(false);
  const [startTime, setStartTime] = useState<string | null>('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [pendingActivity, setPendingActivity] = useState<ActivityType | OtherWorkOption | null>(
    null,
  );
  const [isChangingActivity, setIsChangingActivity] = useState(false);
  const [otherWorkStartTime, setOtherWorkStartTime] = useState<string | null>(null);
  const [todayActivities, setTodayActivities] = useState<TodayActivity[]>([]);
  const [vanChangeReason, setVanChangeReason] = useState('');
  const [vanChangeNote, setVanChangeNote] = useState('');
  const [availableVans, setAvailableVans] = useState<any[]>([]);
  const [selectedVanForChange, setSelectedVanForChange] = useState<any | null>(null);
  const [vanChangeRequestPending, setVanChangeRequestPending] = useState(false);
  const [vanChangePendingBanner, setVanChangePendingBanner] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<string | null>('');
  const [filteredActivityTypes, setFilteredActivityTypes] = useState(ACTIVITY_TYPES);
  const [tempSelectedActivity, setTempSelectedActivity] = useState<ActivityType | null>(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState<string | null>(null);
  const [isTodayLeave, setIsTodayLeave] = useState<boolean>(false);

  const cameraRef = useRef<any>(null);
  const handledApprovedVanChangeSessionRef = useRef<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [filteredOtherWorkOptions, setFilteredOtherWorkOptions] =
    useState<OtherWorkOption[]>(OTHER_WORK_OPTIONS);
  const [routes, setRoutes] = useState<any>();
  const setActiveVisit = useOutletStore((s) => s.setActiveVisit);
  const activeVisit = useOutletStore.getState().activeVisit;
  const clearVisit = useOutletStore((s) => s.clearVisit);
  const { setSelectedRoute, selectedRoute } = useRouteStore();
  const [showDayEndConfirm, setShowDayEndConfirm] = useState<boolean>(false);
  const currency = 'K';
  const van = useRouteStore.getState().van;
  const [dayEndSummary, setDayEndSummary] = useState<any>(null);
  const [finalConfirmation, setFinalConfirmation] = useState(false);
  const { setVan } = useRouteStore();
  const { setHeader } = useHeader();
  const user = useAuthStore((state) => state.user);
  const { setWorkSessionId, workSessionId } = useAuthStore();

  const { guard } = useVisitGuard();
  const dashboardRefreshTick = useAppEventsStore((s) => s.dashboardRefreshTick);

  const filteredQuickActions = useMemo(() => {
    if (!currentActivity) return QUICK_ACTIONS;
    return QUICK_ACTIONS.filter((a) => a.label !== currentActivity);
  }, [currentActivity]);

  const otherWorkOptionsForModal = useMemo(() => {
    const base = isChangingActivity ? filteredOtherWorkOptions : OTHER_WORK_OPTIONS;
    if (!currentActivity) return base;
    return base.filter((o) => o.name !== currentActivity);
  }, [currentActivity, filteredOtherWorkOptions, isChangingActivity]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  // Format van display info
  const vanDisplayInfo = useMemo(() => {
    if (!van) return null;
    return {
      fullName: van.name,
      displayName: van.name?.length > 20 ? van.name.substring(0, 20) + '...' : van.name,
      number: van.vanNumber,
      registration: van.registrationNumber,
      type: van.type || 'Standard',
      capacity: van.capacity,
      combinedLabel: van.vanNumber ? `${van.name} (${van.vanNumber})` : van.name,
    };
  }, [van]);

  useEffect(() => {
    getDayStatus();
    getVan();
  }, []);

  useEffect(() => {
    setDayStarted(false);
    setCurrentActivity(null);
    setStartTime(null);
    setTodayActivities([]);
    setIsTodayLeave(false);
    void getDayStatus();
    void getVan();
  }, [dashboardRefreshTick]);

  useFocusEffect(
    React.useCallback(() => {
      getDayStatus();
      getVan();
    }, []),
  );

  useEffect(() => {
    if (!selectedRoute?.routeSessionId) return;
    visitStatus();
  }, [selectedRoute?.routeSessionId]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
    getDayStatus();
    getVan();
  };

  const handleStartDayPress = () => {
    setUnifiedModalType('activity-change');
    setUnifiedModalVisible(true);
    setIsChangingActivity(false);
    setShowChangeOtherOptions(false);
    setTempSelectedActivity(null);
    setSelectedLeaveType(null);
  };

  const handleChangeActivityPress = () => {
    if (currentActivity === 'Retailing' && selectedRoute) {
      setFilteredActivityTypes(ACTIVITY_TYPES.filter((a) => a.name !== 'Retailing'));
    } else {
      setFilteredActivityTypes(ACTIVITY_TYPES);
      setFilteredOtherWorkOptions(OTHER_WORK_OPTIONS.filter((o) => o.name !== currentActivity));
    }
    setUnifiedModalType('activity-change');
    setUnifiedModalVisible(true);
    setShowChangeOtherOptions(false);
    setIsChangingActivity(true);
    setTempSelectedActivity(null);
    setSelectedLeaveType(null);
  };

  const handleActivitySelect = (activity: ActivityType) => {
    console.log('Selected Activity:', activity);
    if (activity.name === 'Other Work') {
      setShowOtherOptions(true);
      setShowChangeOtherOptions(true);
      setTempSelectedActivity(activity);
      setUnifiedModalVisible(true);
      setUnifiedModalType('other-work');
    } else if (activity.name === 'Leave') {
      setTempSelectedActivity(activity);
      setUnifiedModalVisible(false);
      setUnifiedModalType('leave-type');
      setUnifiedModalVisible(true);
    } else if (activity.name === 'Retailing') {
      getRoutes();
      setSelectedActivity(activity.name);
      setPendingActivity(activity);
      setUnifiedModalVisible(false);
      setUnifiedModalType('van-change');
      setUnifiedModalVisible(true);
      setVanChangeReason('');
    } else {
      setSelectedActivity(activity.name);
      setPendingActivity(activity);
      setUnifiedModalVisible(false);
      openCamera();
    }
  };

  const handleOtherWorkSelect = (option: OtherWorkOption) => {
    console.log('Selected Other Work Option:', option);
    setSelectedActivity(option.name);
    setPendingActivity(option);
    setShowOtherOptions(false);
    setUnifiedModalVisible(false);
    openCamera();
  };

  const handleVanChangeSubmit = () => {
    if (!vanChangeReason) {
      toast.error('Please select an option');
      return;
    }

    if (vanChangeReason === 'Yes, Same Van') {
      setUnifiedModalVisible(false);
      setUnifiedModalType('route-selection');
      setUnifiedModalVisible(true);
      return;
    }

    setVanChangeNote('');
    setSelectedVanForChange(null);
    fetchAvailableVans();
    setUnifiedModalVisible(false);
    setUnifiedModalType('van-selection');
    setUnifiedModalVisible(true);
  };

  const fetchAvailableVans = async () => {
    try {
      const response: any = await homeService.getVans({ limit: 50, page: 1 });

      if (response?.statusCode === 200) {
        const data = response?.data || [];
        const list = data.filter((v: any) => v.vanId !== van?.vanId);
        setAvailableVans(list);
      }
    } catch (error) {
      console.error('Error fetching vans:', error);
      toast.error('Failed to fetch van list. Please try again.');
    }
  };

  const handleVanSelectionSubmit = () => {
    if (!selectedVanForChange || !vanChangeNote.trim()) {
      toast.error('Please enter reason and select a van');
      return;
    }

    setUnifiedModalVisible(false);

    if (isChangingActivity) {
      setUnifiedModalType('route-selection');
      setUnifiedModalVisible(true);
      return;
    }

    setVanChangeRequestPending(true);
    setVanChangePendingBanner(true);
    handleStartDay({ skipRouteValidation: true, forceVanChangePending: true });
  };

  const handleRouteSelect = (route: any) => {
    console.log('Selected Route FULL:', route);
    setSelectedRoute(route);
    setUnifiedModalVisible(false);
    openCamera();
  };

  const handleChangeActivity = (activity: ActivityType) => {
    if (activity.name === 'Other Work') {
      setSelectedRoute(null);
      setShowChangeOtherOptions(true);
      setUnifiedModalType('other-work');
      setUnifiedModalVisible(true);
      setIsChangingActivity(true);
    } else if (activity.name === 'Leave') {
      setSelectedRoute(null);
      setTempSelectedActivity(activity);
      setUnifiedModalVisible(false);
      setUnifiedModalType('leave-type');
      setUnifiedModalVisible(true);
      setIsChangingActivity(true);
    } else if (activity.name === 'Retailing') {
      getRoutes();
      setSelectedActivity(activity.name);
      setUnifiedModalVisible(false);
      setUnifiedModalType('van-change');
      setUnifiedModalVisible(true);
      setVanChangeReason('');
      setIsChangingActivity(true);
    } else {
      setSelectedRoute(null);
      setSelectedActivity(activity.name);
      setPendingActivity(activity);
      setUnifiedModalVisible(false);
      completeActivityChange();
    }
  };

  const handleChangeRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    setUnifiedModalVisible(false);
    setLoadSummaryVisible(true);
  };

  const handleChangeOtherWork = (option: OtherWorkOption) => {
    setSelectedRoute(null);
    setSelectedActivity(option.name);
    setPendingActivity(option);
    setUnifiedModalVisible(false);
    setShowChangeOtherOptions(false);
    completeActivityChange();
  };

  const handleLeaveTypeSelect = (leaveType: ActivityType) => {
    const leaveTypeName = leaveType.name;
    setSelectedLeaveType(leaveTypeName);
    setSelectedRoute(null);
    setSelectedActivity('Leave');
    setPendingActivity({
      ...(tempSelectedActivity || { id: 'leave', name: 'Leave' }),
      name: 'Leave',
    } as any);
    setUnifiedModalVisible(false);

    (async () => {
      try {
        const mappedLeaveType: LeaveType | null =
          leaveTypeName === 'Week Off'
            ? 'WEEK_OFF'
            : leaveTypeName === 'Holiday'
              ? 'HOLIDAY'
              : null;

        if (!mappedLeaveType) {
          toast.error('Invalid leave type selected');
          return;
        }

        const today = new Date();
        const date = today.toISOString().slice(0, 10);
        const userId = useAuthStore.getState().user?.userId;

        const response: ApiResponse<any> = await leaveService.applyLeave({
          type: mappedLeaveType,
          userName: user?.name || '',
          userId,
        });

        if (response?.statusCode === 200 || response?.statusCode === 201) {
          await getDayStatus();
          toast.success('Leave marked successfully.');
        } else {
          toast.error(response?.message || 'Failed to mark leave. Please try again.');
        }
      } catch (error) {
        console.error('Error marking leave:', error);
        toast.error('Failed to mark leave. Please try again.');
      }
    })();
  };

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        toast.error('Camera permission is needed to take your photo');
        return;
      }
    }
    setCameraVisible(true);
  };

  const handleCaptureImage = async (photo: any) => {
    if (photo && photo.uri) {
      setUserPhoto(photo.uri);
      setCameraVisible(false);
      if (isChangingActivity) return;

      if (selectedRoute) {
        setLoadSummaryVisible(true);
      } else {
        handleStartDay();
      }
    } else {
      console.error('No photo captured');
      toast.error('Failed to capture photo');
    }
  };

  const handleLoadSummaryProceed = () => {
    setLoadSummaryVisible(false);
    if (isChangingActivity) {
      completeActivityChange();
      return;
    }
    handleStartDay();
  };

  const handleStartDay = async (options?: {
    skipRouteValidation?: boolean;
    forceVanChangePending?: boolean;
  }) => {
    console.log('Selected Activity:', selectedActivity);
    console.log('Selected Route:', selectedRoute);
    console.log('Van:', van);

    const isVanChangePending =
      Boolean(options?.forceVanChangePending) || Boolean(vanChangeRequestPending);

    if (
      selectedActivity === 'Retailing' &&
      !selectedRoute &&
      !isVanChangePending &&
      !options?.skipRouteValidation
    ) {
      toast.error('Please select route');
      return;
    }

    let dayStartImage: { mediaId?: string; url?: string } | null = null;

    if (userPhoto) {
      const mediaResponse = await homeService.uploadDayStartImage({
        uri: userPhoto,
        ownerId: user?.employeeId || user?.id || 'day-start',
      });

      if (mediaResponse?.statusCode === 201 && mediaResponse.data) {
        dayStartImage = {
          mediaId: mediaResponse.data.mediaId,
          url: mediaResponse.data.url,
        };
      }
    }

    const payload: DayStartPayload = {
      activityName: selectedActivity,
      routeId: selectedRoute?.routeId,
      description: selectedRoute
        ? `Started Retailing - Route: ${selectedRoute.name}, Van: ${mappedVan?.name || ASSIGNED_VAN.name}`
        : isVanChangePending
          ? `Van change request pending. Requested Van: ${selectedVanForChange?.name || mappedVan?.name || ''}`
          : selectedActivity === 'Leave'
            ? `Leave: ${selectedLeaveType || 'Other'}`
            : `Started ${pendingActivity?.name}`,
      totalShops: selectedRoute?.totalShops,
      routeName: selectedRoute?.name,
      vanId: van?.vanId,
      requestedVanId: isVanChangePending ? selectedVanForChange?.vanId : undefined,
      requestedVanName: isVanChangePending
        ? selectedVanForChange?.name || selectedVanForChange?.vanName
        : undefined,
      vanChangeReason: isVanChangePending ? vanChangeNote.trim() : undefined,
      dayStartImageMediaId: dayStartImage?.mediaId,
      dayStartImageUrl: dayStartImage?.url,
      // vanChangeNote: isVanChangePending ? vanChangeNote.trim() : undefined,
    };

    console.log('Day Start Payload:', payload);

    try {
      const response: ApiResponse<any> = await homeService.dayStart(payload);

      if (response?.statusCode === 201) {
        getDayStatus();
        if (isVanChangePending) {
          setVanChangeRequestPending(true);
          toast.success('Day started. Van change request pending approval.');
        } else {
          toast.success('Your day successfully started.');
        }
      }
    } catch (error) {
      console.error('Error starting day:', error);
      toast.error('Failed to start day. Please try again.');
    }
  };

  const completeActivityChange = async () => {
    if (selectedActivity === 'Retailing' && !selectedRoute) {
      toast.error('Please select route');
      return;
    }

    const payload: CreateActivityPayload = {
      name: selectedActivity,
      routeId: selectedRoute?.routeId,
      description: selectedRoute
        ? `Started Retailing - Route: ${selectedRoute.name}, Van: ${mappedVan?.name || van?.name || ASSIGNED_VAN.name}`
        : selectedActivity === 'Leave'
          ? `Leave: ${selectedLeaveType || 'Other'}`
          : `Started ${pendingActivity?.name}`,
      totalShops: selectedRoute?.totalShops,
      routeName: selectedRoute?.name,
      workSessionId,
      vanId: selectedRoute?.vanId || van?.vanId,
      vanName: mappedVan?.name || van?.name,
    };

    try {
      const response: any = await homeService.createActivity(payload);

      if (response.statusCode === 201) {
        setIsChangingActivity(false);
        getDayStatus();
        toast.success(`Activity changed to ${selectedActivity}`);
      }
    } catch (error) {
      console.error('Error changing activity:', error);
      toast.error('Failed to change activity. Please try again.');
    }
  };

  const handleCloseUnifiedModal = () => {
    setUnifiedModalVisible(false);
    setShowChangeOtherOptions(false);
    setShowOtherOptions(false);
    setTempSelectedActivity(null);
    setSelectedLeaveType(null);
  };

  const handleCloseLoadSummary = () => {
    setLoadSummaryVisible(false);
  };

  const handleCancelCamera = () => {
    setCameraVisible(false);
  };

  const handleQuickAction = (route: string) => {
    console.log('Clicked route:', route);

    switch (route) {
      case '/retailing':
        if (dayStarted) {
          handleChangeActivity({ name: 'Retailing' } as any);
        } else {
          handleActivitySelect({ name: 'Retailing' } as any);
        }
        break;

      case '/other-work':
        if (dayStarted) {
          handleChangeActivity({ name: 'Other Work' } as any);
        } else {
          handleActivitySelect({ name: 'Other Work' } as any);
        }
        break;

      case '/leave':
        if (dayStarted) {
          handleChangeActivity({ name: 'Leave' } as any);
        } else {
          handleActivitySelect({ name: 'Leave' } as any);
        }
        break;
    }
  };

  const fetchDayEndSummary = async () => {
    console.log(
      'Fetching day end summary with vanId:',
      van?.vanId,
      'and workSessionId:',
      workSessionId,
    );
    const res: any = await vanService.fetchTodayStockSummary({ vanId: van?.vanId, workSessionId });
    console.log('Stock Summary before day end:', res);
    setDayEndSummary(res?.data);
  };

  const handleEndDay = async (carryForwardStock?: boolean) => {
    try {
      const response = await homeService.dayComplete(carryForwardStock);

      if (response.success) {
        toast.success('Your day successfully completed');
        setDayStarted(false);
        setWorkSessionId('');
        setCurrentActivity(null);
        setTodayActivities([]);
        setStartTime(null);
        setVanChangePendingBanner(false);
        setVanChangeRequestPending(false);
        setSelectedActivityColor('#4158D0');
        setSelectedActivityIcon('storefront');
        useRouteStore.getState().setSelectedRoute(null);
        await getDayStatus();
      }
    } catch (error) {
      console.error('Error completing day:', error);
      toast.error('Failed to complete day. Please try again.');
    }
  };

  const getDayStatus = async () => {
    try {
      const response: any = await homeService.getDayStatus(workSessionId);
      const data = response?.data;

      setDayStarted(data?.status === 'ACTIVE');
      console.log('Day Status Response:', response);
      setTodayActivities(data?.todayActivities || []);

      // Check if today's activity is LEAVE
      if (data?.type === 'LEAVE') {
        setIsTodayLeave(true);
      } else {
        setIsTodayLeave(false);
      }

      if (response.statusCode === 200 && data?.status === 'ACTIVE') {
        setWorkSessionId(data?.workSessionId || '');
        setCurrentActivity(data?.activeActivity?.name || null);
        setStartTime(data?.activeActivity?.startTime || null);
        setSelectedActivityColor('#4158D0');
        setSelectedActivityIcon('storefront');

        const selectedRoute = data?.selectedRoute;
        const van = data?.van;
        const routeStore = useRouteStore.getState();

        if (selectedRoute) {
          routeStore.setSelectedRoute(selectedRoute);
        } else {
          routeStore.setSelectedRoute(null);
        }

        if (van) {
          routeStore.setVan(van);
        }

        const isPendingVanChange = data?.vanChangeStatus === 'PENDING';
        setVanChangePendingBanner(isPendingVanChange);
        setVanChangeRequestPending(isPendingVanChange);

        if (
          data?.vanChangeStatus === 'APPROVED' &&
          !data?.activeActivity &&
          handledApprovedVanChangeSessionRef.current !== data.workSessionId
        ) {
          handledApprovedVanChangeSessionRef.current = data.workSessionId;
          setVanChangePendingBanner(false);
          setVanChangeRequestPending(false);
          setMappedVan({
            ...(mappedVan || ASSIGNED_VAN),
            vanId: data.vanId,
            name: data.vanName || data.requestedVanName || mappedVan?.name,
          });
          await getVan();
          await getRoutes();
          setSelectedActivity('Retailing');
          setPendingActivity(
            ACTIVITY_TYPES.find((activity) => activity.name === 'Retailing') || null,
          );
          setIsChangingActivity(true);
          setUnifiedModalType('route-selection');
          setUnifiedModalVisible(true);
          toast.success('Van change approved. Please select a route.');
        }
      }
    } catch (error) {
      console.error('Error fetching day status:', error);
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
              routeSessionId: item.routeSessionId,
              workSessionId: item.workSessionId,
              vanId: item.vanId,
              totalShops: item.route?.outletCount,
              distance: item.route.distance || 'N/A',
              stops: item.route?.outletCount || 0,
              marketId: item.route.marketId,
              provinceId: item.route.provinceId,
              countryId: item.route.countryId,
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
      const userId = useAuthStore.getState().user?.userId;
      const response: any = await homeService.getVan(userId);

      if (response.statusCode === 200) {
        const van = response?.data?.[0] || null;
        useRouteStore.getState().setVan(van);
        console.log('Van set in store:', van);
      }
    } catch (error) {
      console.error('Error fetching van:', error);
    }
  };

  const visitStatus = async () => {
    try {
      const query: any = {
        workSessionId: selectedRoute?.workSessionId,
        vanId: selectedRoute?.vanId,
        routeSessionId: selectedRoute?.routeSessionId,
      };

      const response = await outletService.visitStatus(query);
      const visit: any = response?.data;

      if (!visit?.visitId) {
        clearVisit();
        return;
      }

      console.log('============visit=============', visit);

      setActiveVisit({
        visitId: visit.visitId,
        outlet: {
          id: visit.outletId,
          customerId: visit.outletId,
          name: visit.outletName,
          ownerName: visit.ownerName || '',
          phoneNumber: visit.phoneNumber || '',
          customerTypeId: visit.customerTypeId || '',
          address: visit.address || '',
          customerCategoryId: visit.customerCategoryId || '',
          channelId: visit.channelId || '',
          marketId: visit.marketId || '',
          provinceId: visit.provinceId || '',
          segmentation: visit.segmentation || '',
          geoTag: visit.geoTag || '',
          status: visit.outletStatus || 'active',
          isDeleted: visit.isDeleted || false,
        },
        checkInTime: new Date(visit.checkInTime),
        checkOutTime: visit.checkOutTime ? new Date(visit.checkOutTime) : undefined,
        status: visit.status,
        routeSessionId: visit?.routeSessionId,
        customerId: visit?.customerId,
      });
    } catch (error) {
      console.error('visitStatus error:', error);
    }
  };

  const handleDayEndConfirmation = () => {
    fetchDayEndSummary();
    setShowDayEndConfirm(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <LinearGradient
          colors={[colors.primary + '12', colors.background, colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.heroSection}
        >
          {/* Header Row with Greeting and Badge */}
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroTextBlock}>
              <AppText style={styles.heroEyebrow}>{greeting}</AppText>
              <AppText style={styles.heroTitle}>{user?.name}</AppText>
            </View>

            <View
              style={[
                styles.heroBadge,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Ionicons
                name={dayStarted ? 'play-circle-outline' : 'pause-circle-outline'}
                size={16}
                color={dayStarted ? colors.success : colors.warning}
              />
              <AppText
                style={[
                  styles.heroBadgeText,
                  { color: dayStarted ? colors.success : colors.warning },
                ]}
              >
                {dayStarted ? 'On Duty' : 'Idle'}
              </AppText>
            </View>
          </View>

          {/* Full Width Van Info Card - Moved outside heroTextBlock */}
          <View style={styles.vanInfoCard}>
            <View style={styles.vanInfoIconContainer}>
              <MaterialCommunityIcons name="van-passenger" size={20} color={colors.primary} />
            </View>
            <View style={styles.vanInfoDetails}>
              <View style={styles.vanInfoRow}>
                <AppText style={styles.vanInfoLabel}>Assigned Vehicle</AppText>
                {van?.type && (
                  <View style={[styles.vanTypeBadge, { backgroundColor: colors.primary + '15' }]}>
                    <AppText style={[styles.vanTypeText, { color: colors.primary }]}>
                      {van.type}
                    </AppText>
                  </View>
                )}
              </View>
              <AppText style={styles.vanInfoName} numberOfLines={1}>
                {vanDisplayInfo?.combinedLabel || 'No van assigned'}
              </AppText>
              {van?.registrationNumber && (
                <View style={styles.vanRegistrationRow}>
                  <Ionicons name="id-card-outline" size={12} color={colors.textSecondary} />
                  <AppText style={styles.vanRegistrationText}>
                    Reg: {van.registrationNumber}
                  </AppText>
                </View>
              )}
              {van?.capacity && (
                <View style={styles.vanCapacityRow}>
                  <Ionicons name="cube-outline" size={12} color={colors.textSecondary} />
                  <AppText style={styles.vanCapacityText}>Capacity: {van.capacity} kg</AppText>
                </View>
              )}
            </View>
          </View>

          {vanChangePendingBanner && (
            <View
              style={[
                styles.pendingBanner,
                { backgroundColor: colors.warning + '08', borderColor: colors.warning + '30' },
              ]}
            >
              <Ionicons name="time-outline" size={18} color={colors.warning} />
              <View style={styles.pendingBannerContent}>
                <AppText style={[styles.pendingBannerTitle, { color: colors.textPrimary }]}>
                  Van Change Request Pending
                </AppText>
                <AppText style={[styles.pendingBannerSubtitle, { color: colors.textSecondary }]}>
                  Your request to change vehicle is under review. You can continue working with your
                  current vehicle.
                </AppText>
              </View>
            </View>
          )}

          <View style={styles.mainContent}>
            {dayStarted && (
              <CurrentActivityCard
                selectedActivity={currentActivity}
                selectedActivityColor={selectedActivityColor}
                selectedActivityIcon={selectedActivityIcon}
                startTime={startTime}
                otherWorkStartTime={otherWorkStartTime}
                selectedRoute={selectedRoute}
                assignedVan={mappedVan}
              />
            )}
          </View>

          <View style={styles.sectionStack}>
            {isTodayLeave ? (
              <View
                style={[
                  styles.leaveMessageContainer,
                  { backgroundColor: colors.success + '15', borderColor: colors.success + '30' },
                ]}
              >
                <Ionicons name="checkmark-circle-outline" size={24} color={colors.success} />
                <View style={styles.leaveMessageContent}>
                  <AppText style={[styles.leaveMessageTitle, { color: colors.textPrimary }]}>
                    You have marked leave
                  </AppText>
                  <AppText style={[styles.leaveMessageSubtitle, { color: colors.textSecondary }]}>
                    Enjoy your time off. Quick actions are not available when on leave.
                  </AppText>
                </View>
              </View>
            ) : (
              <QuickActionsSection
                actions={filteredQuickActions}
                onPressAction={(route: any) => handleQuickAction(route)}
              />
            )}

            <StatsOverviewSection employeeId={user?.userId as any} />

            <TodayActivitiesSection activities={todayActivities} />

            <Footer lastUpdated={new Date().toLocaleTimeString()} />
          </View>
        </LinearGradient>
      </ScrollView>

      <UnifiedActionModal
        visible={unifiedModalVisible}
        modalType={unifiedModalType}
        isDayStart={!dayStarted && !isChangingActivity}
        vanChangeReason={vanChangeReason}
        onSelectVanChangeReason={setVanChangeReason}
        onVanChangeSubmit={handleVanChangeSubmit}
        vans={availableVans}
        selectedVan={selectedVanForChange}
        onSelectVan={setSelectedVanForChange}
        vanChangeNote={vanChangeNote}
        onChangeVanChangeNote={setVanChangeNote}
        onVanSelectionSubmit={handleVanSelectionSubmit}
        onVanSelectionBack={() => {
          setUnifiedModalVisible(false);
          setUnifiedModalType('van-change');
          setUnifiedModalVisible(true);
        }}
        routes={routes}
        assignedVan={mappedVan}
        onSelectRoute={isChangingActivity ? handleChangeRouteSelect : handleRouteSelect}
        showChangeOtherOptions={showOtherOptions || showChangeOtherOptions}
        selectedActivity={currentActivity || tempSelectedActivity?.name || undefined}
        activityTypes={ACTIVITY_TYPES}
        otherWorkOptions={otherWorkOptionsForModal}
        onActivitySelect={isChangingActivity ? handleChangeActivity : handleActivitySelect}
        onOtherWorkSelect={isChangingActivity ? handleChangeOtherWork : handleOtherWorkSelect}
        leaveTypes={LEAVE_TYPES}
        selectedLeaveType={selectedLeaveType || undefined}
        onLeaveTypeSelect={handleLeaveTypeSelect}
        onLeaveBack={() => {
          setUnifiedModalVisible(false);
          setUnifiedModalType('activity-change');
          setUnifiedModalVisible(true);
        }}
        onBackToOptions={() => {
          setShowChangeOtherOptions(false);
          setShowOtherOptions(false);
          setTempSelectedActivity(null);
        }}
        onClose={handleCloseUnifiedModal}
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
        title="Take a Selfie to Start"
        cameraProps={{
          facing: 'front',
          quality: 0.8,
          autofocus: true,
        }}
      />

      <DayEndConfirmationModal
        visible={finalConfirmation}
        onClose={() => setFinalConfirmation(false)}
        onConfirm={handleEndDay}
        vanName={van?.name || 'Vehicle'}
        date={new Date().toLocaleDateString()}
      />

      <DayEndSummaryModal
        visible={showDayEndConfirm}
        data={dayEndSummary}
        onClose={() => setShowDayEndConfirm(false)}
        onProceed={() => {
          setDayEndSummary(false);
          setFinalConfirmation(true);
        }}
      />
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 24,
    },
    heroSection: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 20,
    },
    heroHeaderRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 16,
    },
    heroTextBlock: {
      flex: 1,
    },
    heroEyebrow: {
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: colors.primary,
      marginBottom: 4,
    },
    heroTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 0,
    },
    // Full Width Van Info Card Styles
    vanInfoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      width: '100%',
    },
    vanInfoIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + '10',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    vanInfoDetails: {
      flex: 1,
    },
    vanInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    vanInfoLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    vanTypeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    vanTypeText: {
      fontSize: 10,
      fontWeight: '600',
    },
    vanInfoName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    vanRegistrationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 2,
    },
    vanRegistrationText: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    vanCapacityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    vanCapacityText: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    // Keep existing styles
    heroBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
    },
    heroBadgeText: {
      fontSize: 11,
      fontWeight: '600',
    },
    pendingBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
      marginBottom: 16,
    },
    pendingBannerContent: {
      flex: 1,
    },
    pendingBannerTitle: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 2,
    },
    pendingBannerSubtitle: {
      fontSize: 11,
      lineHeight: 15,
      opacity: 0.85,
    },
    mainContent: {
      marginBottom: 16,
    },
    sectionStack: {
      gap: 12,
    },
    leaveMessageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
      marginBottom: 8,
    },
    leaveMessageContent: {
      flex: 1,
    },
    leaveMessageTitle: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 2,
    },
    leaveMessageSubtitle: {
      fontSize: 11,
      lineHeight: 15,
      opacity: 0.85,
    },
  });
