import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { LoggerService, AuthService } from '@backstage/backend-plugin-api';
import { SystemService } from '../services/SystemService';
import { ServiceService } from '../services/ServiceService';
import { ApiService } from '../services/ApiService';
import { MAX_LIST_LIMIT } from '@internal/plugin-api-platform-common';

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

  logger.info('Registering Service MCP actions');

  actionsRegistry.register({
    name: 'get-services',
    title: 'Service definitions and environments by page',
    description: `
      Browse service definitions across all Systems and owners. The services
      page includes items, offset, limit, totalCount, and hasMore. offset
      defaults to 0; limit defaults to 20 and must be between 1 and ${MAX_LIST_LIMIT}.
      Request offset + limit to continue. Optional search matches service name
      or System; orderBy sorts by name or System (ascending or descending)
      with stable tie-breaking. Optional dependsOn and dependentsType filter
      declared dependency relationships. Each service includes name,
      serviceName (the logical name), owner, system, and versions; each version
      contains environment records with imageVersion, entityRef (including the
      catalog namespace/name), platform, and declared dependencies. Use
      get-service-versions for one service, or
      get-service-dependencies for consumed/provided API relationships.
    `,
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
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
      // TODO: is there a better way to do this?
      output: z => z.object({}).passthrough(),
    },
    action: async ({ input }) => {
      logger.debug('Executing get-services action with input:', input);

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
        output: { services },
      };
    },
  });

  actionsRegistry.register({
    name: 'get-service-versions',
    title: 'Service versions by System and service name',
    description: `
      Retrieve the version and environment definitions for the service
      identified by its logical name (name) and System name (system). Returns
      service with name, serviceName, owner, system, and versions; each version
      contains its environment records. There is no version or environment
      filter, so all matching versions and environments are returned without
      pagination. If no catalog entry matches, the returned placeholder has an
      empty owner and versions array. Use get-services to discover service
      names, or get-service-dependencies for consumed/provided API relations.
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
            .describe('The name of the system of the service to query'),
          name: z.string().describe('The name of the service to query'),
        }),
      // TODO: is there a better way to do this?
      output: z => z.object({}).passthrough(),
    },
    action: async ({ input }) => {
      logger.debug('Executing get-service-version action with input:', input);
      const service = await serviceService.getServiceVersions({
        system: input.system,
        serviceName: input.name,
      });
      return {
        output: { service },
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
      There are no version, environment, or direction filters, so both consumed
      and provided API relations for every matching version and environment
      are returned. Each relations entry includes logical service name, system,
      namespace, entityRef, owner, environment, version, imageVersion, platform,
      and apis.consumed/provided arrays. Each API entry includes name, system,
      namespace, entityRef, owner, and version. These API relations are
      distinct from the declared dependencies included in get-services and
      get-service-versions.
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
            .describe('The name of the system of the service to query'),
          name: z.string().describe('The name of the service to query'),
          imageVersion: z
            .string()
            .optional()
            .describe('Optional exact service image version to filter by'),
        }),
      // TODO: is there a better way to do this?
      output: z => z.object({}).passthrough(),
    },
    action: async ({ input }) => {
      logger.debug(
        'Executing get-service-dependencies action with input:',
        input,
      );
      const relations = await serviceService.getServiceRelations({
        system: input.system,
        serviceName: input.name,
        imageVersion: input.imageVersion,
      });
      return {
        output: { relations },
      };
    },
  });
}
