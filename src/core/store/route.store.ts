import { create } from 'zustand';
import { registerStoreReset } from './reset.store';
import { storage, StorageKeys } from '@/core/storage';
import { repositories } from '@/repositories';

/* ======================================================
 * TYPES
 * ====================================================== */

export type Van = {
  vanId: string;
  name?: string;
  vanName?: string;
  vanNumber?: string;
  provinceId?: unknown;
  province?: unknown;
  market?: unknown;
  categoryIds?: unknown;
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

export const getVanProvinceId = (van?: Partial<Van> | null): string | undefined =>
  resolveEntityId(van?.provinceId, ['provinceId']) ||
  resolveEntityId(van?.province, ['provinceId']) ||
  resolveRelatedId(van?.market, 'provinceId');

export const getVanCategoryIds = (van?: Partial<Van> | null): string[] => {
  if (!Array.isArray(van?.categoryIds)) return [];

  return [
    ...new Set(
      van.categoryIds
        .map((category) => resolveEntityId(category, ['categoryId']))
        .filter((categoryId): categoryId is string => Boolean(categoryId)),
    ),
  ];
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
  hydrated: boolean;
  hydrate: (ownerId?: string) => Promise<void>;

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
  hydrated: false,
};

/* ======================================================
 * STORE
 * ====================================================== */

export const useRouteStore = create<RouteStore>((set, get) => {
  const mergeDefined = (...sources: (Partial<Route> | null | undefined)[]) => {
    const result: Record<string, unknown> = {};
    for (const source of sources) {
      if (!source) continue;
      for (const [key, value] of Object.entries(source)) {
        if (value !== undefined && value !== null && value !== '') {
          result[key] = value;
        }
      }
    }
    return result as Route;
  };

  const normalizeRoute = (route: Route | null, currentRoute?: Route | null) => {
    if (!route) return null;

    const isSameRoute = Boolean(
      route.routeId && currentRoute?.routeId && route.routeId === currentRoute.routeId,
    );
    const mergedRoute = {
      ...(isSameRoute ? currentRoute : {}),
      ...route,
    } as Route;
    const locationIds = getRouteLocationIds(mergedRoute);

    return {
      ...mergedRoute,
      ...locationIds,
      customerCategoryId:
        getRouteCustomerCategoryId(mergedRoute) || currentRoute?.customerCategoryId,
    };
  };

  const persist = () =>
    storage.setItem(
      StorageKeys.SELECTED_ROUTE,
      JSON.stringify({
        selectedRoute: get().selectedRoute,
        van: get().van,
      }),
    );

  const clearPersistedRoute = () => {
    void storage.removeItem(StorageKeys.SELECTED_ROUTE);
  };

  // 🔥 AUTO REGISTER FOR GLOBAL RESET
  registerStoreReset('route', () => {
    set(initialState);
    clearPersistedRoute();
  });

  return {
    ...initialState,

    hydrate: async (ownerId) => {
      try {
        const value = await storage.getItem(StorageKeys.SELECTED_ROUTE);
        if (!value) {
          set({ hydrated: true });
          return;
        }

        const stored = JSON.parse(value) as {
          selectedRoute?: Route | null;
          van?: Van | null;
        };
        const storedRoute = stored.selectedRoute ?? null;
        const routeMaster =
          ownerId && storedRoute?.routeId
            ? ((
                await repositories.routes.findAll(ownerId, {
                  search: storedRoute.routeId,
                  limit: 200,
                })
              ).find((route) => String(route.routeId ?? '') === String(storedRoute.routeId)) ??
              null)
            : null;
        const selectedRoute = storedRoute
          ? normalizeRoute(mergeDefined(storedRoute, routeMaster as Partial<Route> | null))
          : null;
        set({
          selectedRoute,
          van: stored.van ?? null,
          hydrated: true,
        });
        if (selectedRoute) void persist();
      } catch {
        set({ hydrated: true });
      }
    },

    /* ================= RESET ================= */

    reset: () => {
      set(initialState);
      clearPersistedRoute();
    },

    resetRouteStore: () => {
      set(initialState);
      clearPersistedRoute();
    },

    /* ================= VAN ================= */

    setVan: (van) => {
      set({ van });
      void persist();
    },

    /* ================= ROUTE ================= */

    setSelectedRoute: (route) => {
      const currentRoute = get().selectedRoute;
      set({ selectedRoute: normalizeRoute(route, currentRoute) });
      void persist();
    },
  };
});
