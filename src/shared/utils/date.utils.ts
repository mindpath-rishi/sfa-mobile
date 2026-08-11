import { format, isValid, parseISO, differenceInDays, addDays, subDays } from 'date-fns';

export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  DISPLAY_WITH_TIME: 'dd MMM yyyy, hh:mm a',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  TIME_ONLY: 'hh:mm a',
  MONTH_DAY: 'dd MMM',
  YEAR_MONTH: 'MMM yyyy',
  FULL_DATE: 'EEEE, dd MMMM yyyy',
} as const;

export type DateFormat = keyof typeof DATE_FORMATS;

export const formatDate = (
  date: string | Date | null | undefined,
  formatStr: string = DATE_FORMATS.DISPLAY,
  fallback: string = ''
): string => {
  if (!date) return fallback;
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return fallback;
  
  return format(dateObj, formatStr);
};

export const formatDateTime = (date: string | Date | null | undefined): string => {
  return formatDate(date, DATE_FORMATS.DISPLAY_WITH_TIME, '');
};

export const formatApiDate = (date: string | Date | null | undefined): string => {
  return formatDate(date, DATE_FORMATS.API, '');
};

export const formatLocalApiDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const formatTimeOnly = (date: string | Date | null | undefined): string => {
  return formatDate(date, DATE_FORMATS.TIME_ONLY, '');
};

export const isDateValid = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj);
};

export const getDateRange = (days: number): { start: Date; end: Date } => {
  const end = new Date();
  const start = subDays(end, days);
  return { start, end };
};

export const getDateRangeThisWeek = (): { start: Date; end: Date } => {
  const end = new Date();
  const start = subDays(end, 7);
  return { start, end };
};

export const getDateRangeThisMonth = (): { start: Date; end: Date } => {
  const end = new Date();
  const start = subDays(end, 30);
  return { start, end };
};

export const getDaysDifference = (date1: string | Date, date2: string | Date): number => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInDays(d2, d1);
};

export const isDateInRange = (
  date: string | Date,
  startDate: string | Date,
  endDate: string | Date
): boolean => {
  const checkDate = typeof date === 'string' ? parseISO(date) : date;
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  return checkDate >= start && checkDate <= end;
};
