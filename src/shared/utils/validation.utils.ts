// shared/utils/validation.utils.ts

export const isValidSearchTerm = (term: string, minLength: number = 2, maxLength: number = 100): boolean => {
  if (!term || term.trim().length === 0) return false;
  const trimmed = term.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
};

export const isValidNumberRange = (
  min: string | number | null | undefined,
  max: string | number | null | undefined
): boolean => {
  const minNum = min ? parseFloat(String(min)) : null;
  const maxNum = max ? parseFloat(String(max)) : null;
  
  if (minNum !== null && isNaN(minNum)) return false;
  if (maxNum !== null && isNaN(maxNum)) return false;
  if (minNum !== null && maxNum !== null && minNum > maxNum) return false;
  
  return true;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const isNotEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

export const validateRequired = (value: any): boolean => {
  return isNotEmpty(value);
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value && value.trim().length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return !value || value.length <= maxLength;
};