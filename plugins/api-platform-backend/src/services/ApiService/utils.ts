import { InputError } from '@backstage/errors';
import {
  DependentsType,
  OpenApiType,
  OPENAPITYPE_LIST,
  OwnershipType,
} from '@internal/plugin-api-platform-common';

export const parseOrderByParam = <T extends readonly string[]>(
  str: unknown,
  allowedFields: T,
): { field: T[number]; direction: 'asc' | 'desc' } | undefined => {
  if (str === undefined) return undefined;
  if (typeof str !== 'string')
    throw new InputError('invalid orderBy query, must be a string');
  const [field, direction] = str.split('=');
  if (!field)
    throw new InputError('invalid orderBy query, field name is empty');
  if (!['asc', 'desc'].includes(direction)) {
    throw new InputError(
      "invalid orderBy query, order direction must be 'asc' or 'desc'",
    );
  }
  if (!allowedFields.includes(field)) {
    throw new InputError(
      `invalid orderBy field, must be one of ${allowedFields.join(', ')}`,
    );
  }
  return { field: field as T[number], direction: direction as 'asc' | 'desc' };
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
    throw new InputError("invalid type query, must be 'all' or 'owned'");
  return str as 'all' | 'yes' | 'no';
};
