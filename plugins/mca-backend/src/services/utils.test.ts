import { InputError } from '@backstage/errors';
import { parseIntegerParam, parseMcaComponentType } from './utils';

describe('MCA service query parameter parsing', () => {
  it('uses defaults for absent values', () => {
    expect(parseIntegerParam(undefined, 'offset', 0, 0, 100)).toBe(0);
    expect(parseMcaComponentType(undefined)).toBe('all');
  });

  it('accepts supported pagination values and component types', () => {
    expect(parseIntegerParam('20', 'limit', 10, 1, 100)).toBe(20);
    expect(parseMcaComponentType('operation')).toBe('operation');
  });

  it.each(['-1', '1.5', '101', '9007199254740992'])(
    'rejects invalid pagination value %s with InputError',
    value => {
      expect(() => parseIntegerParam(value, 'offset', 0, 0, 100)).toThrow(
        InputError,
      );
    },
  );

  it('rejects unsupported component types with InputError', () => {
    expect(() => parseMcaComponentType('library')).toThrow(InputError);
  });
});
