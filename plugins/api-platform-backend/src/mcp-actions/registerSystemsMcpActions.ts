import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { LoggerService, AuthService } from '@backstage/backend-plugin-api';
import { SystemService } from '../services/SystemService';
import { ServiceService } from '../services/ServiceService';
import { ApiService } from '../services/ApiService';
import type { OwnershipType } from '@internal/plugin-api-platform-common';

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
    title: 'Systems Action',
    description: 'Get All Systems (or Teams or DEFLs) information',
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    schema: {
      input: z =>
        z.object({
          ownershipType: z
            .string()
            .describe('The ownership type of the systems to query'),
        }),
      // TODO: is there a better way to do this?
      output: z => z.object({}).passthrough(),
    },
    action: async ({ input }) => {
      logger.debug('Executing get-systems action with input:', input);
      // Implement the logic to get the system information here

      const ownershipType = input.ownershipType as OwnershipType;

      const systems = await systemService.listSystems({
        ownershipType,
      });
      return {
        output: { systems },
      };
    },
  });

  actionsRegistry.register({
    name: 'get-system-by-name',
    title: 'System by Name Action',
    description: `
    Get System information.
    Aliases for System are Team and DEFL and can be used as well.
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
        output: { system },
      };
    },
  });

  actionsRegistry.register({
    name: 'get-members-of-system-by-name',
    title: 'Members of System by Name Action',
    description: `
    Get members of a System by Name.
    Aliases for System are Team and DEFL and can be used as well.
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
          console.error('Failed to fetch system members', error);
        }
        return [];
      };

      const members = await fetchSystemMembers();

      return {
        output: { system, members },
      };
    },
  });
}
