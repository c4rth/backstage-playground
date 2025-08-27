import { InputError } from '@backstage/errors';

export const parseOrderByParam = <T extends readonly string[]>(
  str: unknown,
  allowedFields: T,
): { field: T[number]; direction: 'asc' | 'desc' } | undefined => {
  if (str === undefined) return undefined;
  if (typeof str !== 'string') throw new InputError('invalid orderBy query, must be a string');
  const [field, direction] = str.split('=');
  if (!field) throw new InputError('invalid orderBy query, field name is empty');
  if (!['asc', 'desc'].includes(direction)) {
    throw new InputError("invalid orderBy query, order direction must be 'asc' or 'desc'");
  }
  if (!allowedFields.includes(field)) {
    throw new InputError(`invalid orderBy field, must be one of ${allowedFields.join(', ')}`);
  }
  return { field: field as T[number], direction: direction as 'asc' | 'desc' };
};

export const parseSearchParam = (str: unknown): string | undefined => {
  if (str === undefined) return undefined;
  if (typeof str !== 'string') throw new InputError('invalid search query, must be a string');
  return str;
};

export const parseTypeParam = (str: unknown): 'all' | 'owned' | undefined => {
  if (str === undefined) return undefined;
  if (typeof str !== 'string') throw new InputError('invalid type query, must be a string');
  if (!['all', 'owned'].includes(str)) throw new InputError("invalid type query, must be 'all' or 'owned'");
  return str as 'all' | 'owned';
};