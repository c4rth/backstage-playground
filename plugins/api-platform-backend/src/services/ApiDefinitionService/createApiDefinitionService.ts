import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { NotFoundError } from '@backstage/errors';
import { ApiDefinitionService } from './types';
import { ApiDefinition } from '@internal/plugin-api-platform-common';
import { CatalogApi } from '@backstage/catalog-client/index';

export async function createApiDefinitionService({
  logger,
  catalogClient,
  auth,
}: {
  logger: LoggerService;
  catalogClient: CatalogApi,
  auth: AuthService,
}): Promise<ApiDefinitionService> {
  logger.info('Initializing ApiDefinitionService');

  const storedApiDefinitions = new Array<ApiDefinition>();

  return {
    async listApiDefinitions() {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      const entities = await catalogClient.getEntities({
        filter: {
          kind: ['API'],
        },
      },
        { token });
      const apiDefs: ApiDefinition[] = entities.items.map((api: any) => ({
        id: api.metadata.uid,
        name: api.metadata.name,
        owner: api.spec?.owner?.toString(),
        project: "xxxx",
        lastVersion: "",
        title: api.metadata.uid,
        description: ""
      }));
      return { items: apiDefs };
    },

    async getApiDefinition(request: { id: string }) {
      const todo = storedApiDefinitions.find(item => item.id === request.id);
      if (!todo) {
        throw new NotFoundError(`No ApiDefinition found with id '${request.id}'`);
      }
      return todo;
    },
  };
}
