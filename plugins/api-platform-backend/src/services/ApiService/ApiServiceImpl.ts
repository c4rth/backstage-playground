import {
  AuthService,
  coreServices,
  createServiceFactory,
  createServiceRef,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { ApiService } from './types';
import {
  ANNOTATION_API_NAME,
  ANNOTATION_API_PROJECT,
  ANNOTATION_API_VERSION,
  ApiDefinitionListResult,
  ApiRelationsDefinition,
  ApiVersionDefinition,
  CATALOG_KIND,
  CATALOG_METADATA,
  CATALOG_METADATA_API_NAME,
  CATALOG_METADATA_API_PROJECT,
  CATALOG_METADATA_API_VERSION,
  CATALOG_METADATA_DESCRIPTION,
  CATALOG_METADATA_NAME,
  CATALOG_METADATA_NAMESPACE,
  CATALOG_RELATIONS,
  CATALOG_SPEC_SYSTEM,
  API_NO_SYSTEM,
  ApiDefinitionsOptions,
  ApiDefinitionsListRequest,
  OwnershipType,
  OpenApiType,
  CATALOG_SPEC_OWNER,
  ANNOTATION_API_TYPE,
  CATALOG_METADATA_API_TYPE,
  ApiRelationType,
  ANNOTATION_SERVICE_VERSION,
  ANNOTATION_SERVICE_PLATFORM,
  ANNOTATION_SERVICE_NAME,
  ANNOTATION_SERVICE_IMAGE_VERSION,
  createPage,
  normalizePagination,
} from '@internal/plugin-api-platform-common';
import { EntityFilterQuery, EntityOrderQuery } from '@backstage/catalog-client';
import * as semver from 'semver';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  fetchCatalogEntitiesWithOwnership,
  getUserGroups,
  isUserGuest,
} from '../common/utils';
import {
  CatalogService,
  catalogServiceRef,
} from '@backstage/plugin-catalog-node';

const DEFAULT_SEMVER = new semver.SemVer('0.0.0');

function getFilter(apiName: string, system?: string): EntityFilterQuery {
  if (system === undefined) {
    return {
      kind: ['API'],
      'metadata.annotations.api.depo.be/name': apiName,
    };
  }
  if (system === API_NO_SYSTEM) {
    return {
      kind: ['API'],
      'metadata.annotations.api.depo.be/name': apiName, // use string, constant does not work here
    };
  }
  return {
    kind: ['API'],
    'metadata.annotations.api.depo.be/name': apiName, // use string, constant does not work here
    'spec.system': system,
  };
}

async function innerGetApiVersions(
  catalog: CatalogService,
  auth: AuthService,
  system: string | undefined,
  apiName: string,
): Promise<ApiVersionDefinition[]> {
  const entities = await catalog.getEntities(
    {
      filter: getFilter(apiName, system),
      fields: [CATALOG_KIND, CATALOG_METADATA, CATALOG_SPEC_SYSTEM],
    },
    { credentials: await auth.getOwnServiceCredentials() },
  );
  const versions: ApiVersionDefinition[] = [];

  for (const entity of entities.items) {
    const version =
      entity.metadata.annotations?.[ANNOTATION_API_VERSION]?.toString();
    if (!version) continue;

    versions.push({
      name:
        entity.metadata.annotations?.[ANNOTATION_API_NAME]?.toString() ??
        apiName,
      system: entity.spec?.system?.toString(),
      namespace: entity.metadata.namespace,
      entityRef: stringifyEntityRef(entity),
      version,
      project:
        entity.metadata.annotations?.[ANNOTATION_API_PROJECT]?.toString() || '',
    });
  }

  return versions.sort((a, b) => semver.rcompare(a.version, b.version));
}

