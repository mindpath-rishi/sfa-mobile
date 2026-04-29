// geofence.utils.ts

export type Geofence = {
  id: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
};

export type GeofenceStatus = {
  [key: string]: boolean; // id -> inside/outside
};

/**
 * Calculate distance between two coordinates (meters)
 */
export const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km

  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c * 1000; // meters
};

/**
 * Check if user is inside a geofence
 */
export const isInsideGeofence = (
  userLat: number,
  userLng: number,
  geofence: Geofence
): boolean => {
  const distance = getDistance(
    userLat,
    userLng,
    geofence.latitude,
    geofence.longitude
  );

  return distance <= geofence.radius;
};

/**
 * Check all geofences and return status map
 */
export const checkGeofences = (
  userLat: number,
  userLng: number,
  geofences: Geofence[]
): GeofenceStatus => {
  const result: GeofenceStatus = {};

  geofences.forEach((fence) => {
    result[fence.id] = isInsideGeofence(userLat, userLng, fence);
  });

  return result;
};

/**
 * Detect ENTER / EXIT events
 */
export const detectGeofenceEvents = (
  prevStatus: GeofenceStatus,
  currentStatus: GeofenceStatus
) => {
  const events: {
    id: string;
    type: 'ENTER' | 'EXIT';
  }[] = [];

  Object.keys(currentStatus).forEach((id) => {
    const prev = prevStatus[id];
    const curr = currentStatus[id];

    if (prev === false && curr === true) {
      events.push({ id, type: 'ENTER' });
    }

    if (prev === true && curr === false) {
      events.push({ id, type: 'EXIT' });
    }
  });

  return events;
};