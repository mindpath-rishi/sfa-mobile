// topup.constants.ts

export const TOPUP_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type TopupStatusType = (typeof TOPUP_STATUS)[keyof typeof TOPUP_STATUS];

export const TOPUP_STATUS_CONFIG: Record<TopupStatusType, {
  label: string;
  color: string;
  bg: string;
  icon: string;
  order: number;
}> = {
  [TOPUP_STATUS.DRAFT]: {
    label: 'Draft',
    color: '#8B5CF6',
    bg: '#8B5CF612',
    icon: 'document-text-outline',
    order: 1,
  },
  [TOPUP_STATUS.SUBMITTED]: {
    label: 'Submitted',
    color: '#3B82F6',
    bg: '#3B82F612',
    icon: 'time-outline',
    order: 2,
  },
  [TOPUP_STATUS.APPROVED]: {
    label: 'Approved',
    color: '#10B981',
    bg: '#10B98112',
    icon: 'checkmark-circle-outline',
    order: 3,
  },
  [TOPUP_STATUS.REJECTED]: {
    label: 'Rejected',
    color: '#EF4444',
    bg: '#EF444412',
    icon: 'close-circle-outline',
    order: 4,
  },
};

export const TOPUP_STATUS_OPTIONS: Array<{
  id: TopupStatusType;
  label: string;
  value: TopupStatusType;
}> = [
  { id: TOPUP_STATUS.DRAFT, label: 'Draft', value: TOPUP_STATUS.DRAFT },
  { id: TOPUP_STATUS.SUBMITTED, label: 'Submitted', value: TOPUP_STATUS.SUBMITTED },
  { id: TOPUP_STATUS.APPROVED, label: 'Approved', value: TOPUP_STATUS.APPROVED },
  { id: TOPUP_STATUS.REJECTED, label: 'Rejected', value: TOPUP_STATUS.REJECTED },
];

export const DEFAULT_FILTERS = {
  status: [],
  dateRange: { start: '', end: '' },
  minValue: '',
  maxValue: '',
};

export const PAGINATION = {
  LIMIT: 10,
  DEFAULT_PAGE: 1,
  ON_END_REACHED_THRESHOLD: 0.5,
} as const;

export const DEBOUNCE_DELAY = 300;

export const MESSAGES = {
  LOAD_ERROR: 'Failed to load top-up requests',
  CREATE_SUCCESS: 'Top-up request created successfully',
  CREATE_ERROR: 'Failed to create top-up request',
  UPDATE_SUCCESS: 'Top-up request updated successfully',
  UPDATE_ERROR: 'Failed to update top-up request',
  DELETE_SUCCESS: 'Top-up request deleted successfully',
  DELETE_ERROR: 'Failed to delete top-up request',
  APPROVE_SUCCESS: 'Top-up request approved successfully',
  APPROVE_ERROR: 'Failed to approve top-up request',
  REJECT_SUCCESS: 'Top-up request rejected successfully',
  REJECT_ERROR: 'Failed to reject top-up request',
  SUBMIT_SUCCESS: 'Top-up request submitted successfully',
  SUBMIT_ERROR: 'Failed to submit top-up request',
  NO_OUTLET: 'Please select an outlet first',
  NO_VAN: 'No van assigned to this outlet',
} as const;

export const EMPTY_STATE = {
  TITLE: 'No inventory top-ups yet',
  DESCRIPTION: 'Tap the + button below to create your first top-up request.',
  ICON: 'cube-outline',
  SEARCH_TITLE: 'No top-ups found',
  SEARCH_DESCRIPTION: 'Try adjusting your search criteria or filters.',
  SEARCH_ICON: 'search-outline',
} as const;

export const FILTER_SECTIONS = {
  STATUS: {
    id: 'status',
    title: 'Status',
    type: 'multiple' as const,
  },
  DATE_RANGE: {
    id: 'dateRange',
    title: 'Date Range',
    type: 'range' as const,
  },
  VALUE_RANGE: {
    id: 'valueRange',
    title: 'Request Value (ZMW)',
    type: 'range' as const,
  },
};

export const SEARCH = {
  PLACEHOLDER: 'Search by van, employee or ID...',
  MIN_LENGTH: 2,
} as const;

export const HEADER = {
  TITLE: 'Top-up Requests',
  RIGHT_ICON: 'plus',
} as const;

export const SORT_OPTIONS = [
  { id: 'date_desc', label: 'Newest First', value: '-date' },
  { id: 'date_asc', label: 'Oldest First', value: '+date' },
  { id: 'value_desc', label: 'Highest Value', value: '-totalRequestedValue' },
  { id: 'value_asc', label: 'Lowest Value', value: '+totalRequestedValue' },
  { id: 'status_asc', label: 'Status A-Z', value: '+status' },
] as const;

export const DATE_FORMATS = {
  DISPLAY: 'DD MMM YYYY',
  API: 'YYYY-MM-DD',
  DISPLAY_WITH_TIME: 'DD MMM YYYY, hh:mm A',
} as const;

export const VALIDATION = {
  MIN_VALUE: 0,
  MAX_VALUE: 999999999,
  MIN_SEARCH_LENGTH: 2,
  MAX_SEARCH_LENGTH: 100,
} as const;


