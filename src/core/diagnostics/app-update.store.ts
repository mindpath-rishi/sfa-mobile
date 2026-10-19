import { create } from 'zustand';

type UpdateInfo = {
  /** This version may no longer use the app (server answered 426). */
  updateRequired: boolean;
  /** A newer version exists; the app keeps working. */
  updateAvailable: boolean;
  minAppVersion?: string | null;
  latestAppVersion?: string | null;
  message?: string | null;
  storeUrl?: string | null;
};

type AppUpdateState = UpdateInfo & {
  setFromServer: (info: Partial<UpdateInfo>) => void;
  dismissAvailable: () => void;
};

export const useAppUpdateStore = create<AppUpdateState>((set) => ({
  updateRequired: false,
  updateAvailable: false,
  setFromServer: (info) =>
    set((current) => ({
      ...current,
      ...info,
      updateRequired: info.updateRequired ?? current.updateRequired,
      updateAvailable: info.updateAvailable ?? current.updateAvailable,
    })),
  dismissAvailable: () => set({ updateAvailable: false }),
}));
