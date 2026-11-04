import { InputError } from '@backstage/errors';
import {
  DependentsType,
  MAX_LIST_LIMIT,
  OpenApiType,
  OPENAPITYPE_LIST,
  OwnershipType,
  SortDirection,
} from '@internal/plugin-api-platform-common';

export function parseIntegerParam(
  value: unknown,
  name: string,
  defaultValue?: number,
): number | undefined {
  if (value === undefined) return defaultValue;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new InputError(`${name} must be a non-negative integer`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new InputError(`${name} must be a safe integer`);
  }
  if (name === 'limit' && (parsed < 1 || parsed > MAX_LIST_LIMIT)) {
    throw new InputError(`limit must be between 1 and ${MAX_LIST_LIMIT}`);
  }
  return parsed;
}

export const parseOrderByParam = <T extends readonly string[]>(
  str: unknown,
  allowedFields: T,
): { field: T[number]; direction: SortDirection } | undefined => {
  if (str === undefined) return undefined;
  if (typeof str !== 'string')
    throw new InputError('invalid orderBy query, must be a string');
  const [field, direction] = str.split('=');
  if (!field)
    throw new InputError('invalid orderBy query, field name is empty');
  if (!['ascending', 'descending'].includes(direction)) {
    throw new InputError(
      "invalid orderBy query, order direction must be 'ascending' or 'descending'",
    );
  }
  if (!allowedFields.includes(field)) {
    throw new InputError(
      `invalid orderBy field, must be one of ${allowedFields.join(', ')}`,
    );
  }
  return {
    field: field as T[number],
    direction: direction as 'ascending' | 'descending',
  };
};

export const parseSearchParam = (str: unknown): string | undefined => {
  if (str === undefined) return undefined;
  if (typeof str !== 'string')
    throw new InputError('invalid search query, must be a string');
  return str;
};

export const parseOwnershipParam = (
  str: unknown,
): OwnershipType | undefined => {
  if (str === undefined) return undefined;
  if (typeof str !== 'string')
    throw new InputError('invalid type query, must be a string');
  if (!['all', 'owned'].includes(str))
    throw new InputError("invalid type query, must be 'all' or 'owned'");
  return str as 'all' | 'owned';
};

export const parseApiTypeParam = (str: unknown): OpenApiType | undefined => {
  if (str === undefined) return undefined;
  if (typeof str !== 'string')
    throw new InputError('invalid type query, must be a string');
  if (!OPENAPITYPE_LIST.includes(str as OpenApiType))
    throw new InputError(
      `invalid type query, must be one of ${OPENAPITYPE_LIST.join(', ')}`,
    );
  return str as OpenApiType;
};

export const parseDependentsParam = (
  str: unknown,
): DependentsType | undefined => {
  if (str === undefined) return undefined;
  if (typeof str !== 'string')
    throw new InputError('invalid type query, must be a string');
  if (!['all', 'yes', 'no'].includes(str))
    throw new InputError("invalid dependentsType, must be 'all', 'yes', or 'no'");
  return str as 'all' | 'yes' | 'no';
};
