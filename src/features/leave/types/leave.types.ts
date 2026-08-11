export type LeaveType = 'WEEK_OFF' | 'HOLIDAY';

export type ApplyLeavePayload = {
  type: LeaveType;
  userId?: string;
  userName?: string;
};
