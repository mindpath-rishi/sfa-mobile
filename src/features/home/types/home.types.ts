export type DayStartPayload = {
  activityName: string;
  routeId?: string;
  description?: string;
  totalShops?: number;
  routeName?: string;
  vanId?: string;
  vanChangeReason?: string;
  vanChangeNote?: string;
  requestedVanId?: string;
  requestedVanName?: string;
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
  vanId?: string;
  vanName?: string;
};
