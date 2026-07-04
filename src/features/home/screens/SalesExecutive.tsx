// SalesExecutiveScreen.tsx - Fixed Full Width Van Card
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Alert,
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
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
import { AppText, ConfirmationModal, Skeleton } from '@/core/components';
import { ApiRequestConfig, ApiResponse } from '@/core/network';
import { outletService } from '@/features/outlet/services/outlet.service';
import { useOutletStore } from '@/core/store/outlet.store';
import { useVisitGuard } from '@/shared/hooks/useVisitGuard';
import {
  getRouteCustomerCategoryId,
  getRouteLocationIds,
  Route,
  useRouteStore,
} from '@/core/store/route.store';
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
import { useLoaderStore } from '@/core/loader/loader.store';
import {
  captureCurrentLocation,
  startSalesmanBackgroundLocation,
  stopSalesmanBackgroundLocation,
} from '@/shared/services/location.service';

export default function SalesExecutiveScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [dashboardLoading, setDashboardLoading] = useState(true);
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
  const [vanChangeRequestId, setVanChangeRequestId] = useState('');
  const [vanChangePendingBanner, setVanChangePendingBanner] = useState(false);
  const [pendingVanChangeName, setPendingVanChangeName] = useState('');
  const [vanChangeApprovedRoutePrompt, setVanChangeApprovedRoutePrompt] = useState(false);
  const [cancelVanChangeVisible, setCancelVanChangeVisible] = useState(false);
  const [cancelVanChangeLoading, setCancelVanChangeLoading] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<string | null>('');
  const [filteredActivityTypes, setFilteredActivityTypes] = useState(ACTIVITY_TYPES);
  const [tempSelectedActivity, setTempSelectedActivity] = useState<ActivityType | null>(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState<string | null>(null);
  const [isTodayLeave, setIsTodayLeave] = useState<boolean>(false);

  const cameraRef = useRef<any>(null);
  const dayStartWithVanChangeRef = useRef(false);
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
  const loader = useLoaderStore();

  const { guard } = useVisitGuard();
  const dashboardRefreshTick = useAppEventsStore((s) => s.dashboardRefreshTick);

  const filteredQuickActions = useMemo(() => {
    const hideLeave =
      currentActivity === 'Retailing' ||
      currentActivity === 'Office Work' ||
      currentActivity === 'Other Work' ||
      currentActivity === 'Meetings';

    return QUICK_ACTIONS.filter((action) => {
      if (currentActivity && action.label === currentActivity) return false;
      if (hideLeave && action.label === 'Leave') return false;
      return true;
    });
  }, [currentActivity]);

  const isVanChangePending = vanChangeRequestPending || vanChangePendingBanner;

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

  const loadDashboard = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setDashboardLoading(true);

    try {
      await Promise.all([getDayStatus(), getVan()]);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard(true);
  }, [loadDashboard]);

  useEffect(() => {
    setDayStarted(false);
    setCurrentActivity(null);
    setStartTime(null);
    setTodayActivities([]);
    setIsTodayLeave(false);
    void loadDashboard(true);
  }, [dashboardRefreshTick, loadDashboard]);

  useFocusEffect(
    React.useCallback(() => {
      void loadDashboard();
    }, [loadDashboard]),
  );

  useEffect(() => {
    if (!selectedRoute?.routeSessionId) return;
    visitStatus();
  }, [selectedRoute?.routeSessionId]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
    void loadDashboard();
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

  const getRequestedVanName = (selectedVan?: any) =>
    selectedVan?.name || selectedVan?.vanName || selectedVan?.vanNumber || '';

  const handleActivityVanChangeRequest = async () => {
    const activeWorkSessionId = workSessionId || useAuthStore.getState().workSessionId;

    if (!activeWorkSessionId) {
      toast.error('Work session not found. Please refresh and try again.');
      return;
    }

    try {
      const requestedVanName = getRequestedVanName(selectedVanForChange);
      const response = await homeService.requestVanChange(activeWorkSessionId, {
        requestedVanId: selectedVanForChange?.vanId,
        requestedVanName,
        vanChangeReason: vanChangeNote.trim(),
      });

      if (response?.success === false || ![200, 201].includes(Number(response?.statusCode))) {
        toast.error(response?.message || 'Failed to submit van change request');
        return;
      }

      setUnifiedModalVisible(false);
      setIsChangingActivity(false);
      setVanChangeRequestPending(true);
      setVanChangeRequestId(response?.data?.vanChangeRequestId || '');
      setVanChangePendingBanner(true);
      setPendingVanChangeName(requestedVanName);
      setSelectedVanForChange(null);
      setVanChangeNote('');
      toast.success('Van change request submitted for approval.');
      await getDayStatus();
    } catch (error: any) {
      console.error('Error requesting van change:', error);
      toast.error(error?.response?.data?.message || 'Failed to submit van change request');
    }
  };

  const handleVanSelectionSubmit = () => {
    if (!selectedVanForChange || !vanChangeNote.trim()) {
      toast.error('Please enter reason and select a van');
      return;
    }

    if (isChangingActivity) {
      void handleActivityVanChangeRequest();
      return;
    }

    // A selfie is required when the executive starts the day, including when
    // they request a different van. Van/activity changes during an active day
    // continue without opening the camera.
    dayStartWithVanChangeRef.current = true;
    setUnifiedModalVisible(false);
    void openCamera();
  };

  const handleRouteSelect = (route: any) => {
    console.log('Selected Route FULL:', route);
    setSelectedRoute(route);
    setUnifiedModalVisible(false);
    openCamera();
  };

  const openApprovedVanRouteSelection = async () => {
    await getRoutes();
    setSelectedActivity('Retailing');
    setPendingActivity(ACTIVITY_TYPES.find((activity) => activity.name === 'Retailing') || null);
    setIsChangingActivity(true);
    setUnifiedModalType('route-selection');
    setUnifiedModalVisible(true);
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
      setPendingActivity(activity);
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
      completeActivityChange({
        activityName: activity.name,
        pendingActivityValue: activity,
        route: null,
      });
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
    completeActivityChange({
      activityName: option.name,
      pendingActivityValue: option,
      route: null,
    });
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

        const userId = useAuthStore.getState().user?.userId;

        const response: ApiResponse<any> = await leaveService.applyLeave({
          type: mappedLeaveType,
          userName: user?.name || '',
          userId,
        });

        if (response?.success || [200, 201, 202].includes(Number(response?.statusCode))) {
          setIsTodayLeave(true);
          await getDayStatus();
          Alert.alert(
            'Leave Marked',
            `${leaveTypeName} has been marked successfully. Quick actions are disabled for today.`,
          );
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

      if (dayStartWithVanChangeRef.current) {
        dayStartWithVanChangeRef.current = false;
        void handleStartDay({
          skipRouteValidation: true,
          forceVanChangePending: true,
          photoUri: photo.uri,
        });
        return;
      }

      if (selectedRoute) {
        setLoadSummaryVisible(true);
      } else {
        handleStartDay({ photoUri: photo.uri });
      }
    } else {
      console.error('No photo captured');
      toast.error('Failed to capture photo');
    }
  };

  const handleLoadSummaryProceed = () => {
    setLoadSummaryVisible(false);
    if (isChangingActivity) {
      completeActivityChange({
        activityName: selectedActivity || pendingActivity?.name,
        pendingActivityValue: pendingActivity,
        route: selectedRoute,
      });
      return;
    }
    handleStartDay();
  };

  const handleStartDay = async (options?: {
    skipRouteValidation?: boolean;
    forceVanChangePending?: boolean;
    photoUri?: string;
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

    try {
      loader.show({ message: 'Getting your start location...' });

      let dayStartImage: { mediaId?: string; url?: string } | null = null;
      let dayStartLocation = await captureCurrentLocation();

      const dayStartPhotoUri = options?.photoUri || userPhoto;
      if (dayStartPhotoUri) {
        loader.show({ message: 'Uploading day start photo...' });

        const mediaResponse = await homeService.uploadDayStartImage(
          {
            uri: dayStartPhotoUri,
            ownerId: user?.employeeId || user?.id || 'day-start',
            subOwnnerId: workSessionId as any,
          },
          {
            showLoader: false,
          },
        );

        if (mediaResponse?.statusCode === 201 && mediaResponse.data) {
          dayStartImage = {
            mediaId: mediaResponse.data.mediaId,
            url: mediaResponse.data.url,
          };
        }
      }

      if (!dayStartLocation) {
        loader.show({ message: 'Confirming your start location...' });
        dayStartLocation = await captureCurrentLocation();
      }
      if (!dayStartLocation) {
        toast.error('A high-accuracy GPS location is required to start the day.');
        return;
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
        customerCategoryId: getRouteCustomerCategoryId(selectedRoute),
        vanId: van?.vanId,
        dayStartImageMediaId: dayStartImage?.mediaId,
        dayStartImageUrl: dayStartImage?.url,
        dayStartLocation,
        // vanChangeNote: isVanChangePending ? vanChangeNote.trim() : undefined,
      };

      console.log('Day Start Payload:', payload);

      loader.show({ message: 'Starting your day...' });

      const response: ApiResponse<any> = await homeService.dayStart(payload, {
        showLoader: false,
      });

      if ([201, 202].includes(Number(response?.statusCode))) {
        const startedWorkSessionId =
          response?.data?.workSessionId || workSessionId || useAuthStore.getState().workSessionId;

        if (isVanChangePending) {
          if (!startedWorkSessionId) {
            setVanChangeRequestPending(false);
            setVanChangePendingBanner(false);
            setPendingVanChangeName('');
            setVanChangeRequestId('');
            setUnifiedModalVisible(false);
            toast.error(
              'Day started, but its work session could not be identified. Please refresh.',
            );
            return;
          }

          const requestedVanName = getRequestedVanName(selectedVanForChange);
          const vanChangeResponse = await homeService.requestVanChange(startedWorkSessionId, {
            requestedVanId: selectedVanForChange?.vanId,
            requestedVanName,
            vanChangeReason: vanChangeNote.trim(),
          });

          if (
            vanChangeResponse?.success === false ||
            ![200, 201].includes(Number(vanChangeResponse?.statusCode))
          ) {
            setVanChangeRequestPending(false);
            setVanChangePendingBanner(false);
            setPendingVanChangeName('');
            setVanChangeRequestId('');
            setUnifiedModalVisible(false);
            toast.error(
              `Day started, but van change request failed: ${vanChangeResponse?.message || 'Please try again.'}`,
            );
          } else {
            setVanChangeRequestPending(true);
            setVanChangePendingBanner(true);
            setPendingVanChangeName(requestedVanName);
            setVanChangeRequestId(vanChangeResponse?.data?.vanChangeRequestId || '');
            setUnifiedModalVisible(false);
            setSelectedVanForChange(null);
            setVanChangeNote('');
            toast.success('Day started. Van change request pending approval.');
          }
        }

        loader.show({ message: 'Preparing today activity...' });
        await getDayStatus({ showLoader: false });

        loader.show({ message: 'Starting location tracking...' });
        await startSalesmanBackgroundLocation(user);

        if (!isVanChangePending) {
          toast.success('Your day successfully started.');
        }
      } else {
        setVanChangeRequestPending(false);
        setVanChangePendingBanner(false);
        setPendingVanChangeName('');
        setVanChangeRequestId('');
        toast.error(response?.message || 'Failed to start day. Please try again.');
      }
    } catch (error: any) {
      console.error('Error starting day:', error);
      setVanChangeRequestPending(false);
      setVanChangePendingBanner(false);
      setPendingVanChangeName('');
      setVanChangeRequestId('');
      toast.error(error?.response?.data?.message || error?.message || 'Failed to start day.');
    } finally {
      loader.hide();
    }
  };

  const completeActivityChange = async (options?: {
    activityName?: string;
    pendingActivityValue?: ActivityType | OtherWorkOption | null;
    route?: Route | null;
  }) => {
    const activityName = options?.activityName || selectedActivity;
    const activityValue =
      options && 'pendingActivityValue' in options ? options.pendingActivityValue : pendingActivity;
    const activityRoute = options && 'route' in options ? options.route : selectedRoute;

    if (!activityName) {
      toast.error('Please select activity');
      return;
    }

    if (activityName === 'Retailing' && !activityRoute) {
      toast.error('Please select route');
      return;
    }

    const payload: CreateActivityPayload = {
      name: activityName,
      routeId: activityRoute?.routeId,
      description: activityRoute
        ? `Started Retailing - Route: ${activityRoute.name}, Van: ${mappedVan?.name || van?.name || ASSIGNED_VAN.name}`
        : activityName === 'Leave'
          ? `Leave: ${selectedLeaveType || 'Other'}`
          : `Started ${activityValue?.name || activityName}`,
      totalShops: activityRoute?.totalShops,
      routeName: activityRoute?.name,
      customerCategoryId: getRouteCustomerCategoryId(activityRoute),
      workSessionId,
      vanId: activityRoute?.vanId || van?.vanId,
      vanName: mappedVan?.name || van?.name,
      startLocation: await captureCurrentLocation(),
    };

    try {
      const response: any = await homeService.createActivity(payload);

      if ([201, 202].includes(Number(response.statusCode))) {
        setIsChangingActivity(false);
        setVanChangeApprovedRoutePrompt(false);
        setCurrentActivity(activityName);
        setStartTime(new Date().toISOString());
        await getDayStatus();
        toast.success(`Activity changed to ${activityName}`);
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
    dayStartWithVanChangeRef.current = false;
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
      loader.show({ message: 'Getting your end location...' });
      const dayEndLocation = await captureCurrentLocation();
      if (!dayEndLocation) {
        toast.error('A high-accuracy GPS location is required to end the day.');
        return;
      }
      const response = await homeService.dayComplete({ carryForwardStock, dayEndLocation });

      if (response.success) {
        await stopSalesmanBackgroundLocation();
        toast.success('Your day successfully completed');
        setDayStarted(false);
        setWorkSessionId('');
        setCurrentActivity(null);
        setTodayActivities([]);
        setStartTime(null);
        setVanChangePendingBanner(false);
        setVanChangeRequestPending(false);
        setPendingVanChangeName('');
        setVanChangeApprovedRoutePrompt(false);
        setSelectedActivityColor('#4158D0');
        setSelectedActivityIcon('storefront');
        useRouteStore.getState().setSelectedRoute(null);
        await getDayStatus();
      }
    } catch (error) {
      console.error('Error completing day:', error);
      const message =
        (error as any)?.response?.data?.message ||
        (error instanceof Error ? error.message : null) ||
        'Failed to complete day. Please try again.';
      toast.error(message);
    } finally {
      loader.hide();
    }
  };

  const handleCancelVanChangeRequest = async () => {
    if (!vanChangeRequestId) {
      toast.error('Van change request not found. Please refresh and try again.');
      return;
    }

    setCancelVanChangeLoading(true);
    try {
      const response = await homeService.cancelVanChangeRequest(vanChangeRequestId);

      if (response?.success === false || ![200, 201].includes(Number(response?.statusCode))) {
        toast.error(response?.message || 'Failed to cancel van change request');
        return;
      }

      setCancelVanChangeVisible(false);
      setVanChangePendingBanner(false);
      setVanChangeRequestPending(false);
      setVanChangeRequestId('');
      setPendingVanChangeName('');
      setVanChangeApprovedRoutePrompt(false);
      setSelectedVanForChange(null);
      setVanChangeNote('');
      toast.success('Van change request cancelled');
      await getDayStatus();
    } catch (error: any) {
      console.error('Error cancelling van change request:', error);
      toast.error(error?.response?.data?.message || 'Failed to cancel van change request');
    } finally {
      setCancelVanChangeLoading(false);
    }
  };

  const getDayStatus = async (config?: ApiRequestConfig) => {
    try {
      const response: any = await homeService.getDayStatus(workSessionId, config);
      const data = response?.data;

      setDayStarted(data?.status === 'ACTIVE');
      console.log('Day Status Response:', response);
      setTodayActivities(data?.todayActivities || []);

      const hasLeaveToday =
        data?.type === 'LEAVE' ||
        Boolean(data?.leave) ||
        data?.activeActivity?.name?.toUpperCase() === 'LEAVE' ||
        data?.todayActivities?.some(
          (activity: any) => String(activity?.name || activity?.type).toUpperCase() === 'LEAVE',
        );
      setIsTodayLeave(Boolean(hasLeaveToday));

      if (response.statusCode === 200 && data?.status === 'ACTIVE') {
        setWorkSessionId(data?.workSessionId || '');
        void startSalesmanBackgroundLocation(user);
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
          setMappedVan({
            ...van,
            name: van.name || van.vanName,
          });
        }

        const isPendingVanChange = data?.vanChangeStatus === 'PENDING';
        setVanChangePendingBanner(isPendingVanChange);
        setVanChangeRequestPending(isPendingVanChange);
        setVanChangeRequestId(isPendingVanChange ? data?.vanChangeRequestId || '' : '');
        setPendingVanChangeName(
          isPendingVanChange
            ? data?.requestedVanName || data?.requestedVan || data?.requestedVanId || ''
            : '',
        );

        const hasStartedRetailing =
          data?.vanChangeActionTaken ?? data?.activeActivity?.name?.includes('Retailing');
        const shouldPromptApprovedVanRoute =
          data?.vanChangeRequiresAction ??
          (data?.vanChangeStatus === 'APPROVED' && !hasStartedRetailing);

        if (!shouldPromptApprovedVanRoute) {
          setVanChangeApprovedRoutePrompt(false);
        }

        if (
          shouldPromptApprovedVanRoute &&
          handledApprovedVanChangeSessionRef.current !== data.workSessionId
        ) {
          handledApprovedVanChangeSessionRef.current = data.workSessionId;
          setVanChangePendingBanner(false);
          setVanChangeRequestPending(false);
          setPendingVanChangeName('');
          setVanChangeApprovedRoutePrompt(true);
          setMappedVan({
            ...(mappedVan || ASSIGNED_VAN),
            vanId: data.vanId,
            name: data.vanName || data.requestedVanName || mappedVan?.name,
          });
          await getVan();
          await openApprovedVanRouteSelection();
          toast.success('Van change approved. Please select a route.');
        }
      } else {
        void stopSalesmanBackgroundLocation();
      }
    } catch (error) {
      console.error('Error fetching day status:', error);
    }
  };

  const getRoutes = async () => {
    try {
      const response: any = await homeService.getVanMappedRoutes();

      if (response.statusCode === 200) {
        const mappedRouteVan = response?.data
          ? {
              vanId: response.data.vanId,
              name: response.data.vanName,
              vanNumber: response.data.vanNumber || '',
              capacity: response.data.capacity || '',
            }
          : null;
        if (mappedRouteVan?.vanId) {
          setMappedVan(mappedRouteVan);
          useRouteStore.getState().setVan(mappedRouteVan);
        }

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
              ...getRouteLocationIds({ ...item, route: item.route }),
              customerCategoryId: getRouteCustomerCategoryId({
                customerCategoryId: item.customerCategoryId,
                customerCategory: item.customerCategory,
                route: item.route,
              }),
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
        if (van) {
          setMappedVan({
            ...van,
            name: van.name || van.vanName,
          });
        }
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

  const renderDashboardSkeleton = () => (
    <>
      <View style={styles.skeletonHeaderRow}>
        <View style={styles.skeletonHeaderText}>
          <Skeleton height={14} width={120} borderRadius={7} />
          <Skeleton height={28} width="70%" borderRadius={8} />
        </View>
        <Skeleton height={32} width={88} borderRadius={16} />
      </View>

      <View style={styles.skeletonVanCard}>
        <Skeleton height={40} width={40} variant="circle" />
        <View style={styles.skeletonVanDetails}>
          <View style={styles.skeletonInlineRow}>
            <Skeleton height={12} width={112} borderRadius={6} />
            <Skeleton height={18} width={54} borderRadius={9} />
          </View>
          <Skeleton height={16} width="78%" borderRadius={8} />
          <Skeleton height={12} width="44%" borderRadius={6} />
        </View>
      </View>

      <View style={styles.skeletonDashboardCard}>
        <View style={styles.skeletonSection}>
          <Skeleton height={18} width={128} borderRadius={8} />
          <View style={styles.skeletonQuickActions}>
            {[1, 2, 3, 4].map((item) => (
              <View key={item} style={styles.skeletonQuickActionItem}>
                <Skeleton height={56} width={56} variant="circle" />
                <Skeleton height={12} width={58} borderRadius={6} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.skeletonSection}>
          <View style={styles.skeletonInlineRow}>
            <Skeleton height={18} width={146} borderRadius={8} />
            <Skeleton height={32} width={32} variant="circle" />
          </View>
          <View style={styles.skeletonStatsRow}>
            {[1, 2].map((item) => (
              <View key={item} style={styles.skeletonStatCard}>
                <Skeleton height={40} width={40} borderRadius={8} />
                <View style={styles.skeletonStatText}>
                  <Skeleton height={12} width={62} borderRadius={6} />
                  <Skeleton height={22} width={76} borderRadius={8} />
                  <Skeleton height={12} width={92} borderRadius={6} />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.skeletonSection}>
          <View style={styles.skeletonInlineRow}>
            <Skeleton height={18} width={142} borderRadius={8} />
            <Skeleton height={20} width={34} borderRadius={10} />
          </View>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.skeletonActivityRow}>
              <Skeleton height={40} width={40} borderRadius={10} />
              <View style={styles.skeletonActivityText}>
                <View style={styles.skeletonInlineRow}>
                  <Skeleton height={14} width="52%" borderRadius={7} />
                  <Skeleton height={18} width={62} borderRadius={9} />
                </View>
                <Skeleton height={12} width="68%" borderRadius={6} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </>
  );

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
          {dashboardLoading ? (
            renderDashboardSkeleton()
          ) : (
            <>
              {/* Header Row with Greeting and Badge */}
              <View style={styles.heroHeaderRow}>
                <View style={styles.heroTextBlock}>
                  <AppText style={styles.heroEyebrow}>{greeting}</AppText>
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
                      <View
                        style={[styles.vanTypeBadge, { backgroundColor: colors.primary + '15' }]}
                      >
                        <AppText style={[styles.vanTypeText, { color: colors.primary }]}>
                          {van.type}
                        </AppText>
                      </View>
                    )}
                  </View>
                  <View style={styles.vanNameActionRow}>
                    <AppText style={styles.vanInfoName} numberOfLines={1}>
                      {vanDisplayInfo?.combinedLabel || 'No van assigned'}
                    </AppText>
                    {vanChangeApprovedRoutePrompt && (
                      <TouchableOpacity
                        activeOpacity={0.75}
                        style={[
                          styles.selectRouteButton,
                          { backgroundColor: colors.primary + '12' },
                        ]}
                        onPress={openApprovedVanRouteSelection}
                      >
                        <AppText style={[styles.selectRouteButtonText, { color: colors.primary }]}>
                          Select Route
                        </AppText>
                      </TouchableOpacity>
                    )}
                  </View>
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
                    <AppText
                      style={[styles.pendingBannerSubtitle, { color: colors.textSecondary }]}
                    >
                      Your request to change vehicle is under review.
                    </AppText>
                    {!!pendingVanChangeName && (
                      <AppText style={[styles.pendingVanName, { color: colors.textPrimary }]}>
                        Requested van: {pendingVanChangeName}
                      </AppText>
                    )}
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.75}
                    style={[styles.cancelVanChangeButton, { borderColor: colors.warning + '50' }]}
                    onPress={() => setCancelVanChangeVisible(true)}
                  >
                    <AppText style={[styles.cancelVanChangeText, { color: colors.warning }]}>
                      Cancel
                    </AppText>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.dashboardContent}>
                {dayStarted && !!currentActivity && !isVanChangePending && (
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

                {isVanChangePending ? null : isTodayLeave ? (
                  <View
                    style={[
                      styles.leaveMessageContainer,
                      {
                        backgroundColor: colors.success + '15',
                        borderColor: colors.success + '30',
                      },
                    ]}
                  >
                    <Ionicons name="checkmark-circle-outline" size={24} color={colors.success} />
                    <View style={styles.leaveMessageContent}>
                      <AppText style={[styles.leaveMessageTitle, { color: colors.textPrimary }]}>
                        You have marked leave
                      </AppText>
                      <AppText
                        style={[styles.leaveMessageSubtitle, { color: colors.textSecondary }]}
                      >
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

                <StatsOverviewSection
                  employeeId={user?.userId as any}
                  routeCustomerCount={
                    selectedRoute?.totalShops || Number((selectedRoute as any)?.stops || 0)
                  }
                />

                <TodayActivitiesSection activities={todayActivities} />

                <Footer lastUpdated={new Date().toLocaleTimeString()} />
              </View>
            </>
          )}
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
        vanSelectionSubmitLabel={isChangingActivity ? 'Submit' : 'Start Day'}
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
        proceedLabel={isChangingActivity ? 'Submit' : 'Proceed'}
      />

      <CameraModal
        visible={cameraVisible}
        cameraRef={cameraRef}
        onClose={handleCancelCamera}
        onCapture={handleCaptureImage}
        onError={(error) => console.error('Camera error:', error)}
        title="Take a Selfie to Start"
        allowCameraSwitch={false}
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

      <ConfirmationModal
        visible={cancelVanChangeVisible}
        title="Cancel van change?"
        message="This will cancel your pending van change request. You can continue with your currently assigned van."
        confirmText="Cancel Request"
        cancelText="Keep Waiting"
        type="warning"
        loading={cancelVanChangeLoading}
        onConfirm={handleCancelVanChangeRequest}
        onCancel={() => {
          if (!cancelVanChangeLoading) setCancelVanChangeVisible(false);
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
      paddingHorizontal: 8,
      paddingTop: 16,
      paddingBottom: 24,
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
      fontSize: 14,
      fontWeight: '400',
      color: colors.textSecondary,
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
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 1,
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
      fontSize: 12,
      fontWeight: '400',
      color: colors.textSecondary,
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
      flex: 1,
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    vanNameActionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 4,
    },
    selectRouteButton: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    selectRouteButtonText: {
      fontSize: 12,
      fontWeight: '700',
    },
    vanRegistrationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 2,
    },
    vanRegistrationText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    vanCapacityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    vanCapacityText: {
      fontSize: 13,
      fontWeight: '600',
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
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    pendingBannerSubtitle: {
      fontSize: 14,
      lineHeight: 20,
    },
    pendingVanName: {
      fontSize: 13,
      fontWeight: '700',
      marginTop: 4,
    },
    cancelVanChangeButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      backgroundColor: colors.surface,
    },
    cancelVanChangeText: {
      fontSize: 12,
      fontWeight: '700',
    },
    dashboardContent: {
      backgroundColor: 'transparent',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 32,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 1,
    },
    skeletonHeaderRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 16,
    },
    skeletonHeaderText: {
      flex: 1,
      gap: 8,
    },
    skeletonVanCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 1,
    },
    skeletonVanDetails: {
      flex: 1,
      gap: 8,
      marginLeft: 12,
    },
    skeletonDashboardCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 1,
    },
    skeletonSection: {
      gap: 12,
    },
    skeletonInlineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    skeletonQuickActions: {
      flexDirection: 'row',
      gap: 12,
    },
    skeletonQuickActionItem: {
      width: 72,
      alignItems: 'center',
      gap: 8,
    },
    skeletonStatsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    skeletonStatCard: {
      flex: 1,
      minHeight: 110,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
    },
    skeletonStatText: {
      flex: 1,
      gap: 8,
    },
    skeletonActivityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 10,
    },
    skeletonActivityText: {
      flex: 1,
      gap: 8,
    },
    leaveMessageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
    },
    leaveMessageContent: {
      flex: 1,
    },
    leaveMessageTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    leaveMessageSubtitle: {
      fontSize: 14,
      lineHeight: 20,
    },
  });
