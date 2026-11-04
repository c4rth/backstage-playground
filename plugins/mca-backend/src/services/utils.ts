import { InputError } from '@backstage/errors';
import type { McaComponentType } from '@internal/plugin-mca-common';

export function parseIntegerParam(
  value: unknown,
  name: string,
  defaultValue: number,
  min: number,
  max: number,
): number {
  if (value === undefined) return defaultValue;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new InputError(`${name} must be an integer`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    throw new InputError(`${name} must be between ${min} and ${max}`);
  }
  return parsed;
}

export function parseMcaComponentType(value: unknown): McaComponentType {
  const allowedTypes = ['all', 'element', 'operation'] as const;
  if (value === undefined) return 'all';
  const componentType =
    typeof value === 'string'
      ? allowedTypes.find(allowedType => allowedType === value)
      : undefined;
  if (!componentType) {
    throw new InputError(
      "type must be one of 'all', 'element', or 'operation'",
    );
  }
  return componentType;
}

export const parseOrderByParam = <T extends readonly string[]>(
  str: unknown,
  allowedFields: T,
): { field: T[number]; direction: 'ascending' | 'descending' } | undefined => {
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
    direction: direction === 'descending' ? 'descending' : 'ascending',
  };
};

export const parseSearchParam = (str: unknown): string | undefined => {
  if (str === undefined) return undefined;
  if (typeof str !== 'string')
    throw new InputError('invalid search query, must be a string');
  return str;
};
