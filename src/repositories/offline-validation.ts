import type { EntityName } from '@/database';

type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';

type FieldRule = {
  type: FieldType;
  required?: boolean;
  min?: number;
  max?: number;
  items?: Record<string, FieldRule>;
};

type EntityRules = Partial<Record<EntityName, Record<string, FieldRule>>>;

// Mirrors required/type constraints from the server schemas for every entity
// currently created by the mobile offline workflow. mediaUploads is a local
// staging entity, so its rules describe the data required by the upload API.
const RULES: EntityRules = {
  attendance: {
    workSessionId: { type: 'string', required: true },
    userId: { type: 'string', required: true },
    vanId: { type: 'string', required: true },
    dayStartTime: { type: 'date', required: true },
    status: { type: 'string' },
    backgroundLocations: { type: 'array' },
  },
  activities: {
    activityId: { type: 'string', required: true },
    workSessionId: { type: 'string', required: true },
    userId: { type: 'string', required: true },
    vanId: { type: 'string', required: true },
    name: { type: 'string', required: true },
    startTime: { type: 'date', required: true },
    status: { type: 'string' },
  },
  vanErpClosing: {
    stockId: { type: 'string', required: true },
    date: { type: 'date', required: true },
    vanId: { type: 'string', required: true },
    productId: { type: 'string', required: true },

    qtyInCase: { type: 'number', required: true, min: 0 },
    status: { type: 'string' },

    compCode: { type: 'string' },
    vanCode: { type: 'string' },
    itemCode: { type: 'string' },

    qty: { type: 'number', min: 0 },
    closeDate: { type: 'date' },
    syncStatus: { type: 'string' },
    modifiedDate: { type: 'date' },
    epochTime: { type: 'number' },
    erpStockId: { type: 'string' },
    time: { type: 'string' },
    createdDate: { type: 'date' },

    unitQtyInCase: { type: 'number', min: 1 },
    piecePrice: { type: 'number', min: 0 },
    pieceNetWeight: { type: 'number', min: 0 },
    isDeleted: { type: 'boolean' },
  },
  routeSessions: {
    routeSessionId: { type: 'string', required: true },
    workSessionId: { type: 'string', required: true },
    userId: { type: 'string', required: true },
    vanId: { type: 'string', required: true },
    routeId: { type: 'string', required: true },
    totalShops: { type: 'number', required: true, min: 0 },
    startTime: { type: 'date', required: true },
    sessionDate: { type: 'date' },
    isActive: { type: 'boolean' },
  },
  leaves: {
    leaveId: { type: 'string', required: true },
    userId: { type: 'string', required: true },
    type: { type: 'string' },
    status: { type: 'string' },
  },
  nonSales: {
    nonSaleId: { type: 'string', required: true },
    visitId: { type: 'string', required: true },
    outletId: { type: 'string', required: true },
    employeeId: { type: 'string', required: true },
    vanId: { type: 'string', required: true },
    reasonCategoryId: { type: 'string', required: true },
    reasonId: { type: 'string', required: true },
    remark: { type: 'string' },
    status: { type: 'string' },
  },
  interactions: {
    interactionId: { type: 'string', required: true },
    customerId: { type: 'string', required: true },
    employeeId: { type: 'string', required: true },
    routeSessionId: { type: 'string', required: true },
    workSessionId: { type: 'string', required: true },
    vanId: { type: 'string', required: true },
    customerLocation: {
      type: 'object',
      required: true,
      items: {
        latitude: { type: 'number', required: true, min: -90, max: 90 },
        longitude: { type: 'number', required: true, min: -180, max: 180 },
      },
    },
    arrivalLocation: {
      type: 'object',
      required: true,
      items: {
        latitude: { type: 'number', required: true, min: -90, max: 90 },
        longitude: { type: 'number', required: true, min: -180, max: 180 },
        accuracy: { type: 'number', min: 0 },
      },
    },
    distanceMeters: { type: 'number', required: true, min: 0 },
    configuredRadiusMeters: { type: 'number', required: true, min: 0 },
    visitType: { type: 'string', required: true },
    arrivalTime: { type: 'date', required: true },
    status: { type: 'string' },
  },
  visits: {
    visitId: { type: 'string', required: true },
    routeSessionId: { type: 'string', required: true },
    workSessionId: { type: 'string', required: true },
    employeeId: { type: 'string', required: true },
    vanId: { type: 'string', required: true },
    outletId: { type: 'string', required: true },
    checkInTime: { type: 'date', required: true },
    checkInLocation: {
      type: 'object',
      items: {
        latitude: { type: 'number', min: -90, max: 90 },
        longitude: { type: 'number', min: -180, max: 180 },
        accuracy: { type: 'number', min: 0 },
      },
    },
    status: { type: 'string' },
  },
  outlets: {
    customerId: { type: 'string', required: true },
    customerCategoryId: { type: 'string', required: true },
    channelId: { type: 'string', required: true },
    customerTypeId: { type: 'string', required: true },
    marketId: { type: 'string', required: true },
    provinceId: { type: 'string', required: true },
    countryId: { type: 'string', required: true },
    ownerName: { type: 'string', required: true },
    phoneNumber: { type: 'string', required: true },
    name: { type: 'string', required: true },
    segmentation: { type: 'string', required: true },
    address: {
      type: 'object',
      required: true,
      items: {
        line1: { type: 'string', required: true },
        line2: { type: 'string' },
      },
    },
    geoTag: {
      type: 'object',
      items: {
        lat: { type: 'number', required: true, min: -90, max: 90 },
        lng: { type: 'number', required: true, min: -180, max: 180 },
      },
    },
    creditLimit: { type: 'number', min: 0 },
    creditDays: { type: 'number', min: 0 },
    outstanding: { type: 'number', min: 0 },
    status: { type: 'string' },
  },
  orders: {
    saleId: { type: 'string', required: true },
    vanId: { type: 'string', required: true },
    visitId: { type: 'string', required: true },
    vanName: { type: 'string', required: true },
    customerId: { type: 'string', required: true },
    customerName: { type: 'string', required: true },
    employees: {
      type: 'array',
      required: true,
      items: {
        employeeId: { type: 'string', required: true },
        employeeName: { type: 'string', required: true },
        role: { type: 'string', required: true },
      },
    },
    date: { type: 'date', required: true },
    totalQty: { type: 'number', required: true, min: 0 },
    totalWeight: { type: 'number', required: true, min: 0 },
    totalValue: { type: 'number', required: true, min: 0 },
    paidAmount: { type: 'number', min: 0 },
    pendingAmount: { type: 'number', min: 0 },
  },
  orderItems: {
    saleId: { type: 'string', required: true },
    compCode: { type: 'string', required: true },
    productId: { type: 'string', required: true },
    productName: { type: 'string', required: true },
    categoryId: { type: 'string', required: true },
    parentCategoryId: { type: 'string', required: true },
    customerCategoryId: { type: 'string', required: true },
    isFocusedPack: { type: 'string' },
    quantity: { type: 'number', required: true, min: 0 },
    netCases: { type: 'number', required: true, min: 0 },
    piecePrice: { type: 'number', required: true, min: 0 },
    casePrice: { type: 'number', required: true, min: 0 },
    pieceNetWeight: { type: 'number', required: true, min: 0 },
    caseNetWeight: { type: 'number', required: true, min: 0 },
    unitQtyInCase: { type: 'number', required: true, min: 1 },
  },
  collections: {
    paymentId: { type: 'string', required: true },
    customerId: { type: 'string', required: true },
    vanId: { type: 'string', required: true },
    employeeId: { type: 'string', required: true },
    amount: { type: 'number', required: true, min: 0 },
    paymentMode: { type: 'string', required: true },
    date: { type: 'date', required: true },
    sales: {
      type: 'array',
      items: {
        saleId: { type: 'string', required: true },
        amount: { type: 'number', required: true, min: 0 },
      },
    },
  },
  inventoryTransactions: {
    transactionId: { type: 'string', required: true },
    productId: { type: 'string', required: true },
    vanId: { type: 'string', required: true },
    employeeId: { type: 'string', required: true },
    warehouseId: { type: 'string' },
    transactionType: { type: 'string', required: true },
    direction: { type: 'string', required: true },
    quantity: { type: 'number', required: true, min: 0.0001 },
    cases: { type: 'number', min: 0 },
    pieces: { type: 'number', min: 0 },
    referenceNo: { type: 'string' },
    remark: { type: 'string' },
    transactionDate: { type: 'date', required: true },
    status: { type: 'string' },
  },
  mediaUploads: {
    customerId: { type: 'string', required: true },
    uri: { type: 'string', required: true },
    extension: { type: 'string', required: true },
    isPrimary: { type: 'boolean', required: true },
  },
};

