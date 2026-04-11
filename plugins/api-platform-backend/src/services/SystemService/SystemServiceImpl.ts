import { AuthService, coreServices, createServiceFactory, createServiceRef, LoggerService } from '@backstage/backend-plugin-api';
import { EntityOrderQuery } from '@backstage/catalog-client';
import { Entity } from '@backstage/catalog-model';
import { SystemService } from './types';
import {
  ANNOTATION_API_NAME,
  ANNOTATION_SERVICE_NAME,
  CATALOG_KIND,
  CATALOG_METADATA_DESCRIPTION,
  CATALOG_METADATA_NAME,
  CATALOG_RELATIONS,
  CATALOG_SPEC_OWNER,
  SystemDefinition,
  SystemDefinitionListResult,
  SystemDefinitionsListRequest,
  SystemDefinitionsOptions,
  OwnershipType,
  ANNOTATION_LIBRARY_NAME
} from '@internal/plugin-api-platform-common';
import { getUserGroups, isUserGuest } from '../common/utils';
import { CatalogService, catalogServiceRef } from '@backstage/plugin-catalog-node';

export interface SystemServiceOptions {
  logger: LoggerService;
  catalog: CatalogService;
  auth: AuthService;
}

function getOrder(order: SystemDefinitionsOptions | undefined): EntityOrderQuery | undefined {
  if (!order) return undefined;
  const fieldMap: Record<string, string> = {
    name: CATALOG_METADATA_NAME,
    description: CATALOG_METADATA_DESCRIPTION,
    owner: CATALOG_SPEC_OWNER,
  };
  return {
    field: fieldMap[order.field] ?? CATALOG_METADATA_NAME,
    order: order.direction,
  };
}

// Shared function to fetch system entities with ownership filter
async function fetchSystemEntities(
  catalog: CatalogService,
  auth: AuthService,
  fields: string[],
  ownership: OwnershipType,
  userEntityRef: string | undefined,
  order?: EntityOrderQuery,
): Promise<Entity[]> {

  if (ownership === 'owned' && isUserGuest(userEntityRef)) {
    // Guest users have no owned systems
    return [];
  }

  // Fetch entities and user groups in parallel if ownership filtering needed
  const [entities, userGroupRefs] = await Promise.all([
    catalog.getEntities(
      {
        filter: { kind: ['System'] },
        fields,
        order,
      },
      { credentials: await auth.getOwnServiceCredentials() },
    ).then(res => res.items),
    ownership === 'owned' && userEntityRef
      ? getUserGroups(catalog, auth, userEntityRef)
      : Promise.resolve([] as string[]),
  ]);

  // Filter by ownership if needed - use Set for O(1) lookup
  if (ownership === 'owned' && userEntityRef && userGroupRefs.length > 0) {
    const groupSet = new Set(userGroupRefs);
    return entities.filter(entity => {
      const owner = entity.spec?.owner?.toString() || '';
      return groupSet.has(owner);
    });
  }

  return entities;
}

export class SystemServiceImpl implements SystemService {

  private readonly catalog: CatalogService;
  private readonly auth: AuthService;

  constructor(options: SystemServiceOptions) {
    this.catalog = options.catalog;
    this.auth = options.auth;

    options.logger.info('Initializing SystemService');
  }

  async getSystemsCount(ownership: OwnershipType, userEntityRef: string | undefined): Promise<number> {
    const entities = await fetchSystemEntities(
      this.catalog,
      this.auth,
      [CATALOG_METADATA_NAME, CATALOG_SPEC_OWNER],
      ownership,
      userEntityRef,
    );
    return entities.length;
  }

  async listSystems(request: SystemDefinitionsListRequest): Promise<SystemDefinitionListResult> {
    const entities = await fetchSystemEntities(
      this.catalog,
      this.auth,
      [CATALOG_KIND, CATALOG_METADATA_NAME, CATALOG_SPEC_OWNER],
      request.ownership ?? 'all',
      request.userEntityRef,
      getOrder(request.orderBy),
    );

    // Map to SystemDefinition format
    let systems = entities.map(entity => ({
      apiVersion: entity.apiVersion,
      kind: entity.kind,
      metadata: entity.metadata,
      spec: entity.spec,
    }));

    const search = request.search?.toLowerCase();
    if (search) {
      systems = systems.filter(system => (
        system.metadata.name.toLowerCase().includes(search) ||
        (system.spec?.owner?.toString() || '').toLowerCase().includes(search)
      ));
    }

    const offset = request.offset ?? 0;
    const limit = request.limit ?? 20;
    return {
      items: systems.slice(offset, offset + limit),
      offset,
      limit,
      totalCount: systems.length,
    };
  }

  async getSystem(systemName: string): Promise<SystemDefinition> {
    // Fetch system entity
    const systemEntities = await this.catalog.getEntities(
      {
        filter: { kind: ['System'], 'metadata.name': systemName },
        fields: [CATALOG_KIND, CATALOG_METADATA_NAME, CATALOG_METADATA_DESCRIPTION, CATALOG_RELATIONS],
      },
      { credentials: await this.auth.getOwnServiceCredentials() }
    );

    const entity = systemEntities.items[0];
    const system: SystemDefinition = {
      entity,
      apis: [],
      services: [],
      libraries: [],
    };

    if (!entity?.relations || entity.relations.length === 0) {
      return system;
    }

    // Extract entity refs from relations
    const targetRefs = entity.relations.map(rel => rel.targetRef);

    // Batch fetch all related entities in a single query instead of N individual calls
    const relatedEntities = await this.catalog.getEntitiesByRefs(
      { entityRefs: targetRefs },
      { credentials: await this.auth.getOwnServiceCredentials() }
    );

    // Use Sets to collect unique names
    const apiNames = new Set<string>();
    const serviceNames = new Set<string>();
    const libraryNames = new Set<string>();

    for (const relEntity of relatedEntities.items) {
      if (!relEntity) continue;

      if (relEntity.kind === 'API') {
        const name = relEntity.metadata.annotations?.[ANNOTATION_API_NAME]?.toString();
        if (name) apiNames.add(name);
      } else if (relEntity.kind === 'Component') {
        const name = relEntity.metadata.annotations?.[ANNOTATION_SERVICE_NAME]?.toString();
        if (name) {
          serviceNames.add(name);
          continue;
        }
        const libName = relEntity.metadata.annotations?.[ANNOTATION_LIBRARY_NAME]?.toString();
        if (libName) libraryNames.add(libName);
      }
    }

    system.apis = Array.from(apiNames);
    system.services = Array.from(serviceNames);
    system.libraries = Array.from(libraryNames);

    return system;
  }
};

export const systemServiceRef = createServiceRef<SystemService>({
  id: 'api-platform.system.service',
  defaultFactory: async service =>
    createServiceFactory({
      service,
      deps: {
        logger: coreServices.logger,
        auth: coreServices.auth,
        catalog: catalogServiceRef
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