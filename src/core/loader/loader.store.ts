import { create } from 'zustand';

export type LoaderType = 'spinner' | 'progress' | 'success' | 'error';

interface LoaderState {
  visible: boolean;
  message?: string;
  progress?: number;
  type: LoaderType;

  show: (options?: { message?: string; type?: LoaderType; progress?: number }) => void;

  hide: () => void;

  setProgress: (progress: number) => void;

  showSuccess: (message?: string) => void;
  showError: (message?: string) => void;
}

export const useLoaderStore = create<LoaderState>((set) => ({
  visible: false,
  message: undefined,
  progress: undefined,
  type: 'spinner',

  show: (options = {}) => {
    set({
      visible: true,
      message: options.message,
      type: options.type || 'spinner',
      progress: options.progress,
    });
  },

  hide: () => {
    set({ visible: false });
  },

  setProgress: (progress: number) => {
    set({ progress });
  },

  showSuccess: (message?: string) => {
    set({
      visible: true,
      type: 'success',
      message,
    });

    // Auto-hide after 1.5 seconds
    setTimeout(() => {
      set({ visible: false });
    }, 1500);
  },

  showError: (message?: string) => {
    set({
      visible: true,
      type: 'error',
      message,
    });

    // Auto-hide after 1.5 seconds
    setTimeout(() => {
      set({ visible: false });
    }, 1500);
  },
}));

/**
 * Stable loader actions for components that only show/hide the loader.
 * Unlike `useLoaderStore()`, it does not re-render the caller whenever the
 * loader opens or closes.
 */
const loaderActions = {
  show: (...args: Parameters<LoaderState['show']>) => useLoaderStore.getState().show(...args),
  hide: () => useLoaderStore.getState().hide(),
  setProgress: (progress: number) => useLoaderStore.getState().setProgress(progress),
  showSuccess: (message?: string) => useLoaderStore.getState().showSuccess(message),
  showError: (message?: string) => useLoaderStore.getState().showError(message),
};

export const useLoaderActions = () => loaderActions;
