import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { ServiceService } from './types';
import {
  ANNOTATION_IMAGE_VERSION,
  ANNOTATION_SERVICE_NAME,
  ANNOTATION_SERVICE_PLATFORM,
  ANNOTATION_SERVICE_VERSION,
  CATALOG_METADATA_IMAGE_VERSION,
  CATALOG_METADATA_NAME,
  CATALOG_METADATA_NAMESPACE,
  CATALOG_METADATA_SERVICE_NAME,
  CATALOG_METADATA_SERVICE_PLATFORM,
  CATALOG_METADATA_SERVICE_VERSION,
  CATALOG_SPEC_DEPENDS_ON,
  CATALOG_SPEC_LIFECYCLE,
  CATALOG_SPEC_OWNER,
  CATALOG_SPEC_SYSTEM,
  OwnershipType,
  ServiceDefinition,
  ServiceDefinitionListResult,
  ServiceDefinitionsListRequest,
  ServiceDefinitionsOptions,
} from '@internal/plugin-api-platform-common';
import { CatalogApi, EntityFilterQuery } from '@backstage/catalog-client';
import { Entity } from '@backstage/catalog-model';
import { getUserGroups } from '../common/utils';
import { getCatalogToken } from '../common/token';

function getFilter(serviceName?: string): EntityFilterQuery {
  if (serviceName) {
    return {
      kind: ['Component'],
      'spec.type': ['service'],
      'metadata.service-name': serviceName
    };
  }
  return {
    kind: ['Component'],
    'spec.type': ['service']
  };
}

function getSortOrder(order: ServiceDefinitionsOptions | undefined): { field1: "serviceName" | "system"; field2: "serviceName" | "system"; order: 'asc' | 'desc'; } | undefined {
  if (!order) return undefined;
  return {
    field1: order.field === 'name' ? 'serviceName' : 'system',
    field2: order.field === 'name' ? 'system' : 'serviceName',
    order: order.direction,
  };
}

async function innerGetServices(catalogClient: CatalogApi, auth: AuthService, orderBy: ServiceDefinitionsOptions | undefined, serviceName: string | undefined): Promise<ServiceDefinition[]> {
  const token = await getCatalogToken(auth);
  const entities = await catalogClient.getEntities(
    {
      filter: getFilter(serviceName),
      fields: [
        CATALOG_METADATA_NAME,
        CATALOG_METADATA_NAMESPACE,
        CATALOG_METADATA_SERVICE_NAME,
        CATALOG_METADATA_SERVICE_PLATFORM,
        CATALOG_METADATA_SERVICE_VERSION,
        CATALOG_METADATA_IMAGE_VERSION,
        CATALOG_SPEC_SYSTEM,
        CATALOG_SPEC_LIFECYCLE,
        CATALOG_SPEC_OWNER,
        CATALOG_SPEC_DEPENDS_ON,
      ],
      order: {
        field: CATALOG_METADATA_NAME,
        order: 'asc'
      },
    },
    { token });

  return processServiceEntities(entities.items, orderBy);
}

