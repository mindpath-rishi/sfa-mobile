import { api } from '@/core/network';
import type { ApiResponse } from '@/core/network/api.types';
import { EXPENSE_ENDPOINTS, EXPENSE_PAGINATION } from '../constants/expense.constants';
import type { Expense, ExpenseRequest } from '../types/expense.types';

export interface ExpenseService {
  preview(): Promise<ApiResponse<ExpenseRequest>>;
  create(): Promise<ApiResponse<Expense>>;
  getMine(page?: number): Promise<ApiResponse<Expense[]>>;
}

export const expenseService: ExpenseService = {
  preview: () => api.get<ExpenseRequest>(EXPENSE_ENDPOINTS.PREVIEW),

  /** Remarks are filled server-side from the routes worked (day start) */
  create: () => api.post<Expense>(EXPENSE_ENDPOINTS.BASE),

  getMine: (page = 1) =>
    api.get<Expense[]>(
      `${EXPENSE_ENDPOINTS.MINE}?page=${page}&limit=${EXPENSE_PAGINATION.HISTORY_LIMIT}`,
    ),
};
