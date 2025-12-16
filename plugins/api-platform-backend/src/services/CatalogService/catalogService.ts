import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { CatalogApi } from '@backstage/catalog-client';
import { CatalogService } from './types';
import { Entity } from "@backstage/catalog-model";
import { getCatalogToken } from '../common/token';

export interface CatalogServiceOptions {
  logger: LoggerService;
  catalogClient: CatalogApi;
  auth: AuthService;
}

export async function catalogService(options: CatalogServiceOptions): Promise<CatalogService> {
  const { logger, catalogClient, auth } = options;
  logger.info('Initializing CatalogService');

  return {
    async registerCatalogInfo(request: { target: string, kind: string }): Promise<String> {
      const token = await getCatalogToken(auth);
      const existResponse = await catalogClient.addLocation(
        {
          type: 'url',
          target: request.target,
          dryRun: true
        },
        { token }
      );
      let returnMessage = '';
      if (existResponse.exists) {
        const entity = existResponse.entities.find(candidate => candidate.kind === request.kind);
        if (!entity) {
          throw new Error("Entity to refresh but not found");
        }
        const entityRef = `${entity.kind.toLowerCase()}:${entity.metadata.namespace}/${entity.metadata.name}`;
        await catalogClient.refreshEntity(
          entityRef,
          { token }
        );
        returnMessage = 'Refreshed';
      } else {
        const locationResponse = await catalogClient.addLocation(
          {
            type: 'url',
            target: request.target,
            dryRun: false
          },
          { token }
        );
        returnMessage = `Created: ${locationResponse.location.target}`;
      }
      return `{"message" : "${returnMessage}: ${request.target}"}`;
    },

    async getEntityByName(request: { name: string, kind: string }): Promise<Entity | undefined> {
      const token = await getCatalogToken(auth);
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
      const token = await getCatalogToken(auth);
      const annotations = entity.metadata.annotations;
      if (!annotations || !annotations['backstage.io/managed-by-origin-location']) {
        throw new Error("Metadata location not found");
      }
      const location = await catalogClient.getLocationByRef(annotations['backstage.io/managed-by-origin-location'], { token });
      if (!location) {
        throw new Error("Location not found");
      }
      await catalogClient.removeLocationById(location.id, { token });
      return `{"message" : "unregistered "${entity.metadata.name}"}`;
    },
  };
}
