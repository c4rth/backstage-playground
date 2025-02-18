import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { ApiPlatformService } from './types';
import {
  ANNOTATION_API_NAME,
  ANNOTATION_API_PROJECT,
  ANNOTATION_API_VERSION,
  ApiVersionDefinition,
  CATALOG_KIND,
  CATALOG_METADATA_API_NAME,
  CATALOG_METADATA_DESCRIPTION,
  CATALOG_METADATA_NAME,
  CATALOG_RELATIONS
} from '@internal/plugin-api-platform-common';
import { CatalogApi } from '@backstage/catalog-client';
import * as semver from 'semver';

async function innerGetApiVersions(logger: LoggerService, catalogClient: CatalogApi, auth: AuthService, apiName: string): Promise<ApiVersionDefinition[]> {
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
  const apisSameName = entities.items.filter(entity => entity.metadata[ANNOTATION_API_NAME] === apiName);
  const versions: ApiVersionDefinition[] = apisSameName.map(entity => ({
    entityRef: `api:${entity.metadata.namespace}/${entity.metadata.name}`,
    version: entity.metadata[ANNOTATION_API_VERSION]?.toString() || '',
    project: entity.metadata[ANNOTATION_API_PROJECT]?.toString() || '',
  }));
  return versions.sort((a, b) => semver.compare(a.version, b.version)).reverse();
}

export interface ApiPlatformServiceOptions {
  logger: LoggerService;
  catalogClient: CatalogApi;
  auth: AuthService;
}

export async function apiPlatformService(options: ApiPlatformServiceOptions): Promise<ApiPlatformService> {
  const { logger, catalogClient, auth } = options;
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
          fields: [
            CATALOG_KIND,
            CATALOG_METADATA_NAME,
            CATALOG_METADATA_DESCRIPTION,
            CATALOG_METADATA_API_NAME,
            CATALOG_RELATIONS],
        },
        { token });
      const uniqueEntities = Array.from(
        new Map(entities.items.map(entity => [entity.metadata[ANNOTATION_API_NAME], entity])).values()
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

  };

}
