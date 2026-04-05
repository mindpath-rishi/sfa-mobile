import { create } from 'zustand';
import { Outlet } from '@/features/outlet/types/outlet.types';

type VisitStatus = 'IDLE' | 'ACTIVE' | 'COMPLETED';

type ActiveVisit = {
  visitId: string;
  outlet: Outlet;
  checkInTime: Date;
  checkOutTime?: Date;
  status: VisitStatus;
  routeSessionId: string;
};

type OutletStore = {
  selectedOutlet: Outlet | null;
  activeVisit: ActiveVisit | null;

  /* ================= OUTLET ================= */
  setSelectedOutlet: (outlet: Outlet | null) => void;
  clearSelectedOutlet: () => void;

  /* ================= VISIT ================= */

  setActiveVisit: (visit: ActiveVisit | null) => void;
  updateVisitStatus: (status: VisitStatus, checkOutTime?: Date) => void;
  clearVisit: () => void;
};

export const useOutletStore = create<OutletStore>((set) => ({
  selectedOutlet: null,
  activeVisit: null,

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

  clearVisit: () => {
    set({
      activeVisit: null,
      selectedOutlet: null,
    });
  },
}));
