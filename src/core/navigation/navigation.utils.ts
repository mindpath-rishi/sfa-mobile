import { router } from 'expo-router';
import type { AppRoute } from './routes';
import { canAccessRoute } from './navigation.guard';
import { EnsureAccessOptions, GuardContext, GuardFailReason } from './navigation.types';

const DEFAULTS: Required<EnsureAccessOptions> = {
  loginRoute: '/(auth)/login' as AppRoute,
  forbiddenRoute: '/(app)/forbidden' as AppRoute,
};

const safeReplace = (to: AppRoute) => {
  try {
    router.replace(to);
  } catch {
    router.push(to);
  }
};

export const ensureRouteAccess = (
  route: AppRoute,
  ctx: GuardContext,
  options?: EnsureAccessOptions,
): boolean => {
  const { loginRoute, forbiddenRoute } = { ...DEFAULTS, ...options };

  if (canAccessRoute(route, ctx)) return true;

  if (ctx.userLevel === 'GUEST') {
    safeReplace(loginRoute);
    return false;
  }

  safeReplace(forbiddenRoute);
  return false;
};

export const getRouteAccessStatus = (
  route: AppRoute,
  ctx: GuardContext,
): { allowed: boolean; reason?: GuardFailReason } => {
  if (canAccessRoute(route, ctx)) return { allowed: true };

  return ctx.userLevel === 'GUEST'
    ? { allowed: false, reason: 'NOT_LOGGED_IN' }
    : { allowed: false, reason: 'FORBIDDEN' };
};

export const guardedNavigate = (
  route: AppRoute,
  ctx: GuardContext,
  options?: EnsureAccessOptions,
) => {
  if (!ensureRouteAccess(route, ctx, options)) return;
  router.push(route);
};
