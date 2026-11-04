import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { LoggerService, AuthService } from '@backstage/backend-plugin-api';
import { SystemService } from '../services/SystemService';
import { ServiceService } from '../services/ServiceService';
import { ApiService } from '../services/ApiService';
import {
  ANNOTATION_API_NAME,
  ANNOTATION_API_PROJECT,
  ANNOTATION_API_TYPE,
  ANNOTATION_API_VERSION,
  OPENAPITYPE_LIST,
} from '@internal/plugin-api-platform-common';
import { stringifyEntityRef } from '@backstage/catalog-model';
import {
  logMcpActionExecution,
  logMcpActionRegistration,
  pageItems,
  READ_ONLY_ACTION_ATTRIBUTES,
} from '@internal/mcp-common/src';
import { NotFoundError } from '@backstage/errors';
import { apiPlatformOutputSchemas } from './outputSchemas';

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

  logMcpActionRegistration(logger, 'API');

  actionsRegistry.register({
    name: 'get-apis',
    title: 'Latest API entities by type and page',
    description: `
      Browse API catalog entities by the required apiType: all, enterprise,
      public, experience, inner, third-party, or mca. Returns apis as a list
      envelope with items, offset, limit, and totalCount; each item is the
      latest semantic version for one logical API name and System, not every
      version. Each item exposes name, system, namespace, entityRef, version,
      type, project, complete description, and owner as direct fields.
      All fields for the selected page are returned without truncation or
      JSON chunking.
      The scope
      includes all owners. offset defaults to 0; limit
      defaults to 20; limit must be between 1 and 100. hasMore indicates
      whether another page exists; request apis.nextOffset to continue.
      Pagination occurs in memory after loading all matching catalog entities
      and grouping their latest versions; limit bounds the response, not loading.
      Optional search matches API name, System, project, type, or description.
      Optional orderBy sorts by name, description, System, or type (ascending
      or descending), with
      stable tie-breaking. Use get-api-versions-by-name to list every version
      of a known API, or get-api-by-name-and-version to retrieve one version.
    `,
    attributes: READ_ONLY_ACTION_ATTRIBUTES,
    schema: {
      input: z =>
        z.object({
          apiType: z
            .enum(OPENAPITYPE_LIST)
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
      output: z => apiPlatformOutputSchemas(z).apis,
    },
    action: async ({ input }) => {
      logMcpActionExecution(logger, 'get-apis', input);
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
          apis: pageItems({
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
          }),
        },
      };
    },
  });

  actionsRegistry.register({
    name: 'get-api-versions-by-name',
    title: 'API versions by API name, optionally scoped to a System',
    description: `
      List all versions for the logical API name supplied in name. Optionally
      provide system to restrict results to that System; omit it to search
      across all Systems. Team and DEFL are domain aliases for System names;
      they do not trigger a Group lookup or imply that a Group entity exists.
      Returns apis as an array containing every matching version.
      Entries include name, system, namespace, entityRef, version and project,
      sorted by descending semantic version. There is no pagination,
      truncation or JSON chunking.
      Pass name, system, and version directly to
      get-api-dependencies. Use get-apis to discover logical API names, or
      get-api-by-name-and-version to retrieve a specific version.
    `,
    attributes: READ_ONLY_ACTION_ATTRIBUTES,
    schema: {
      input: z =>
        z.object({
          system: z
            .string()
            .optional()
            .describe('Optional System name to scope the API lookup'),
          name: z.string().describe('The name of the API to query'),
        }),
      output: z => apiPlatformOutputSchemas(z).apiVersions,
    },
    action: async ({ input }) => {
      logMcpActionExecution(logger, 'get-api-versions-by-name', input);

      const apis = await apiService.getApiVersions({
        system: input.system,
        apiName: input.name,
      });
      return { output: { apis } };
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
      project. Missing APIs are reported as not found. Team and DEFL are
      domain aliases for System names, not Group lookups. If a version prefix
      could match multiple releases or Systems, first use
      get-api-versions-by-name to choose a more
      specific result. Use get-apis to discover API names.
    `,
    attributes: READ_ONLY_ACTION_ATTRIBUTES,
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
      output: z => apiPlatformOutputSchemas(z).api,
    },
    action: async ({ input }) => {
      logMcpActionExecution(logger, 'get-api-by-name-and-version', input);

      const api = await apiService.getApiMatchingVersion({
        system: input.system,
        apiName: input.name,
        apiVersion: input.version,
      });
      if (!api) {
        throw new NotFoundError(
          `API ${input.name} version ${input.version} not found`,
        );
      }
      return { output: { api } };
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
      imply a Group entity. The required version is matched exactly.
      By default returns summary with consumerCount and providerCount (service
      environment relationships, not distinct logical services). details=true
      returns relations as a page of {direction, api, service, lifecycle}.
      API/service fields include reusable name, system, namespace, entityRef
      and version identifiers; services also include environment, imageVersion,
      owner and platform. direction defaults to all; environment is an optional
      exact filter. offset defaults to 0; limit defaults to 20 (maximum 100);
      request relations.nextOffset to continue. All matching relations are
      loaded, resolved, filtered and sorted before pagination in memory;
      limit bounds the response, not loading. Pass name, system, and version
      directly from get-api-versions-by-name; omit system only to search all
      Systems.
    `,
    attributes: READ_ONLY_ACTION_ATTRIBUTES,
    schema: {
      input: z =>
        z.object({
          system: z
            .string()
            .optional()
            .describe('Optional System name to scope the API lookup'),
          name: z.string().describe('The name of the API to query'),
          version: z.string().describe('The version of the API to query'),
          details: z.boolean().optional(),
          direction: z.enum(['all', 'consumer', 'provider']).optional(),
          environment: z.string().optional(),
          offset: z.number().int().min(0).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        }),
      output: z => apiPlatformOutputSchemas(z).apiDependencies,
    },
    action: async ({ input }) => {
      logMcpActionExecution(logger, 'get-api-dependencies', input);
      const [consumerServices, providerServices] = await Promise.all([
        apiService.getApiRelations({
          system: input.system,
          apiName: input.name,
          apiVersion: input.version,
          relationType: 'consumer',
        }),
        apiService.getApiRelations({
          system: input.system,
          apiName: input.name,
          apiVersion: input.version,
          relationType: 'provider',
        }),
      ]);
      const relations = [
        ...consumerServices.flatMap(({ services, ...api }) =>
          services.map(({ service, lifecycle }) => ({
            direction: 'consumer' as const,
            api,
            service,
            lifecycle,
          })),
        ),
        ...providerServices.flatMap(({ services, ...api }) =>
          services.map(({ service, lifecycle }) => ({
            direction: 'provider' as const,
            api,
            service,
            lifecycle,
          })),
        ),
      ]
        .filter(
          relation =>
            (!input.direction ||
              input.direction === 'all' ||
              relation.direction === input.direction) &&
            (!input.environment ||
              relation.service.environment === input.environment),
        )
        .sort(
          (a, b) =>
            a.api.entityRef.localeCompare(b.api.entityRef) ||
            a.direction.localeCompare(b.direction) ||
            a.service.entityRef.localeCompare(b.service.entityRef),
        );
      return {
        output: {
          name: input.name,
          system: input.system,
          version: input.version,
          summary: {
            consumerCount: relations.filter(r => r.direction === 'consumer')
              .length,
            providerCount: relations.filter(r => r.direction === 'provider')
              .length,
          },
          ...(input.details ? { relations: pageItems(relations, input) } : {}),
        },
      };
    },
  });
}