// Shared function to fetch service entities with ownership filter
async function fetchServiceEntities(
  catalogClient: CatalogApi,
  auth: AuthService,
  fields: string[],
  ownership: OwnershipType,
  userEntityRef: string | undefined,
): Promise<Entity[]> {
  const token = await getCatalogToken(auth);

  // Fetch user groups in parallel with entities if needed
  const [entities, userGroupRefs] = await Promise.all([
    catalogClient.getEntities(
      {
        filter: getFilter(undefined),
        fields,
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

function parseDependencies(dependsOn: any): string[] {
  if (Array.isArray(dependsOn)) {
    return dependsOn.map(dep => dep.toString().replace(/^component:/, ''));
  } else if (dependsOn) {
    return [dependsOn.toString().replace(/^component:/, '')];
  }
  return [];
}

// Process entities into ServiceDefinition array
function processServiceEntities(entities: Entity[], orderBy: ServiceDefinitionsOptions | undefined, dependsOn?: string): ServiceDefinition[] {
  const mapServices = new Map<string, ServiceDefinition>();

  for (const entity of entities) {
    if (!entity.metadata || !entity.spec) continue;

    const name = entity.metadata[ANNOTATION_SERVICE_NAME]?.toString();
    const system = entity.spec.system?.toString();
    const version = entity.metadata[ANNOTATION_SERVICE_VERSION]?.toString();
    if (!name || !version) continue;

    const dependsOnList = parseDependencies(entity.spec.dependsOn);
    if (dependsOn && !dependsOnList.includes(dependsOn)) {
      continue;
    }

    const lifecycle = entity.spec.lifecycle?.toString().toLowerCase() || '-';
    const mapKey = `${system}-${name}`;

    // Get or create service definition
    let def = mapServices.get(mapKey);
    if (!def) {
      def = {
        name: mapKey,
        serviceName: name,
        owner: entity.spec.owner?.toString() || '',
        system: system || '-',
        versions: []
      };
      mapServices.set(mapKey, def);
    }

    // Find or create version definition
    let defVersion = def.versions.find(svcDef => svcDef.version === version);
    if (!defVersion) {
      defVersion = {
        version,
        environments: {}
      };
      def.versions.push(defVersion);
    }

    // Add environment info
    const platforms = entity.metadata[ANNOTATION_SERVICE_PLATFORM]?.toString() || 'cloud';

    defVersion.environments[lifecycle as keyof typeof defVersion.environments] = {
      imageVersion: entity.metadata[ANNOTATION_IMAGE_VERSION]?.toString() || '?',
      entityRef: `component:${entity.metadata.namespace}/${entity.metadata.name}`,
      platform: platforms,
      dependencies: parseDependencies(entity.spec.dependsOn),
    };
  }

  

  // Sort versions once per service
  for (const def of mapServices.values()) {
    def.versions.sort((a, b) =>
      a.version.localeCompare(b.version, undefined, { numeric: true })
    );
  }

  const svcDefs = Array.from(mapServices.values());

  // Sort by order
  if (orderBy) {
    const order = getSortOrder(orderBy);
    if (order) {
      svcDefs.sort((a, b) => {
        const compare1 = a[order.field1].localeCompare(b[order.field1]);
        if (compare1 !== 0) {
          return order.order === 'asc' ? compare1 : -compare1;
        }
        const compare2 = a[order.field2].localeCompare(b[order.field2]);
        return order.order === 'asc' ? compare2 : -compare2;
      });
    }
  }

  return svcDefs;
}

// Extract unique service count from entities
function countUniqueServices(entities: Entity[]): number {
  const uniqueNames = new Set<string>();
  for (const entity of entities) {
    if (entity.metadata) {
      const system = entity.spec?.system?.toString() ?? '';
      const serviceName = entity.metadata[ANNOTATION_SERVICE_NAME]?.toString() ?? '';
      if (serviceName) {
        uniqueNames.add(`${system}-${serviceName}`);
      }
    }
  }
  return uniqueNames.size;
}

export interface ServiceServiceOptions {
  logger: LoggerService;
  catalogClient: CatalogApi;
  auth: AuthService;
}

export async function serviceService(options: ServiceServiceOptions): Promise<ServiceService> {
  const { logger, catalogClient, auth } = options;

  logger.info('Initializing ServiceService');

  return {

    async getServicesCount(ownership: OwnershipType, userEntityRef: string | undefined): Promise<number> {
      const entities = await fetchServiceEntities(
        catalogClient,
        auth,
        [CATALOG_SPEC_SYSTEM, CATALOG_METADATA_SERVICE_NAME, CATALOG_SPEC_OWNER],
        ownership,
        userEntityRef,
      );
      return countUniqueServices(entities);
    },

    async listServices(request: ServiceDefinitionsListRequest): Promise<ServiceDefinitionListResult> {
      const entities = await fetchServiceEntities(
        catalogClient,
        auth,
        [
          CATALOG_METADATA_NAME,
          CATALOG_METADATA_NAMESPACE,
          CATALOG_METADATA_SERVICE_NAME,
          CATALOG_METADATA_SERVICE_PLATFORM,
          CATALOG_METADATA_SERVICE_VERSION,
          CATALOG_METADATA_IMAGE_VERSION,
          CATALOG_SPEC_SYSTEM,
          CATALOG_SPEC_LIFECYCLE,
          CATALOG_SPEC_OWNER,
          CATALOG_SPEC_DEPENDS_ON
        ],
        request.ownership ?? 'all',
        request.userEntityRef,
      );

      let services = processServiceEntities(entities, request.orderBy, request.dependsOn);

      const search = request.search?.toLowerCase();
      if (search) {
        services = services.filter(svc => (
          svc.name.toLowerCase().includes(search) ||
          svc.system.toLowerCase().includes(search)
        ));
      }

      const offset = request.offset ?? 0;
      const limit = request.limit ?? 20;
      return {
        items: services.slice(offset, offset + limit),
        offset,
        limit,
        totalCount: services.length,
      };
    },

    async getServiceVersions(request: { system: string, serviceName: string }): Promise<ServiceDefinition> {
      const { system, serviceName } = request;
      const services = await innerGetServices(catalogClient, auth, undefined, serviceName);
      // Find first matching service (array already filtered by serviceName at query level)
      return services.find(svc => svc.system === system) ?? {
        name: `${system}-${serviceName}`,
        serviceName,
        owner: '',
        system,
        versions: [],
      };
    },

  };
}