import { RouteValue } from './navigation.types';

export const routes = {
  auth: {
    login: '/(auth)/login',
    forgot: '/(auth)/forgot',
  },
  tabs: {
    home: '/(drawer)/(tabs)/home',
    dailySummary: '/(drawer)/(tabs)/daily-summary',
    dailySummaryUsers: '/(drawer)/(tabs)/daily-summary/users',
    dailySummaryTimeline: '/(drawer)/(tabs)/daily-summary/[userId]',
    dailySummaryOrder: '/(drawer)/(tabs)/daily-summary/[userId]/order/[activityId]',
    settings: '/(drawer)/(tabs)/settings',
  },
  app: {
    profile: '/profile',
  },
} as const;

export type AppRoute = RouteValue<typeof routes>;
