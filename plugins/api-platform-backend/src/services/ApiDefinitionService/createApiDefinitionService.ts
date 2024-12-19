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
    
    async listApiDefinitions(): Promise<{ items: any[] }> {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      const entities = await catalogClient.getEntities(
        {
          filter: {
            kind: ['API'],
          },
          fields: ['kind', 'metadata', 'relations'],
        },
        { token });
      const uniqueEntities = Array.from(
        new Map(entities.items.map(entity => [entity.metadata[API_PLATFORM_API_NAME_ANNOTATION], entity])).values()
      );
      return { items: uniqueEntities };
    },


    async getApiDefinitionVersions(request: { id: string }): Promise<ApiVersionDefinition[]> {
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
      return versions.sort((a, b) => semver.compare(a.version, b.version)).reverse();
    },


    async registerCatalogInfo(location: { target: string }): Promise<String> {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      logger.debug(`Test location: ${location.target}`);
      const existResponse = await catalogClient.addLocation(
        {
          type: 'url',
          target: location.target,
          dryRun: true
        },
        { token }
      );
      logger.debug(JSON.stringify(existResponse));
      let returnMessage = '';
      if (existResponse.exists) {
        const apiEntity = existResponse.entities.filter(entity => entity.kind === 'API')[0];
        const entityRef = `api:${apiEntity.metadata.namespace}/${apiEntity.metadata.name}`;
        logger.debug(`Refresh entity: ${entityRef}`);
        await catalogClient.refreshEntity(
          entityRef,
          { token }
        );
        returnMessage = 'Refreshed';
      } else {
        logger.debug(`Add new location: ${location.target}`);
        const locationResponse = await catalogClient.addLocation(
          {
            type: 'url',
            target: location.target,
            dryRun: false
          },
          { token }
        );
        logger.debug(`Location created: ${locationResponse.location.target}`);
        returnMessage = 'Created';
      }
      return `{"message" : "${returnMessage}: ${location.target}"}`;
    },

  };

}
