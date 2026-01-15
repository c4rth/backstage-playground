import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { ApiService } from './types';
import {
  ANNOTATION_API_NAME,
  ANNOTATION_API_PROJECT,
  ANNOTATION_API_VERSION,
  ApiDefinitionListResult,
  ApiRelationDefinition,
  ApiVersionDefinition,
  CATALOG_KIND,
  CATALOG_METADATA,
  CATALOG_METADATA_API_NAME,
  CATALOG_METADATA_API_VERSION,
  CATALOG_METADATA_DESCRIPTION,
  CATALOG_METADATA_NAME,
  CATALOG_RELATIONS,
  CATALOG_SPEC_SYSTEM,
  API_NO_SYSTEM,
  ApiDefinitionsOptions,
  ApiDefinitionsListRequest,
  OwnershipType,
  CATALOG_SPEC_OWNER
} from '@internal/plugin-api-platform-common';
import { CatalogApi, EntityFilterQuery, EntityOrderQuery } from '@backstage/catalog-client';
import * as semver from 'semver';
import { Entity } from '@backstage/catalog-model';
import { getUserGroups } from '../common/utils';
import { getCatalogToken } from '../common/token';

function getFilter(apiName: string, system: string): EntityFilterQuery {
  if (system === API_NO_SYSTEM) {
    return {
      kind: ['API'],
      'metadata.api-name': apiName, // use string, constant does not work here
    }
  }
  return {
    kind: ['API'],
    'metadata.api-name': apiName, // use string, constant does not work here
    'spec.system': system
  };
}

async function innerGetApiVersions(
  catalogClient: CatalogApi, 
  auth: AuthService, 
  system: string, 
  apiName: string,
  options?: { skipSort?: boolean; matchPrefix?: string }
): Promise<ApiVersionDefinition[]> {
  const token = await getCatalogToken(auth);
  const entities = await catalogClient.getEntities(
    {
      filter: getFilter(apiName, system),
      fields: [CATALOG_METADATA],
    },
    { token }
  );
  
  const versions: ApiVersionDefinition[] = [];
  const matchPrefix = options?.matchPrefix?.toLowerCase();
  
  for (const entity of entities.items) {
    const version = entity.metadata[ANNOTATION_API_VERSION]?.toString();
    if (!version) continue;
    
    // Early return if looking for a specific prefix match
    if (matchPrefix && version.toLowerCase().startsWith(matchPrefix)) {
      return [{
        entityRef: `api:${entity.metadata.namespace}/${entity.metadata.name}`,
        version,
        project: entity.metadata[ANNOTATION_API_PROJECT]?.toString() || '',
      }];
    }
    
    versions.push({
      entityRef: `api:${entity.metadata.namespace}/${entity.metadata.name}`,
      version,
      project: entity.metadata[ANNOTATION_API_PROJECT]?.toString() || '',
    });
  }
  
  // Skip sort if not needed (e.g., when caller only needs existence check)
  if (options?.skipSort) {
    return versions;
  }
  
  return versions.sort((a, b) => semver.rcompare(a.version, b.version));
}

function getLatestByApiName(entities: Entity[], search?: string): Entity[] {
  const latest = new Map<string, { entity: Entity, version: semver.SemVer }>();
  const searchLower = search?.toLowerCase();

  for (const item of entities) {
    const apiName = item.metadata[ANNOTATION_API_NAME]?.toString();
    const system = item.spec?.system?.toString();
    if (!apiName || !system) continue;

    // Apply search filter during iteration to avoid second pass
    if (searchLower) {
      const description = item.metadata.description?.toString() || '';
      const project = item.metadata[ANNOTATION_API_PROJECT]?.toString() || '';
      const matchesSearch = 
        apiName.toLowerCase().includes(searchLower) ||
        system.toLowerCase().includes(searchLower) ||
        project.toLowerCase().includes(searchLower) ||
        description.toLowerCase().includes(searchLower);
      if (!matchesSearch) continue;
    }

    const versionStr = item.metadata[ANNOTATION_API_VERSION]?.toString();
    if (!versionStr) continue;
    
    let version: semver.SemVer;
    try {
      version = new semver.SemVer(versionStr);
    } catch {
      version = new semver.SemVer('0.0.0');
    }
    
    const mapKey = `${system}-${apiName}`;
    const existing = latest.get(mapKey);
    // Use compare() > 0 instead of gt() - avoids extra function call overhead
    if (!existing || semver.compare(version, existing.version) > 0) {
      latest.set(mapKey, { entity: item, version });
    }
  }
  
  return Array.from(latest.values(), ({ entity }) => entity);
}

