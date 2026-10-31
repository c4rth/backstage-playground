import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { LoggerService, AuthService } from '@backstage/backend-plugin-api';
import { SystemService } from '../services/SystemService';
import { ServiceService } from '../services/ServiceService';
import { ApiService } from '../services/ApiService';
import { MAX_LIST_LIMIT } from '@internal/plugin-api-platform-common';
import { stringifyEntityRef } from '@backstage/catalog-model';

export function registerSystemsMcpActions(options: {
  actionsRegistry: ActionsRegistryService;
  logger: LoggerService;
  auth: AuthService;
  catalog: CatalogService;
  systemService: SystemService;
  serviceService: ServiceService;
  apiService: ApiService;
}) {
  const { actionsRegistry, logger, catalog, auth, systemService } = options;

  logger.info('Registering System MCP actions');

  actionsRegistry.register({
    name: 'get-systems',
    title: 'Catalog Systems by page',
    description: `
      Browse catalog entities of kind System across all owners. The systems
      page includes items, offset, limit, totalCount, and hasMore; each item
      exposes name, system (the canonical System name), namespace, entityRef,
      and owner directly. offset defaults to 0; limit
      defaults to 20; limit must be between 1 and ${MAX_LIST_LIMIT}. Request
      offset + limit to continue. Optional search matches name or owner.
      Optional orderBy sorts by one field: name, description, or owner
      (ascending or descending). Use get-system-by-name for one System's
      related API, service, and library names.
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
              field: z.enum(['name', 'description', 'owner']),
              direction: z.enum(['ascending', 'descending']),
            })
            .optional(),
        }),
      // TODO: is there a better way to do this?
      output: z => z.object({}).passthrough(),
    },
    action: async ({ input }) => {
      logger.debug('Executing get-systems action with input:', input);
      // Implement the logic to get the system information here

      const systems = await systemService.listSystems({
        ownershipType: 'all',
        offset: input.offset,
        limit: input.limit,
        search: input.search,
        orderBy: input.orderBy,
      });
      return {
        output: {
          systems: {
            ...systems,
            items: systems.items.map(entity => ({
              kind: entity.kind,
              name: entity.metadata.name,
              system: entity.metadata.name,
              namespace: entity.metadata.namespace,
              entityRef: stringifyEntityRef(entity),
              owner: entity.spec?.owner?.toString() ?? '',
            })),
          },
        },
      };
    },
  });

  actionsRegistry.register({
    name: 'get-system-by-name',
    title: 'System details and related entity names',
    description: `
      Look up a catalog System by its exact metadata.name (name); no namespace
      input or pagination is supported. Team and DEFL are domain aliases for
      System terminology, not separate Group lookups and not a guarantee that
      a Group entity exists. Returns system with direct name, canonical system,
      namespace, entityRef, owner, and catalog entity fields, plus deduplicated
      apis, services, and libraries arrays of related logical names. Use
      get-systems to browse available Systems, or
      get-members-of-system-by-name for users matched through the System owner.
    `,
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    schema: {
      input: z =>
        z.object({
          name: z.string().describe('The name of the system to query'),
        }),
      // TODO: is there a better way to do this?
      output: z => z.object({}).passthrough(),
    },
    action: async ({ input }) => {
      logger.debug('Executing get-system-by-name action with input:', input);

      const system = await systemService.getSystem(input.name);
      return {
        output: {
          system: {
            ...system,
            name: system.entity?.metadata.name,
            system: system.entity?.metadata.name,
            namespace: system.entity?.metadata.namespace,
            entityRef: system.entity
              ? stringifyEntityRef(system.entity)
              : undefined,
            owner: system.entity?.spec?.owner?.toString() ?? '',
          },
        },
      };
    },
  });

  actionsRegistry.register({
    name: 'get-members-of-system-by-name',
    title: 'Users matching a System owner',
    description: `
      Find users for a catalog System identified by its exact metadata.name
      (name). Returns system and members; members are User catalog entities
      whose spec.memberOf matches the System's spec.owner. This is owner-group
      membership, not traversal of System relations; Team and DEFL aliases do
      not create or imply a Group entity. The system result includes direct
      name, canonical system, namespace, entityRef, and owner fields. A System
      with no owner cannot be queried this way. Use get-system-by-name for
      related APIs, services, and libraries instead.
    `,
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    schema: {
      input: z =>
        z.object({
          name: z.string().describe('The name of the system to query'),
        }),
      // TODO: is there a better way to do this?
      output: z => z.object({}).passthrough(),
    },
    action: async ({ input }) => {
      logger.debug(
        'Executing get-members-of-system-by-name action with input:',
        input,
      );

      const system = await systemService.getSystem(input.name);

      if (!system) {
        throw new Error(`System with name ${input.name} not found`);
      }

      const owner = system.entity?.spec?.owner?.toString() ?? '';
      if (!owner) {
        throw new Error(`Owner for system ${input.name} not found`);
      }

      const fetchSystemMembers = async () => {
        try {
          const response = await catalog.getEntities(
            {
              filter: {
                kind: ['User'],
                // Find entities where 'partOf' points to your system
                'spec.memberOf': owner,
              },
            },
            { credentials: await auth.getOwnServiceCredentials() },
          );

          const childEntities = response.items;

          return childEntities;
        } catch (error) {
          throw new Error(`Failed to fetch members for system ${input.name}`);
        }
      };

      const members = await fetchSystemMembers();

      return {
        output: {
          system: {
            ...system,
            name: system.entity?.metadata.name,
            system: system.entity?.metadata.name,
            namespace: system.entity?.metadata.namespace,
            entityRef: system.entity
              ? stringifyEntityRef(system.entity)
              : undefined,
            owner,
          },
          members,
        },
      };
    },
  });
}
