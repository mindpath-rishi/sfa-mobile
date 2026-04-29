import { format } from 'date-fns';

export function formatCurrency(
  value: number,
  {
    prefix = 'K',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  }: {
    prefix?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {},
) {
  const safeNumber = Number(value || 0);
  const formatted = safeNumber.toLocaleString(undefined, {
    minimumFractionDigits,
    maximumFractionDigits,
  });
  return `${prefix} ${formatted}`;
}

export function formatDateSafe(dateString: string, dateFormat = 'dd MMM yyyy') {
  try {
    return format(new Date(dateString), dateFormat);
  } catch {
    return 'Invalid date';
  }
}

