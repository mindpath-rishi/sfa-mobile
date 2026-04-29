// shared/utils/string.utils.ts

export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str.split(' ').map(word => capitalize(word)).join(' ');
};

export const truncate = (str: string, length: number, suffix: string = '...'): string => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length).trim() + suffix;
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
};

export const maskString = (str: string, start: number = 0, end: number = 0, maskChar: string = '*'): string => {
  if (!str) return '';
  const visibleStart = str.substring(0, start);
  const visibleEnd = str.substring(str.length - end);
  const maskedLength = str.length - start - end;
  const masked = maskChar.repeat(maskedLength);
  return `${visibleStart}${masked}${visibleEnd}`;
};