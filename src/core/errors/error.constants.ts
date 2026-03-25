import { AppErrorType } from './error.enums';

export const ERROR_MESSAGES: Record<AppErrorType, { title: string; message: string }> = {
  NETWORK: {
    title: 'Network Error',
    message: 'Please check your internet connection.',
  },
  SERVER: {
    title: 'Server Error',
    message: 'Something went wrong. Try again later.',
  },
  UNAUTHORIZED: {
    title: 'Session Expired',
    message: 'Please login again.',
  },
  NOT_FOUND: {
    title: 'Not Found',
    message: 'Requested resource not found.',
  },
  UNKNOWN: {
    title: 'Something went wrong',
    message: 'Unexpected error occurred.',
  },
};
