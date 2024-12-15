import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { ApiDefinitionService } from './types';
import { API_PLATFORM_API_NAME_ANNOTATION, API_PLATFORM_API_VERSION_ANNOTATION, ApiVersionDefinition } from '@internal/plugin-api-platform-common';
import { CatalogApi } from '@backstage/catalog-client/index';
import * as semver from 'semver';


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

  return {
    async listApiDefinitions() {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      const entities = await catalogClient.getEntities(
        {
          filter: {
            kind: ['API'],
          },
        },
        { token });
      const uniqueEntities = Array.from(
        new Map(entities.items.map(entity => [entity.metadata[API_PLATFORM_API_NAME_ANNOTATION], entity])).values()
      );
      return { items: uniqueEntities };
    },

    async getApiDefinitionVersions(request: { id: string }) {

      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      const entities = await catalogClient.getEntities(
        {
          filter: {
            kind: ['API'],
          },
        },
        { token });

      const apisSameName = entities.items.filter(entity => entity.metadata[API_PLATFORM_API_NAME_ANNOTATION] === request.id);

      const versions: ApiVersionDefinition[] = apisSameName.map(entity => ({
        entityRef: `api:${entity.metadata.namespace}/${entity.metadata.name}`,
        version: entity.metadata[API_PLATFORM_API_VERSION_ANNOTATION]?.toString() || ''
      }));
      return versions.sort((a,b) => semver.compare(a.version, b.version)).reverse();
    },
  };
}
