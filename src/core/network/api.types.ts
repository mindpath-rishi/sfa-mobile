export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiHeaders = Record<string, string>;

export type ApiRequestConfig = {
  headers?: ApiHeaders;
  params?: Record<string, any>;
  showLoader?: boolean; // ✅ NEW: control loader visibility per request
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
