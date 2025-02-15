import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { ServicePlatformService } from './types';
import {
  ANNOTATION_CONTAINER_NAME,
  ANNOTATION_CONTAINER_VERSION,
  ANNOTATION_SERVICE_NAME,
  ANNOTATION_SERVICE_VERSION,
  CATALOG_METADATA_CONTAINER_NAME,
  CATALOG_METADATA_CONTAINER_VERSION,
  CATALOG_METADATA_NAME,
  CATALOG_METADATA_NAMESPACE,
  CATALOG_METADATA_SERVICE_NAME,
  CATALOG_METADATA_SERVICE_VERSION,
  CATALOG_RELATIONS,
  CATALOG_SPEC_LIFECYCLE,
  ServiceApisDefinition,
  ServiceDefinition,
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

async function innerGetServices(logger: LoggerService, catalogClient: CatalogApi, auth: AuthService, serviceName: string | undefined): Promise<ServiceDefinition[]> {
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
        CATALOG_METADATA_SERVICE_VERSION,
        CATALOG_METADATA_CONTAINER_NAME,
        CATALOG_METADATA_CONTAINER_VERSION,
        CATALOG_SPEC_LIFECYCLE,
        CATALOG_RELATIONS],
    },
    { token });

  const mapServices: Map<string, ServiceDefinition> = new Map();

  entities.items.forEach(entity => {
    const name = entity.metadata[ANNOTATION_SERVICE_NAME]?.toString() || '?';
    const version = entity.metadata[ANNOTATION_SERVICE_VERSION]?.toString() || '?';
    const lifecycle = entity.spec?.lifecycle?.toString().toLowerCase() || '?';
    let def: ServiceDefinition;
    if (mapServices.has(name)) {
      def = mapServices.get(name)!;
    } else {
      def = {
        name: name,
        owner: entity.relations?.filter(rel => rel.type === RELATION_OWNED_BY).at(0)?.targetRef || '',
        versions: []
      };
    }
    const defVersions = def.versions.filter((svcDef: ServiceVersionDefinition) => svcDef.version === version);
    let defVersion: ServiceVersionDefinition;
    if (defVersions.length > 0) {
      defVersion = defVersions.at(0)!;
    } else {
      defVersion = {
        version: version,
        environments: {
        }
      };
      def.versions.push(defVersion);
    }
    switch (lifecycle) {
      case 'tst':
        defVersion.environments.tst = {
          containerVersion: entity.metadata[ANNOTATION_CONTAINER_VERSION]?.toString() || '?',
          containerName: entity.metadata[ANNOTATION_CONTAINER_NAME]?.toString() || '?',
          entityRef: `component:${entity.metadata.namespace}/${entity.metadata.name}`,
        }
        break;
      case 'gtu':
        defVersion.environments.gtu = {
          containerVersion: entity.metadata[ANNOTATION_CONTAINER_VERSION]?.toString() || '?',
          containerName: entity.metadata[ANNOTATION_CONTAINER_NAME]?.toString() || '?',
          entityRef: `component:${entity.metadata.namespace}/${entity.metadata.name}`,
        }
        break;
      case 'uat':
        defVersion.environments.uat = {
          containerVersion: entity.metadata[ANNOTATION_CONTAINER_VERSION]?.toString() || '?',
          containerName: entity.metadata[ANNOTATION_CONTAINER_NAME]?.toString() || '?',
          entityRef: `component:${entity.metadata.namespace}/${entity.metadata.name}`,
        }
        break;
      case 'ptp':
        defVersion.environments.ptp = {
          containerVersion: entity.metadata[ANNOTATION_CONTAINER_VERSION]?.toString() || '?',
          containerName: entity.metadata[ANNOTATION_CONTAINER_NAME]?.toString() || '?',
          entityRef: `component:${entity.metadata.namespace}/${entity.metadata.name}`,
        }
        break;
      case 'prd':
        defVersion.environments.prd = {
          containerVersion: entity.metadata[ANNOTATION_CONTAINER_VERSION]?.toString() || '?',
          containerName: entity.metadata[ANNOTATION_CONTAINER_NAME]?.toString() || '?',
          entityRef: `component:${entity.metadata.namespace}/${entity.metadata.name}`,
        }
        break;
      default:
        logger.warn(`Unknonw lifecyle: ${lifecycle}`);
        break;
    }
    mapServices.set(name, def);
  });
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
      const services = await innerGetServices(logger, catalogClient, auth, undefined);
      return { items: services };
    },

    async getServiceVersions(request: { serviceName: string }): Promise<ServiceDefinition> {
      const { serviceName } = request;
      const services = await innerGetServices(logger, catalogClient, auth, serviceName);
      return services[0];
    },


    async getServiceApis(request: { serviceName: string, serviceVersion: string, containerVersion: string }): Promise<ServiceApisDefinition> {
      const { serviceName, serviceVersion, containerVersion } = request;
      logger.info(`Get service ${serviceName}-${serviceVersion}-${containerVersion}`);
      return await apiPlatformStore.getServiceApis(serviceName, serviceVersion, containerVersion);
    },

    async addServiceApis(request: { serviceName: string, serviceVersion: string, containerVersion: string, consumedApis?: string[], providedApis?: string[] }): Promise<string> {
      const { serviceName, serviceVersion, containerVersion, consumedApis, providedApis } = request;
      logger.info(`Add service ${serviceName}-${serviceVersion}-${containerVersion}: ${consumedApis} ${providedApis}`);
      await apiPlatformStore.storeServiceApis(
        serviceName,
        serviceVersion,
        containerVersion,
        consumedApis ? JSON.stringify(consumedApis) : undefined,
        providedApis ? JSON.stringify(providedApis) : undefined
      )
      return "ok";
    }
  }

}