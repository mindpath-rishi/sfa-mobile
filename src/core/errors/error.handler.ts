import axios from 'axios';
import { AppError } from './error.class';
import { AppErrorType } from './error.enums';

const extractBackendMessage = (data: any): string | undefined => {
  if (typeof data === 'string' && data.trim()) return data.trim();

  const candidates = [data?.message, data?.error?.message, data?.data?.message];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    if (Array.isArray(candidate) && candidate.length) {
      return candidate.map(String).join(', ');
    }
  }

  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors
      .map((error: any) => error?.message || error)
      .filter(Boolean)
      .map(String)
      .join(', ');
  }

  return undefined;
};

export const errorHandler = (err: unknown): AppError => {
  let appError: AppError;

  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data: any = err.response?.data;

    let message = extractBackendMessage(data) || err.message || 'Something went wrong';

    // ✅ Normalize known errors
    if (message.includes('totalShops')) {
      message = 'Total Shops must be a valid number';
    }

    if (err.code === 'ECONNABORTED') {
      appError = new AppError({
        message: 'Request timeout. Please try again.',
        code: AppErrorType.NETWORK,
        status,
        data,
      });
    } else if (!status) {
      appError = new AppError({
        message: 'Network error. Check your internet connection.',
        code: AppErrorType.NETWORK,
        data,
      });
    } else if (status === 401 || status === 403) {
      appError = new AppError({
        message: extractBackendMessage(data) || 'Unauthorized. Please login again.',
        code: AppErrorType.UNAUTHORIZED,
        status,
        data,
      });
    } else if (status === 404) {
      appError = new AppError({
        message: extractBackendMessage(data) || 'Resource not found.',
        code: AppErrorType.NOT_FOUND,
        status,
        data,
      });
    } else if (status >= 500) {
      appError = new AppError({
        message: extractBackendMessage(data) || 'Server error. Please try later.',
        code: AppErrorType.SERVER,
        status,
        data,
      });
    } else {
      appError = new AppError({
        message,
        code: AppErrorType.UNKNOWN,
        status,
        data,
      });
    }
  } else if (err instanceof Error) {
    appError = new AppError({
      message: err.message,
      code: AppErrorType.UNKNOWN,
    });
  } else {
    appError = new AppError({
      message: 'Unknown error',
      code: AppErrorType.UNKNOWN,
    });
  }

  return appError;
};
