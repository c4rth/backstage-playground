import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { ServicePlatformService } from './types';
import { API_PLATFORM_SERVICE_CONTAINER_NAME_ANNOTATION, API_PLATFORM_SERVICE_CONTAINER_VERSION_ANNOTATION, API_PLATFORM_SERVICE_NAME_ANNOTATION, API_PLATFORM_SERVICE_VERSION_ANNOTATION, ServiceDefinition, ServiceVersionDefinition } from '@internal/plugin-api-platform-common';
import { CatalogApi, EntityFilterQuery } from '@backstage/catalog-client';

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
        'metadata.name',
        'metadata.namespace',
        'metadata.service-name',
        'metadata.service-version',
        'metadata.container-version',
        'metadata.container-name',
        'spec.lifecycle',
        'relations'],
    },
    { token });

  const mapServices: Map<string, ServiceDefinition> = new Map();

  entities.items.forEach(entity => {
    const name = entity.metadata[API_PLATFORM_SERVICE_NAME_ANNOTATION]?.toString() || '?';
    const version = entity.metadata[API_PLATFORM_SERVICE_VERSION_ANNOTATION]?.toString() || '?';
    const lifecycle = entity.spec?.lifecycle?.toString().toLowerCase() || '?';
    let def: ServiceDefinition;
    if (mapServices.has(name)) {
      def = mapServices.get(name)!;
    } else {
      def = {
        name: name,
        owner: entity.relations?.filter(rel => rel.type === 'ownedBy').at(0)?.targetRef || '',
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
          containerVersion: entity.metadata[API_PLATFORM_SERVICE_CONTAINER_VERSION_ANNOTATION]?.toString() || '?',
          containerName: entity.metadata[API_PLATFORM_SERVICE_CONTAINER_NAME_ANNOTATION]?.toString() || '?',
          entityRef: `component:${entity.metadata.namespace}/${entity.metadata.name}`,
        }
        break;
      case 'gtu':
        defVersion.environments.gtu = {
          containerVersion: entity.metadata[API_PLATFORM_SERVICE_CONTAINER_VERSION_ANNOTATION]?.toString() || '?',
          containerName: entity.metadata[API_PLATFORM_SERVICE_CONTAINER_NAME_ANNOTATION]?.toString() || '?',
          entityRef: `component:${entity.metadata.namespace}/${entity.metadata.name}`,
        }
        break;
      case 'uat':
        defVersion.environments.uat = {
          containerVersion: entity.metadata[API_PLATFORM_SERVICE_CONTAINER_VERSION_ANNOTATION]?.toString() || '?',
          containerName: entity.metadata[API_PLATFORM_SERVICE_CONTAINER_NAME_ANNOTATION]?.toString() || '?',
          entityRef: `component:${entity.metadata.namespace}/${entity.metadata.name}`,
        }
        break;
      case 'ptp':
        defVersion.environments.ptp = {
          containerVersion: entity.metadata[API_PLATFORM_SERVICE_CONTAINER_VERSION_ANNOTATION]?.toString() || '?',
          containerName: entity.metadata[API_PLATFORM_SERVICE_CONTAINER_NAME_ANNOTATION]?.toString() || '?',
          entityRef: `component:${entity.metadata.namespace}/${entity.metadata.name}`,
        }
        break;
      case 'prd':
        defVersion.environments.prd = {
          containerVersion: entity.metadata[API_PLATFORM_SERVICE_CONTAINER_VERSION_ANNOTATION]?.toString() || '?',
          containerName: entity.metadata[API_PLATFORM_SERVICE_CONTAINER_NAME_ANNOTATION]?.toString() || '?',
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

export async function servicePlatformService({
  logger,
  catalogClient,
  auth,
}: {
  logger: LoggerService;
  catalogClient: CatalogApi,
  auth: AuthService,
}): Promise<ServicePlatformService> {
  logger.info('Initializing ServicePlatformService');

  return {

    async listServices(): Promise<{ items: ServiceDefinition[] }> {
      const services = await innerGetServices(logger, catalogClient, auth, undefined);
      return { items: services };
    },

    async getServiceVersions(request: { serviceName: string }): Promise<ServiceDefinition> {
      const services = await innerGetServices(logger, catalogClient, auth, request.serviceName);
      return services[0];
    }
  }

}