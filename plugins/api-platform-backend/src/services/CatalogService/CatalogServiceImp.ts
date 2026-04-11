import { AuthService, coreServices, createServiceFactory, createServiceRef, LoggerService } from '@backstage/backend-plugin-api';
import { ApiPlatformCatalogService } from './types';
import { Entity } from "@backstage/catalog-model";
import { CatalogService, catalogServiceRef } from '@backstage/plugin-catalog-node';

export interface CatalogServiceOptions {
  logger: LoggerService;
  auth: AuthService;
  catalog: CatalogService;
}

export class CatalogServiceImpl implements ApiPlatformCatalogService {
  private readonly logger: LoggerService;
  private readonly catalog: CatalogService;
  private readonly auth: AuthService;

  constructor(options: CatalogServiceOptions) {
    this.logger = options.logger;
    this.catalog = options.catalog;
    this.auth = options.auth;
    this.logger.info('CatalogService initialized');
  }
  async registerCatalogInfo(request: { target: string, kind: string }): Promise<String> {
    const existResponse = await this.catalog.addLocation(
      {
        type: 'url',
        target: request.target,
        dryRun: true
      },
      { credentials: await this.auth.getOwnServiceCredentials() },
    );
    let returnMessage = '';
    if (existResponse.exists) {
      const entity = existResponse.entities.find(candidate => candidate.kind === request.kind);
      if (!entity) {
        throw new Error("Entity to refresh but not found");
      }
      const entityRef = `${entity.kind.toLowerCase()}:${entity.metadata.namespace}/${entity.metadata.name}`;
      await this.catalog.refreshEntity(
        entityRef,
        { credentials: await this.auth.getOwnServiceCredentials() },
      );
      returnMessage = 'Refreshed';
    } else {
      const locationResponse = await this.catalog.addLocation(
        {
          type: 'url',
          target: request.target,
          dryRun: false
        },
        { credentials: await this.auth.getOwnServiceCredentials() },
      );
      returnMessage = `Created: ${locationResponse.location.target}`;
    }
    return `{"message" : "${returnMessage}: ${request.target}"}`;
  }

  async getEntityByName(request: { name: string, kind: string }): Promise<Entity | undefined> {
    const entities = await this.catalog.getEntities(
      {
        filter: {
          kind: request.kind,
          'metadata.name': request.name
        },
      },
      { credentials: await this.auth.getOwnServiceCredentials() },
    );
    if (entities.items.length === 0) {
      return undefined;
    }
    return entities.items[0];
  }

  async unregisterCatalogInfo(entity: Entity): Promise<String> {
    const annotations = entity.metadata.annotations;
    if (!annotations || !annotations['backstage.io/managed-by-origin-location']) {
      throw new Error("Metadata location not found");
    }
    const location = await this.catalog.getLocationByRef(annotations['backstage.io/managed-by-origin-location'], { credentials: await this.auth.getOwnServiceCredentials() });
    if (!location) {
      throw new Error("Location not found");
    }
    await this.catalog.removeLocationById(location.id, { credentials: await this.auth.getOwnServiceCredentials() });
    return `{"message" : "unregistered "${entity.metadata.name}"}`;
  }
};


export const apiPlatformCatalogServiceRef = createServiceRef<ApiPlatformCatalogService>({
  id: 'api-platform.catalog.service',
  defaultFactory: async service =>
    createServiceFactory({
      service,
      deps: {
        logger: coreServices.logger,
        auth: coreServices.auth,
        catalog: catalogServiceRef
      },
      async factory({ logger, auth, catalog }) {
        const apiService = new CatalogServiceImpl({
          logger,
          auth,
          catalog
        });
        return apiService;
      },
    }),
});