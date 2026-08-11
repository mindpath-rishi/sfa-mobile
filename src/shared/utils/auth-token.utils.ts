import { jwtDecode } from 'jwt-decode';

type ExpirableJwtPayload = {
  exp?: number;
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<ExpirableJwtPayload>(token);

    if (!decoded.exp) {
      return false;
    }

    return decoded.exp * 1000 <= Date.now();
  } catch (error) {
    console.warn('JWT expiry check failed:', error);
    return true;
  }
};
