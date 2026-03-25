import { AppError } from './error.class';
import { AppErrorType } from './error.enums';

/**
 * Maps AppError to UI AppErrorType
 * (Now direct because AppError already uses AppErrorType)
 */
export const mapErrorToUIType = (error: AppError): AppErrorType => {
  return error.code ?? AppErrorType.UNKNOWN;
};
