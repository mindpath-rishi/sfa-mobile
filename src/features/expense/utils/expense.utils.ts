import type { ExpenseStatus } from '../types/expense.types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const formatExpenseDate = (value?: string) => {
  if (!value) return '--';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '--';
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

export const formatAmount = (value?: number) =>
  Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

type StatusColors = { success: string; error: string; warning: string; info: string };

export const getStatusColor = (status: ExpenseStatus, colors: StatusColors) => {
  switch (status) {
    case 'APPROVED':
      return colors.success;
    case 'REJECTED':
      return colors.error;
    case 'SYNCED_TO_ERP':
      return colors.info;
    default:
      return colors.warning;
  }
};

/** Pulls the backend message out of an API error */
export const getErrorMessage = (error: unknown, fallback: string) => {
  const e = error as { response?: { data?: { message?: string } }; message?: string };
  return e?.response?.data?.message || e?.message || fallback;
};
