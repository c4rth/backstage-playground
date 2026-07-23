import { InputError } from '@backstage/errors';

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
