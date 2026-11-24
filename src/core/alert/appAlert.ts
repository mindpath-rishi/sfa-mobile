import type { AlertButton } from 'react-native';
import { create } from 'zustand';

/*
 * Drop-in replacement for Alert.alert that renders the app's ConfirmationModal
 * (see AppAlertHost) instead of the native system dialog, so every prompt in the
 * app looks the same. Same signature: appAlert(title, message?, buttons?).
 */
export type AppAlertRequest = {
  id: number;
  title: string;
  message?: string;
  buttons: AlertButton[];
};

type AppAlertState = {
  queue: AppAlertRequest[];
  push: (request: AppAlertRequest) => void;
  shift: () => void;
};

let nextId = 1;

export const useAppAlertStore = create<AppAlertState>((set) => ({
  queue: [],
  push: (request) => set((state) => ({ queue: [...state.queue, request] })),
  shift: () => set((state) => ({ queue: state.queue.slice(1) })),
}));

export const appAlert = (title: string, message?: string, buttons?: AlertButton[]) => {
  useAppAlertStore.getState().push({
    id: nextId++,
    title,
    message,
    buttons: buttons?.length ? buttons : [{ text: 'OK' }],
  });
};
