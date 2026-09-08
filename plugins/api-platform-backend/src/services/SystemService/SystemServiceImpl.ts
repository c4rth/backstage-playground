import {
  AuthService,
  coreServices,
  createServiceFactory,
  createServiceRef,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { EntityOrderQuery } from '@backstage/catalog-client';
import { SystemService } from './types';
import {
  ANNOTATION_API_NAME,
  ANNOTATION_SERVICE_NAME,
  CATALOG_KIND,
  CATALOG_METADATA_API_NAME,
  CATALOG_METADATA_DESCRIPTION,
  CATALOG_METADATA_LIBRARY_NAME,
  CATALOG_METADATA_NAME,
  CATALOG_RELATIONS,
  CATALOG_METADATA_SERVICE_NAME,
  CATALOG_SPEC_OWNER,
  SystemDefinition,
  SystemDefinitionListResult,
  SystemDefinitionsListRequest,
  SystemDefinitionsOptions,
  OwnershipType,
  ANNOTATION_LIBRARY_NAME,
} from '@internal/plugin-api-platform-common';
import { getUserGroups, isUserGuest } from '../common/utils';
import {
  CatalogService,
  catalogServiceRef,
} from '@backstage/plugin-catalog-node';

export interface SystemServiceOptions {
  logger: LoggerService;
  catalog: CatalogService;
  auth: AuthService;
}

function getOrder(
  order: SystemDefinitionsOptions | undefined,
): EntityOrderQuery | undefined {
  if (!order) return undefined;
  const fieldMap: Record<string, string> = {
    name: CATALOG_METADATA_NAME,
    description: CATALOG_METADATA_DESCRIPTION,
    owner: CATALOG_SPEC_OWNER,
  };
  return {
    field: fieldMap[order.field] ?? CATALOG_METADATA_NAME,
    order: order.direction === 'descending' ? 'desc' : 'asc',
  };
}

export class SystemServiceImpl implements SystemService {
  private readonly catalog: CatalogService;
  private readonly auth: AuthService;

  constructor(options: SystemServiceOptions) {
    this.catalog = options.catalog;
    this.auth = options.auth;

    options.logger.info('Initializing SystemService');
  }

  async getSystemsCount(
    ownershipType: OwnershipType,
    userEntityRef: string | undefined,
  ): Promise<number> {
    if (ownershipType === 'owned' && isUserGuest(userEntityRef)) {
      return 0;
    }

    const userGroupRefs =
      ownershipType === 'owned' && userEntityRef
        ? await getUserGroups(this.catalog, this.auth, userEntityRef)
        : [];
    if (ownershipType === 'owned' && userGroupRefs.length === 0) {
      return 0;
    }

    const filter =
      ownershipType === 'owned'
        ? userGroupRefs.map(owner => ({
            kind: ['System'],
            'spec.owner': owner,
          }))
        : { kind: ['System'] };
    const result = await this.catalog.queryEntities(
      { filter, limit: 0 },
      { credentials: await this.auth.getOwnServiceCredentials() },
    );

    return result.totalItems;
  }

  async listSystems(
    request: SystemDefinitionsListRequest,
  ): Promise<SystemDefinitionListResult> {
    const offset = request.offset ?? 0;
    const limit = request.limit ?? 20;
    const ownershipType = request.ownershipType ?? 'all';

    if (ownershipType === 'owned' && isUserGuest(request.userEntityRef)) {
      return { items: [], offset, limit, totalCount: 0 };
    }

    const userGroupRefs =
      ownershipType === 'owned' && request.userEntityRef
        ? await getUserGroups(this.catalog, this.auth, request.userEntityRef)
        : [];

    if (ownershipType === 'owned' && userGroupRefs.length === 0) {
      return { items: [], offset, limit, totalCount: 0 };
    }

    const filter =
      ownershipType === 'owned'
        ? userGroupRefs.map(owner => ({
            kind: ['System'],
            'spec.owner': owner,
          }))
        : { kind: ['System'] };
    const systems = await this.catalog.queryEntities(
      {
        filter,
        fields: [CATALOG_KIND, CATALOG_METADATA_NAME, CATALOG_SPEC_OWNER],
        orderFields: getOrder(request.orderBy),
        fullTextFilter: request.search
          ? {
              term: request.search,
              fields: [CATALOG_METADATA_NAME, CATALOG_SPEC_OWNER],
            }
          : undefined,
        offset,
        limit,
      },
      { credentials: await this.auth.getOwnServiceCredentials() },
    );

    return {
      items: systems.items,
      offset,
      limit,
      totalCount: systems.totalItems,
    };
  }

  async getSystem(systemName: string): Promise<SystemDefinition> {
    // Fetch system entity
    const systemEntities = await this.catalog.getEntities(
      {
        filter: { kind: ['System'], 'metadata.name': systemName },
        fields: [
          CATALOG_KIND,
          CATALOG_METADATA_NAME,
          CATALOG_METADATA_DESCRIPTION,
          CATALOG_RELATIONS,
        ],
      },
      { credentials: await this.auth.getOwnServiceCredentials() },
    );

    const entity = systemEntities.items[0];

    if (!entity?.relations || entity.relations.length === 0) {
      return { entity, apis: [], services: [], libraries: [] };
    }

    // Keep the first occurrence order while avoiding duplicate catalog lookups.
    const targetRefs = [...new Set(entity.relations.map(rel => rel.targetRef))];

    // Batch fetch only the fields needed to classify related entities.
    const relatedEntities = await this.catalog.getEntitiesByRefs(
      {
        entityRefs: targetRefs,
        fields: [
          CATALOG_KIND,
          CATALOG_METADATA_API_NAME,
          CATALOG_METADATA_SERVICE_NAME,
          CATALOG_METADATA_LIBRARY_NAME,
        ],
      },
      { credentials: await this.auth.getOwnServiceCredentials() },
    );

    // Use Sets to collect unique names
    const apiNames = new Set<string>();
    const serviceNames = new Set<string>();
    const libraryNames = new Set<string>();

    for (const relEntity of relatedEntities.items) {
      if (!relEntity) continue;

      if (relEntity.kind === 'API') {
        const name =
          relEntity.metadata.annotations?.[ANNOTATION_API_NAME]?.toString();
        if (name) apiNames.add(name);
      } else if (relEntity.kind === 'Component') {
        const name =
          relEntity.metadata?.annotations?.[ANNOTATION_SERVICE_NAME]?.toString();
        if (name) {
          serviceNames.add(name);
          continue;
        }
        const libName =
          relEntity.metadata?.annotations?.[ANNOTATION_LIBRARY_NAME]?.toString();
        if (libName) libraryNames.add(libName);
      }
    }

    return {
      entity,
      apis: Array.from(apiNames),
      services: Array.from(serviceNames),
      libraries: Array.from(libraryNames),
    };
  }
}

export const systemServiceRef = createServiceRef<SystemService>({
  id: 'api-platform.system.service',
  defaultFactory: async service =>
    createServiceFactory({
      service,
      deps: {
        logger: coreServices.logger,
        auth: coreServices.auth,
        catalog: catalogServiceRef,
      },
      async factory({ logger, catalog, auth }) {
        const systemService = new SystemServiceImpl({
          logger,
          catalog,
          auth,
        });
        return systemService;
      },
    }),
});
