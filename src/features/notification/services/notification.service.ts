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

  approveVanChange: (workSessionId: string) =>
    api.patch<any>(`/work-session/van-change/${workSessionId}/approve`, {}) as Promise<
      ApiResponse<any>
    >,

  rejectVanChange: (workSessionId: string) =>
    api.patch<any>(`/work-session/van-change/${workSessionId}/reject`, {}) as Promise<
      ApiResponse<any>
    >,
};
