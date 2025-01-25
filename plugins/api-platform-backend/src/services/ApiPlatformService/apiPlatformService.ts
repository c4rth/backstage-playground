import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { ApiPlatformService } from './types';
import { API_PLATFORM_API_NAME_ANNOTATION, API_PLATFORM_API_PROJECT_ANNOTATION, API_PLATFORM_API_VERSION_ANNOTATION, ApiVersionDefinition } from '@internal/plugin-api-platform-common';
import { CatalogApi } from '@backstage/catalog-client';
import * as semver from 'semver';

async function innerGetApiVersions(logger: LoggerService,  catalogClient: CatalogApi,  auth: AuthService, apiName: string): Promise<ApiVersionDefinition[]> {
    const { token } = await auth.getPluginRequestToken({
    onBehalfOf: await auth.getOwnServiceCredentials(),
    targetPluginId: 'catalog',
  });
  logger.debug(`Get versions of : ${apiName}`);
  const entities = await catalogClient.getEntities(
    {
      filter: {
        kind: ['API'],
        'metadata.api-name': apiName
      },
    },
    { token });
  const apisSameName = entities.items.filter(entity => entity.metadata[API_PLATFORM_API_NAME_ANNOTATION] === apiName);
  const versions: ApiVersionDefinition[] = apisSameName.map(entity => ({
    entityRef: `api:${entity.metadata.namespace}/${entity.metadata.name}`,
    version: entity.metadata[API_PLATFORM_API_VERSION_ANNOTATION]?.toString() || '',
    project: entity.metadata[API_PLATFORM_API_PROJECT_ANNOTATION]?.toString() || '',
  }));
  return versions.sort((a, b) => semver.compare(a.version, b.version)).reverse();
}

export async function apiPlatformService({
  logger,
  catalogClient,
  auth,
}: {
  logger: LoggerService;
  catalogClient: CatalogApi,
  auth: AuthService,
}): Promise<ApiPlatformService> {
  logger.info('Initializing ApiDefinitionService');

  return {

    async listApis(): Promise<{ items: any[] }> {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      const entities = await catalogClient.getEntities(
        {
          filter: {
            kind: ['API'],
          },
          fields: ['kind',
            'metadata.name',
            'metadata.description',
            'metadata.api-name',
            'relations'],
        },
        { token });
      const uniqueEntities = Array.from(
        new Map(entities.items.map(entity => [entity.metadata[API_PLATFORM_API_NAME_ANNOTATION], entity])).values()
      );
      return { items: uniqueEntities };
    },

    async getApiVersions(request: { apiName: string }): Promise<ApiVersionDefinition[]> {
      return innerGetApiVersions(logger, catalogClient, auth, request.apiName);
    },

    async getApiMatchingVersion(request: { apiName: string, apiVersion: string }): Promise<ApiVersionDefinition | undefined> {      
      const sortedVersions = await innerGetApiVersions(logger, catalogClient, auth, request.apiName);
      const filteredVersion = sortedVersions.filter(apiDef => apiDef.version.startsWith(request.apiVersion));
      if (filteredVersion.length > 0) {
        return filteredVersion.at(0);
      }
      return undefined;
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
