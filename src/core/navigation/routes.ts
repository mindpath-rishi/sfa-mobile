import { RouteValue } from './navigation.types';

export const routes = {
  auth: {
    login: '/(auth)/login',
    forgot: '/(auth)/forgot',
  },
  tabs: {
    home: '/(tabs)/home',
    settings: '/(tabs)/settings',
  },
  app: {
    profile: '/profile',
  },
} as const;

export type AppRoute = RouteValue<typeof routes>;
