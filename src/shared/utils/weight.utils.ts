// shared/utils/weight.utils.ts

// ============ Types ============
export type WeightUnit = 'kg' | 'g' | 'lb' | 'oz';
export type WeightPrecision = 0 | 1 | 2 | 3;

export interface WeightOptions {
  unit?: WeightUnit;
  decimals?: WeightPrecision;
  showUnit?: boolean;
}

// ============ Conversion Factors ============
const CONVERSION_FACTORS: Record<WeightUnit, number> = {
  kg: 1,
  g: 1000,
  lb: 2.20462,
  oz: 35.274,
};

const TO_KG_FACTORS: Record<WeightUnit, number> = {
  kg: 1,
  g: 0.001,
  lb: 0.453592,
  oz: 0.0283495,
};

// ============ Core Conversion Functions ============
export const convertWeight = (
  value: number,
  fromUnit: WeightUnit,
  toUnit: WeightUnit
): number => {
  if (value === null || value === undefined || isNaN(value)) return 0;
  
  // Convert to kg first, then to target unit
  const inKg = value * TO_KG_FACTORS[fromUnit];
  return inKg * CONVERSION_FACTORS[toUnit];
};

export const toKg = (value: number, fromUnit: WeightUnit): number => 
  convertWeight(value, fromUnit, 'kg');

export const toGrams = (value: number, fromUnit: WeightUnit): number => 
  convertWeight(value, fromUnit, 'g');

export const toPounds = (value: number, fromUnit: WeightUnit): number => 
  convertWeight(value, fromUnit, 'lb');

export const toOunces = (value: number, fromUnit: WeightUnit): number => 
  convertWeight(value, fromUnit, 'oz');

// ============ Formatting Functions ============
export const formatWeight = (
  value: number | null | undefined,
  options: WeightOptions = {}
): string => {
  const { unit = 'kg', decimals = 2, showUnit = true } = options;
  
  if (value === null || value === undefined || isNaN(value)) {
    return showUnit ? `0 ${unit}` : '0';
  }
  
  const formattedValue = value.toFixed(decimals);
  return showUnit ? `${formattedValue} ${unit}` : formattedValue;
};

export const formatWeightFromUnit = (
  value: number | null | undefined,
  fromUnit: WeightUnit,
  options: WeightOptions = {}
): string => {
  const { unit = 'kg', decimals = 2, showUnit = true } = options;
  
  if (value === null || value === undefined || isNaN(value)) {
    return showUnit ? `0 ${unit}` : '0';
  }
  
  const converted = convertWeight(value, fromUnit, unit);
  const formattedValue = converted.toFixed(decimals);
  return showUnit ? `${formattedValue} ${unit}` : formattedValue;
};

// ============ Weight Calculation Functions ============
export const sumWeights = (
  weights: Array<{ value: number; unit: WeightUnit }>,
  targetUnit: WeightUnit = 'kg'
): number => {
  return weights.reduce((sum, { value, unit }) => {
    return sum + convertWeight(value, unit, targetUnit);
  }, 0);
};

export const getTotalWeight = (
  items: Array<{ weightPerUnit: number; quantity: number; unit?: WeightUnit }>,
  targetUnit: WeightUnit = 'kg'
): number => {
  return items.reduce((total, { weightPerUnit, quantity, unit = 'kg' }) => {
    const itemWeight = weightPerUnit * quantity;
    return total + convertWeight(itemWeight, unit, targetUnit);
  }, 0);
};

export const getAverageWeight = (
  weights: number[],
  unit: WeightUnit = 'kg'
): number => {
  if (!weights.length) return 0;
  const sum = weights.reduce((acc, w) => acc + w, 0);
  return sum / weights.length;
};

// ============ Comparison Functions ============
export const compareWeights = (
  value1: number,
  unit1: WeightUnit,
  value2: number,
  unit2: WeightUnit
): number => {
  const inKg1 = convertWeight(value1, unit1, 'kg');
  const inKg2 = convertWeight(value2, unit2, 'kg');
  
  if (inKg1 > inKg2) return 1;
  if (inKg1 < inKg2) return -1;
  return 0;
};

