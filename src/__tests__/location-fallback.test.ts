const mockLoc = {
  requestForegroundPermissionsAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
};

jest.mock('expo-location', () => ({
  Accuracy: { Lowest: 1, Low: 2, Balanced: 3, High: 4, Highest: 5, BestForNavigation: 6 },
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied' },
  requestForegroundPermissionsAsync: (...a: unknown[]) =>
    mockLoc.requestForegroundPermissionsAsync(...a),
  getForegroundPermissionsAsync: (...a: unknown[]) => mockLoc.getForegroundPermissionsAsync(...a),
  hasServicesEnabledAsync: (...a: unknown[]) => mockLoc.hasServicesEnabledAsync(...a),
  getCurrentPositionAsync: (...a: unknown[]) => mockLoc.getCurrentPositionAsync(...a),
  getLastKnownPositionAsync: (...a: unknown[]) => mockLoc.getLastKnownPositionAsync(...a),
}));
jest.mock('socket.io-client', () => ({ io: jest.fn() }));
jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskDefined: jest.fn(() => false),
  isTaskRegisteredAsync: jest.fn(async () => false),
}));
jest.mock('expo-intent-launcher', () => ({ startActivityAsync: jest.fn() }));
jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(),
  addNetworkStateListener: jest.fn(),
}));
jest.mock('expo-application', () => ({ applicationId: 'com.salesstream.app' }));
jest.mock('@/core/store/auth.store', () => ({
  useAuthStore: { getState: () => ({ user: null, accessToken: null }), subscribe: jest.fn() },
}));
jest.mock('@/core/offline/offline.store', () => ({
  useOfflineStore: { getState: () => ({}) },
  isOfflineMode: () => false,
}));
jest.mock('@/repositories', () => ({ repositories: {} }));
jest.mock('@/shared/services/tokenStorage', () => ({ getAccessToken: async () => null }));

import {
  captureBestEffortLocation,
  captureDayEndLocation,
  prefetchDayEndLocation,
} from '@/shared/services/location.service';

const fix = (accuracy: number, ageMs = 0, lat = -15.4) => ({
  coords: { latitude: lat, longitude: 28.3, accuracy, altitude: null, speed: null, heading: null },
  timestamp: Date.now() - ageMs,
});
const BEST = 6;
const BALANCED = 3;

beforeEach(() => {
  Object.values(mockLoc).forEach((fn) => fn.mockReset());
  mockLoc.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
  mockLoc.getForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
  mockLoc.hasServicesEnabledAsync.mockResolvedValue(true);
  mockLoc.getLastKnownPositionAsync.mockResolvedValue(null);
});

describe('captureBestEffortLocation (day start / day end / visit check-out)', () => {
  it('returns a precise fix when one is available', async () => {
    mockLoc.getCurrentPositionAsync.mockResolvedValue(fix(8));
    const result = await captureBestEffortLocation();
    expect(result?.accuracy).toBe(8);
    expect(mockLoc.getCurrentPositionAsync).toHaveBeenCalledTimes(1);
  });

  it('falls back to an approximate (network) fix when precise GPS is too inaccurate', async () => {
    mockLoc.getCurrentPositionAsync.mockImplementation(async ({ accuracy }: any) =>
      accuracy === BEST ? fix(450) : fix(600, 0, -15.41),
    );
    const result = await captureBestEffortLocation();
    expect(result).toMatchObject({ latitude: -15.41, accuracy: 600 });
    expect(mockLoc.getCurrentPositionAsync).toHaveBeenLastCalledWith(
      expect.objectContaining({ accuracy: BALANCED }),
    );
  });

  it('uses the last known position (any age) when no fresh fix can be obtained', async () => {
    mockLoc.getCurrentPositionAsync.mockRejectedValue(new Error('timeout'));
    mockLoc.getLastKnownPositionAsync.mockImplementation(async (options?: any) =>
      options?.requiredAccuracy ? null : fix(1200, 60 * 60_000, -15.5),
    );
    const result = await captureBestEffortLocation();
    expect(result).toMatchObject({ latitude: -15.5, accuracy: 1200 });
  });

  it('resolves undefined (never throws) when location is unavailable or denied', async () => {
    mockLoc.getCurrentPositionAsync.mockRejectedValue(new Error('timeout'));
    await expect(captureBestEffortLocation()).resolves.toBeUndefined();

    mockLoc.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
    mockLoc.getForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
    await expect(captureBestEffortLocation()).resolves.toBeUndefined();
  });
});

describe('day-end prefetch', () => {
  it('reuses the location fetched when the summary opened (no second GPS request)', async () => {
    mockLoc.getCurrentPositionAsync.mockResolvedValue(fix(9, 0, -15.6));
    prefetchDayEndLocation();
    const result = await captureDayEndLocation();

    expect(result?.latitude).toBe(-15.6);
    expect(mockLoc.getCurrentPositionAsync).toHaveBeenCalledTimes(1);
  });

  it('captures on demand when nothing was prefetched', async () => {
    mockLoc.getCurrentPositionAsync.mockResolvedValue(fix(7, 0, -15.7));
    const result = await captureDayEndLocation();
    expect(result?.latitude).toBe(-15.7);
  });
});
