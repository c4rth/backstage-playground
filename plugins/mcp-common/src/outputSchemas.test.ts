import { z } from 'zod/v3';
import { entityOutputSchema, pageOutputSchema } from './index';

describe('MCP output schemas', () => {
  const page = {
    items: [{ name: 'example' }],
    offset: 0,
    limit: 20,
    totalCount: 1,
    hasMore: false,
    nextOffset: null,
  };

  it('requires typed page metadata and items', () => {
    const schema = pageOutputSchema(z, z.object({ name: z.string() }));
    expect(schema.parse(page)).toEqual(page);
    expect(schema.safeParse({ ...page, items: [{}] }).success).toBe(false);
    expect(schema.safeParse({ ...page, nextOffset: '20' }).success).toBe(false);
    expect(schema.safeParse({ ...page, limit: 101 }).success).toBe(false);
    expect(schema.safeParse({}).success).toBe(false);
  });

  it('validates entity identity without stripping custom catalog fields', () => {
    const entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Custom',
      metadata: { name: 'example', annotations: { custom: 'value' } },
      spec: { custom: { nested: true } },
      customField: { values: [1, false, null] },
    };
    expect(entityOutputSchema(z).parse(entity)).toEqual(entity);
    expect(entityOutputSchema(z).safeParse({ kind: 'API' }).success).toBe(
      false,
    );
  });
});
