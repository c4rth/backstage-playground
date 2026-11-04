import type { z } from 'zod/v3';

export type McpZod = typeof z;

export function entityOutputSchema(zod: McpZod) {
  return zod
    .object({
      apiVersion: zod.string(),
      kind: zod.string(),
      metadata: zod
        .object({
          name: zod.string(),
          namespace: zod.string().optional(),
        })
        .passthrough(),
      spec: zod.record(zod.unknown()).optional(),
      relations: zod
        .array(
          zod
            .object({ type: zod.string(), targetRef: zod.string() })
            .passthrough(),
        )
        .optional(),
    })
    .passthrough();
}
