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
  marketId?: string;
  provinceId?: string;
  countryId?: string;
  customerCategoryId?: string;
  customerCategory?: {
    id?: string;
    _id?: string;
    categoryId?: string;
    customerCategoryId?: string;
  };
  route?: {
    customerCategoryId?: string;
    customerCategory?: {
      id?: string;
      _id?: string;
      categoryId?: string;
      customerCategoryId?: string;
    };
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

export const useRouteStore = create<RouteStore>((set) => {
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
      set({
        selectedRoute: route
          ? {
              ...route,
              customerCategoryId: getRouteCustomerCategoryId(route),
            }
          : null,
      });
    },
  };
});
