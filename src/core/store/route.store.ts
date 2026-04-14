import { create } from 'zustand';

/* ======================================================
 * TYPES
 * ====================================================== */

export type Van = {
  vanId: string;
  name?: string;
  vanName?: string;
};

export type Route = {
  routeId: string;
  name?: string;
  routeSessionId: string;
  workSessionId: string;
  totalShops: number;
  distance: string;
  vanId?: string;
};

type RouteStore = {
  van: Van | null;
  selectedRoute: Route | null;

  /* ================= VAN ================= */
  setVan: (van: Van | null) => void;

  /* ================= ROUTE ================= */
  setSelectedRoute: (route: Route | null) => void;

  /* ================= RESET ================= */
  resetRouteStore: () => void;
};

/* ======================================================
 * STORE
 * ====================================================== */

export const useRouteStore = create<RouteStore>((set) => ({
  van: null,
  selectedRoute: null,

  /* ================= VAN ================= */

  setVan: (van) => {
    set({ van });
  },

  /* ================= ROUTE ================= */

  setSelectedRoute: (route) => {
    set({ selectedRoute: route });
  },

  /* ================= RESET ================= */

  resetRouteStore: () => {
    set({
      van: null,
      selectedRoute: null,
    });
  },
}));
