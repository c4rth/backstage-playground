import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { ServicePlatformService } from './types';
import {
  ANNOTATION_IMAGE_VERSION,
  ANNOTATION_SERVICE_NAME,
  ANNOTATION_SERVICE_VERSION,
  CATALOG_METADATA_IMAGE_VERSION,
  CATALOG_METADATA_NAME,
  CATALOG_METADATA_NAMESPACE,
  CATALOG_METADATA_SERVICE_NAME,
  CATALOG_METADATA_SERVICE_VERSION,
  CATALOG_RELATIONS,
  CATALOG_SPEC_LIFECYCLE,
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
        CATALOG_METADATA_IMAGE_VERSION,
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
          imageVersion: entity.metadata[ANNOTATION_IMAGE_VERSION]?.toString() || '?',
          entityRef: `component:${entity.metadata.namespace}/${entity.metadata.name}`,
        }
        break;
      case 'gtu':
        defVersion.environments.gtu = {
          imageVersion: entity.metadata[ANNOTATION_IMAGE_VERSION]?.toString() || '?',
          entityRef: `component:${entity.metadata.namespace}/${entity.metadata.name}`,
        }
        break;
      case 'uat':
        defVersion.environments.uat = {
          imageVersion: entity.metadata[ANNOTATION_IMAGE_VERSION]?.toString() || '?',
          entityRef: `component:${entity.metadata.namespace}/${entity.metadata.name}`,
        }
        break;
      case 'ptp':
        defVersion.environments.ptp = {
          imageVersion: entity.metadata[ANNOTATION_IMAGE_VERSION]?.toString() || '?',
          entityRef: `component:${entity.metadata.namespace}/${entity.metadata.name}`,
        }
        break;
      case 'prd':
        defVersion.environments.prd = {
          imageVersion: entity.metadata[ANNOTATION_IMAGE_VERSION]?.toString() || '?',
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
 
    async getServiceInformation(request: { applicationCode: string, serviceName: string, serviceVersion: string, imageVersion: string }): Promise<ServiceInformation | undefined> {
      const { applicationCode, serviceName, serviceVersion, imageVersion } = request;
      logger.info(`Get service ${applicationCode}-${serviceName}-${serviceVersion}-${imageVersion}`);
      return await apiPlatformStore.getServiceInformation(applicationCode,serviceName, serviceVersion, imageVersion);
    },
 
    async addServiceInformation(request: { serviceInformation: ServiceInformation }): Promise<string> {
      const { serviceInformation } = request;
      logger.info(`Add serviceInformation ${serviceInformation}`);
      await apiPlatformStore.storeServiceInformation(serviceInformation)
      return "ok";
    }
  }
 
}