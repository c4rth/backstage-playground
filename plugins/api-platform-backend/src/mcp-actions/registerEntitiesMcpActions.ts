import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import { InputError, NotFoundError } from '@backstage/errors';
import {
  logMcpActionExecution,
  logMcpActionRegistration,
  READ_ONLY_ACTION_ATTRIBUTES,
} from '@internal/mcp-common/src';
import { apiPlatformOutputSchemas } from './outputSchemas';

export function registerEntitiesMcpActions(options: {
  actionsRegistry: ActionsRegistryService;
  logger: LoggerService;
  auth: AuthService;
  catalog: CatalogService;
}) {
  const { actionsRegistry, logger, auth, catalog } = options;

  logMcpActionRegistration(logger, 'Entity');

  actionsRegistry.register({
    name: 'get-entity-by-ref',
    title: 'Complete catalog entity by canonical reference',
    description: `
      Retrieve one complete catalog entity using entityRef in kind:namespace/name
      format, for example api:default/example or component:default/my-service.
      Copy entityRef directly from API Platform list, version or dependency
      results. Kind and namespace are required; no defaults or logical-name
      reconstruction are applied. Supports any catalog kind, not just APIs,
      services or Systems. Returns canonical entityRef and the full entity,
      including metadata, spec and relations wherever present, without projection,
      pagination or chunking. Invalid references and missing entities are errors.
      Use get-apis, get-services or get-systems for discovery; use the dependency
      tools for resolved relationship summaries rather than raw catalog relations.
    `,
    attributes: READ_ONLY_ACTION_ATTRIBUTES,
    schema: {
      input: z =>
        z.object({
          entityRef: z
            .string()
            .trim()
            .min(1)
            .describe('Full catalog reference in kind:namespace/name format'),
        }),
      output: z => apiPlatformOutputSchemas(z).entity,
    },
    action: async ({ input }) => {
      const ref = input.entityRef.trim();
      if (!/^[^:/\s]+:[^:/\s]+\/[^:/\s]+$/.test(ref)) {
        throw new InputError('entityRef must use kind:namespace/name format');
      }
      const entityRef = stringifyEntityRef(parseEntityRef(ref));
      logMcpActionExecution(logger, 'get-entity-by-ref', { entityRef });
      const entity = await catalog.getEntityByRef(entityRef, {
        credentials: await auth.getOwnServiceCredentials(),
      });
      if (!entity) {
        throw new NotFoundError(`Entity ${entityRef} not found`);
      }
      return { output: { entityRef: stringifyEntityRef(entity), entity } };
    },
  });
}
