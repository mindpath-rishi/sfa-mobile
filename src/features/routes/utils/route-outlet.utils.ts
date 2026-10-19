/**
 * Route screen outlet helpers
 * ---------------------------
 * Pure helpers shared by the route screen and its outlet components.
 */
import { formatCurrency as formatCurrencyCommon } from '@/shared/utils/currenty.utils';
import type { Outlet } from '@/features/routes/types/route.types';

export const formatCurrency = (amount: number): string => {
  return formatCurrencyCommon(amount, {
    prefix: 'K',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const getOutletCoordinate = (outlet: Outlet) => {
  const latitude = Number(outlet.geoTag?.lat);
  const longitude = Number(outlet.geoTag?.lng);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  )
    return null;
  return { latitude, longitude };
};

export const getOutletDisplayName = (outlet: any): string => {
  const name =
    outlet?.name ??
    outlet?.customerName ??
    outlet?.outletName ??
    outlet?.shopName ??
    outlet?.businessName ??
    outlet?.legalName ??
    outlet?.companyName ??
    outlet?.customer?.name ??
    outlet?.customer?.customerName ??
    outlet?.ownerName;

  const normalizedName = String(name ?? '').trim();
  return normalizedName || 'Unnamed Outlet';
};

export const normalizeFilterText = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

export const hasNoOrderInLast30Days = (outlet: Outlet) => {
  if (!outlet.lastOrderDate) return true;

  const lastOrderTime = new Date(outlet.lastOrderDate).getTime();
  if (Number.isNaN(lastOrderTime)) return true;

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return lastOrderTime < thirtyDaysAgo;
};

/** Distance as shown on outlet cards, e.g. "1.2". */
export const formatOutletDistanceKm = (distance?: number) => ((distance ?? 0) / 1000).toFixed(1);
