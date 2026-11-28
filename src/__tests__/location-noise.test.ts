import { stabilizeStationaryFix } from '@/shared/utils/location-noise.utils';

describe('stationary location stabilization', () => {
  it('resets speed on the first fix because movement cannot yet be established', () => {
    const first = {
      latitude: 10,
      longitude: 20,
      accuracy: 6,
      speed: 1.4,
    };

    expect(stabilizeStationaryFix(null, first, 0).location.speed).toBe(0);
  });

  it('holds the previous coordinates and zeros speed for movement inside the accuracy deadband', () => {
    const previous = { latitude: 10, longitude: 20, accuracy: 8, speed: 0 };
    const current = { latitude: 10.00005, longitude: 20.00005, accuracy: 10, speed: 6.4 };

    const result = stabilizeStationaryFix(previous, current, 10);

    expect(result.stationary).toBe(true);
    expect(result.location).toMatchObject({
      latitude: previous.latitude,
      longitude: previous.longitude,
      speed: 0,
    });
  });

  it('accepts movement beyond the accuracy deadband', () => {
    const previous = { latitude: 10, longitude: 20, accuracy: 8, speed: 0 };
    const current = { latitude: 10.0001, longitude: 20.0001, accuracy: 10, speed: 1.8 };

    const result = stabilizeStationaryFix(previous, current, 10.1);

    expect(result.stationary).toBe(false);
    expect(result.location).toBe(current);
  });

  it('holds position when a low-accuracy fix drifts 100 m+ while not moving', () => {
    const previous = { latitude: 10, longitude: 20, accuracy: 12, speed: 0 };
    const current = { latitude: 10.001, longitude: 20, accuracy: 140, speed: 0 };

    const result = stabilizeStationaryFix(previous, current, 111);

    expect(result.stationary).toBe(true);
    expect(result.location).toMatchObject({ latitude: 10, longitude: 20, speed: 0 });
  });

  it('accepts a jump inside the accuracy radius when the device reports real speed', () => {
    const previous = { latitude: 10, longitude: 20, accuracy: 12, speed: 0 };
    const current = { latitude: 10.001, longitude: 20, accuracy: 140, speed: 8 };

    expect(stabilizeStationaryFix(previous, current, 111).stationary).toBe(false);
  });

  it('accepts a jump larger than the accuracy radius', () => {
    const previous = { latitude: 10, longitude: 20, accuracy: 12, speed: 0 };
    const current = { latitude: 10.0015, longitude: 20, accuracy: 60, speed: 0 };

    expect(stabilizeStationaryFix(previous, current, 166).stationary).toBe(false);
  });
});
