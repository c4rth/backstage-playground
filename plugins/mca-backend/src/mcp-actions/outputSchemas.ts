import type { McpZod } from '@internal/mcp-common/src';

export function mcaOutputSchemas(z: McpZod) {
  const tag = z.object({ label: z.string(), values: z.array(z.string()) });
  const member = z.object({
    name: z.string(),
    signature: z.string(),
    description: z.string(),
    tags: z.array(tag),
  });
  return {
    component: z.object({
      component: z.object({
        component: z.string(),
        prdVersion: z.string(),
        p1Version: z.string(),
        p2Version: z.string(),
        p3Version: z.string(),
        p4Version: z.string(),
        applicationCode: z.string(),
        packageName: z.string(),
      }),
    }),
    definition: z.object({
      definition: z.object({ component: z.string(), refP: z.string() }),
      result: z
        .unknown()
        .refine(value => value !== undefined, 'Parsed definition is required')
        .describe(
          'Complete parsed XML content; keys depend on the component definition',
        ),
    }),
    basetype: z.object({
      javaDoc: z.object({
        baseType: z.string(),
        packageName: z.string(),
        title: z.string(),
        signature: z.string(),
        description: z.string(),
        inheritance: z.array(z.string()),
        tags: z.array(tag),
        fields: z.array(member),
        constructors: z.array(member),
        methods: z.array(member),
        inheritedMembers: z.array(
          z.object({ source: z.string(), members: z.array(z.string()) }),
        ),
      }),
    }),
  };
}
