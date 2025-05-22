import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { ApiDefinitionsListRequest, ApiDefinitionsOptions, ApiPlatformService } from './types';
import {
  ANNOTATION_API_NAME,
  ANNOTATION_API_PROJECT,
  ANNOTATION_API_VERSION,
  ApiDefinitionListResult,
  ApiVersionDefinition,
  CATALOG_KIND,
  CATALOG_METADATA,
  CATALOG_METADATA_API_NAME,
  CATALOG_METADATA_API_PROJECT,
  CATALOG_METADATA_API_VERSION,
  CATALOG_METADATA_DESCRIPTION,
  CATALOG_METADATA_NAME,
  CATALOG_SPEC_SYSTEM
} from '@internal/plugin-api-platform-common';
import { CatalogApi, EntityOrderQuery, GetEntitiesResponse } from '@backstage/catalog-client';
import * as semver from 'semver';
import { Entity } from '@backstage/catalog-model';

async function innerGetApiVersions(catalogClient: CatalogApi, auth: AuthService, apiName: string): Promise<ApiVersionDefinition[]> {
  const { token } = await auth.getPluginRequestToken({
    onBehalfOf: await auth.getOwnServiceCredentials(),
    targetPluginId: 'catalog',
  });
  const entities = await catalogClient.getEntities(
    {
      filter: {
        kind: ['API'],
        'metadata.api-name': apiName,
      },
      fields: [CATALOG_METADATA],
    },
    { token }
  );
  const apisSameName = entities.items.filter(
    entity => entity.metadata[ANNOTATION_API_NAME] === apiName
  );
  const versions = apisSameName.map(entity => ({
    entityRef: `api:${entity.metadata.namespace}/${entity.metadata.name}`,
    version: entity.metadata[ANNOTATION_API_VERSION]?.toString() || '',
    project: entity.metadata[ANNOTATION_API_PROJECT]?.toString() || '',
  }));
  return versions
    .filter(v => v.version)
    .sort((a, b) => semver.compare(a.version, b.version))
    .reverse();
}

function getLatestByApiName(input: GetEntitiesResponse): Entity[] {
  const latest = new Map<string, Entity>();
  const existingVersions = new Map<string, semver.SemVer>();

  for (const item of input.items) {
    const apiName = item.metadata['api-name']?.toString() ?? '';
    const versionStr = item.metadata['api-version']?.toString() || '0.0.0';
    let version: semver.SemVer;
    try {
      version = new semver.SemVer(versionStr);
    } catch {
      version = new semver.SemVer('0.0.0');
    }
    const existing = latest.get(apiName);
    const existingVersion = existingVersions.get(apiName);
    if (!existing || !existingVersion || semver.gt(version, existingVersion)) {
      latest.set(apiName, item);
      existingVersions.set(apiName, version);
    }
  }
  return Array.from(latest.values());
}

export interface ApiPlatformServiceOptions {
  logger: LoggerService;
  catalogClient: CatalogApi;
  auth: AuthService;
}

function getOrder(order: ApiDefinitionsOptions | undefined): EntityOrderQuery | undefined {
  if (order) {
    let field = "";
    switch (order?.field) {
      case 'api.name':
        field = CATALOG_METADATA_API_NAME;
        break;
      case 'api.description':
        field = CATALOG_METADATA_DESCRIPTION;
        break;
      case 'api.system':
        field = CATALOG_SPEC_SYSTEM;
        break;
      default:
        field = CATALOG_METADATA_API_NAME;
    }
    return {
      field: field,
      order: order.direction,
    };
  }
  return undefined;
}

export async function apiPlatformService(options: ApiPlatformServiceOptions): Promise<ApiPlatformService> {
  const { logger, catalogClient, auth } = options;
  logger.info('Initializing ApiDefinitionService');

  return {

    async getApisCount(): Promise<number> {
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
            CATALOG_METADATA_API_NAME,
          ],
        },
        { token });
      const uniqueApiNames = new Set<string>(entities.items.map(entity => entity.metadata[ANNOTATION_API_NAME]?.toString() || ''));
      return uniqueApiNames.size;
    },

    async listApis(request: ApiDefinitionsListRequest): Promise<ApiDefinitionListResult> {
      const offset = request.offset ?? 0;
      const limit = request.limit ?? 20;
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
            CATALOG_METADATA_API_VERSION,
            CATALOG_METADATA_API_PROJECT,
            CATALOG_SPEC_SYSTEM,
          ],
          order: getOrder(request.orderBy),
        },
        { token });
      
      const latestEntities = getLatestByApiName(entities);
      let result = latestEntities;
      if (request.search) {
        result = latestEntities.filter(entity => {
          const apiName = entity.metadata[ANNOTATION_API_NAME]?.toString() || '';
          const search = request.search?.toLowerCase() || '';
          const description = entity.metadata.description?.toString() || '';
          const system = entity.spec?.system?.toString() || entity.metadata[ANNOTATION_API_PROJECT]?.toString() || '';
          return (
            apiName.toLowerCase().includes(search) ||
            system.toLowerCase().includes(search) ||
            description.toLowerCase().includes(search)
          );
        });
      }
      return {
        items: result.slice(offset, offset + limit),
        offset,
        limit,
        totalCount: Number(result.length),
      };
    },

    async getApiVersions(request: { apiName: string }): Promise<ApiVersionDefinition[]> {
      return innerGetApiVersions(catalogClient, auth, request.apiName);
    },

    async getApiMatchingVersion(request: { apiName: string, apiVersion: string }): Promise<ApiVersionDefinition | undefined> {
      const sortedVersions = await innerGetApiVersions(catalogClient, auth, request.apiName);
      const filteredVersion = sortedVersions.filter(apiDef => apiDef.version.startsWith(request.apiVersion));
      if (filteredVersion.length > 0) {
        return filteredVersion.at(0);
      }
      return undefined;
    },

  };

}
