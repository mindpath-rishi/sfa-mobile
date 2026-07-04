import { api } from '@/core/network';
import type { ApiResponse } from '@/core/network/api.types';

export type NotificationItem = {
  _id?: string;
  id?: string;
  title: string;
  body?: string;
  message?: string;
  category?: string;
  platform?: string;
  data?: Record<string, unknown>;
  isRead?: boolean;
  createdAt?: string;
  sentAt?: string;
};

export type NotificationQuery = {
  page?: number;
  limit?: number;
  isRead?: boolean;
};

export const notificationService = {
  getNotifications: (params?: NotificationQuery) =>
    api.get<NotificationItem[]>('/notification', {
      params: { page: 1, limit: 30, ...(params || {}) },
      showLoader: false,
    }) as Promise<ApiResponse<NotificationItem[]>>,

  markAsRead: (notificationId: string) =>
    api.patch<null>(`/notification/${notificationId}/read`, undefined, {
      showLoader: false,
    }) as Promise<ApiResponse<null>>,

  approveVanChange: (vanChangeRequestId: string) =>
    api.patch<any>(`/van-change-request/${vanChangeRequestId}/approve`, {}) as Promise<
      ApiResponse<any>
    >,

  rejectVanChange: (vanChangeRequestId: string) =>
    api.patch<any>(`/van-change-request/${vanChangeRequestId}/reject`, {}) as Promise<
      ApiResponse<any>
    >,

  acceptTopup: (topupId: string) =>
    api.patch<any>(`/van-inventory-topup/${topupId}/accept`, {}) as Promise<ApiResponse<any>>,

  rejectTopup: (topupId: string, payload: any = {}) =>
    api.patch<any>(`/van-inventory-topup/${topupId}/reject`, payload) as Promise<ApiResponse<any>>,

  approveOutlet: (customerId: string, outletVerificationId?: string) =>
    api.patch<any>(
      outletVerificationId
        ? `/outlet-verification/${outletVerificationId}/approve`
        : `/customer/${customerId}/approve`,
      {},
    ) as Promise<ApiResponse<any>>,

  rejectOutlet: (
    customerId: string,
    reason = 'Rejected by reporting manager',
    outletVerificationId?: string,
  ) =>
    api.patch<any>(
      outletVerificationId
        ? `/outlet-verification/${outletVerificationId}/reject`
        : `/customer/${customerId}/reject`,
      { reason },
    ) as Promise<ApiResponse<any>>,
};