const missing = (value: unknown) =>
  value === undefined || value === null || (typeof value === 'string' && !value.trim());

const matchesType = (value: unknown, type: FieldType) => {
  if (type === 'array') return Array.isArray(value);
  if (type === 'date') {
    if (!(typeof value === 'string' || typeof value === 'number' || value instanceof Date))
      return false;
    return !Number.isNaN(new Date(value).getTime());
  }
  if (type === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (type === 'object')
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  return typeof value === type;
};

const validateFields = (
  entity: EntityName,
  data: Record<string, unknown>,
  rules: Record<string, FieldRule>,
  prefix = '',
) => {
  const errors: string[] = [];
  for (const [field, rule] of Object.entries(rules)) {
    const path = prefix ? `${prefix}.${field}` : field;
    const value = data[field];
    if (missing(value)) {
      if (rule.required) errors.push(`${path} is required`);
      continue;
    }
    if (!matchesType(value, rule.type)) {
      errors.push(`${path} must be ${rule.type === 'array' ? 'an array' : `a ${rule.type}`}`);
      continue;
    }
    if (rule.type === 'number' && rule.min !== undefined && (value as number) < rule.min) {
      errors.push(`${path} must be at least ${rule.min}`);
    }
    if (rule.type === 'number' && rule.max !== undefined && (value as number) > rule.max) {
      errors.push(`${path} must be at most ${rule.max}`);
    }
    if (rule.type === 'array' && rule.items) {
      (value as unknown[]).forEach((item, index) => {
        if (typeof item !== 'object' || item === null || Array.isArray(item)) {
          errors.push(`${path}[${index}] must be an object`);
        } else {
          errors.push(
            ...validateFields(
              entity,
              item as Record<string, unknown>,
              rule.items!,
              `${path}[${index}]`,
            ),
          );
        }
      });
    }
    if (rule.type === 'object' && rule.items) {
      errors.push(...validateFields(entity, value as Record<string, unknown>, rule.items, path));
    }
  }
  return errors;
};

const findUnsafeValues = (value: unknown, path = 'payload'): string[] => {
  if (typeof value === 'number' && !Number.isFinite(value))
    return [`${path} must be a finite number`];
  if (Array.isArray(value))
    return value.flatMap((item, index) => findUnsafeValues(item, `${path}[${index}]`));
  if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
    return Object.entries(value).flatMap(([key, item]) => findUnsafeValues(item, `${path}.${key}`));
  }
  return [];
};

export class OfflineValidationError extends Error {
  constructor(entity: EntityName, errors: string[]) {
    super(`Cannot save offline ${entity}: ${errors.join('; ')}`);
    this.name = 'OfflineValidationError';
  }
}

export const validateOfflineEntity = (entity: EntityName, data: Record<string, unknown>) => {
  const errors = [
    ...findUnsafeValues(data),
    ...(RULES[entity] ? validateFields(entity, data, RULES[entity]!) : []),
  ];
  if (errors.length) throw new OfflineValidationError(entity, errors);
};
