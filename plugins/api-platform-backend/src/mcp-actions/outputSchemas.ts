import {
  entityOutputSchema,
  McpZod,
  pageOutputSchema,
} from '@internal/mcp-common/src';

export function apiPlatformOutputSchemas(z: McpZod) {
  const count = z.number().int().nonnegative();
  const identity = z.object({
    name: z.string(),
    system: z.string().optional(),
    namespace: z.string().optional(),
    entityRef: z.string(),
  });
  const apiVersion = identity.extend({
    version: z.string(),
    project: z.string(),
  });
  const serviceRelation = identity.extend({
    owner: z.string(),
    environment: z.string(),
    version: z.string(),
    imageVersion: z.string(),
    platform: z.string(),
  });
  const service = z.object({
    name: z.string(),
    serviceName: z.string(),
    catalogName: z.string(),
    system: z.string(),
    owner: z.string(),
  });
  const environment = z.object({
    version: z.string(),
    environment: z.string(),
    imageVersion: z.string(),
    entityRef: z.string(),
    namespace: z.string(),
    platform: z.string(),
  });
  const system = identity.extend({
    entityRef: z.string().optional(),
    owner: z.string(),
    counts: z.object({ apis: count, services: count, libraries: count }),
  });
  return {
    apis: z.object({
      apis: pageOutputSchema(
        z,
        apiVersion.extend({
          type: z.string(),
          description: z.string(),
          owner: z.string(),
        }),
      ),
    }),
    apiVersions: z.object({ apis: z.array(apiVersion) }),
    api: z.object({ api: apiVersion }),
    apiDependencies: z.object({
      name: z.string(),
      system: z.string().optional(),
      version: z.string(),
      summary: z.object({ consumerCount: count, providerCount: count }),
      relations: pageOutputSchema(
        z,
        z.object({
          direction: z.enum(['consumer', 'provider']),
          api: identity.extend({
            apiVersion: z.string(),
            version: z.string(),
            project: z.string().optional(),
          }),
          service: serviceRelation,
          lifecycle: z.string(),
        }),
      ).optional(),
    }),
    services: z.object({
      services: pageOutputSchema(
        z,
        service.extend({ versionCount: count, environmentCount: count }),
      ),
    }),
    serviceVersions: z.object({
      service,
      section: z.enum(['versions', 'environments', 'dependencies']),
      page: pageOutputSchema(
        z,
        z.union([
          z.object({ version: z.string(), environments: z.array(z.string()) }),
          environment.extend({ dependencyCount: count }),
          environment.extend({ dependency: z.string() }),
        ]),
      ),
    }),
    serviceDependencies: z.object({
      name: z.string(),
      system: z.string(),
      summary: z.object({
        environmentCount: count,
        consumedCount: count,
        providedCount: count,
      }),
      relations: pageOutputSchema(
        z,
        z.object({
          direction: z.enum(['consumed', 'provided']),
          service: serviceRelation,
          api: identity.extend({
            owner: z.string(),
            version: z.string(),
            project: z.string().optional(),
          }),
        }),
      ).optional(),
    }),
    systems: z.object({
      systems: pageOutputSchema(
        z,
        identity.extend({ kind: z.string(), owner: z.string() }),
      ),
    }),
    system: z.object({
      system,
      section: z.enum(['summary', 'entity', 'apis', 'services', 'libraries']),
      entity: entityOutputSchema(z).optional(),
      page: pageOutputSchema(
        z,
        z.object({ name: z.string(), system: z.string().optional() }),
      ).optional(),
    }),
    members: z.object({
      system,
      members: pageOutputSchema(
        z,
        z.object({
          name: z.string(),
          namespace: z.string().optional(),
          entityRef: z.string(),
          displayName: z.unknown().optional(),
          entity: entityOutputSchema(z).optional(),
        }),
      ),
    }),
    entity: z.object({
      entityRef: z.string(),
      entity: entityOutputSchema(z),
    }),
  };
}
