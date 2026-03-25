import { AppErrorType } from './error.enums';

interface AppErrorParams {
  message: string;
  code?: AppErrorType;
  status?: number;
  data?: unknown;
}

export class AppError extends Error {
  public readonly code: AppErrorType;
  public readonly status?: number;
  public readonly data?: unknown;

  constructor({ message, code, status, data }: AppErrorParams) {
    super(message);

    this.name = 'AppError';
    this.code = code ?? AppErrorType.UNKNOWN;
    this.status = status;
    this.data = data;

    // Fix prototype chain (important in TS when extending Error)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
