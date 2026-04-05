// activity.types.ts
import { Route } from './route.types';
import { OtherWorkOption } from './salesExecutive.types';
import { Van } from './van.types';

// ============================================
// Activity Type Definitions
// ============================================

export interface ActivityType {
  id: string;
  name: string;
  icon: string;
  color: string;
  category?: ActivityCategory;
  defaultDuration?: number; // in minutes
  requiresRoute?: boolean;
  requiresVan?: boolean;
}

export type ActivityCategory = 'work' | 'break' | 'travel' | 'meeting' | 'admin' | 'other';

export type ActivityStatus =
  | 'completed'
  | 'pending'
  | 'scheduled'
  | 'cancelled'
  | 'in_progress'
  | 'ongoing'
  | 'ended';

export type ActivityPriority = 'high' | 'medium' | 'low';

// ============================================
// Activity Interfaces
// ============================================

export interface Activity {
  id: string;
  _id?: string;
  type: ActivityType['name'];
  name?: string;
  activityType?: string;
  customer?: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  status: ActivityStatus;
  amount?: string;
  location?: string;
  notes?: string;
  priority?: ActivityPriority;
  routeId?: string;
  routeName?: string;
  vanId?: string;
  vanName?: string;
  duration?: number; // in minutes
  category?: ActivityCategory;
  createdAt?: string;
  updatedAt?: string;
}

export interface TodayActivity {
  _id: string;
  name: string;
  activityType?: string;
  type?: string;
  startTime: string;
  endTime?: string;
  status: string;
  duration?: string;
  routeName?: string;
  vanName?: string;
  notes?: string;
  priority?: ActivityPriority;
}

// ============================================
// Component Props
// ============================================

export interface ActivityItemProps {
  item: Activity;
  onPress?: () => void;
  index?: number;
  showBorder?: boolean;
  isOngoing?: boolean;
}

export interface TodayActivitiesSectionProps {
  activities: TodayActivity[];
  onActivityPress?: (activity: TodayActivity) => void;
  maxDisplayCount?: number;
  showStats?: boolean;
  collapsible?: boolean;
}

export interface CurrentActivityCardProps {
  selectedActivity: string | null;
  selectedActivityColor: string;
  selectedActivityIcon: string;
  startTime: string | null;
  otherWorkStartTime: string | null;
  selectedRoute: any | null;
  assignedVan: Van;
  onPressChange: () => void;
  onPressEnd: () => void;
  onPressRoute?: () => void;
  onPressVan?: () => void;
  compact?: boolean;
  showWarningAfter?: number; // hours
}

export interface ChangeActivityModalProps {
  visible: boolean;
  showChangeOtherOptions: boolean;
  selectedActivity: string | null;
  activityTypes: ActivityType[];
  otherWorkOptions: OtherWorkOption[];
  onClose: () => void;
  onActivitySelect: (activity: ActivityType) => void;
  onOtherWorkSelect: (option: OtherWorkOption) => void;
  onBackToOptions: () => void;
  currentActivity?: Activity;
}

// ============================================
// Activity History & Tracking
// ============================================

export interface ActivityHistoryEntry {
  id?: string;
  activity: string;
  activityType?: string;
  route?: string;
  routeId?: string;
  van?: string;
  vanId?: string;
  startTime: string;
  endTime?: string;
  time?: string;
  date: string;
  duration?: string;
  durationMinutes?: number;
  status?: ActivityStatus;
  notes?: string;
  location?: string;
  completedAt?: string;
}

export interface ActivityStats {
  totalActivities: number;
  completedActivities: number;
  ongoingActivities: number;
  totalDuration: string;
  totalDurationMinutes: number;
  completionRate: number;
  averageDuration: string;
  mostFrequentActivity: string;
  activitiesByCategory: Record<ActivityCategory, number>;
}

// ============================================
// Activity Planning & Scheduling
// ============================================

export interface ScheduledActivity {
  id: string;
  activityId: string;
  activityType: ActivityType;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: ActivityStatus;
  priority: ActivityPriority;
  dependencies?: string[]; // IDs of activities that must be completed first
  notes?: string;
}