function getLatestByApiName(entities: Entity[], search?: string): Entity[] {
  const latest = new Map<string, { entity: Entity; version: semver.SemVer }>();
  const searchLower = search?.toLowerCase();

  for (const item of entities) {
    const apiName =
      item.metadata.annotations?.[ANNOTATION_API_NAME]?.toString();
    const apiType =
      item.metadata.annotations?.[ANNOTATION_API_TYPE]?.toString() || '?';
    const system = item.spec?.system?.toString();
    if (!apiName || !system) continue;

    // Apply search filter during iteration to avoid second pass
    if (searchLower) {
      const description = item.metadata.description?.toString() || '';
      const project =
        item.metadata.annotations?.[ANNOTATION_API_PROJECT]?.toString() || '';
      const matchesSearch =
        `${apiName}\0${system}\0${project}\0${apiType}\0${description}`
          .toLowerCase()
          .includes(searchLower);
      if (!matchesSearch) continue;
    }

    const versionStr =
      item.metadata.annotations?.[ANNOTATION_API_VERSION]?.toString();
    if (!versionStr) continue;

    const version = semver.parse(versionStr) ?? DEFAULT_SEMVER;

    const mapKey = JSON.stringify([system, apiName]);
    const existing = latest.get(mapKey);
    const comparison = existing ? version.compare(existing.version) : 1;
    const entityRef = `${item.metadata.namespace}/${item.metadata.name}`;
    const existingEntityRef = existing
      ? `${existing.entity.metadata.namespace}/${existing.entity.metadata.name}`
      : '';
    if (
      !existing ||
      comparison > 0 ||
      (comparison === 0 && entityRef.localeCompare(existingEntityRef) < 0)
    ) {
      latest.set(mapKey, { entity: item, version });
    }
  }

  return Array.from(latest.values(), ({ entity }) => entity);
}

function compareEntityValues(a: string, b: string): number {
  return a.localeCompare(b);
}

function sortApiEntities(
  entities: Entity[],
  orderBy: ApiDefinitionsOptions | undefined,
): Entity[] {
  const direction = orderBy?.direction === 'descending' ? -1 : 1;
  const field = orderBy?.field ?? 'name';
  const getValue = (entity: Entity, key: ApiDefinitionsOptions['field']) => {
    switch (key) {
      case 'description':
        return entity.metadata.description?.toString() ?? '';
      case 'system':
        return entity.spec?.system?.toString() ?? '';
      case 'type':
        return (
          entity.metadata.annotations?.[ANNOTATION_API_TYPE]?.toString() ?? ''
        );
      default:
        return (
          entity.metadata.annotations?.[ANNOTATION_API_NAME]?.toString() ?? ''
        );
    }
  };
  return entities.sort((a, b) => {
    const primary = compareEntityValues(getValue(a, field), getValue(b, field));
    if (primary !== 0) return primary * direction;
    const system = compareEntityValues(
      getValue(a, 'system'),
      getValue(b, 'system'),
    );
    if (system !== 0) return system;
    return compareEntityValues(
      `${a.metadata.namespace}/${a.metadata.name}`,
      `${b.metadata.namespace}/${b.metadata.name}`,
    );
  });
}

function getOrder(
  order: ApiDefinitionsOptions | undefined,
): EntityOrderQuery | undefined {
  if (!order) return undefined;
  let field = '';
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
    case 'type':
      field = CATALOG_METADATA_API_TYPE;
      break;
    default:
      field = CATALOG_METADATA_API_NAME;
  }
  return {
    field: field,
    order: order.direction === 'descending' ? 'desc' : 'asc',
  };
}

export interface ApiServiceOptions {
  logger: LoggerService;
  catalog: CatalogService;
  auth: AuthService;
}

// Shared function to fetch API entities with ownership filter
async function fetchApiEntities(
  catalog: CatalogService,
  auth: AuthService,
  fields: string[],
  ownershipType: OwnershipType,
  apiType: OpenApiType | 'all',
  userEntityRef: string | undefined,
  order?: EntityOrderQuery,
): Promise<Entity[]> {
  return fetchCatalogEntitiesWithOwnership({
    catalog,
    auth,
    filter:
      apiType === 'all'
        ? { kind: ['API'] }
        : {
            kind: ['API'],
            [CATALOG_METADATA_API_TYPE]: apiType,
          },
    fields,
    ownershipType,
    userEntityRef,
    order,
  });
}

