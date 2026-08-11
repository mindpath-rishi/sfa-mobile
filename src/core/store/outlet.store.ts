import { create } from 'zustand';
import { Outlet } from '@/features/outlet/types/outlet.types';
import { registerStoreReset } from './reset.store';

/* ================= TYPES ================= */

type VisitStatus = 'IDLE' | 'ACTIVE' | 'COMPLETED';

type ActiveVisit = {
  visitId: string;
  outlet: Outlet;
  checkInTime: Date;
  checkOutTime?: Date;
  status: VisitStatus;
  routeSessionId: string;
  customerId: string;
  visitType?: 'ON_SITE' | 'OFF_SITE';
};

export type ActiveInteraction = {
  interactionId: string;
  customerId: string;
  arrivalTime: string;
  visitType: 'ON_SITE' | 'OFF_SITE';
  distanceMeters: number;
  status: 'ARRIVED' | 'CONVERTED' | 'ABANDONED';
};

type OutletStore = {
  selectedOutlet: Outlet | null;
  activeVisit: ActiveVisit | null;
  activeInteraction: ActiveInteraction | null;

  /* ================= OUTLET ================= */
  setSelectedOutlet: (outlet: Outlet | null) => void;
  clearSelectedOutlet: () => void;

  /* ================= VISIT ================= */
  setActiveVisit: (visit: ActiveVisit | null) => void;
  updateVisitStatus: (status: VisitStatus, checkOutTime?: Date) => void;
  clearActiveVisit: () => void;
  clearVisit: () => void;
  setActiveInteraction: (interaction: ActiveInteraction | null) => void;

  reset: () => void; // ✅ added
};

/* ================= INITIAL STATE ================= */

const initialState = {
  selectedOutlet: null,
  activeVisit: null,
  activeInteraction: null,
};

/* ================= STORE ================= */

export const useOutletStore = create<OutletStore>((set) => {
  // 🔥 AUTO REGISTER RESET
  registerStoreReset('outlet', () => {
    set(initialState);
  });

  return {
    ...initialState,

    /* ================= RESET ================= */
    reset: () => {
      set(initialState);
    },

    /* ================= OUTLET ================= */

    setSelectedOutlet: (outlet) => {
      set({ selectedOutlet: outlet });
    },

    clearSelectedOutlet: () => {
      set({ selectedOutlet: null });
    },

    /* ================= VISIT ================= */

    setActiveVisit: (visit) => {
      set({
        activeVisit: visit,
        selectedOutlet: visit?.outlet || null,
      });
    },

    updateVisitStatus: (status, checkOutTime) => {
      set((state) => {
        if (!state.activeVisit) return state;

        return {
          activeVisit: {
            ...state.activeVisit,
            status,
            ...(checkOutTime && { checkOutTime }),
          },
        };
      });
    },

    clearActiveVisit: () => {
      set({ activeVisit: null });
    },

    clearVisit: () => {
      set({
        activeVisit: null,
        selectedOutlet: null,
      });
    },
    setActiveInteraction: (activeInteraction) => set({ activeInteraction }),
  };
});
