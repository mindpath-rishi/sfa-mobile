import { create } from 'zustand';
import { registerStoreReset } from './reset.store';

/* ======================================================
 * TYPES
 * ====================================================== */

export type Van = {
  vanId: string;
  name?: string;
  vanName?: string;
  vanNumber?: string;
};

export type Route = {
  routeId: string;
  name?: string;
  routeSessionId: string;
  workSessionId: string;
  totalShops: number;
  distance: string;
  vanId?: string;
  routeName?: string;
  routeCode?: string;
  marketId?: unknown;
  provinceId?: unknown;
  countryId?: unknown;
  market?: unknown;
  province?: unknown;
  country?: unknown;
  customerCategoryId?: string;
  customerCategory?: {
    id?: string;
    _id?: string;
    categoryId?: string;
    customerCategoryId?: string;
  };
  route?: {
    marketId?: unknown;
    provinceId?: unknown;
    countryId?: unknown;
    market?: unknown;
    province?: unknown;
    country?: unknown;
    customerCategoryId?: string;
    customerCategory?: {
      id?: string;
      _id?: string;
      categoryId?: string;
      customerCategoryId?: string;
    };
  };
};

const resolveEntityId = (value: unknown, idKeys: string[]): string | undefined => {
  if (typeof value === 'string' || typeof value === 'number') {
    const id = String(value).trim();
    return id || undefined;
  }
  if (!value || typeof value !== 'object') return undefined;

  const entity = value as Record<string, unknown>;
  for (const key of [...idKeys, 'id', '_id', 'value']) {
    const candidate = entity[key];
    if (typeof candidate === 'string' || typeof candidate === 'number') {
      const id = String(candidate).trim();
      if (id) return id;
    }
  }
  return undefined;
};

const resolveRelatedId = (value: unknown, key: string): string | undefined => {
  if (!value || typeof value !== 'object') return undefined;
  const candidate = (value as Record<string, unknown>)[key];
  return resolveEntityId(candidate, [key]);
};

export const getRouteLocationIds = (route?: Partial<Route> | null) => {
  const nestedRoute = route?.route;
  return {
    marketId:
      resolveEntityId(route?.marketId, ['marketId']) ||
      resolveEntityId(route?.market, ['marketId']) ||
      resolveEntityId(nestedRoute?.marketId, ['marketId']) ||
      resolveEntityId(nestedRoute?.market, ['marketId']),
    provinceId:
      resolveEntityId(route?.provinceId, ['provinceId']) ||
      resolveEntityId(route?.province, ['provinceId']) ||
      resolveRelatedId(route?.market, 'provinceId') ||
      resolveEntityId(nestedRoute?.provinceId, ['provinceId']) ||
      resolveEntityId(nestedRoute?.province, ['provinceId']) ||
      resolveRelatedId(nestedRoute?.market, 'provinceId'),
    countryId:
      resolveEntityId(route?.countryId, ['countryId']) ||
      resolveEntityId(route?.country, ['countryId']) ||
      resolveRelatedId(route?.province, 'countryId') ||
      resolveRelatedId(route?.market, 'countryId') ||
      resolveEntityId(nestedRoute?.countryId, ['countryId']) ||
      resolveEntityId(nestedRoute?.country, ['countryId']) ||
      resolveRelatedId(nestedRoute?.province, 'countryId') ||
      resolveRelatedId(nestedRoute?.market, 'countryId'),
  };
};

export const getRouteCustomerCategoryId = (route?: Partial<Route> | null): string | undefined => {
  if (!route) return undefined;

  const customerCategory = route.customerCategory;
  const nestedRoute = route.route;
  const nestedRouteCustomerCategory = nestedRoute?.customerCategory;

  return (
    route.customerCategoryId ||
    customerCategory?.customerCategoryId ||
    customerCategory?.categoryId ||
    customerCategory?.id ||
    customerCategory?._id ||
    nestedRoute?.customerCategoryId ||
    nestedRouteCustomerCategory?.customerCategoryId ||
    nestedRouteCustomerCategory?.categoryId ||
    nestedRouteCustomerCategory?.id ||
    nestedRouteCustomerCategory?._id
  );
};

type RouteStore = {
  van: Van | null;
  selectedRoute: Route | null;

  /* ================= VAN ================= */
  setVan: (van: Van | null) => void;

  /* ================= ROUTE ================= */
  setSelectedRoute: (route: Route | null) => void;

  /* ================= RESET ================= */
  reset: () => void; // ✅ global reset support
  resetRouteStore: () => void; // ✅ manual reset (existing)
};

/* ======================================================
 * INITIAL STATE
 * ====================================================== */

const initialState = {
  van: null,
  selectedRoute: null,
};

/* ======================================================
 * STORE
 * ====================================================== */

export const useRouteStore = create<RouteStore>((set, get) => {
  // 🔥 AUTO REGISTER FOR GLOBAL RESET
  registerStoreReset('route', () => {
    set(initialState);
  });

  return {
    ...initialState,

    /* ================= RESET ================= */

    reset: () => {
      set(initialState);
    },

    resetRouteStore: () => {
      set(initialState);
    },

    /* ================= VAN ================= */

    setVan: (van) => {
      set({ van });
    },

    /* ================= ROUTE ================= */

    setSelectedRoute: (route) => {
      const currentRoute = get().selectedRoute;
      const isSameRoute = Boolean(
        route?.routeId && currentRoute?.routeId && route.routeId === currentRoute.routeId,
      );
      const mergedRoute = route
        ? ({ ...(isSameRoute ? currentRoute : {}), ...route } as Route)
        : null;
      const locationIds = getRouteLocationIds(mergedRoute);
      set({
        selectedRoute: mergedRoute
          ? {
              ...mergedRoute,
              ...locationIds,
              customerCategoryId:
                getRouteCustomerCategoryId(mergedRoute) || currentRoute?.customerCategoryId,
            }
          : null,
      });
    },
  };
});
