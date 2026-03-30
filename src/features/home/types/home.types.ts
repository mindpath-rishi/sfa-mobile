export type DayStartPayload = {
  activityName: string;
  routeId?: string;
  description?: string;
  totalShops?: number;
  routeName?: string;
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
};
