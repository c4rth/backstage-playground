import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { CatalogApi } from '@backstage/catalog-client';
import { CatalogPlatformService } from './types';
import { Entity, getCompoundEntityRef } from "@backstage/catalog-model";

export interface CatalogPlatformServiceOptions {
  logger: LoggerService;
  catalogClient: CatalogApi;
  auth: AuthService;
}

export async function catalogPlatformService(options: CatalogPlatformServiceOptions): Promise<CatalogPlatformService> {
  const { logger, catalogClient, auth } = options;
  logger.info('Initializing CatalogPlatformService');

  return {
    async registerCatalogInfo(request: { target: string, kind: string }): Promise<String> {
      logger.info("Get token");
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      logger.debug(`Test location: ${request.target}`);
      const existResponse = await catalogClient.addLocation(
        {
          type: 'url',
          target: request.target,
          dryRun: true
        },
        { token }
      );
      logger.debug(JSON.stringify(existResponse));
      let returnMessage = '';
      if (existResponse.exists) {
        const entity = existResponse.entities.find(candidate => candidate.kind === request.kind);
        if (!entity) {
          throw new Error("Entity to refresh but not found");
        }
        const entityRef = `${entity.kind.toLowerCase()}:${entity.metadata.namespace}/${entity.metadata.name}`;
        logger.debug(`Refresh entity: ${entityRef}`);
        await catalogClient.refreshEntity(
          entityRef,
          { token }
        );
        returnMessage = 'Refreshed';
      } else {
        logger.debug(`Add new location: ${request.target}`);
        const locationResponse = await catalogClient.addLocation(
          {
            type: 'url',
            target: request.target,
            dryRun: false
          },
          { token }
        );
        logger.debug(`Location created: ${locationResponse.location.target}`);
        returnMessage = 'Created';
      }
      return `{"message" : "${returnMessage}: ${request.target}"}`;
    },

    async getEntityByName(request: { name: string, kind: string }): Promise<Entity | undefined> {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      const entities = await catalogClient.getEntities(
        {
          filter: {
            kind: request.kind,
            'metadata.name': request.name
          },
        },
        { token }
      );
      if (entities.items.length === 0) {
        return undefined;
      }
      return entities.items[0];
    },

    async unregisterCatalogInfo(entity: Entity): Promise<String> {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      const location = await catalogClient.getLocationByEntity(getCompoundEntityRef(entity), { token });
      if (!location) {
        throw new Error("Location not found");
      }
      await catalogClient.removeLocationById(location.id, { token });
      return `{"message" : "unregistered "${entity.metadata.name}"}`;
    },
  };
}
