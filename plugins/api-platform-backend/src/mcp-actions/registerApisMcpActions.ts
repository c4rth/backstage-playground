import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { LoggerService, AuthService } from '@backstage/backend-plugin-api';
import { SystemService } from '../services/SystemService';
import { ServiceService } from '../services/ServiceService';
import { ApiService } from '../services/ApiService';
import type { OpenApiType } from '@internal/plugin-api-platform-common';
import {
  ANNOTATION_API_NAME,
  ANNOTATION_API_PROJECT,
  ANNOTATION_API_TYPE,
  ANNOTATION_API_VERSION,
} from '@internal/plugin-api-platform-common';
import { stringifyEntityRef } from '@backstage/catalog-model';

export function registerApisMcpActions(options: {
  actionsRegistry: ActionsRegistryService;
  logger: LoggerService;
  catalog: CatalogService;
  auth: AuthService;
  systemService: SystemService;
  serviceService: ServiceService;
  apiService: ApiService;
}) {
  const { actionsRegistry, logger, apiService } = options;

  logger.info('Registering API MCP actions');

  actionsRegistry.register({
    name: 'get-apis',
    title: 'Latest API entities by type and page',
    description: `
      Browse API catalog entities by the required apiType: all, enterprise,
      public, experience, inner, third-party, or mca. Returns apis as a list
      envelope with items, offset, limit, and totalCount; each item is the
      latest semantic version for one logical API name and System, not every
      version. Each item exposes name, system, namespace, entityRef, version,
      type, project, description, and owner as direct fields. The scope
      includes all owners. offset defaults to 0; limit
      defaults to 20; limit must be between 1 and 100. hasMore indicates
      whether another page exists; request offset + limit to continue.
      Optional search matches API name, System, project, type, or description.
      Optional orderBy sorts by name, description, System, or type (ascending
      or descending), with
      stable tie-breaking. Use get-api-versions-by-name to list every version
      of a known API, or get-api-by-name-and-version to retrieve one version.
    `,
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    schema: {
      input: z =>
        z.object({
          apiType: z
            .custom<OpenApiType>()
            .describe('The type of the API to query'),
          offset: z.number().int().min(0).optional(),
          limit: z.number().int().min(1).max(100).optional(),
          search: z.string().optional(),
          orderBy: z
            .object({
              field: z.enum(['name', 'description', 'system', 'type']),
              direction: z.enum(['ascending', 'descending']),
            })
            .optional(),
        }),
      // TODO: is there a better way to do this?
      output: z => z.object({}).passthrough(),
    },
    action: async ({ input }) => {
      logger.debug('Executing get-apis action with input:', input);
      const apis = await apiService.listApis({
        apiType: input.apiType,
        ownershipType: 'all',
        offset: input.offset,
        limit: input.limit,
        search: input.search,
        orderBy: input.orderBy,
      });
      return {
        output: {
          apis: {
            ...apis,
            items: apis.items.map(entity => ({
              name:
                entity.metadata.annotations?.[
                  ANNOTATION_API_NAME
                ]?.toString() ?? entity.metadata.name,
              system: entity.spec?.system?.toString(),
              namespace: entity.metadata.namespace,
              entityRef: stringifyEntityRef(entity),
              version:
                entity.metadata.annotations?.[
                  ANNOTATION_API_VERSION
                ]?.toString() ?? '',
              type:
                entity.metadata.annotations?.[
                  ANNOTATION_API_TYPE
                ]?.toString() ?? '',
              project:
                entity.metadata.annotations?.[
                  ANNOTATION_API_PROJECT
                ]?.toString() ?? '',
              description: entity.metadata.description?.toString() ?? '',
              owner: entity.spec?.owner?.toString() ?? '',
            })),
          },
        },
      };
    },
  });

  actionsRegistry.register({
    name: 'get-api-versions-by-name',
    title: 'API versions by API name, optionally scoped to a System',
    description: `
      List every version for the logical API name supplied in name. Optionally
      provide system to restrict results to that System; omit it to search
      across all Systems. Team and DEFL are domain aliases for System names;
      they do not trigger a Group lookup or imply that a Group entity exists.
      Returns apis as entries with name, system, namespace, entityRef, version,
      and project, sorted by descending semantic version; there is no
      pagination. Pass name, system, and version directly to
      get-api-dependencies. Use get-apis to discover logical API names, or
      get-api-by-name-and-version to retrieve a specific version.
    `,
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    schema: {
      input: z =>
        z.object({
          system: z
            .string()
            .optional()
            .describe('Optional System name to scope the API lookup'),
          name: z.string().describe('The name of the API to query'),
        }),
      output: z => z.object({}).passthrough(),
    },
    action: async ({ input }) => {
      logger.debug(
        'Executing get-api-versions-by-name action with input:',
        input,
      );

      const apis = await apiService.getApiVersions({
        system: input.system,
        apiName: input.name,
      });
      return {
        output: { apis },
      };
    },
  });

  actionsRegistry.register({
    name: 'get-api-by-name-and-version',
    title: 'API details by name and version, optionally scoped to a System',
    description: `
      Retrieve an API version using its logical API name (name) and version.
      Optionally provide system to restrict the lookup to that System; omit it
      to search across all Systems. The version is matched by prefix, not exact
      equality, and the first matching catalog entity is returned. The output
      field api contains name, system, namespace, entityRef, version, and
      project; it can be undefined when there is no match. Team and DEFL are
      domain aliases for System names, not Group lookups. If a version prefix
      could match multiple releases or Systems, first use
      get-api-versions-by-name to choose a more
      specific result. Use get-apis to discover API names.
    `,
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    schema: {
      input: z =>
        z.object({
          system: z
            .string()
            .optional()
            .describe('Optional System name to scope the API lookup'),
          name: z.string().describe('The name of the API to query'),
          version: z.string().describe('The version of the API to query'),
        }),
      output: z => z.object({}).passthrough(),
    },
    action: async ({ input }) => {
      logger.debug(
        'Executing get-api-by-name-and-version action with input:',
        input,
      );

      const api = await apiService.getApiMatchingVersion({
        system: input.system,
        apiName: input.name,
        apiVersion: input.version,
      });
      return {
        output: { api },
      };
    },
  });

  actionsRegistry.register({
    name: 'get-api-dependencies',
    title:
      'Consumer and provider services by API, optionally scoped to a System',
    description: `
      Find services related to a logical API name (name). Optionally provide
      system to restrict results to that System; omit it to search across all
      Systems. Team and DEFL are domain aliases for System names; they do not
      imply a Group entity. The required version is matched exactly. Returns
      consumer and provider arrays grouped by API identity, including name,
      system, namespace, entityRef, apiVersion, and version. Each related
      service includes name, system, namespace, entityRef, owner, environment,
      version, imageVersion, and platform. Pass name, system, and version
      directly from get-api-versions-by-name; omit system only to search all
      Systems.
    `,
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    schema: {
      input: z =>
        z.object({
          system: z
            .string()
            .optional()
            .describe('Optional System name to scope the API lookup'),
          name: z.string().describe('The name of the API to query'),
          version: z.string().describe('The version of the API to query'),
        }),
      output: z => z.object({}).passthrough(),
    },
    action: async ({ input }) => {
      logger.debug('Executing get-api-dependencies action with input:', input);
      const consumerServices = await apiService.getApiRelations({
        system: input.system,
        apiName: input.name,
        apiVersion: input.version,
        relationType: 'consumer',
      });
      const providerServices = await apiService.getApiRelations({
        system: input.system,
        apiName: input.name,
        apiVersion: input.version,
        relationType: 'provider',
      });
      return {
        output: {
          consumer: consumerServices,
          provider: providerServices,
        },
      };
    },
  });
}
