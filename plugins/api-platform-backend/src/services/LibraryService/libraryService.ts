import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { LibraryService } from './types';
import {
  CATALOG_KIND,
  CATALOG_METADATA,
  CATALOG_METADATA_DESCRIPTION,
  CATALOG_METADATA_NAME,
  CATALOG_SPEC_SYSTEM,
  OwnershipType,
  CATALOG_SPEC_OWNER,
  LibraryDefinitionListResult,
  LibraryDefinitionsListRequest,
  LibraryDefinition,
  CATALOG_METADATA_LIBRARY_NAME,
  CATALOG_METADATA_LIBRARY_VERSION,
  LibraryDefinitionsOptions,
  ANNOTATION_LIBRARY_NAME,
  ANNOTATION_LIBRARY_VERSION,
  CATALOG_RELATIONS
} from '@internal/plugin-api-platform-common';
import { CatalogApi, EntityFilterQuery, EntityOrderQuery } from '@backstage/catalog-client';
import * as semver from 'semver';
import { Entity, RELATION_DEPENDENCY_OF } from '@backstage/catalog-model';
import { getUserGroups } from '../common/utils';
import { getCatalogToken } from '../common/token';

function getFilter(system: string, libraryName?: string): EntityFilterQuery {
  if (libraryName) {
    return {
      kind: ['Component'],
      'spec.type': ['library'],
      'metadata.library-name': libraryName,
      'spec.system': system
    };
  }
  return {
    kind: ['Component'],
    'spec.type': ['library'],
    'spec.system': system
  };
}

async function innerGetLibraryVersions(catalogClient: CatalogApi, auth: AuthService, system: string, libraryName: string): Promise<LibraryDefinition[]> {
  const token = await getCatalogToken(auth);
  const entities = await catalogClient.getEntities(
    {
      filter: getFilter(system, libraryName),
      fields: [CATALOG_METADATA, CATALOG_RELATIONS],
    },
    { token }
  );
  const versions: LibraryDefinition[] = [];
  for (const entity of entities.items) {
    const version = entity.metadata[ANNOTATION_LIBRARY_VERSION]?.toString();
    const dependsOf = entity.relations?.reduce((count, relation) => relation.type === RELATION_DEPENDENCY_OF ? count + 1 : count, 0) || 0;
    if (version) {
      versions.push({
        entityRef: `component:${entity.metadata.namespace}/${entity.metadata.name}`,
        version,
        dependsOf,
      });
    }
  }

  return versions.sort((a, b) => semver.valid(a.version) && semver.valid(b.version) ? semver.rcompare(a.version, b.version) : b.version.localeCompare(a.version));
}

function getLatestByLibraryName(entities: Entity[]): Entity[] {
  const latest = new Map<string, { entity: Entity, version: semver.SemVer }>();

  for (const item of entities) {
    const libraryName = item.metadata[ANNOTATION_LIBRARY_NAME]?.toString();
    const system = item.spec?.system?.toString();
    if (!libraryName || !system) continue;
    const versionStr = item.metadata[ANNOTATION_LIBRARY_VERSION]?.toString();
    if (!versionStr) continue;

    let version: semver.SemVer;
    try {
      version = new semver.SemVer(versionStr);
    } catch {
      version = new semver.SemVer('0.0.0');
    }

    const mapKey = `${system}-${libraryName}`;
    const existing = latest.get(mapKey);
    // Use compare() > 0 instead of gt() - avoids extra function call overhead
    if (!existing || semver.compare(version, existing.version) > 0) {
      latest.set(mapKey, { entity: item, version });
    }
  }

  return Array.from(latest.values(), ({ entity }) => entity);
}

function getOrder(order: LibraryDefinitionsOptions | undefined): EntityOrderQuery | undefined {
  if (!order) return undefined;
  let field = "";
  switch (order?.field) {
    case 'name':
      field = CATALOG_METADATA_LIBRARY_NAME;
      break;
    case 'description':
      field = CATALOG_METADATA_DESCRIPTION;
      break;
    case 'system':
      field = CATALOG_SPEC_SYSTEM;
      break;
    default:
      field = CATALOG_METADATA_LIBRARY_NAME;
  }
  return {
    field: field,
    order: order.direction,
  };
}

export interface LibraryServiceOptions {
  logger: LoggerService;
  catalogClient: CatalogApi;
  auth: AuthService;
}

async function fetchLibraryEntities(
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
        filter: {
          kind: ['Component'],
          'spec.type': ['library']
        },
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

export async function libraryService(options: LibraryServiceOptions): Promise<LibraryService> {
  const { logger, catalogClient, auth } = options;
  logger.info('Initializing LibraryService');

  return {

    async listLibraries(request: LibraryDefinitionsListRequest): Promise<LibraryDefinitionListResult> {
      const entities = await fetchLibraryEntities(
        catalogClient,
        auth,
        [
          CATALOG_KIND,
          CATALOG_METADATA_NAME,
          CATALOG_METADATA_DESCRIPTION,
          CATALOG_METADATA_LIBRARY_NAME,
          CATALOG_METADATA_LIBRARY_VERSION,
          CATALOG_SPEC_SYSTEM,
          CATALOG_SPEC_OWNER,
        ],
        request.ownership ?? 'all',
        request.userEntityRef,
        getOrder(request.orderBy),
      );

      let latestEntities = getLatestByLibraryName(entities);

      const search = request.search?.toLowerCase();
      if (search) {
        latestEntities = latestEntities.filter(entity => {
          const libraryName = entity.metadata[ANNOTATION_LIBRARY_NAME]?.toString() || '';
          const description = entity.metadata.description?.toString() || '';
          const system = entity.spec?.system?.toString() || '';
          return (
            libraryName.toLowerCase().includes(search) ||
            system.toLowerCase().includes(search) ||
            description.toLowerCase().includes(search)
          );
        });
      }

      const offset = request.offset ?? 0;
      const limit = request.limit ?? 20;
      return {
        items: latestEntities.slice(offset, offset + limit),
        offset,
        limit,
        totalCount: latestEntities.length,
      };
    },

    async getLibraryVersions(request: { system: string, libraryName: string }): Promise<LibraryDefinition[]> {
      return innerGetLibraryVersions(catalogClient, auth, request.system, request.libraryName);
    },
  };

}