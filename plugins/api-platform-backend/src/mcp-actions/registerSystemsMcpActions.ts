import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { LoggerService, AuthService } from '@backstage/backend-plugin-api';
import { SystemService } from '../services/SystemService';
import { ServiceService } from '../services/ServiceService';
import { ApiService } from '../services/ApiService';
import {
  MAX_LIST_LIMIT,
  SystemDefinition,
} from '@internal/plugin-api-platform-common';
import { stringifyEntityRef } from '@backstage/catalog-model';
import {
  logMcpActionExecution,
  logMcpActionRegistration,
  pageItems,
  READ_ONLY_ACTION_ATTRIBUTES,
} from '@internal/mcp-common/src';
import {
  CustomErrorBase,
  NotFoundError,
  ServiceUnavailableError,
} from '@backstage/errors';
import { apiPlatformOutputSchemas } from './outputSchemas';

function systemSummary(system: SystemDefinition) {
  return {
    name: system.entity?.metadata.name,
    system: system.entity?.metadata.name,
    namespace: system.entity?.metadata.namespace,
    entityRef: system.entity ? stringifyEntityRef(system.entity) : undefined,
    owner: system.entity?.spec?.owner?.toString() ?? '',
    counts: {
      apis: system.apis.length,
      services: system.services.length,
      libraries: system.libraries.length,
    },
  };
}

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

  logMcpActionRegistration(logger, 'System');

  actionsRegistry.register({
    name: 'get-systems',
    title: 'Catalog Systems by page',
    description: `
      Browse catalog entities of kind System across all owners. The systems
      page includes items, offset, limit, totalCount, and hasMore; each item
      exposes name, system (the canonical System name), namespace, entityRef,
      and owner directly. offset defaults to 0; limit
      defaults to 20; limit must be between 1 and ${MAX_LIST_LIMIT}. Request
      systems.nextOffset to continue. The catalog applies offset and limit
      before returning entities; this action does not load all Systems.
      Optional search matches name or owner.
      Optional orderBy sorts by one field: name, description, or owner
      (ascending or descending). Use get-system-by-name for one System's
      related API, service, and library names.
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
              field: z.enum(['name', 'description', 'owner']),
              direction: z.enum(['ascending', 'descending']),
            })
            .optional(),
        }),
      output: z => apiPlatformOutputSchemas(z).systems,
    },
    action: async ({ input }) => {
      logMcpActionExecution(logger, 'get-systems', input);
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
          systems: pageItems({
            ...systems,
            items: systems.items.map(entity => ({
              kind: entity.kind,
              name: entity.metadata.name,
              system: entity.metadata.name,
              namespace: entity.metadata.namespace,
              entityRef: stringifyEntityRef(entity),
              owner: entity.spec?.owner?.toString() ?? '',
            })),
          }),
        },
      };
    },
  });

  actionsRegistry.register({
    name: 'get-system-by-name',
    title: 'System details and related entity names',
    description: `
      Look up a catalog System by its exact metadata.name (name); no namespace
      input is supported. Team and DEFL are domain aliases for
      System terminology, not separate Group lookups and not a guarantee that
      a Group entity exists. Returns system with direct name, canonical system,
      namespace, entityRef, owner and counts for apis, services and libraries.
      section defaults to summary, without a raw entity or related-name arrays.
      Select section=apis, services or libraries for a page of {name, system};
      select section=entity for the projected raw catalog entity. offset defaults
      to 0; limit defaults to 20 (maximum 100); request page.nextOffset to continue.
      All related names are loaded before sorting and pagination in memory;
      limit bounds the response, not loading.
      Use
      get-systems to browse available Systems, or
      get-members-of-system-by-name for users matched through the System owner.
    `,
    attributes: READ_ONLY_ACTION_ATTRIBUTES,
    schema: {
      input: z =>
        z.object({
          name: z.string().describe('The name of the system to query'),
          section: z
            .enum(['summary', 'apis', 'services', 'libraries', 'entity'])
            .optional(),
          offset: z.number().int().min(0).optional(),
          limit: z.number().int().min(1).max(MAX_LIST_LIMIT).optional(),
        }),
      output: z => apiPlatformOutputSchemas(z).system,
    },
    action: async ({ input }) => {
      logMcpActionExecution(logger, 'get-system-by-name', input);

      const system = await systemService.getSystem(input.name);
      const section = input.section ?? 'summary';
      return {
        output: {
          system: systemSummary(system),
          section,
          ...(section === 'entity' ? { entity: system.entity } : {}),
          ...(section !== 'entity' && section !== 'summary'
            ? {
                page: pageItems(
                  [...system[section]].sort().map(name => ({
                    name,
                    system: system.entity?.metadata.name,
                  })),
                  input,
                ),
              }
            : {}),
        },
      };
    },
  });

  actionsRegistry.register({
    name: 'get-members-of-system-by-name',
    title: 'Users matching a System owner',
    description: `
      Find users for a catalog System identified by its exact metadata.name
      (name). Returns a System summary and members page; members are Users
      whose spec.memberOf matches the System's spec.owner. This is owner-group
      membership, not traversal of System relations; Team and DEFL aliases do
      not create or imply a Group entity. The system result includes direct
      name, canonical system, namespace, entityRef, and owner fields. A System
      with no owner cannot be queried this way. Use get-system-by-name for
      related APIs, services, and libraries instead.
      Default member summaries include name, namespace, entityRef and displayName.
      details=true includes the raw User entity. offset defaults to 0; limit
      defaults to 20 (maximum 100); request members.nextOffset to continue.
      Entries are sorted by canonical entityRef.
      All matching users are loaded before sorting and pagination in memory;
      limit bounds the response, not loading.
    `,
    attributes: READ_ONLY_ACTION_ATTRIBUTES,
    schema: {
      input: z =>
        z.object({
          name: z.string().describe('The name of the system to query'),
          details: z.boolean().optional(),
          offset: z.number().int().min(0).optional(),
          limit: z.number().int().min(1).max(MAX_LIST_LIMIT).optional(),
        }),
      output: z => apiPlatformOutputSchemas(z).members,
    },
    action: async ({ input }) => {
      logMcpActionExecution(logger, 'get-members-of-system-by-name', input);

      const system = await systemService.getSystem(input.name);

      if (!system) {
        throw new NotFoundError(`System with name ${input.name} not found`);
      }

      const owner = system.entity?.spec?.owner?.toString() ?? '';
      if (!owner) {
        throw new NotFoundError(`Owner for system ${input.name} not found`);
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
          if (error instanceof CustomErrorBase) {
            throw error;
          }
          throw new ServiceUnavailableError(
            `Failed to fetch members for system ${input.name}`,
            error,
          );
        }
      };

      const members = await fetchSystemMembers();

      const items = members
        .map(entity => ({
          name: entity.metadata.name,
          namespace: entity.metadata.namespace,
          entityRef: stringifyEntityRef(entity),
          displayName:
            entity.spec?.profile &&
            typeof entity.spec.profile === 'object' &&
            !Array.isArray(entity.spec.profile)
              ? entity.spec.profile.displayName
              : undefined,
          ...(input.details ? { entity } : {}),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      return {
        output: {
          system: systemSummary(system),
          members: pageItems(items, input),
        },
      };
    },
  });
}