async function countApiDefinitions(
  catalog: CatalogService,
  auth: AuthService,
  ownershipType: OwnershipType,
  apiType: OpenApiType,
  userEntityRef: string | undefined,
): Promise<number> {
  if (ownershipType === 'owned' && isUserGuest(userEntityRef)) {
    return 0;
  }

  const userGroupRefs =
    ownershipType === 'owned' && userEntityRef
      ? await getUserGroups(catalog, auth, userEntityRef)
      : [];
  if (ownershipType === 'owned' && userGroupRefs.length === 0) {
    return 0;
  }

  const apiFilter: Record<string, string | string[]> =
    apiType === 'all'
      ? { kind: ['API'] }
      : { kind: ['API'], [CATALOG_METADATA_API_TYPE]: apiType };
  const filter: EntityFilterQuery =
    ownershipType === 'owned'
      ? userGroupRefs.map(owner => ({ ...apiFilter, 'spec.owner': owner }))
      : apiFilter;
  const uniqueApiNames = new Set<string>();
  const credentials = await auth.getOwnServiceCredentials();

  for await (const entities of catalog.streamEntities(
    {
      filter,
      fields: [CATALOG_METADATA_API_NAME, CATALOG_SPEC_SYSTEM],
    },
    { credentials },
  )) {
    for (const entity of entities) {
      const apiName =
        entity.metadata.annotations?.[ANNOTATION_API_NAME]?.toString();
      if (apiName) {
        uniqueApiNames.add(
          `${entity.spec?.system?.toString() ?? ''}-${apiName}`,
        );
      }
    }
  }

  return uniqueApiNames.size;
}

export class ApiServiceImpl implements ApiService {
  private readonly logger: LoggerService;
  private readonly catalog: CatalogService;
  private readonly auth: AuthService;

  constructor(options: ApiServiceOptions) {
    this.logger = options.logger;
    this.catalog = options.catalog;
    this.auth = options.auth;
    this.logger.info('ApiService initialized');
  }

  async getApisCount(
    ownershipType: OwnershipType,
    apiType: OpenApiType,
    userEntityRef: string | undefined,
  ): Promise<number> {
    return countApiDefinitions(
      this.catalog,
      this.auth,
      ownershipType,
      apiType,
      userEntityRef,
    );
  }

  async listApis(
    request: ApiDefinitionsListRequest,
  ): Promise<ApiDefinitionListResult> {
    const entities = await fetchApiEntities(
      this.catalog,
      this.auth,
      [
        CATALOG_KIND,
        CATALOG_METADATA_NAME,
        CATALOG_METADATA_NAMESPACE,
        CATALOG_METADATA_DESCRIPTION,
        CATALOG_METADATA_API_NAME,
        CATALOG_METADATA_API_TYPE,
        CATALOG_METADATA_API_PROJECT,
        CATALOG_METADATA_API_VERSION,
        CATALOG_SPEC_SYSTEM,
        CATALOG_SPEC_OWNER,
      ],
      request.ownershipType ?? 'all',
      request.apiType ?? 'all',
      request.userEntityRef,
      getOrder(request.orderBy),
    );

    // Combine filtering and grouping in single pass
    const latestEntities = getLatestByApiName(entities, request.search);

    const { offset, limit } = normalizePagination(
      request.offset,
      request.limit,
    );
    const totalCount = latestEntities.length;
    const sortedEntities = sortApiEntities(latestEntities, request.orderBy);
    const items = sortedEntities.slice(offset, offset + limit);

    return createPage(items, offset, limit, totalCount);
  }

  async getApiVersions(request: {
    system?: string;
    apiName: string;
  }): Promise<ApiVersionDefinition[]> {
    return innerGetApiVersions(
      this.catalog,
      this.auth,
      request.system,
      request.apiName,
    );
  }

  async getApiMatchingVersion(request: {
    system?: string;
    apiName: string;
    apiVersion: string;
  }): Promise<ApiVersionDefinition | undefined> {
    const entities = await this.catalog.queryEntities(
      {
        filter: getFilter(request.apiName, request.system),
        query: {
          [CATALOG_METADATA_API_VERSION]: {
            $hasPrefix: request.apiVersion,
          },
        },
        fields: [
          CATALOG_KIND,
          CATALOG_METADATA_NAME,
          CATALOG_METADATA_NAMESPACE,
          CATALOG_METADATA_API_NAME,
          CATALOG_METADATA_API_VERSION,
          CATALOG_METADATA_API_PROJECT,
          CATALOG_SPEC_SYSTEM,
        ],
        limit: 1,
      },
      { credentials: await this.auth.getOwnServiceCredentials() },
    );
    const entity = entities.items[0];
    const version =
      entity?.metadata.annotations?.[ANNOTATION_API_VERSION]?.toString();
    if (!entity || !version) {
      return undefined;
    }

    return {
      name:
        entity.metadata.annotations?.[ANNOTATION_API_NAME]?.toString() ??
        request.apiName,
      system: entity.spec?.system?.toString(),
      namespace: entity.metadata.namespace,
      entityRef: stringifyEntityRef(entity),
      version,
      project:
        entity.metadata.annotations?.[ANNOTATION_API_PROJECT]?.toString() || '',
    };
  }

