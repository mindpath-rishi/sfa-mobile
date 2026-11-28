import type { ExpenseOption, ExpenseStatus } from '../types/expense.types';

export const EXPENSE_ENDPOINTS = {
  BASE: '/expense',
  PREVIEW: '/expense/preview',
  MINE: '/expense/me',
} as const;

export const EXPENSE_PAGINATION = {
  HISTORY_LIMIT: 10,
} as const;

export const EXPENSE_OPTION_LABEL: Record<ExpenseOption, string> = {
  FOOD_AND_NIGHT_STAY: 'Food & Night Stay',
  DAILY_EXPENSE: 'Daily Expense',
};

export const EXPENSE_STATUS_LABEL: Record<ExpenseStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SYNCED_TO_ERP: 'Paid',
};

export const EXPENSE_MESSAGES = {
  SUBMITTED: 'Expense request submitted',
  SUBMIT_FAILED: 'Unable to submit expense request',
  LOAD_FAILED: 'Unable to load expense details',
  WINDOW_CLOSED: 'Expense requests can be raised Monday to Saturday.',
  ALREADY_RAISED: 'You have already raised a request for this week.',
  NO_HISTORY: 'No expense requests yet',
} as const;
