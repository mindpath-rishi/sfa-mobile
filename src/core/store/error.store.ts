import { create } from 'zustand';
import { AppErrorType } from '../errors/error.enums';

interface GlobalErrorState {
  type: AppErrorType | null;
  message?: string;

  setError: (type: AppErrorType, message?: string) => void;
  clear: () => void;
}

export const useGlobalErrorStore = create<GlobalErrorState>((set) => ({
  type: null,
  message: undefined,

  setError: (type, message) =>
    set({
      type,
      message,
    }),

  clear: () =>
    set({
      type: null,
      message: undefined,
    }),
}));
