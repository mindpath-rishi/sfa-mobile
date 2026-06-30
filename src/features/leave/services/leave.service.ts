import { api } from '@/core/network';
import type { ApiResponse } from '@/core/network/api.types';
import type { ApplyLeavePayload } from '../types/leave.types';
import { isSalesman } from '@/core/navigation/role.utils';
import { isOfflineMode } from '@/core/offline/offline.store';
import { useAuthStore } from '@/core/store/auth.store';
import { repositories } from '@/repositories';

export interface LeaveService {
  applyLeave(payload: ApplyLeavePayload): Promise<ApiResponse<any>>;
}

export const leaveService: LeaveService = {
  applyLeave: async (payload) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.post<any, ApplyLeavePayload>('/leave', payload) as Promise<ApiResponse<any>>;
    }
    const record = await repositories.leaves.create(user?.userId ?? '', {
      ...payload,
      userId: user?.userId,
      userName: user?.name,
      status: 'COMPLETED',
    });
    return {
      success: true,
      statusCode: 202,
      message: 'Leave saved locally',
      data: { ...record, leaveId: record.uuid },
      offline: true,
    } as ApiResponse<any>;
  },
};
