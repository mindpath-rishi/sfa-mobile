import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { api } from '@/core/network';
import { toast } from '@/core/utils';
import ExpenseScreen from '@/features/expense/screens/ExpenseScreen';
import { expenseService } from '@/features/expense/services/expense.service';
import type { Expense, ExpenseRequest } from '@/features/expense/types/expense.types';
import {
  formatAmount,
  formatExpenseDate,
  getErrorMessage,
  getStatusColor,
} from '@/features/expense/utils/expense.utils';

jest.mock('@/core/network', () => ({
  api: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('@/core/utils', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');
  return { useFocusEffect: (cb: () => void) => useEffect(cb, [cb]) };
});

const mockedApi = api as unknown as { get: jest.Mock; post: jest.Mock };

const PREVIEW: ExpenseRequest = {
  userId: 'EMP-1',
  manNumber: 'MN-100',
  employeeName: 'Asha Banda',
  expenseTag: 'LOCAL',
  expenseOption: 'DAILY_EXPENSE',
  requestedDate: '2026-11-23T08:00:00.000Z',
  weekStart: '2026-11-23T00:00:00.000Z',
  fromDate: '2026-11-23T00:00:00.000Z',
  toDate: '2026-11-28T00:00:00.000Z',
  noOfDays: 6,
  toBeAdjustedDays: 2,
  adjustedDates: ['2026-11-18T00:00:00.000Z', '2026-11-21T00:00:00.000Z'],
  payableDays: 4,
  perDayValue: 100,
  withdrawalChargePercent: 2.5, // 2.5% of 400
  withdrawalCharges: 10,
  totalAmount: 410,
  routeIds: ['R1', 'R2'],
  remarks: 'Kitwe Local, Ndola',
};

const ok = <T,>(data: T) => Promise.resolve({ success: true, statusCode: 200, data });

const mockApi = ({ preview = ok(PREVIEW) as Promise<unknown>, history = [] as Expense[] } = {}) => {
  mockedApi.get.mockImplementation((url: string) => {
    if (url.startsWith('/expense/preview')) return preview;
    if (url.startsWith('/expense/me')) return ok(history);
    return Promise.reject(new Error(`unexpected GET ${url}`));
  });
};

beforeEach(() => jest.clearAllMocks());

/* ======================================================
 * SERVICE
 * ====================================================== */

describe('expenseService', () => {
  it('calls the preview endpoint', async () => {
    mockedApi.get.mockResolvedValue({});
    await expenseService.preview();
    expect(mockedApi.get).toHaveBeenCalledWith('/expense/preview');
  });

  it('creates with no body (routes come from day start)', async () => {
    mockedApi.post.mockResolvedValue({});
    await expenseService.create();
    expect(mockedApi.post).toHaveBeenCalledWith('/expense');
  });

  it('pages history', async () => {
    mockedApi.get.mockResolvedValue({});
    await expenseService.getMine(2);
    expect(mockedApi.get).toHaveBeenCalledWith('/expense/me?page=2&limit=10');
  });
});

/* ======================================================
 * UTILS
 * ====================================================== */

describe('expense utils', () => {
  it('formats dates and handles empty/invalid values', () => {
    expect(formatExpenseDate(new Date(2026, 10, 23).toISOString())).toBe('Mon, 23 Nov');
    expect(formatExpenseDate(undefined)).toBe('--');
    expect(formatExpenseDate('not-a-date')).toBe('--');
  });

  it('formats amounts to 2 decimals', () => {
    expect(formatAmount(410)).toMatch(/^410[.,]00$/);
    expect(formatAmount(undefined)).toMatch(/^0[.,]00$/);
  });

  it('maps statuses to colors', () => {
    const colors = { success: 'g', error: 'r', warning: 'y', info: 'b' };
    expect(getStatusColor('APPROVED', colors)).toBe('g');
    expect(getStatusColor('REJECTED', colors)).toBe('r');
    expect(getStatusColor('SYNCED_TO_ERP', colors)).toBe('b');
    expect(getStatusColor('PENDING', colors)).toBe('y');
  });

  it('prefers the backend message on errors', () => {
    expect(getErrorMessage({ response: { data: { message: 'From API' } } }, 'fb')).toBe('From API');
    expect(getErrorMessage(new Error('Network'), 'fb')).toBe('Network');
    expect(getErrorMessage(undefined, 'fb')).toBe('fb');
  });
});

/* ======================================================
 * SCREEN
 * ====================================================== */

describe('ExpenseScreen', () => {
  it('shows the calculated request, routes worked and empty history', async () => {
    mockApi();
    const screen = render(<ExpenseScreen />);

    expect(await screen.findByText('Daily Expense · LOCAL')).toBeTruthy();
    expect(screen.getByText('No. of Days')).toBeTruthy();
    expect(screen.getByText('6')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy(); // payable
    expect(screen.getByText(/^410[.,]00$/)).toBeTruthy();
    expect(screen.getByText('Withdrawal Charges (2.5%)')).toBeTruthy();
    expect(screen.getByText(/Adjusted for absent days/)).toBeTruthy();
    expect(screen.getByText('Routes: Kitwe Local, Ndola')).toBeTruthy();
    expect(screen.getByText('No expense requests yet')).toBeTruthy();
  });

  it('submits, toasts and reloads without calling the beat API', async () => {
    mockApi();
    mockedApi.post.mockResolvedValue({ data: {} });
    const screen = render(<ExpenseScreen />);

    const submit = await screen.findByText('Submit Expense');
    await act(async () => {
      fireEvent.press(submit);
    });

    expect(mockedApi.post).toHaveBeenCalledWith('/expense');
    expect(mockedApi.get.mock.calls.some(([u]) => u.startsWith('/beat'))).toBe(false);
    expect(toast.success).toHaveBeenCalledWith('Expense request submitted');
    await waitFor(() =>
      expect(mockedApi.get.mock.calls.filter(([u]) => u.startsWith('/expense/me'))).toHaveLength(2),
    );
  });

  it('shows the backend error when submit fails', async () => {
    mockApi();
    mockedApi.post.mockRejectedValue({
      response: { data: { message: 'Expense request already raised for this week' } },
    });
    const screen = render(<ExpenseScreen />);

    const submit = await screen.findByText('Submit Expense');
    await act(async () => {
      fireEvent.press(submit);
    });

    expect(toast.error).toHaveBeenCalledWith('Expense request already raised for this week');
  });

  it('shows the existing request instead of the form when already raised this week', async () => {
    mockApi({
      history: [{ ...PREVIEW, expenseId: 'EID1', status: 'PENDING' }],
    });
    const screen = render(<ExpenseScreen />);

    expect(
      await screen.findByText('You have already raised a request for this week.'),
    ).toBeTruthy();
    expect(screen.queryByText('Submit Expense')).toBeNull();
    expect(screen.getByText('Pending')).toBeTruthy();
  });

  it('shows the form again when this week’s request was rejected', async () => {
    mockApi({
      history: [
        { ...PREVIEW, expenseId: 'EID1', status: 'REJECTED', actionRemarks: 'Wrong beats' },
      ],
    });
    const screen = render(<ExpenseScreen />);

    expect(await screen.findByText('Submit Expense')).toBeTruthy();
    expect(screen.getByText('Rejected')).toBeTruthy();
    expect(screen.getByText('Wrong beats')).toBeTruthy();
  });

  it('shows the window-closed message on Sunday', async () => {
    mockApi({
      preview: Promise.reject({
        response: {
          data: {
            message: 'Expense request window is closed. Requests can be raised Monday to Saturday.',
          },
        },
      }),
    });
    const screen = render(<ExpenseScreen />);

    expect(await screen.findByText(/window is closed/)).toBeTruthy();
    expect(screen.queryByText('Submit Expense')).toBeNull();
  });
});
