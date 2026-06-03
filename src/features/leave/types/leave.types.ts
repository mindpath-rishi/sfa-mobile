export type LeaveType = 'WEEK_OFF' | 'HOLIDAY';

export type ApplyLeavePayload = {
  leaveType: LeaveType;
  date: string; // YYYY-MM-DD
  userId?: string;
  note?: string;
};

