const mockStore = new Map<string, string>();
const mockState = { user: { userId: 'U1' } as { userId: string } | null };
const mockApi = { patch: jest.fn(), get: jest.fn(), post: jest.fn() };
const mockLocation = {
  captureBestEffortLocation: jest.fn(),
  captureCurrentLocation: jest.fn(),
};

jest.mock('@/core/storage', () => ({
  storage: {
    getItem: async (k: string) => mockStore.get(k) ?? null,
    setItem: async (k: string, v: string) => void mockStore.set(k, v),
    removeItem: async (k: string) => void mockStore.delete(k),
  },
}));
jest.mock('@/core/network', () => ({
  get api() {
    return mockApi;
  },
}));
jest.mock('@/core/network/upload', () => ({ uploadFormData: jest.fn() }));
jest.mock('@/core/navigation/role.utils', () => ({ isSalesman: () => true }));
jest.mock('@/core/offline/offline.store', () => ({ isOfflineMode: () => false }));
jest.mock('@/core/store/auth.store', () => ({
  useAuthStore: { getState: () => mockState },
}));
jest.mock('@/repositories', () => ({ repositories: {} }));
jest.mock('@/shared/services/location.service', () => ({
  captureBestEffortLocation: (...args: unknown[]) =>
    mockLocation.captureBestEffortLocation(...args),
  captureCurrentLocation: (...args: unknown[]) => mockLocation.captureCurrentLocation(...args),
}));

import {
  completeVisitInBackground,
  retryPendingVisitCompletions,
} from '@/features/outlet/services/outlet.service';

const KEY = 'pending_visit_completions';
const pending = () => JSON.parse(mockStore.get(KEY) || '[]');
const loc = {
  latitude: -15.4,
  longitude: 28.3,
  accuracy: 30,
  capturedAt: '2026-10-23T08:00:00.000Z',
};

beforeEach(() => {
  mockStore.clear();
  mockState.user = { userId: 'U1' };
  mockApi.patch.mockReset();
  mockLocation.captureBestEffortLocation.mockReset();
});

describe('completeVisitInBackground', () => {
  it('persists the completion first, sends check-out time + location, then clears it', async () => {
    let seenWhileRunning: any[] = [];
    mockApi.patch.mockImplementation(async () => {
      seenWhileRunning = pending();
      return { success: true, statusCode: 200 };
    });

    await completeVisitInBackground('V1', Promise.resolve(loc));

    expect(seenWhileRunning).toEqual([
      expect.objectContaining({ visitId: 'V1', userId: 'U1', checkOutLocation: loc }),
    ]);
    const [url, body] = mockApi.patch.mock.calls[0];
    expect(url).toBe('shop-visit/V1');
    expect(body).toMatchObject({ status: 'COMPLETED', checkOutLocation: loc });
    expect(body.checkOutTime).toBe(seenWhileRunning[0].checkOutTime);
    expect(pending()).toEqual([]);
  });

  it('falls back to an approximate location when the pre-captured one is missing', async () => {
    mockLocation.captureBestEffortLocation.mockResolvedValue(loc);
    mockApi.patch.mockResolvedValue({ success: true, statusCode: 200 });

    await completeVisitInBackground('V1', Promise.resolve(undefined));
    expect(mockLocation.captureBestEffortLocation).toHaveBeenCalled();
    expect(mockApi.patch.mock.calls[0][1].checkOutLocation).toEqual(loc);
  });

  it('keeps the pending entry when the server fails (app closed / network down)', async () => {
    mockApi.patch.mockRejectedValue(new Error('Network Error'));

    await expect(completeVisitInBackground('V1', Promise.resolve(loc))).rejects.toThrow();
    expect(pending()).toEqual([expect.objectContaining({ visitId: 'V1', checkOutLocation: loc })]);
  });

  it('keeps the pending entry when the server answers success:false', async () => {
    mockApi.patch.mockResolvedValue({ success: false, message: 'oops' });
    await expect(completeVisitInBackground('V1', Promise.resolve(loc))).rejects.toThrow('oops');
    expect(pending()).toHaveLength(1);
  });
});

describe('retryPendingVisitCompletions', () => {
  const seed = (items: any[]) => mockStore.set(KEY, JSON.stringify(items));
  const recent = new Date(Date.now() - 60_000).toISOString();

  it('retries with the ORIGINAL check-out time and location, then removes the entry', async () => {
    seed([{ visitId: 'V1', userId: 'U1', checkOutTime: recent, checkOutLocation: loc }]);
    mockApi.patch.mockResolvedValue({ success: true, statusCode: 200 });

    await retryPendingVisitCompletions();

    expect(mockApi.patch).toHaveBeenCalledWith('shop-visit/V1', {
      status: 'COMPLETED',
      checkOutTime: recent,
      checkOutLocation: loc,
    });
    expect(pending()).toEqual([]);
  });

  it("only retries the current user's visits and keeps failures for the next attempt", async () => {
    seed([
      { visitId: 'MINE', userId: 'U1', checkOutTime: recent, checkOutLocation: loc },
      { visitId: 'OTHER', userId: 'U2', checkOutTime: recent, checkOutLocation: loc },
    ]);
    mockApi.patch.mockRejectedValue(new Error('offline'));

    await retryPendingVisitCompletions();

    expect(mockApi.patch).toHaveBeenCalledTimes(1);
    expect(mockApi.patch.mock.calls[0][0]).toBe('shop-visit/MINE');
    expect(
      pending()
        .map((i: any) => i.visitId)
        .sort(),
    ).toEqual(['MINE', 'OTHER']);
  });

  it('drops entries older than 24 hours without calling the server', async () => {
    seed([{ visitId: 'OLD', userId: 'U1', checkOutTime: '2020-01-01T00:00:00.000Z' }]);
    await retryPendingVisitCompletions();
    expect(mockApi.patch).not.toHaveBeenCalled();
    expect(pending()).toEqual([]);
  });

  it('does nothing when logged out', async () => {
    mockState.user = null;
    seed([{ visitId: 'V1', userId: 'U1', checkOutTime: recent }]);
    await retryPendingVisitCompletions();
    expect(mockApi.patch).not.toHaveBeenCalled();
    expect(pending()).toHaveLength(1);
  });
});
