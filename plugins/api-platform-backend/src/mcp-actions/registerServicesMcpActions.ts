import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { LoggerService, AuthService } from '@backstage/backend-plugin-api';
import { SystemService } from '../services/SystemService';
import { ServiceService } from '../services/ServiceService';
import { ApiService } from '../services/ApiService';
import type { OwnershipType } from '@internal/plugin-api-platform-common';

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
    title: 'Services Action',
    description: `
      Get All Services information.
      No dependencies are provided.
    `,
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    schema: {
      input: z =>
        z.object({
          ownershipType: z
            .custom<OwnershipType>()
            .describe('The ownership type of the services to query'),
        }),
      // TODO: is there a better way to do this?
      output: z => z.object({}).passthrough(),
    },
    action: async ({ input }) => {
      logger.debug('Executing get-services action with input:', input);

      const services = await serviceService.listServices({
        ownershipType: input.ownershipType,
      });
      return {
        output: { services },
      };
    },
  });

  actionsRegistry.register({
    name: 'get-service-versions',
    title: 'Service Versions Action',
    description: 'Get Service Versions information',
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
    title: 'Service Dependencies Action',
    description: `
    Get Service dependencies information by name and version.
    The dependencies include both consumed and provided APIs relationships of the service.
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
      logger.debug(
        'Executing get-service-dependencies action with input:',
        input,
      );
      const relations = await serviceService.getServiceRelations({
        system: input.system,
        serviceName: input.name,
      });
      return {
        output: { relations },
      };
    },
  });
}
