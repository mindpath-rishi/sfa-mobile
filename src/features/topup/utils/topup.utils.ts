import { TOPUP_STATUS, TOPUP_STATUS_CONFIG, TopupStatusType } from '../constants/topup.constants';

// Re-export commonly used formatters
export { formatCurrency, formatWeight, formatQuantity } from '@/shared/utils/number.utils';

// ============ Status Helpers ============
export const getStatusConfig = (status: TopupStatusType) =>
  TOPUP_STATUS_CONFIG[status] || TOPUP_STATUS_CONFIG[TOPUP_STATUS.DRAFT];

export const getStatusLabel = (status: TopupStatusType) => getStatusConfig(status).label;

export const getStatusColor = (status: TopupStatusType) => getStatusConfig(status).color;

export const getStatusBgColor = (status: TopupStatusType) => getStatusConfig(status).bg;

export const getStatusIcon = (status: TopupStatusType) => getStatusConfig(status).icon;
