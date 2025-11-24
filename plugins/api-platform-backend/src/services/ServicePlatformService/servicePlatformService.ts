import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { ServicePlatformService } from './types';
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
  CATALOG_SPEC_LIFECYCLE,
  CATALOG_SPEC_OWNER,
  CATALOG_SPEC_SYSTEM,
  OwnershipType,
  ServiceDefinition,
  ServiceDefinitionListResult,
  ServiceDefinitionsListRequest,
  ServiceDefinitionsOptions,
  ServiceInformation,
} from '@internal/plugin-api-platform-common';
import { CatalogApi, EntityFilterQuery } from '@backstage/catalog-client';
import { ApiPlatformStore } from '../../database/apiPlatformStore';
import { getUserGroups } from '../common/utils';

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
  const { token } = await auth.getPluginRequestToken({
    onBehalfOf: await auth.getOwnServiceCredentials(),
    targetPluginId: 'catalog',
  });
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
      ],
      order: { 
        field: CATALOG_METADATA_NAME, 
        order: 'asc' 
      },
    },
    { token });

  const mapServices = new Map<string, ServiceDefinition>();

  for (const entity of entities.items) {

    if (!entity.metadata || !entity.spec)
      continue;
    const name = entity.metadata[ANNOTATION_SERVICE_NAME]?.toString();
    const system = entity.spec.system?.toString();
    const version = entity.metadata[ANNOTATION_SERVICE_VERSION]?.toString();
    if (!name || !version)
      continue;

    const lifecycle = entity.spec.lifecycle?.toString().toLowerCase() || '-';

    // Get or create service definition
    const mapKey = `${system}-${name}`;
    let def = mapServices.get(mapKey);
    if (!def) {
      def = {
        name: mapKey,
        serviceName: name,
        owner: entity.spec.owner?.toString() || '',
        system: entity.spec?.system?.toString() || '-',
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
    };
  }

  // Sort versions once per service
  for (const def of mapServices.values()) {
    def.versions.sort((a, b) =>
      a.version.localeCompare(b.version, undefined, { numeric: true })
    );
  }

  console.log('*****************', mapServices)

  const svcDefs = Array.from(mapServices.values());


  console.log('*****************', svcDefs)

  // Sort by order
  if (orderBy) {
    const order = getSortOrder(orderBy);

    console.log('*****************', order)

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

export interface ServicePlatformServiceOptions {
  logger: LoggerService;
  catalogClient: CatalogApi;
  apiPlatformStore: ApiPlatformStore;
  auth: AuthService;
}

export async function servicePlatformService(options: ServicePlatformServiceOptions): Promise<ServicePlatformService> {
  const { logger, catalogClient, apiPlatformStore, auth } = options;

  logger.info('Initializing ServicePlatformService');

  return {

    async getServicesCount(ownership: OwnershipType, userEntityRef: string | undefined): Promise<number> {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      let allEntities = await catalogClient.getEntities(
        {
          filter: getFilter(undefined),
          fields: [
            CATALOG_SPEC_SYSTEM,
            CATALOG_METADATA_SERVICE_NAME,
            CATALOG_SPEC_OWNER,
          ],
        },
        { token }).then(res => res.items);

      if (ownership === 'owned' && userEntityRef) {
        const userGroupRefs = await getUserGroups(catalogClient, auth, userEntityRef!!);
        allEntities = allEntities.filter(entity => {
          const owner = entity.spec?.owner?.toString() || '';
          return userGroupRefs.includes(owner);
        });
      }

      const uniqueNames = new Set<string>();
      for (const entity of allEntities) {
        if (entity.metadata) {
          const svcName = `${entity.spec?.system?.toString()}-${entity.metadata[ANNOTATION_SERVICE_NAME]?.toString()}`;
          if (svcName) {
            uniqueNames.add(svcName);
          }
        }
      }

      return uniqueNames.size;
    },

    async listServices(request: ServiceDefinitionsListRequest): Promise<ServiceDefinitionListResult> {
      let services = await innerGetServices(catalogClient, auth, request.orderBy, undefined);
      if (request.ownership === 'owned') {
        const userGroupRefs = await getUserGroups(catalogClient, auth, request.userEntityRef!!);
        services = services.filter(service => {
          return userGroupRefs.includes(service.owner);
        });
      }

      const search = request.search?.toLowerCase();
      if (search) {
        services = services.filter(svc => {
          return (
            svc.name.toLowerCase().includes(search) ||
            svc.system.toLowerCase().includes(search)
          );
        });
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
      return services.filter(svc => svc.system === `${system}`)[0];
    },

    async getServiceInformation(request: { applicationCode: string, serviceName: string, serviceVersion: string, imageVersion: string }): Promise<ServiceInformation | undefined> {
      const { applicationCode, serviceName, serviceVersion, imageVersion } = request;
      const res = await apiPlatformStore.getServiceInformation(applicationCode, serviceName, serviceVersion, imageVersion);
      if (res) {
        return res;
      }
      return {
        applicationCode: applicationCode,
        serviceName: serviceName,
        serviceVersion: serviceVersion,
        imageVersion: imageVersion,
        repository: '',
        sonarQubeProjectKey: '',
        apiDependencies: {},
      };
    },

    async addServiceInformation(request: { serviceInformation: ServiceInformation }): Promise<string> {
      const { serviceInformation } = request;
      await apiPlatformStore.storeServiceInformation(serviceInformation)
      return "ok";
    }
  }

}