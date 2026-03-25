import { Route } from 'expo-router';
import { ActivityHistoryEntry, ActivityType, TodayActivity } from './activity.types';
import { Van } from './van.types';

// export interface ActivityType {
//   id: string;
//   name: string;
//   icon: string;
//   color: string;
// }

export interface OtherWorkOption {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface SalesExecutiveState {
  dayStarted: boolean;
  selectedActivity: string;
  selectedActivityColor: string;
  selectedActivityIcon: string;
  selectedRoute: Route | null;
  selectedVan: Van;
  startTime: string;
  activityHistory: ActivityHistoryEntry[];
  userPhoto: string | null;
  otherWorkStartTime: string | null;
  otherWorkDuration: string | null;
  todayActivities: TodayActivity[];
  vanChangeReason: string;
}

export interface ChangeActivityModalProps {
  visible: boolean;
  showChangeOtherOptions: boolean;
  selectedActivity: string;
  activityTypes: ActivityType[];
  otherWorkOptions: OtherWorkOption[];
  onClose: () => void;
  onActivitySelect: (activity: ActivityType) => void;
  onOtherWorkSelect: (option: OtherWorkOption) => void;
  onBackToOptions: () => void;
}
