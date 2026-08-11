// src/core/navigation/navigation.guard.ts
import type { AppRoute } from './routes';
import type { GuardContext, Permission, RbacUser, UserLevel } from './navigation.types';

/* ---------------------------------- */
/* ✅ Level Based Access (Simple)      */
/* ---------------------------------- */

export const canAccessByLevel = (userLevel: UserLevel, allowedLevels: UserLevel[]): boolean =>
  allowedLevels.includes(userLevel);

/* ---------------------------------- */
/* ✅ RBAC Permission Helpers          */
/* ---------------------------------- */

const getUser = (ctx: GuardContext): RbacUser | null => ctx.rbacUser ?? null;

export const hasPermission = (user: RbacUser | null, permission: Permission): boolean => {
  if (!user) return false;
  return user.permissions.includes(permission);
};

export const hasAnyPermission = (user: RbacUser | null, permissions: Permission[]): boolean => {
  if (!user) return false;
  if (permissions.length === 0) return false;
  return permissions.some((p) => user.permissions.includes(p));
};

export const hasAllPermissions = (user: RbacUser | null, permissions: Permission[]): boolean => {
  if (!user) return false;
  if (permissions.length === 0) return false;
  return permissions.every((p) => user.permissions.includes(p));
};

/* ---------------------------------- */
/* ✅ Route Guard Rules                */
/* ---------------------------------- */

export type RouteGuardRule =
  | {
      type: 'LEVEL';
      allowedLevels: UserLevel[];
    }
  | {
      type: 'RBAC_ANY';
      anyPermissions: Permission[];
    }
  | {
      type: 'RBAC_ALL';
      allPermissions: Permission[];
    };

/**
 * Only add protected routes here.
 * Any route not listed is public.
 */
export const routeGuards: Partial<Record<AppRoute, RouteGuardRule>> = {
  '/(drawer)/(tabs)/home': {
    type: 'LEVEL',
    allowedLevels: ['USER', 'ADMIN', 'SUPER_ADMIN'],
  },

  '/(drawer)/(tabs)/daily-summary': {
    type: 'LEVEL',
    allowedLevels: ['USER', 'ADMIN', 'SUPER_ADMIN'],
  },

  '/(drawer)/(tabs)/daily-summary/users': {
    type: 'LEVEL',
    allowedLevels: ['USER', 'ADMIN', 'SUPER_ADMIN'],
  },

  '/(drawer)/(tabs)/daily-summary/[userId]': {
    type: 'LEVEL',
    allowedLevels: ['USER', 'ADMIN', 'SUPER_ADMIN'],
  },

  '/(drawer)/(tabs)/daily-summary/[userId]/order/[activityId]': {
    type: 'LEVEL',
    allowedLevels: ['USER', 'ADMIN', 'SUPER_ADMIN'],
  },

  '/(drawer)/(tabs)/settings': {
    type: 'RBAC_ANY',
    anyPermissions: ['VIEW_SETTINGS', 'EDIT_SETTINGS'],
  },
} as const;

/* ---------------------------------- */
/* ✅ Final Route Check                */
/* ---------------------------------- */

export const canAccessRoute = (route: AppRoute, ctx: GuardContext): boolean => {
  const rule = routeGuards[route];

  // public route by default
  if (!rule) return true;

  if (rule.type === 'LEVEL') {
    return canAccessByLevel(ctx.userLevel, rule.allowedLevels);
  }

  const user = getUser(ctx);

  if (rule.type === 'RBAC_ANY') {
    return hasAnyPermission(user, rule.anyPermissions);
  }

  if (rule.type === 'RBAC_ALL') {
    return hasAllPermissions(user, rule.allPermissions);
  }

  return false;
};
