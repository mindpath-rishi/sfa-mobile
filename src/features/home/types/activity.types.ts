import { Route } from './route.types';
import { OtherWorkOption } from './salesExecutive.types';
import { Van } from './van.types';

export interface ActivityType {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type ActivityStatus = 'completed' | 'pending' | 'scheduled' | 'cancelled' | 'in_progress';

export interface ActivityItemProps {
  item: Activity;
  onPress?: () => void;
  index?: number;
  showBorder?: boolean;
}

export interface TodayActivity {
  id: string;
  type: string;
  customer: string;
  time: string;
  status: string;
  notes: string;
}

export interface TodayActivitiesSectionProps {
  activities: TodayActivity[];
}

export interface ActivityHistoryEntry {
  activity: string;
  route?: string;
  van?: string;
  time: string;
  date: string;
  duration?: string;
  status?: string;
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

export interface Activity {
  id: string;
  type:
    | 'visit'
    | 'order'
    | 'meeting'
    | 'collection'
    | 'demo'
    | 'office'
    | 'van_change'
    | 'retailing';
  customer: string;
  time: string;
  status: 'completed' | 'pending' | 'scheduled' | 'in_progress' | 'ended';
  amount?: string;
  location?: string;
  notes?: string;
}

export interface CurrentActivityCardProps {
  selectedActivity: string;
  selectedActivityColor: string;
  selectedActivityIcon: string;
  startTime: string;
  otherWorkStartTime: string | null;
  selectedRoute: Route | null;
  assignedVan: Van;
  onPressChange: () => void;
  onPressEnd: () => void;
}
