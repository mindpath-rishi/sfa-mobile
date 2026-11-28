const mockApi = { post: jest.fn(), get: jest.fn(), patch: jest.fn() };
const mockCapture = jest.fn();
const mockSync = {
  getPendingCount: jest.fn(),
  uploadPendingBeforeSettlement: jest.fn(),
  sync: jest.fn(async () => undefined),
};
const mockCalls: string[] = [];

jest.mock('@/core/network', () => ({
  get api() {
    return mockApi;
  },
}));
jest.mock('@/core/network/upload', () => ({ uploadFormData: jest.fn() }));
jest.mock('@/shared/services/location.service', () => ({
  captureDayEndLocation: () => mockCapture(),
  stopSalesmanBackgroundLocation: jest.fn(),
}));
jest.mock('@/core/navigation/role.utils', () => ({ isSalesman: () => true }));
jest.mock('@/shared/services/product.service', () => ({
  loadCachedProducts: jest.fn(async () => []),
  loadCachedCategories: jest.fn(async () => []),
}));
jest.mock('@/core/store/auth.store', () => ({
  useAuthStore: { getState: () => ({ user: { userId: 'U1' }, workSessionId: 'WS1' }) },
}));
jest.mock('@/core/offline/offline.store', () => ({
  isOfflineMode: () => false,
  useOfflineStore: { getState: () => ({}) },
}));
jest.mock('@/repositories', () => ({ repositories: {} }));
jest.mock('@/sync/sync.service', () => ({
  get syncService() {
    return mockSync;
  },
}));
jest.mock('@/core/loader/loader.store', () => ({
  useLoaderStore: { getState: () => ({ show: jest.fn(), hide: jest.fn() }) },
}));

import { homeService } from '@/features/home/services/home.service';

const location = { latitude: -15.4, longitude: 28.3, accuracy: 400, capturedAt: 'x' };

beforeEach(() => {
  mockCalls.length = 0;
  mockApi.post.mockReset().mockResolvedValue({ success: true, statusCode: 200 });
  mockSync.getPendingCount.mockReset().mockResolvedValue(0);
  mockSync.uploadPendingBeforeSettlement.mockReset();
  mockCapture.mockReset();
});

describe('homeService.dayComplete (van settlement / stock-count paths)', () => {
  it('sends the captured day-end location with the request', async () => {
    mockCapture.mockResolvedValue(location);
    await homeService.dayComplete(true);
    expect(mockApi.post).toHaveBeenCalledWith(
      '/work-session/complete',
      { carryForwardStock: true, dayEndLocation: location },
      undefined,
    );
  });

  it('never blocks: completes the day without a location when none is available', async () => {
    mockCapture.mockResolvedValue(undefined);
    const res = await homeService.dayComplete(false);
    expect(res.success).toBe(true);
    expect(mockApi.post).toHaveBeenCalledWith(
      '/work-session/complete',
      { carryForwardStock: false, dayEndLocation: undefined },
      undefined,
    );
  });

  it('starts GPS before uploading pending entries, so both run together', async () => {
    mockSync.getPendingCount.mockResolvedValue(3);
    mockCapture.mockImplementation(async () => {
      mockCalls.push('gps-start');
      return location;
    });
    mockSync.uploadPendingBeforeSettlement.mockImplementation(async () => {
      mockCalls.push('upload');
    });

    await homeService.dayComplete(true);
    expect(mockCalls).toEqual(['gps-start', 'upload']);
  });

  it('uses a location the caller already captured instead of capturing again', async () => {
    await homeService.dayComplete({ carryForwardStock: true, dayEndLocation: location });
    expect(mockCapture).not.toHaveBeenCalled();
    expect(mockApi.post.mock.calls[0][1]).toEqual({
      carryForwardStock: true,
      dayEndLocation: location,
    });
  });
});
