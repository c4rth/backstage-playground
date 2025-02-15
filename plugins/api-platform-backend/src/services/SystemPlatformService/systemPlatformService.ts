import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { CatalogApi } from '@backstage/catalog-client';
import { SystemPlatformService } from './types';
import { Entity, RELATION_OWNED_BY } from '@backstage/catalog-model';
import { 
  ANNOTATION_API_NAME, 
  ANNOTATION_SERVICE_NAME, 
  CATALOG_KIND, 
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
    async listSystems(): Promise<{ items: any[] }> {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      const entities = await catalogClient.getEntities(
        {
          filter: {
            kind: ['System'],
          },
          fields: [
            CATALOG_KIND,
            CATALOG_METADATA_NAME,
            CATALOG_METADATA_DESCRIPTION,
            CATALOG_RELATIONS
          ],
        },
        { token });
      const filteredEntities: Entity[] = [];
      entities.items.forEach(entity => {
        filteredEntities.push(
          {
            apiVersion: entity.apiVersion,
            kind: entity.kind,
            metadata: entity.metadata,
            relations: entity.relations?.filter(relation => relation.type === RELATION_OWNED_BY)
          }
        );
      }
      );
      return { items: filteredEntities };
    },

    async getSystem(request: { systemName: string }): Promise<SystemDefinition> {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      const entities = await catalogClient.getEntities(
        {
          filter: {
            kind: ['System'],
            'metadata.name': request.systemName,
          },
          fields: [
            CATALOG_KIND,
            CATALOG_METADATA_NAME,
            CATALOG_METADATA_DESCRIPTION,
            CATALOG_RELATIONS,
          ],
        },
        { token });
      const entity = entities.items[0];
      const system: SystemDefinition = {
        entity: entity,
        apis: [],
        services: []
      }
      if (entity.relations) {
        for (let index = 0; index < entity.relations.length; index++) {
          const element = entity.relations[index];
          const relEntity = await catalogClient.getEntityByRef(element.targetRef, { token });
          if (relEntity?.kind === 'API') {
            const name = relEntity.metadata[ANNOTATION_API_NAME]?.toString();
            if (name && !system.apis.includes(name)) {
              system.apis.push(name);
            }
          } else if (relEntity?.kind === 'Component') {
            const name = relEntity.metadata[ANNOTATION_SERVICE_NAME]?.toString();
            if (name &&!system.services.includes(name)) {
              system.services.push(name);
            }
          }
        }
      }

      return system;
    },
  };

}
