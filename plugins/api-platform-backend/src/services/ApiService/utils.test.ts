import { InputError } from '@backstage/errors';
import { parseDependentsParam, parseIntegerParam } from './utils';

describe('API service query parameter parsing', () => {
  it('uses defaults and accepts safe integer values', () => {
    expect(parseIntegerParam(undefined, 'offset', 0)).toBe(0);
    expect(parseIntegerParam(undefined, 'limit')).toBeUndefined();
    expect(parseIntegerParam('42', 'offset')).toBe(42);
    expect(parseIntegerParam('100', 'limit')).toBe(100);
  });

  it.each(['-1', '1.5', '12abc', '9007199254740992'])(
    'rejects invalid offset %s with InputError',
    value => {
      expect(() => parseIntegerParam(value, 'offset')).toThrow(InputError);
    },
  );

  it.each(['0', '101', '1.5'])(
    'rejects invalid limit %s with InputError',
    value => {
      expect(() => parseIntegerParam(value, 'limit')).toThrow(InputError);
    },
  );

  it('rejects invalid dependentsType values with InputError', () => {
    expect(() => parseDependentsParam('owned')).toThrow(InputError);
  });
});
