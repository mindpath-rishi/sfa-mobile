export type LocationFixForNoiseFilter = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  speed?: number | null;
};

const MIN_STATIONARY_DISTANCE_METERS = 5;
const MAX_STATIONARY_DISTANCE_METERS = 25;
/** Largest jump that can still be written off as GPS drift. */
const MAX_DRIFT_DISTANCE_METERS = 200;
/** Above this reported speed (about 5 km/h) the device is really moving. */
const MOVING_SPEED_METERS_PER_SECOND = 1.4;

/**
 * A jump that stays inside the fixes' own accuracy radius while the device
 * reports no real speed is GPS drift (Wi-Fi/cell fixes, indoors), not movement.
 * Without this, a phone lying still can jump 100 m+ between fixes.
 */
const isAccuracyDrift = (
  previous: LocationFixForNoiseFilter,
  current: LocationFixForNoiseFilter,
  distanceMeters: number,
) => {
  if (distanceMeters > MAX_DRIFT_DISTANCE_METERS) return false;
  if (current.speed != null && current.speed > MOVING_SPEED_METERS_PER_SECOND) return false;

  const uncertainty = Math.max(previous.accuracy ?? 0, current.accuracy ?? 0);
  return distanceMeters <= uncertainty;
};

export const stabilizeStationaryFix = <T extends LocationFixForNoiseFilter>(
  previous: T | null,
  current: T,
  distanceMeters: number,
) => {
  if (!previous) {
    return { location: { ...current, speed: 0 }, stationary: false };
  }

  const accuracies = [previous.accuracy, current.accuracy].filter(
    (accuracy): accuracy is number => accuracy != null && Number.isFinite(accuracy) && accuracy > 0,
  );
  const accuracyThreshold = accuracies.length
    ? Math.max(...accuracies)
    : MIN_STATIONARY_DISTANCE_METERS;
  const threshold = Math.max(
    MIN_STATIONARY_DISTANCE_METERS,
    Math.min(MAX_STATIONARY_DISTANCE_METERS, accuracyThreshold),
  );

  if (distanceMeters > threshold && !isAccuracyDrift(previous, current, distanceMeters)) {
    return { location: current, stationary: false };
  }

  return {
    location: {
      ...current,
      latitude: previous.latitude,
      longitude: previous.longitude,
      speed: 0,
    },
    stationary: true,
  };
};
