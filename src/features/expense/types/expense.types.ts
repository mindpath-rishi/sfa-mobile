export type ExpenseTag = 'UPC' | 'LOCAL';

export type ExpenseOption = 'FOOD_AND_NIGHT_STAY' | 'DAILY_EXPENSE';

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SYNCED_TO_ERP';

/** Calculated request — returned by preview and stored on create */
export interface ExpenseRequest {
  userId: string;
  manNumber?: string;
  employeeName: string;
  expenseTag: ExpenseTag;
  expenseOption: ExpenseOption;
  requestedDate: string;
  weekStart: string;
  fromDate: string;
  toDate: string;
  noOfDays: number;
  toBeAdjustedDays: number;
  adjustedDates: string[];
  previousExpenseId?: string;
  payableDays: number;
  perDayValue: number;
  /** Slab % applied to payable days × per day value */
  withdrawalChargePercent?: number;
  withdrawalCharges: number;
  totalAmount: number;
  /** Routes worked in the range (from day-start route sessions) */
  routeIds: string[];
  /** ERP Remarks: route names, in order worked */
  remarks: string;
}

export interface Expense extends ExpenseRequest {
  expenseId: string;
  status: ExpenseStatus;
  actionRemarks?: string;
  createdAt?: string;
}
