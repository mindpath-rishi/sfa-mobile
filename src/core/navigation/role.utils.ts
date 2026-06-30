type RoleUser = {
  role?: string | null;
  roleId?: string | null;
};

export type AppRoleId = 'MANAGER' | 'SALESMAN';

const SALESMAN_ROLES = new Set(['SALESMAN', 'SALES', 'SALES_EXECUTIVE']);

export const getRoleId = (user?: RoleUser | null): AppRoleId => {
  // roleId can be a database identifier (for example, RID-001), while role is
  // the authorization name. Check both instead of allowing roleId to mask role.
  const roles = [user?.role, user?.roleId].map((role) =>
    String(role ?? '')
      .trim()
      .toUpperCase(),
  );

  if (roles.some((role) => SALESMAN_ROLES.has(role))) {
    return 'SALESMAN';
  }

  return 'MANAGER';
};

export const isSalesman = (user?: RoleUser | null) => getRoleId(user) === 'SALESMAN';

export const isManager = (user?: RoleUser | null) => getRoleId(user) === 'MANAGER';