function getOrder(order: ApiDefinitionsOptions | undefined): EntityOrderQuery | undefined {
  if (!order) return undefined;
  let field = "";
  switch (order?.field) {
    case 'name':
      field = CATALOG_METADATA_API_NAME;
      break;
    case 'description':
      field = CATALOG_METADATA_DESCRIPTION;
      break;
    case 'system':
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

export interface ApiServiceOptions {
  logger: LoggerService;
  catalogClient: CatalogApi;
  auth: AuthService;
}

// Shared function to fetch API entities with ownership filter
async function fetchApiEntities(
  catalogClient: CatalogApi,
  auth: AuthService,
  fields: string[],
  ownership: OwnershipType,
  userEntityRef: string | undefined,
  order?: EntityOrderQuery,
): Promise<Entity[]> {
  const token = await getCatalogToken(auth);
  
  // Fetch user groups in parallel with entities if needed
  const [entities, userGroupRefs] = await Promise.all([
    catalogClient.getEntities(
      {
        filter: { kind: ['API'] },
        fields,
        order,
      },
      { token }
    ).then(res => res.items),
    ownership === 'owned' && userEntityRef
      ? getUserGroups(catalogClient, auth, userEntityRef)
      : Promise.resolve([] as string[]),
  ]);

  // Filter by ownership if needed
  if (ownership === 'owned' && userEntityRef && userGroupRefs.length > 0) {
    const groupSet = new Set(userGroupRefs);
    return entities.filter(entity => {
      const owner = entity.spec?.owner?.toString() || '';
      return groupSet.has(owner);
    });
  }

  return entities;
}

export async function apiService(options: ApiServiceOptions): Promise<ApiService> {
  const { logger, catalogClient, auth } = options;
  logger.info('Initializing ApiService');

  return {

    async getApisCount(ownership: OwnershipType, userEntityRef: string | undefined): Promise<number> {
      const entities = await fetchApiEntities(
        catalogClient,
        auth,
        [CATALOG_METADATA_API_NAME, CATALOG_SPEC_SYSTEM, CATALOG_SPEC_OWNER],
        ownership,
        userEntityRef,
      );
      // Inline counting to avoid function call overhead
      const uniqueApiNames = new Set<string>();
      for (const entity of entities) {
        const apiName = entity.metadata[ANNOTATION_API_NAME]?.toString();
        if (apiName) {
          const system = entity.spec?.system?.toString() ?? '';
          uniqueApiNames.add(`${system}-${apiName}`);
        }
      }
      return uniqueApiNames.size;
    },

    async listApis(request: ApiDefinitionsListRequest): Promise<ApiDefinitionListResult> {
      const entities = await fetchApiEntities(
        catalogClient,
        auth,
        [
          CATALOG_KIND,
          CATALOG_METADATA_NAME,
          CATALOG_METADATA_DESCRIPTION,
          CATALOG_METADATA_API_NAME,
          CATALOG_METADATA_API_VERSION,
          CATALOG_SPEC_SYSTEM,
          CATALOG_SPEC_OWNER,
        ],
        request.ownership ?? 'all',
        request.userEntityRef,
        getOrder(request.orderBy),
      );

      // Combine filtering and grouping in single pass
      const latestEntities = getLatestByApiName(entities, request.search);
      
      const offset = request.offset ?? 0;
      const limit = request.limit ?? 20;
      const totalCount = latestEntities.length;
      
      // Only slice if needed - avoid creating new array when returning all
      const items = (offset === 0 && limit >= totalCount) 
        ? latestEntities 
        : latestEntities.slice(offset, offset + limit);
      
      return { items, offset, limit, totalCount };
    },

    async getApiVersions(request: { system: string, apiName: string }): Promise<ApiVersionDefinition[]> {
      return innerGetApiVersions(catalogClient, auth, request.system, request.apiName);
    },

    async getApiMatchingVersion(request: { system: string, apiName: string, apiVersion: string }): Promise<ApiVersionDefinition | undefined> {
      // Use matchPrefix option for early return - avoids sorting all versions
      const versions = await innerGetApiVersions(catalogClient, auth, request.system, request.apiName, { 
        matchPrefix: request.apiVersion 
      });
      return versions[0];
    },

    async getApiRelations(request: { system: string, apiName: string, relationType: 'provider' | 'consumer' }): Promise<ApiRelationDefinition[]> {
      const token = await getCatalogToken(auth);
      const entities = await catalogClient.getEntities(
        {
          filter: {
            kind: ['API'],
            'metadata.api-name': request.apiName,
            'spec.system': request.system
          },
          fields: [
            CATALOG_METADATA_NAME,
            CATALOG_METADATA_API_NAME,
            CATALOG_METADATA_API_VERSION,
            CATALOG_RELATIONS,
          ],
        },
        { token }
      );

      // Map relationType to Backstage relation type
      const relationTypeFilter = request.relationType === 'provider' ? 'apiProvidedBy' : 'apiConsumedBy';
      
      const relations: ApiRelationDefinition[] = [];
      for (const entity of entities.items) {
        const apiVersion = entity.metadata[ANNOTATION_API_VERSION]?.toString();
        if (!apiVersion) continue;
        
        // Build services array directly without intermediate filter array
        const entityRelations = entity.relations;
        if (!entityRelations?.length) continue;
        
        const services: ApiRelationDefinition['services'] = [];
        for (const relation of entityRelations) {
          if (relation.type === relationTypeFilter) {
            services.push({
              entityRef: relation.targetRef,
              version: apiVersion,
              lifecycle: relation.type,
            });
          }
        }
        
        if (services.length > 0) {
          relations.push({ apiVersion, services });
        }
      }
      return relations;
    },

  };

}