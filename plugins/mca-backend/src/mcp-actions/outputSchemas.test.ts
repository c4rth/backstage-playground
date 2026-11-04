import { z } from 'zod/v3';
import { mcaOutputSchemas } from './outputSchemas';

describe('MCA output schemas', () => {
  const schemas = mcaOutputSchemas(z);

  it.each(Object.entries(schemas))(
    'requires the %s result shape',
    (_name, schema) => {
      expect(schema.safeParse({}).success).toBe(false);
    },
  );

  it('preserves arbitrary parsed XML content, including falsy values', () => {
    const output = {
      definition: { component: 'Example', refP: 'P1' },
      result: { custom: [false, 0, null, '', { nested: 'value' }] },
    };
    expect(schemas.definition.parse(output)).toEqual(output);
    expect(
      schemas.definition.safeParse({ definition: output.definition }).success,
    ).toBe(false);
    expect(
      schemas.definition.safeParse({
        ...output,
        definition: { component: 'Example', refP: 1 },
      }).success,
    ).toBe(false);
  });
});
