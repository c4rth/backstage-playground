import {
  AuthService,
  coreServices,
  createServiceFactory,
  createServiceRef,
  LoggerService,
  PermissionsService,
  HttpAuthService,
} from '@backstage/backend-plugin-api';
import {
  ApiPlatformCatalogService,
  RefreshResponse,
  UnregisterResponse,
} from './types';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  CATALOG_KIND,
  CATALOG_METADATA_NAME,
  CATALOG_METADATA_NAMESPACE,
} from '@internal/plugin-api-platform-common';
import {
  CatalogService,
  catalogServiceRef,
} from '@backstage/plugin-catalog-node';
import { catalogEntityDeletePermission } from '@backstage/plugin-catalog-common/alpha';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

const CATALOG_METADATA_UID = 'metadata.uid';
const CATALOG_MANAGED_BY_LOCATION =
  'metadata.annotations.backstage.io/managed-by-location';

export interface CatalogServiceOptions {
  logger: LoggerService;
  auth: AuthService;
  catalog: CatalogService;
  permissions: PermissionsService;
  httpAuth: HttpAuthService;
}

export class CatalogServiceImpl implements ApiPlatformCatalogService {
  private readonly logger: LoggerService;
  private readonly catalog: CatalogService;
  private readonly auth: AuthService;
  private readonly permissions: PermissionsService;
  private readonly httpAuth: HttpAuthService;

  constructor(options: CatalogServiceOptions) {
    this.logger = options.logger;
    this.catalog = options.catalog;
    this.auth = options.auth;
    this.permissions = options.permissions;
    this.httpAuth = options.httpAuth;
    this.logger.info('CatalogService initialized');
  }
  async registerCatalogInfo(request: {
    target: string;
    kind: string;
  }): Promise<String> {
    const existResponse = await this.catalog.addLocation(
      {
        type: 'url',
        target: request.target,
        dryRun: true,
      },
      { credentials: await this.auth.getOwnServiceCredentials() },
    );
    let returnMessage = '';
    if (existResponse.exists) {
      const entity = existResponse.entities.find(
        candidate => candidate.kind === request.kind,
      );
      if (!entity) {
        throw new Error('Entity to refresh but not found');
      }
      const entityRef = `${entity.kind.toLowerCase()}:${entity.metadata.namespace}/${entity.metadata.name}`;
      await this.catalog.refreshEntity(entityRef, {
        credentials: await this.auth.getOwnServiceCredentials(),
      });
      returnMessage = 'Refreshed';
    } else {
      const locationResponse = await this.catalog.addLocation(
        {
          type: 'url',
          target: request.target,
          dryRun: false,
        },
        { credentials: await this.auth.getOwnServiceCredentials() },
      );
      returnMessage = `Created: ${locationResponse.location.target}`;
    }
    return `{"message" : "${returnMessage}: ${request.target}"}`;
  }

  private async findEntityByName(
    request: {
      name: string;
      kind: string;
    },
    fields?: string[],
  ): Promise<Entity | undefined> {
    const entities = await this.catalog.getEntities(
      {
        filter: {
          kind: request.kind,
          'metadata.name': request.name,
        },
        fields,
      },
      { credentials: await this.auth.getOwnServiceCredentials() },
    );
    return entities.items[0];
  }

  async getEntityByName(request: {
    name: string;
    kind: string;
  }): Promise<Entity | undefined> {
    return this.findEntityByName(request);
  }

  private async getEntityReferenceByName(request: {
    name: string;
    kind: string;
  }): Promise<Entity | undefined> {
    return this.findEntityByName(request, [
      CATALOG_KIND,
      CATALOG_METADATA_NAME,
      CATALOG_METADATA_NAMESPACE,
      CATALOG_METADATA_UID,
      CATALOG_MANAGED_BY_LOCATION,
    ]);
  }

  async unregisterCatalogInfo(request: any): Promise<UnregisterResponse> {
    const entity = await this.getEntityReferenceByName({
      name: request.params.name,
      kind: request.params.kind,
    });
    if (!entity) {
      return {
        message: `Entity not found: "${request.kind} / ${request.name}"`,
        returnCode: 404,
      };
    }
    const credentials = await this.httpAuth.credentials(request);
    const authorizeResponse = (
      await this.permissions.authorize(
        [
          {
            permission: catalogEntityDeletePermission,
            resourceRef: stringifyEntityRef(entity),
          },
        ],
        { credentials },
      )
    )[0];
    if (authorizeResponse.result === AuthorizeResult.DENY) {
      return {
        message: `Forbidden: "${request.kind} / ${request.name}"`,
        returnCode: 403,
      };
    }
    try {
      const annotations = entity.metadata.annotations;
      if (!annotations || !annotations['backstage.io/managed-by-location']) {
        this.logger.error(
          `Metadata location not found for entity: ${stringifyEntityRef(entity)}`,
        );
        throw new Error('Metadata location not found');
      }
      const location = await this.catalog.getLocationByRef(
        annotations['backstage.io/managed-by-location'],
        { credentials: await this.auth.getOwnServiceCredentials() },
      );
      if (!location) {
        throw new Error('Location not found');
      }
      this.logger.info(`Location to remove: ${location.entityRef}`);
      if (entity.metadata.uid) {
        await this.catalog.removeEntityByUid(entity.metadata.uid, {
          credentials: await this.auth.getOwnServiceCredentials(),
        });
      }
      await this.catalog.removeLocationById(location.id, {
        credentials: await this.auth.getOwnServiceCredentials(),
      });
      return {
        message: `unregistered "${entity.metadata.name}"`,
        returnCode: 204,
      };
    } catch (error) {
      return {
        message: `failed to unregister "${entity.metadata.name}" - ${error}`,
        returnCode: 500,
      };
    }
  }

  async refreshCatalogInfo(request: {
    name: string;
    kind: string;
  }): Promise<RefreshResponse> {
    const entity = await this.getEntityReferenceByName({
      name: request.name,
      kind: request.kind,
    });
    if (entity) {
      try {
        const annotations = entity.metadata.annotations;
        if (!annotations || !annotations['backstage.io/managed-by-location']) {
          this.logger.error(
            `Metadata location not found for entity: ${stringifyEntityRef(entity)}`,
          );
          throw new Error('Metadata location not found');
        }
        const entityRef = stringifyEntityRef(entity);
        this.logger.info(`Entity to refresh: ${entityRef}`);
        await this.catalog.refreshEntity(entityRef, {
          credentials: await this.auth.getOwnServiceCredentials(),
        });
        return {
          message: `refreshed "${entity.metadata.name}"`,
          returnCode: 200,
        };
      } catch (error) {
        return {
          message: `failed to refresh "${entity.metadata.name}" - ${error}`,
          returnCode: 500,
        };
      }
    } else {
      this.logger.error(
        `Entity not found for refresh: ${request.kind}:${request.name}`,
      );
      return {
        message: `entity not found: "${request.name}"`,
        returnCode: 404,
      };
    }
  }
}

export const apiPlatformCatalogServiceRef =
  createServiceRef<ApiPlatformCatalogService>({
    id: 'api-platform.catalog.service',
    defaultFactory: async service =>
      createServiceFactory({
        service,
        deps: {
          logger: coreServices.logger,
          auth: coreServices.auth,
          catalog: catalogServiceRef,
          permissions: coreServices.permissions,
          httpAuth: coreServices.httpAuth,
        },
        async factory({ logger, auth, catalog, permissions, httpAuth }) {
          const apiService = new CatalogServiceImpl({
            logger,
            auth,
            catalog,
            permissions,
            httpAuth,
          });
          return apiService;
        },
      }),
  });
