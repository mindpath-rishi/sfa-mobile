import type { CapturedLocation } from '@/shared/services/location.service';

export type DayStartPayload = {
  activityName: string;
  routeId?: string;
  description?: string;
  totalShops?: number;
  routeName?: string;
  customerCategoryId?: string;
  vanId?: string;
  vanChangeReason?: string;
  vanChangeNote?: string;
  requestedVanId?: string;
  requestedVanName?: string;
  dayStartImageMediaId?: string;
  dayStartImageUrl?: string;
  dayStartLocation?: CapturedLocation;
};

export type DayStartResponse = {
  data: any;
  routeId?: string;
  description?: string;
};

export type CreateActivityPayload = {
  name: string;
  routeId?: string;
  description?: string;
  totalShops?: number;
  workSessionId?: string;
  routeName?: string;
  customerCategoryId?: string;
  vanId?: string;
  vanName?: string;
  startLocation?: CapturedLocation;
};
