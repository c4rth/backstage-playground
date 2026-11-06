import {
  AuthService,
  coreServices,
  createServiceFactory,
  createServiceRef,
  LoggerService,
  PermissionsService,
  HttpAuthService,
} from '@backstage/backend-plugin-api';
import { ApiPlatformCatalogService } from './types';
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
import {
  CustomErrorBase,
  InputError,
  NotAllowedError,
  NotFoundError,
  ServiceUnavailableError,
} from '@backstage/errors';
import type { Request } from 'express';

const CATALOG_METADATA_UID = 'metadata.uid';
const CATALOG_MANAGED_BY_LOCATION =
  'metadata.annotations.backstage.io/managed-by-location';

async function callService<T>(
  message: string,
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof CustomErrorBase) throw error;
    throw new ServiceUnavailableError(message, error);
  }
}

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
  }): Promise<string> {
    if (
      !request ||
      typeof request.target !== 'string' ||
      !request.target.trim()
    ) {
      throw new InputError('target must be a non-empty URL');
    }
    if (typeof request.kind !== 'string' || !request.kind.trim()) {
      throw new InputError('kind must be a non-empty string');
    }
    if (!URL.canParse(request.target)) {
      throw new InputError('target must be a valid URL');
    }

    const existResponse = await callService(
      'Failed to check the catalog location',
      async () =>
        this.catalog.addLocation(
          {
            type: 'url',
            target: request.target,
            dryRun: true,
          },
          { credentials: await this.auth.getOwnServiceCredentials() },
        ),
    );
    let returnMessage = '';
    if (existResponse.exists) {
      const entity = existResponse.entities.find(
        candidate => candidate.kind === request.kind,
      );
      if (!entity) {
        throw new NotFoundError(
          `Entity of kind ${request.kind} not found at ${request.target}`,
        );
      }
      const entityRef = `${entity.kind.toLowerCase()}:${entity.metadata.namespace}/${entity.metadata.name}`;
      await callService('Failed to refresh the catalog entity', async () =>
        this.catalog.refreshEntity(entityRef, {
          credentials: await this.auth.getOwnServiceCredentials(),
        }),
      );
      returnMessage = 'Refreshed';
    } else {
      const locationResponse = await callService(
        'Failed to register the catalog location',
        async () =>
          this.catalog.addLocation(
            {
              type: 'url',
              target: request.target,
              dryRun: false,
            },
            { credentials: await this.auth.getOwnServiceCredentials() },
          ),
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
    const entities = await callService(
      `Failed to look up ${request.kind}:${request.name}`,
      async () =>
        this.catalog.getEntities(
          {
            filter: {
              kind: request.kind,
              'metadata.name': request.name,
            },
            fields,
          },
          { credentials: await this.auth.getOwnServiceCredentials() },
        ),
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

  async unregisterCatalogInfo(
    request: Request<{ kind: string; name: string }>,
  ): Promise<void> {
    const entity = await this.getEntityReferenceByName({
      name: request.params.name,
      kind: request.params.kind,
    });
    if (!entity) {
      throw new NotFoundError(
        `Entity not found: "${request.params.kind} / ${request.params.name}"`,
      );
    }
    const credentials = await this.httpAuth.credentials(request);
    const authorizeResponse = (
      await callService('Failed to check catalog delete permission', () =>
        this.permissions.authorize(
          [
            {
              permission: catalogEntityDeletePermission,
              resourceRef: stringifyEntityRef(entity),
            },
          ],
          { credentials },
        ),
      )
    )[0];
    if (authorizeResponse.result === AuthorizeResult.DENY) {
      throw new NotAllowedError(
        `Not allowed to unregister "${request.params.kind} / ${request.params.name}"`,
      );
    }
    const managedByLocation =
      entity.metadata.annotations?.['backstage.io/managed-by-location'];
    if (!managedByLocation) {
      throw new NotFoundError(
        `Managed-by location not found for ${stringifyEntityRef(entity)}`,
      );
    }
    const location = await callService(
      'Failed to look up catalog location',
      async () =>
        this.catalog.getLocationByRef(managedByLocation, {
          credentials: await this.auth.getOwnServiceCredentials(),
        }),
    );
    if (!location) {
      throw new NotFoundError(
        `Location ${managedByLocation} not found for ${stringifyEntityRef(entity)}`,
      );
    }
    this.logger.info(`Location to remove: ${location.entityRef}`);
    const uid = entity.metadata.uid;
    if (uid) {
      await callService('Failed to remove catalog entity', async () =>
        this.catalog.removeEntityByUid(uid, {
          credentials: await this.auth.getOwnServiceCredentials(),
        }),
      );
    }
    await callService('Failed to remove catalog location', async () =>
      this.catalog.removeLocationById(location.id, {
        credentials: await this.auth.getOwnServiceCredentials(),
      }),
    );
  }

  async refreshCatalogInfo(request: {
    name: string;
    kind: string;
  }): Promise<string> {
    const entity = await this.getEntityReferenceByName({
      name: request.name,
      kind: request.kind,
    });
    if (!entity) {
      throw new NotFoundError(
        `Entity not found for refresh: ${request.kind}:${request.name}`,
      );
    }

    const managedByLocation =
      entity.metadata.annotations?.['backstage.io/managed-by-location'];
    if (!managedByLocation) {
      throw new NotFoundError(
        `Managed-by location not found for ${stringifyEntityRef(entity)}`,
      );
    }
    const entityRef = stringifyEntityRef(entity);
    this.logger.info(`Entity to refresh: ${entityRef}`);
    await callService('Failed to refresh catalog entity', async () =>
      this.catalog.refreshEntity(entityRef, {
        credentials: await this.auth.getOwnServiceCredentials(),
      }),
    );
    return `refreshed "${entity.metadata.name}"`;
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
