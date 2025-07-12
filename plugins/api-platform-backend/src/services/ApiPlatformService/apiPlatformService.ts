import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { ApiDefinitionsListRequest, ApiPlatformService } from './types';
import {
  ANNOTATION_API_NAME,
  ANNOTATION_API_PROJECT,
  ANNOTATION_API_VERSION,
  ApiDefinitionListResult,
  ApiVersionDefinition,
  CATALOG_KIND,
  CATALOG_METADATA,
  CATALOG_METADATA_API_NAME,
  CATALOG_METADATA_API_VERSION,
  CATALOG_METADATA_DESCRIPTION,
  CATALOG_METADATA_NAME,
  CATALOG_SPEC_SYSTEM
} from '@internal/plugin-api-platform-common';
import { CatalogApi, GetEntitiesResponse } from '@backstage/catalog-client';
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
        'metadata.api-name': apiName, // use string, constant does not work here
      },
      fields: [CATALOG_METADATA],
    },
    { token }
  );
  return entities.items
    .filter(entity => entity.metadata[ANNOTATION_API_NAME] === apiName)
    .map(entity => ({
      entityRef: `api:${entity.metadata.namespace}/${entity.metadata.name}`,
      version: entity.metadata[ANNOTATION_API_VERSION]?.toString() || '',
      project: entity.metadata[ANNOTATION_API_PROJECT]?.toString() || '',
    }))
    .filter(v => v.version)
    .sort((a, b) => semver.rcompare(a.version, b.version));
}

function getLatestByApiName(input: GetEntitiesResponse): Entity[] {
  const latest = new Map<string, { entity: Entity, version: semver.SemVer }>();

  for (const item of input.items) {
    const apiName = item.metadata[ANNOTATION_API_NAME]?.toString();
    if (!apiName) continue;
    const versionStr = item.metadata[ANNOTATION_API_VERSION]?.toString();
    if (!versionStr) continue;
    let version: semver.SemVer;
    try {
      version = new semver.SemVer(versionStr);
    } catch {
      version = new semver.SemVer('0.0.0');
    }
    const existing = latest.get(apiName);
    if (!existing || semver.gt(version, existing.version)) {
      latest.set(apiName, { entity: item, version });
    }
  }
  return Array.from(latest.values(), ({ entity }) => entity);
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
            CATALOG_METADATA_API_NAME,
          ],
        },
        { token });
      const uniqueApiNames = new Set<string>();
      for (const entity of entities.items) {
        const apiName = entity.metadata[ANNOTATION_API_NAME]?.toString();
        if (apiName) {
          uniqueApiNames.add(apiName);
        }
      }

      return uniqueApiNames.size;
    },

    async listApis(request: ApiDefinitionsListRequest): Promise<ApiDefinitionListResult> {
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
            CATALOG_SPEC_SYSTEM,
          ],
        },
        { token });

      const latestEntities = getLatestByApiName(entities);
      let result = latestEntities;
      const search = request.search?.toLowerCase();
      if (search) {
        result = latestEntities.filter(entity => {
          const apiName = entity.metadata[ANNOTATION_API_NAME]?.toString() || '';
          const description = entity.metadata.description?.toString() || '';
          const system = entity.spec?.system?.toString() || entity.metadata[ANNOTATION_API_PROJECT]?.toString() || '';
          return (
            apiName.toLowerCase().includes(search) ||
            system.toLowerCase().includes(search) ||
            description.toLowerCase().includes(search)
          );
        });
      }
      const offset = request.offset ?? 0;
      const limit = request.limit ?? 20;
      return {
        items: result.slice(offset, offset + limit),
        offset,
        limit,
        totalCount: result.length,
      };
    },

    async getApiVersions(request: { apiName: string }): Promise<ApiVersionDefinition[]> {
      return innerGetApiVersions(catalogClient, auth, request.apiName);
    },

    async getApiMatchingVersion(request: { apiName: string, apiVersion: string }): Promise<ApiVersionDefinition | undefined> {
      const apiVersions = await innerGetApiVersions(catalogClient, auth, request.apiName);
      return apiVersions.find(apiDef => apiDef.version.startsWith(request.apiVersion));
    },

  };

}