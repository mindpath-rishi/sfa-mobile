export type RouteValue<T> =
  T extends Record<string, infer V>
    ? V extends string
      ? V
      : V extends Record<string, any>
        ? RouteValue<V>
        : never
    : never;

// core/navigation/navigation.types.ts

import type { AppRoute } from './routes';

export type GuardFailReason = 'NOT_LOGGED_IN' | 'FORBIDDEN';

export type UserLevel = 'GUEST' | 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export type Role = 'SALES' | 'SUPERVISOR' | 'MANAGER' | 'ADMIN';

export type RbacUser = {
  role: Role;
  permissions: Permission[];
};

export type Permission =
  | 'AUTH_LOGIN'
  | 'AUTH_LOGOUT'
  | 'VIEW_DASHBOARD'
  | 'VIEW_SETTINGS'
  | 'EDIT_SETTINGS'
  | 'MANAGE_USERS';

export type GuardContext = {
  userLevel: UserLevel;
  rbacUser?: RbacUser | null;
};

export type EnsureAccessOptions = {
  loginRoute?: AppRoute;
  forbiddenRoute?: AppRoute;
};