  async getApiRelations(request: {
    system?: string;
    apiName: string;
    apiVersion?: string;
    relationType: ApiRelationType;
  }): Promise<ApiRelationsDefinition[]> {
    const entities = await this.catalog.getEntities(
      {
        filter: {
          kind: ['API'],
          'metadata.annotations.api.depo.be/name': request.apiName,
          ...(request.system === undefined
            ? {}
            : { 'spec.system': request.system }),
        },
        fields: [
          CATALOG_KIND,
          CATALOG_METADATA_NAME,
          CATALOG_METADATA_NAMESPACE,
          CATALOG_METADATA_API_NAME,
          CATALOG_METADATA_API_VERSION,
          CATALOG_SPEC_SYSTEM,
          CATALOG_RELATIONS,
        ],
      },
      { credentials: await this.auth.getOwnServiceCredentials() },
    );

    // Map relationType to Backstage relation type
    const relationTypeFilter =
      request.relationType === 'provider' ? 'apiProvidedBy' : 'apiConsumedBy';

    const relations: ApiRelationsDefinition[] = [];
    for (const entity of entities.items) {
      const apiVersion =
        entity.metadata.annotations?.[ANNOTATION_API_VERSION]?.toString();
      if (
        !apiVersion ||
        (request.apiVersion !== undefined && apiVersion !== request.apiVersion)
      ) {
        continue;
      }

      // Build services array directly without intermediate filter array
      const entityRelations = entity.relations;
      if (!entityRelations?.length) continue;

      const services: ApiRelationsDefinition['services'] = [];
      for (const relation of entityRelations) {
        if (relation.type === relationTypeFilter) {
          const svcEntity = await this.catalog.getEntityByRef(
            relation.targetRef,
            {
              credentials: await this.auth.getOwnServiceCredentials(),
            },
          );
          services.push({
            service: {
              name:
                svcEntity?.metadata.annotations?.[
                  ANNOTATION_SERVICE_NAME
                ]?.toString() || '',
              system: svcEntity?.spec?.system?.toString(),
              namespace: svcEntity?.metadata.namespace,
              entityRef: relation.targetRef,
              owner: svcEntity?.spec?.owner?.toString() || '',
              environment: svcEntity?.spec?.lifecycle?.toString() || '',
              version:
                svcEntity?.metadata.annotations?.[
                  ANNOTATION_SERVICE_VERSION
                ]?.toString() || '',
              imageVersion:
                svcEntity?.metadata.annotations?.[
                  ANNOTATION_SERVICE_IMAGE_VERSION
                ]?.toString() || '',
              platform:
                svcEntity?.metadata.annotations?.[
                  ANNOTATION_SERVICE_PLATFORM
                ]?.toString() || '',
            },
            version: apiVersion,
            lifecycle: relation.type,
          });
        }
      }

      if (services.length > 0) {
        relations.push({
          name:
            entity.metadata.annotations?.[ANNOTATION_API_NAME]?.toString() ??
            request.apiName,
          system: entity.spec?.system?.toString(),
          namespace: entity.metadata.namespace,
          entityRef: stringifyEntityRef(entity),
          apiVersion,
          version: apiVersion,
          services,
        });
      }
    }
    return relations;
  }
}

export const apiServiceRef = createServiceRef<ApiService>({
  id: 'api-platform.api.service',
  defaultFactory: async service =>
    createServiceFactory({
      service,
      deps: {
        logger: coreServices.logger,
        auth: coreServices.auth,
        catalog: catalogServiceRef,
      },
      async factory({ logger, catalog, auth }) {
        const apiService = new ApiServiceImpl({
          logger,
          catalog,
          auth,
        });
        return apiService;
      },
    }),
});
