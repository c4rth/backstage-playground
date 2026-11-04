import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { LoggerService, AuthService } from '@backstage/backend-plugin-api';
import { SystemService } from '../services/SystemService';
import { ServiceService } from '../services/ServiceService';
import { ApiService } from '../services/ApiService';
import { MAX_LIST_LIMIT } from '@internal/plugin-api-platform-common';
import {
  logMcpActionExecution,
  logMcpActionRegistration,
  pageItems,
  READ_ONLY_ACTION_ATTRIBUTES,
} from '@internal/mcp-common/src';
import { parseEntityRef } from '@backstage/catalog-model';
import { apiPlatformOutputSchemas } from './outputSchemas';

export function registerServicesMcpActions(options: {
  actionsRegistry: ActionsRegistryService;
  logger: LoggerService;
  catalog: CatalogService;
  auth: AuthService;
  systemService: SystemService;
  serviceService: ServiceService;
  apiService: ApiService;
}) {
  const { actionsRegistry, logger, serviceService } = options;

  logMcpActionRegistration(logger, 'Service');

  actionsRegistry.register({
    name: 'get-services',
    title: 'Service summaries by page',
    description: `
      Browse service definitions across all Systems and owners. The services
      page includes items, offset, limit, totalCount, and hasMore. offset
      defaults to 0; limit defaults to 20 and must be between 1 and ${MAX_LIST_LIMIT}.
      Request services.nextOffset to continue. All matching catalog entities
      are loaded and grouped before pagination in memory; limit bounds the
      response, not loading. Optional search matches service name
      or System; orderBy sorts by name or System (ascending or descending)
      with stable tie-breaking. Optional dependsOn and dependentsType filter
      declared dependency relationships. Each summary includes name and
      serviceName (both logical names), catalogName (the synthesized name),
      owner, system, versionCount and environmentCount. No environment
      definitions or dependency arrays are included. Use get-service-versions
      with section=environments or section=dependencies to retrieve them, or
      get-service-dependencies for consumed/provided API relationships.
    `,
    attributes: READ_ONLY_ACTION_ATTRIBUTES,
    schema: {
      input: z =>
        z.object({
          offset: z.number().int().min(0).optional(),
          limit: z.number().int().min(1).max(MAX_LIST_LIMIT).optional(),
          search: z.string().optional(),
          orderBy: z
            .object({
              field: z.enum(['name', 'system']),
              direction: z.enum(['ascending', 'descending']),
            })
            .optional(),
          dependsOn: z.string().optional(),
          dependentsType: z.enum(['all', 'yes', 'no']).optional(),
        }),
      output: z => apiPlatformOutputSchemas(z).services,
    },
    action: async ({ input }) => {
      logMcpActionExecution(logger, 'get-services', input);

      const services = await serviceService.listServices({
        ownershipType: 'all',
        offset: input.offset,
        limit: input.limit,
        search: input.search,
        orderBy: input.orderBy,
        dependsOn: input.dependsOn,
        dependentsType: input.dependentsType,
      });
      return {
        output: {
          services: pageItems({
            ...services,
            items: services.items.map(service => ({
              name: service.serviceName,
              serviceName: service.serviceName,
              catalogName: service.name,
              owner: service.owner,
              system: service.system,
              versionCount: service.versions.length,
              environmentCount: service.versions.reduce(
                (count, version) =>
                  count + Object.keys(version.environments).length,
                0,
              ),
            })),
          }),
        },
      };
    },
  });

  actionsRegistry.register({
    name: 'get-service-versions',
    title: 'Service versions by System and service name',
    description: `
      Browse a service's versions by logical name (name) and System (system).
      Returns service identity and a page. section defaults to versions: items
      contain version and available environment names only. section=environments
      returns version, environment, imageVersion, entityRef, namespace, platform
      and dependencyCount; section=dependencies returns one declared dependency
      per item with those environment identifiers. Optional version and
      environment filters match exactly. offset defaults to 0; limit defaults
      to 20 (maximum 100); request page.nextOffset to continue. All matching
      service versions and environments are loaded before filtering, sorting
      and pagination in memory; limit bounds the response, not loading. A missing service
      has an empty owner and page. Use get-services to discover service
      names, or get-service-dependencies for consumed/provided API relations.
    `,
    attributes: READ_ONLY_ACTION_ATTRIBUTES,
    schema: {
      input: z =>
        z.object({
          system: z
            .string()
            .describe('The name of the system of the service to query'),
          name: z.string().describe('The name of the service to query'),
          section: z
            .enum(['versions', 'environments', 'dependencies'])
            .optional(),
          version: z.string().optional(),
          environment: z.string().optional(),
          offset: z.number().int().min(0).optional(),
          limit: z.number().int().min(1).max(MAX_LIST_LIMIT).optional(),
        }),
      output: z => apiPlatformOutputSchemas(z).serviceVersions,
    },
    action: async ({ input }) => {
      logMcpActionExecution(logger, 'get-service-version', input);
      const service = await serviceService.getServiceVersions({
        system: input.system,
        serviceName: input.name,
      });
      const versions = service.versions.filter(
        v => !input.version || v.version === input.version,
      );
      const environments = versions
        .flatMap(v =>
          Object.entries(v.environments)
            .filter(
              ([environment]) =>
                !input.environment || environment === input.environment,
            )
            .map(([environment, definition]) => ({
              version: v.version,
              environment,
              ...definition,
              namespace: parseEntityRef(definition.entityRef).namespace,
            })),
        )
        .sort(
          (a, b) =>
            a.version.localeCompare(b.version, undefined, { numeric: true }) ||
            a.environment.localeCompare(b.environment) ||
            a.entityRef.localeCompare(b.entityRef),
        );
      const section = input.section ?? 'versions';
      const items = (() => {
        if (section === 'versions') {
          return versions
            .filter(
              v =>
                !input.environment ||
                Object.keys(v.environments).includes(input.environment),
            )
            .map(v => ({
              version: v.version,
              environments: Object.keys(v.environments)
                .filter(e => !input.environment || e === input.environment)
                .sort(),
            }))
            .sort((a, b) =>
              a.version.localeCompare(b.version, undefined, { numeric: true }),
            );
        }
        if (section === 'environments') {
          return environments.map(({ dependencies, ...environment }) => ({
            ...environment,
            dependencyCount: dependencies.length,
          }));
        }
        return environments.flatMap(({ dependencies, ...environment }) =>
          [...dependencies]
            .sort()
            .map(dependency => ({ ...environment, dependency })),
        );
      })();
      return {
        output: {
          service: {
            name: service.serviceName,
            serviceName: service.serviceName,
            catalogName: service.name,
            system: service.system,
            owner: service.owner,
          },
          section,
          page: pageItems<(typeof items)[number]>(items, input),
        },
      };
    },
  });

  actionsRegistry.register({
    name: 'get-service-dependencies',
    title: 'Consumed and provided APIs by service',
    description: `
      Find API relationships for the service identified by its logical name
      (name) and System name (system). Optional imageVersion restricts results
      to service catalog entities with that exact image-version annotation.
      Optional version and environment match exactly; direction defaults to all
      (consumed and provided). By default returns summary with environmentCount,
      consumedCount and providedCount. details=true returns relations as a page
      of {direction, service, api}, one API relationship per item. Service fields
      include logical name, system, namespace, entityRef, owner, environment,
      version, imageVersion and platform; API fields include name, system,
      namespace, entityRef, owner and version. offset defaults to 0; limit defaults
      to 20 (maximum 100); request relations.nextOffset to continue.
      All matching relations are loaded and resolved before filtering, sorting
      and pagination in memory; limit bounds the response, not loading. These API
      relations differ from declared dependencies in get-service-versions
      section=dependencies.
    `,
    attributes: READ_ONLY_ACTION_ATTRIBUTES,
    schema: {
      input: z =>
        z.object({
          system: z
            .string()
            .describe('The name of the system of the service to query'),
          name: z.string().describe('The name of the service to query'),
          imageVersion: z
            .string()
            .optional()
            .describe('Optional exact service image version to filter by'),
          details: z.boolean().optional(),
          version: z.string().optional(),
          environment: z.string().optional(),
          direction: z.enum(['all', 'consumed', 'provided']).optional(),
          offset: z.number().int().min(0).optional(),
          limit: z.number().int().min(1).max(MAX_LIST_LIMIT).optional(),
        }),
      output: z => apiPlatformOutputSchemas(z).serviceDependencies,
    },
    action: async ({ input }) => {
      logMcpActionExecution(logger, 'get-service-dependencies', input);
      const relations = await serviceService.getServiceRelations({
        system: input.system,
        serviceName: input.name,
        imageVersion: input.imageVersion,
      });
      const environments = relations.filter(
        r =>
          (!input.version || r.version === input.version) &&
          (!input.environment || r.environment === input.environment),
      );
      const items = environments
        .flatMap(({ apis, ...service }) => [
          ...apis.consumed.map(api => ({
            direction: 'consumed' as const,
            service,
            api,
          })),
          ...apis.provided.map(api => ({
            direction: 'provided' as const,
            service,
            api,
          })),
        ])
        .filter(
          r =>
            !input.direction ||
            input.direction === 'all' ||
            r.direction === input.direction,
        )
        .sort(
          (a, b) =>
            a.service.entityRef.localeCompare(b.service.entityRef) ||
            a.direction.localeCompare(b.direction) ||
            a.api.entityRef.localeCompare(b.api.entityRef),
        );
      return {
        output: {
          name: input.name,
          system: input.system,
          summary: {
            environmentCount: environments.length,
            consumedCount: items.filter(r => r.direction === 'consumed').length,
            providedCount: items.filter(r => r.direction === 'provided').length,
          },
          ...(input.details ? { relations: pageItems(items, input) } : {}),
        },
      };
    },
  });
}
