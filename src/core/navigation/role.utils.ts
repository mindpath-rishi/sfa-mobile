type RoleUser = {
  role?: string | null;
  roleId?: string | null;
};

export type AppRoleId = 'MANAGER' | 'SALESMAN';

export const getRoleId = (user?: RoleUser | null): AppRoleId => {
  const rawRole = String(user?.roleId || user?.role || '').trim().toUpperCase();

  if (rawRole === 'SALESMAN' || rawRole === 'SALES' || rawRole === 'SALES_EXECUTIVE') {
    return 'SALESMAN';
  }

  return 'MANAGER';
};

export const isSalesman = (user?: RoleUser | null) => getRoleId(user) === 'SALESMAN';

export const isManager = (user?: RoleUser | null) => getRoleId(user) === 'MANAGER';
