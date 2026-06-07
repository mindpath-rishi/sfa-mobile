import { api } from '@/core/network';
import type { ApiResponse } from '@/core/network/api.types';
import type { ApplyLeavePayload } from '../types/leave.types';

export interface LeaveService {
  applyLeave(payload: ApplyLeavePayload): Promise<ApiResponse<any>>;
}

export const leaveService: LeaveService = {
  applyLeave: (payload) =>
    api.post<any, ApplyLeavePayload>('/leave', payload) as Promise<ApiResponse<any>>,
};
