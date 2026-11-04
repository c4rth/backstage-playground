import { z } from 'zod/v3';
import { apiPlatformOutputSchemas } from './outputSchemas';

describe('API Platform output schemas', () => {
  const schemas = apiPlatformOutputSchemas(z);

  it.each(Object.entries(schemas))(
    'requires the %s result shape',
    (_name, schema) => {
      expect(schema.safeParse({}).success).toBe(false);
    },
  );

  it('validates summaries and dependency directions', () => {
    const output = {
      name: 'Example',
      version: '1.0',
      summary: { consumerCount: 1, providerCount: 0 },
    };
    expect(schemas.apiDependencies.parse(output)).toEqual(output);
    expect(
      schemas.apiDependencies.safeParse({
        ...output,
        summary: { consumerCount: '1', providerCount: 0 },
      }).success,
    ).toBe(false);
    expect(
      schemas.apiDependencies.safeParse({
        ...output,
        relations: {
          items: [{ direction: 'invalid' }],
          offset: 0,
          limit: 20,
          totalCount: 1,
          hasMore: false,
          nextOffset: null,
        },
      }).success,
    ).toBe(false);
  });
});
