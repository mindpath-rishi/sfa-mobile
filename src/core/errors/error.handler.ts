import axios from 'axios';
import { AppError } from './error.class';
import { AppErrorType } from './error.enums';
import { toast } from '@/shared/utils/toast';

export const errorHandler = (err: unknown): AppError => {
  let appError: AppError;

  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data: any = err.response?.data;

    // ✅ Extract message properly (handles string | array)
    let message: string =
      typeof data?.message === 'string'
        ? data.message
        : Array.isArray(data?.message)
          ? data.message.join(', ')
          : (err.message ?? 'Something went wrong');

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
        message: 'Unauthorized. Please login again.',
        code: AppErrorType.UNAUTHORIZED,
        status,
        data,
      });
    } else if (status === 404) {
      appError = new AppError({
        message: 'Resource not found.',
        code: AppErrorType.NOT_FOUND,
        status,
        data,
      });
    } else if (status >= 500) {
      appError = new AppError({
        message: 'Server error. Please try later.',
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

  // ✅ Single place toast (NO duplicate)
  toast.error('Error', appError.message);

  return appError;
};