export interface ActivityPlan {
  id: string;
  date: string;
  executiveId: string;
  activities: ScheduledActivity[];
  totalDuration: number;
  breaks: ActivityBreak[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityBreak {
  id: string;
  startTime: string;
  endTime: string;
  type: 'lunch' | 'short' | 'tea';
  duration: number;
}

// ============================================
// Activity Performance & Analytics
// ============================================

export interface ActivityPerformance {
  activityId: string;
  activityName: string;
  totalTimeSpent: number; // in minutes
  averageTimePerSession: number;
  completionRate: number;
  mostActiveDay: string;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface DailyActivitySummary {
  date: string;
  totalActivities: number;
  completedActivities: number;
  totalDuration: number;
  activities: ActivityHistoryEntry[];
  breaks: ActivityBreak[];
  efficiency: number; // percentage
  overtime: boolean;
  overtimeMinutes?: number;
}

// ============================================
// Activity Validation & Utils
// ============================================

export interface ActivityValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ActivityFilters {
  status?: ActivityStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  activityTypes?: string[];
  categories?: ActivityCategory[];
  searchQuery?: string;
  priority?: ActivityPriority[];
}

// ============================================
// Activity Notification Types
// ============================================

export interface ActivityNotification {
  id: string;
  type: 'reminder' | 'warning' | 'alert' | 'info';
  title: string;
  message: string;
  activityId?: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    onPress: () => void;
  };
}

// ============================================
// Activity Context Types
// ============================================

export interface ActivityContextType {
  currentActivity: Activity | null;
  todayActivities: TodayActivity[];
  activityHistory: ActivityHistoryEntry[];
  activityStats: ActivityStats;
  isLoading: boolean;
  error: string | null;
  startActivity: (activity: ActivityType, route?: Route, van?: Van) => Promise<void>;
  endActivity: (activityId: string, notes?: string) => Promise<void>;
  changeActivity: (newActivity: ActivityType) => Promise<void>;
  getActivityHistory: (dateRange?: { start: Date; end: Date }) => Promise<ActivityHistoryEntry[]>;
  refreshActivities: () => Promise<void>;
  clearError: () => void;
}

// ============================================
// Helper Types for Activity Items
// ============================================

export interface ActivityItemComponentProps {
  item: TodayActivity;
  index: number;
  totalItems: number;
  onPress?: () => void;
}

export interface ActivityStatsCardProps {
  stats: ActivityStats;
  variant?: 'compact' | 'detailed';
  onPress?: () => void;
}

// ============================================
// Constants
// ============================================

export const ACTIVITY_STATUS_CONFIG: Record<
  ActivityStatus,
  {
    label: string;
    color: string;
    icon: string;
    bgColor: string;
  }
> = {
  completed: {
    label: 'Completed',
    color: '#10B981',
    icon: 'checkmark-circle',
    bgColor: '#10B98115',
  },
  pending: {
    label: 'Pending',
    color: '#F59E0B',
    icon: 'time',
    bgColor: '#F59E0B15',
  },
  scheduled: {
    label: 'Scheduled',
    color: '#3B82F6',
    icon: 'calendar',
    bgColor: '#3B82F615',
  },
  cancelled: {
    label: 'Cancelled',
    color: '#EF4444',
    icon: 'close-circle',
    bgColor: '#EF444415',
  },
  in_progress: {
    label: 'In Progress',
    color: '#8B5CF6',
    icon: 'play-circle',
    bgColor: '#8B5CF615',
  },
  ongoing: {
    label: 'Active',
    color: '#10B981',
    icon: 'radio-button-on',
    bgColor: '#10B98115',
  },
  ended: {
    label: 'Ended',
    color: '#6B7280',
    icon: 'stop-circle',
    bgColor: '#6B728015',
  },
};

export const ACTIVITY_CATEGORY_CONFIG: Record<
  ActivityCategory,
  {
    label: string;
    icon: string;
    color: string;
  }
> = {
  work: {
    label: 'Work',
    icon: 'briefcase',
    color: '#3B82F6',
  },
  break: {
    label: 'Break',
    icon: 'cafe',
    color: '#F59E0B',
  },
  travel: {
    label: 'Travel',
    icon: 'car',
    color: '#8B5CF6',
  },
  meeting: {
    label: 'Meeting',
    icon: 'people',
    color: '#EC489A',
  },
  admin: {
    label: 'Admin',
    icon: 'document-text',
    color: '#6B7280',
  },
  other: {
    label: 'Other',
    icon: 'ellipsis-horizontal',
    color: '#9CA3AF',
  },
};

// ============================================
// Activity Type Definitions
// ============================================

export const DEFAULT_ACTIVITY_TYPES: ActivityType[] = [
  {
    id: 'retailing',
    name: 'Retailing',
    icon: 'storefront',
    color: '#3B82F6',
    category: 'work',
    defaultDuration: 480,
    requiresRoute: true,
    requiresVan: true,
  },
  {
    id: 'driving',
    name: 'Driving',
    icon: 'car',
    color: '#8B5CF6',
    category: 'travel',
    defaultDuration: 60,
    requiresVan: true,
  },
  {
    id: 'break',
    name: 'Break',
    icon: 'cafe',
    color: '#F59E0B',
    category: 'break',
    defaultDuration: 30,
  },
  {
    id: 'meeting',
    name: 'Meeting',
    icon: 'people',
    color: '#EC489A',
    category: 'meeting',
    defaultDuration: 60,
  },
  {
    id: 'office_work',
    name: 'Office Work',
    icon: 'business',
    color: '#10B981',
    category: 'admin',
    defaultDuration: 240,
  },
  {
    id: 'cash_collection',
    name: 'Cash Collection',
    icon: 'cash',
    color: '#F59E0B',
    category: 'work',
    defaultDuration: 120,
  },
  {
    id: 'van_change',
    name: 'Van Change',
    icon: 'swap-horizontal',
    color: '#6B7280',
    category: 'other',
    defaultDuration: 30,
    requiresVan: true,
  },
  {
    id: 'training',
    name: 'Training',
    icon: 'school',
    color: '#8B5CF6',
    category: 'meeting',
    defaultDuration: 120,
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    icon: 'build',
    color: '#EF4444',
    category: 'other',
    defaultDuration: 60,
    requiresVan: true,
  },
];
