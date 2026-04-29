// shared/utils/number.utils.ts

interface FormatCurrencyOptions {
  currency?: string;
  locale?: string;
  decimals?: number;
  showDecimals?: boolean;
}

export const formatCurrency = (
  value: number | null | undefined,
  options: FormatCurrencyOptions = {}
): string => {
  const {
    currency = 'K',
    locale = 'en-ZM',
    decimals = 2,
    showDecimals = true,
  } = options;
  
  if (value === null || value === undefined || isNaN(value)) return `${currency} 0`;
  
  const formattedValue = showDecimals 
    ? value.toFixed(decimals) 
    : Math.round(value).toString();
  
  // Add thousand separators
  const withSeparators = parseFloat(formattedValue).toLocaleString(locale, {
    minimumFractionDigits: showDecimals ? decimals : 0,
    maximumFractionDigits: showDecimals ? decimals : 0,
  });
  
  return `${currency} ${withSeparators}`;
};

export const formatNumber = (
  value: number | null | undefined,
  options: { locale?: string; decimals?: number } = {}
): string => {
  const { locale = 'en-ZM', decimals = 0 } = options;
  
  if (value === null || value === undefined || isNaN(value)) return '0';
  
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatPercentage = (
  value: number | null | undefined,
  decimals: number = 1
): string => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
};

export const formatWeight = (
  weight: number | null | undefined,
  unit: string = 'kg',
  decimals: number = 2
): string => {
  if (weight === null || weight === undefined || isNaN(weight)) return `0 ${unit}`;
  return `${weight.toFixed(decimals)} ${unit}`;
};

export const formatQuantity = (
  quantity: number | null | undefined,
  suffix: string = ''
): string => {
  if (quantity === null || quantity === undefined || isNaN(quantity)) return `0${suffix}`;
  return `${quantity.toLocaleString()}${suffix}`;
};

export const calculatePercentage = (
  part: number,
  total: number,
  decimals: number = 1
): number => {
  if (total === 0) return 0;
  return Number(((part / total) * 100).toFixed(decimals));
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const roundToDecimals = (value: number, decimals: number = 2): number => {
  return Number(value.toFixed(decimals));
};