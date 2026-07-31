export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiHeaders = Record<string, string>;

export type ApiRequestConfig = {
  headers?: ApiHeaders;
  params?: Record<string, any>;
  showLoader?: boolean; // ✅ NEW: control loader visibility per request
  /** Disable the device API cache for transient/action-oriented requests. */
  cache?: boolean;
  /** Optional per-request timeout override in milliseconds. */
  timeoutMs?: number;
  /** Abort a delayed request if another user signs in before it is sent. */
  expectedUserId?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  statusCode: number;
  meta?: { total: number; page: number; limit: number };
  /** True when the response was restored from the salesman's device cache. */
  offline?: boolean;
};
