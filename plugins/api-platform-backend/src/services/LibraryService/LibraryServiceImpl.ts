import {
  AuthService,
  coreServices,
  createServiceFactory,
  createServiceRef,
  LoggerService,
} from '@backstage/backend-plugin-api';
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
  CATALOG_RELATIONS,
} from '@internal/plugin-api-platform-common';
import { EntityFilterQuery, EntityOrderQuery } from '@backstage/catalog-client';
import * as semver from 'semver';
import { Entity, RELATION_DEPENDENCY_OF } from '@backstage/catalog-model';
import { fetchCatalogEntitiesWithOwnership } from '../common/utils';
import {
  CatalogService,
  catalogServiceRef,
} from '@backstage/plugin-catalog-node';

function getFilter(system: string, libraryName?: string): EntityFilterQuery {
  if (libraryName) {
    return {
      kind: ['Component'],
      'spec.type': ['library'],
      'metadata.annotations.library.depo.be/name': libraryName,
      'spec.system': system,
    };
  }
  return {
    kind: ['Component'],
    'spec.type': ['library'],
    'spec.system': system,
  };
}

async function innerGetLibraryVersions(
  catalog: CatalogService,
  auth: AuthService,
  system: string,
  libraryName: string,
  servicesCount: boolean,
): Promise<LibraryDefinition[]> {
  const fields = servicesCount
    ? [CATALOG_METADATA, CATALOG_RELATIONS]
    : [CATALOG_METADATA];
  const entities = await catalog.getEntities(
    {
      filter: getFilter(system, libraryName),
      fields: fields,
    },
    { credentials: await auth.getOwnServiceCredentials() },
  );

  const versions: LibraryDefinition[] = [];
  for (const entity of entities.items) {
    const version =
      entity.metadata.annotations?.[ANNOTATION_LIBRARY_VERSION]?.toString();
    if (!version) continue;

    // Count dependencies inline without reduce overhead
    let dependsOfCount = 0;
    if (servicesCount && entity.relations) {
      for (const relation of entity.relations) {
        if (relation.type === RELATION_DEPENDENCY_OF) {
          dependsOfCount++;
        }
      }
    }

    versions.push({
      entityRef: `component:${entity.metadata.namespace}/${entity.metadata.name}`,
      version,
      dependsOfCount,
    });
  }

  return versions.sort((a, b) =>
    semver.valid(a.version) && semver.valid(b.version)
      ? semver.rcompare(a.version, b.version)
      : b.version.localeCompare(a.version),
  );
}

function isNewerVersion(
  currentSemver: semver.SemVer | null,
  existingSemver: semver.SemVer | null,
  currentLower: string,
  existingLower: string,
): boolean {
  if (currentSemver && existingSemver) {
    return currentSemver.compare(existingSemver) > 0;
  }
  return currentLower > existingLower;
}

function getLatestByLibraryName(entities: Entity[], search?: string): Entity[] {
  const latest = new Map<
    string,
    {
      entity: Entity;
      version: string;
      parsedVersion: semver.SemVer | null;
      normalizedVersion: string;
    }
  >();
  const searchLower = search?.toLowerCase();

  for (const item of entities) {
    const libraryName =
      item.metadata.annotations?.[ANNOTATION_LIBRARY_NAME]?.toString();
    const system = item.spec?.system?.toString();
    if (!libraryName || !system) continue;

    // Apply search filter during iteration to avoid second pass
    if (searchLower) {
      const description = item.metadata.description?.toString() || '';
      const matchesSearch = `${libraryName}\0${system}\0${description}`
        .toLowerCase()
        .includes(searchLower);
      if (!matchesSearch) continue;
    }

    const versionStr =
      item.metadata.annotations?.[ANNOTATION_LIBRARY_VERSION]?.toString();
    if (!versionStr) continue;

    const mapKey = `${system}-${libraryName}`;
    const existing = latest.get(mapKey);
    const parsedVersion = semver.parse(versionStr);
    const normalizedVersion = versionStr.toLowerCase();
    if (
      !existing ||
      isNewerVersion(
        parsedVersion,
        existing.parsedVersion,
        normalizedVersion,
        existing.normalizedVersion,
      )
    ) {
      latest.set(mapKey, {
        entity: item,
        version: versionStr,
        parsedVersion,
        normalizedVersion,
      });
    }
  }

  return Array.from(latest.values(), ({ entity }) => entity);
}

function getOrder(
  order: LibraryDefinitionsOptions | undefined,
): EntityOrderQuery | undefined {
  if (!order) return undefined;
  let field = '';
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
    order: order.direction === 'descending' ? 'desc' : 'asc',
  };
}

export interface LibraryServiceOptions {
  logger: LoggerService;
  catalog: CatalogService;
  auth: AuthService;
}

async function fetchLibraryEntities(
  catalog: CatalogService,
  auth: AuthService,
  fields: string[],
  ownershipType: OwnershipType,
  userEntityRef: string | undefined,
  order?: EntityOrderQuery,
): Promise<Entity[]> {
  return fetchCatalogEntitiesWithOwnership({
    catalog,
    auth,
    filter: {
      kind: ['Component'],
      'spec.type': ['library'],
    },
    fields,
    ownershipType,
    userEntityRef,
    order,
  });
}

export class LibraryServiceImpl implements LibraryService {
  private readonly catalog: CatalogService;
  private readonly auth: AuthService;

  constructor(options: LibraryServiceOptions) {
    this.catalog = options.catalog;
    this.auth = options.auth;

    options.logger.info('Initializing LibraryService');
  }
  async listLibraries(
    request: LibraryDefinitionsListRequest,
  ): Promise<LibraryDefinitionListResult> {
    const entities = await fetchLibraryEntities(
      this.catalog,
      this.auth,
      [
        CATALOG_KIND,
        CATALOG_METADATA_NAME,
        CATALOG_METADATA_DESCRIPTION,
        CATALOG_METADATA_LIBRARY_NAME,
        CATALOG_METADATA_LIBRARY_VERSION,
        CATALOG_SPEC_SYSTEM,
        CATALOG_SPEC_OWNER,
      ],
      request.ownershipType ?? 'all',
      request.userEntityRef,
      getOrder(request.orderBy),
    );

    // Combine filtering and grouping in single pass
    const latestEntities = getLatestByLibraryName(entities, request.search);

    const offset = request.offset ?? 0;
    const limit = request.limit ?? 20;
    const totalCount = latestEntities.length;

    // Only slice if needed - avoid creating new array when returning all
    const items =
      offset === 0 && limit >= totalCount
        ? latestEntities
        : latestEntities.slice(offset, offset + limit);

    return { items, offset, limit, totalCount };
  }

  async getLibraryVersions(request: {
    system: string;
    libraryName: string;
    servicesCount: boolean;
  }): Promise<LibraryDefinition[]> {
    return innerGetLibraryVersions(
      this.catalog,
      this.auth,
      request.system,
      request.libraryName,
      request.servicesCount,
    );
  }
}

export const libraryServiceRef = createServiceRef<LibraryService>({
  id: 'api-platform.library.service',
  defaultFactory: async service =>
    createServiceFactory({
      service,
      deps: {
        logger: coreServices.logger,
        auth: coreServices.auth,
        catalog: catalogServiceRef,
      },
      async factory({ logger, auth, catalog }) {
        const libraryService = new LibraryServiceImpl({
          logger,
          catalog,
          auth,
        });
        return libraryService;
      },
    }),
});