export const isHeavier = (
  value1: number,
  unit1: WeightUnit,
  value2: number,
  unit2: WeightUnit
): boolean => compareWeights(value1, unit1, value2, unit2) > 0;

export const isLighter = (
  value1: number,
  unit1: WeightUnit,
  value2: number,
  unit2: WeightUnit
): boolean => compareWeights(value1, unit1, value2, unit2) < 0;

export const isEqualWeight = (
  value1: number,
  unit1: WeightUnit,
  value2: number,
  unit2: WeightUnit,
  tolerance: number = 0.01
): boolean => {
  const diff = Math.abs(convertWeight(value1, unit1, 'kg') - convertWeight(value2, unit2, 'kg'));
  return diff <= tolerance;
};

// ============ Validation Functions ============
export const isValidWeight = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  const num = Number(value);
  return !isNaN(num) && num >= 0;
};

export const isValidWeightRange = (
  weight: number,
  min: number,
  max: number,
  unit: WeightUnit = 'kg'
): boolean => {
  const weightInKg = convertWeight(weight, unit, 'kg');
  const minInKg = convertWeight(min, unit, 'kg');
  const maxInKg = convertWeight(max, unit, 'kg');
  return weightInKg >= minInKg && weightInKg <= maxInKg;
};

// ============ Display Helper Functions ============
export const getAppropriateUnit = (weightInKg: number): WeightUnit => {
  if (weightInKg >= 1) return 'kg';
  if (weightInKg >= 0.001) return 'g';
  return 'g';
};

export const getReadableWeight = (weightInKg: number): string => {
  const unit = getAppropriateUnit(weightInKg);
  let value = weightInKg;
  
  switch (unit) {
    case 'g':
      value = weightInKg * 1000;
      break;
    case 'lb':
      value = weightInKg * 2.20462;
      break;
    case 'oz':
      value = weightInKg * 35.274;
      break;
  }
  
  const decimals = unit === 'kg' ? 2 : 0;
  return `${value.toFixed(decimals)} ${unit}`;
};

// ============ Inventory/Case Weight Functions ============
export interface CaseWeight {
  pieceWeight: number;
  piecesPerCase: number;
  caseWeight?: number;
  unit?: WeightUnit;
}

export const calculateCaseWeight = (
  pieceWeight: number,
  piecesPerCase: number,
  unit: WeightUnit = 'kg'
): number => {
  return pieceWeight * piecesPerCase;
};

export const calculateTotalWeight = (
  cases: number,
  pieces: number,
  pieceWeight: number,
  caseWeight: number,
  unit: WeightUnit = 'kg'
): number => {
  const casesWeight = cases * caseWeight;
  const piecesWeight = pieces * pieceWeight;
  return casesWeight + piecesWeight;
};

export const getWeightBreakdown = (
  cases: number,
  pieces: number,
  pieceWeight: number,
  caseWeight: number,
  unit: WeightUnit = 'kg'
) => {
  const fromCases = cases * caseWeight;
  const fromPieces = pieces * pieceWeight;
  const total = fromCases + fromPieces;
  
  return {
    fromCases,
    fromPieces,
    total,
    percentageFromCases: total > 0 ? (fromCases / total) * 100 : 0,
    percentageFromPieces: total > 0 ? (fromPieces / total) * 100 : 0,
  };
};

// ============ Batch Processing ============
export const batchConvertWeights = (
  weights: Array<{ value: number; fromUnit: WeightUnit }>,
  toUnit: WeightUnit = 'kg'
): number[] => {
  return weights.map(({ value, fromUnit }) => convertWeight(value, fromUnit, toUnit));
};

export const batchFormatWeights = (
  weights: Array<number | null | undefined>,
  options: WeightOptions = {}
): string[] => {
  return weights.map(weight => formatWeight(weight, options));
};