type StoreKey = 'cart' | 'outlet' | 'route' | 'auth' | 'other';

const storeResetMap: Record<string, () => void> = {};

/**
 * 🔥 Register store with key
 */
export const registerStoreReset = (key: StoreKey, fn: () => void) => {
  storeResetMap[key] = fn;
};

/**
 * 🔥 Reset all stores
 */
export const resetAllStores = () => {
  Object.values(storeResetMap).forEach((fn) => fn());
};

/**
 * 🔥 Reset specific store
 */
export const resetStore = (key: StoreKey) => {
  storeResetMap[key]?.();
};

/**
 * 🔥 Reset only outlet related state
 */
export const resetOutletStore = () => {
  storeResetMap['outlet']?.();
};

/**
 * 🔥 Reset only route related state
 */
export const resetRouteStore = () => {
  storeResetMap['route']?.();
};