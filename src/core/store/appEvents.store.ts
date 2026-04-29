import { create } from 'zustand';

type AppEventsState = {
  dashboardRefreshTick: number;
  bumpDashboardRefresh: () => void;
};

export const useAppEventsStore = create<AppEventsState>((set) => ({
  dashboardRefreshTick: 0,
  bumpDashboardRefresh: () =>
    set((s) => ({ dashboardRefreshTick: s.dashboardRefreshTick + 1 })),
}));

