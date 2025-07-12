import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { CatalogApi } from '@backstage/catalog-client';
import { SystemPlatformService } from './types';
import { Entity, RELATION_OWNED_BY } from '@backstage/catalog-model';
import {
  ANNOTATION_API_NAME,
  ANNOTATION_SERVICE_NAME,
  CATALOG_KIND,
  CATALOG_METADATA,
  CATALOG_METADATA_DESCRIPTION,
  CATALOG_METADATA_NAME,
  CATALOG_RELATIONS,
  SystemDefinition
} from '@internal/plugin-api-platform-common';

export interface CatalogPlatformServiceOptions {
  logger: LoggerService;
  catalogClient: CatalogApi;
  auth: AuthService;
}

export async function systemPlatformService(options: CatalogPlatformServiceOptions): Promise<SystemPlatformService> {

  const { logger, catalogClient, auth } = options;

  logger.info('Initializing SystemPlatformService');

  return {
    async listSystems(): Promise<{ items: Entity[] }> {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      const entities = await catalogClient.getEntities(
        {
          filter: {
            kind: ['System']
          },
          fields: [
            CATALOG_KIND,
            CATALOG_METADATA,
            CATALOG_RELATIONS
          ],
        },
        { token }
      );
      const filteredEntities = entities.items.map(entity => {
        const ownedByRelations = entity.relations?.filter(r => r.type === RELATION_OWNED_BY);

        return {
          apiVersion: entity.apiVersion,
          kind: entity.kind,
          metadata: entity.metadata,
          relations: ownedByRelations || [],
        };
      });

      return { items: filteredEntities };
    },

    async getSystem(request: { systemName: string }): Promise<SystemDefinition> {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      const entities = await catalogClient.getEntities(
        {
          filter: { kind: ['System'], 'metadata.name': request.systemName },
          fields: [CATALOG_KIND, CATALOG_METADATA_NAME, CATALOG_METADATA_DESCRIPTION, CATALOG_RELATIONS],
        },
        { token }
      );
      const entity = entities.items[0];
      const system: SystemDefinition = {
        entity,
        apis: [],
        services: [],
      };
      if (!entity?.relations) {
        return system;
      }
      // Use Sets to avoid duplicate checks and improve performance
      const apiNames = new Set<string>();
      const serviceNames = new Set<string>();

      // Batch fetch all related entities to reduce API calls
      const relatedEntityPromises = entity.relations.map(rel =>
        catalogClient.getEntityByRef(rel.targetRef, { token }).catch(() => null)
      );

      const relatedEntities = await Promise.allSettled(relatedEntityPromises);

      for (const result of relatedEntities) {
        if (result.status === 'fulfilled' && result.value) {
          const relEntity = result.value;

          if (relEntity.kind === 'API') {
            const name = relEntity.metadata[ANNOTATION_API_NAME]?.toString();
            if (name) apiNames.add(name);
          } else if (relEntity.kind === 'Component') {
            const name = relEntity.metadata[ANNOTATION_SERVICE_NAME]?.toString();
            if (name) serviceNames.add(name);
          }
        }
      }

      system.apis = Array.from(apiNames);
      system.services = Array.from(serviceNames);

      return system;
    },
  };

}
