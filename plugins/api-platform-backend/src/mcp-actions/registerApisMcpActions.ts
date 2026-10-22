import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { LoggerService, AuthService } from '@backstage/backend-plugin-api';
import { SystemService } from '../services/SystemService';
import { ServiceService } from '../services/ServiceService';
import { ApiService } from '../services/ApiService';
import type {
  OwnershipType,
  OpenApiType,
} from '@internal/plugin-api-platform-common';

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
    title: 'APIs Action',
    description: 'Get All APIs information',
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
          ownershipType: z
            .custom<OwnershipType>()
            .describe('The ownership type of the APIs to query'),
        }),
      // TODO: is there a better way to do this?
      output: z => z.object({}).passthrough(),
    },
    action: async ({ input }) => {
      logger.debug('Executing get-apis action with input:', input);

      const apis = await apiService.listApis({
        apiType: input.apiType,
        ownershipType: input.ownershipType,
      });
      return {
        output: { apis },
      };
    },
  });

  actionsRegistry.register({
    name: 'get-api-versions-by-name',
    title: 'API versions by System Name Query Action',
    description: `
    Get API versions for a System by Name.
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
          system: z.string().describe('The system of the API to query'),
          name: z.string().describe('The name of the API to query'),
        }),
      output: z => z.object({}).passthrough(),
    },
    action: async ({ input }) => {
      logger.debug(
        'Executing get-api-versions-by-system action with input:',
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
    name: 'get-api-by-name',
    title: 'API by Name Action',
    description: 'Get API information by name',
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    schema: {
      input: z =>
        z.object({
          system: z.string().describe('The system of the API to query'),
          name: z.string().describe('The name of the API to query'),
        }),
      output: z => z.object({}).passthrough(),
    },
    action: async ({ input }) => {
      logger.debug('Executing get-api-by-name action with input:', input);

      const api = await apiService.getApiVersions({
        system: input.system,
        apiName: input.name,
      });
      return {
        output: { api },
      };
    },
  });

  actionsRegistry.register({
    name: 'get-api-by-name-and-version',
    title: 'API by Name and Version Action',
    description: 'Get API information by name and version',
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    schema: {
      input: z =>
        z.object({
          system: z.string().describe('The system of the API to query'),
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
}
