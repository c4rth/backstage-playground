import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { ServicePlatformService } from './types';
import {
  ANNOTATION_IMAGE_VERSION,
  ANNOTATION_SERVICE_NAME,
  ANNOTATION_SERVICE_PLATFORM,
  ANNOTATION_SERVICE_VERSION,
  CATALOG_METADATA,
  CATALOG_RELATIONS,
  CATALOG_SPEC_LIFECYCLE,
  CATALOG_SPEC_SYSTEM,
  ServiceDefinition,
  ServiceInformation,
  ServiceVersionDefinition
} from '@internal/plugin-api-platform-common';
import { CatalogApi, EntityFilterQuery } from '@backstage/catalog-client';
import { ApiPlatformStore } from '../../database/apiPlatformStore';
import { RELATION_OWNED_BY } from '@backstage/catalog-model';

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

async function innerGetServices(catalogClient: CatalogApi, auth: AuthService, serviceName: string | undefined): Promise<ServiceDefinition[]> {
  const { token } = await auth.getPluginRequestToken({
    onBehalfOf: await auth.getOwnServiceCredentials(),
    targetPluginId: 'catalog',
  });
  const entities = await catalogClient.getEntities(
    {
      filter: getFilter(serviceName),
      fields: [
        CATALOG_METADATA,
        CATALOG_SPEC_SYSTEM,
        CATALOG_SPEC_LIFECYCLE,
        CATALOG_RELATIONS],
    },
    { token });

  const mapServices = new Map<string, ServiceDefinition>();

  for (const entity of entities.items) {
    const name = entity.metadata[ANNOTATION_SERVICE_NAME]?.toString();
    const version = entity.metadata[ANNOTATION_SERVICE_VERSION]?.toString();
    if (!name || !version) continue;

    const lifecycle = entity.spec?.lifecycle?.toString().toLowerCase() || '-';
    
    // Get or create service definition
    let def = mapServices.get(name);
    if (!def) {
      def = {
        name,
        owner: entity.relations?.find(rel => rel.type === RELATION_OWNED_BY)?.targetRef || '',
        system: entity.spec?.system?.toString() || '-',
        versions: []
      };
      mapServices.set(name, def);
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

  return Array.from(mapServices.values());
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

    async listServices(): Promise<{ items: ServiceDefinition[] }> {
      const services = await innerGetServices(catalogClient, auth, undefined);
      return { items: services };
    },

    async getServiceVersions(request: { serviceName: string }): Promise<ServiceDefinition> {
      const { serviceName } = request;
      const services = await innerGetServices(catalogClient, auth, serviceName);
      return services[0];
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