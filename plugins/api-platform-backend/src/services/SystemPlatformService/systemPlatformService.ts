import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { CatalogApi, EntityOrderQuery } from '@backstage/catalog-client';
import { SystemPlatformService } from './types';
import {
  ANNOTATION_API_NAME,
  ANNOTATION_SERVICE_NAME,
  CATALOG_KIND,
  CATALOG_METADATA_DESCRIPTION,
  CATALOG_METADATA_NAME,
  CATALOG_RELATIONS,
  CATALOG_SPEC_OWNER,
  SystemDefinition,
  SystemDefinitionListResult,
  SystemDefinitionsListRequest,
  SystemDefinitionsOptions,
  OwnershipType
} from '@internal/plugin-api-platform-common';
import { getUserGroups } from '../common/utils';

export interface CatalogPlatformServiceOptions {
  logger: LoggerService;
  catalogClient: CatalogApi;
  auth: AuthService;
}

function getOrder(order: SystemDefinitionsOptions | undefined): EntityOrderQuery | undefined {
  if (!order) return undefined;
  let field = "";
  const fieldMap: Record<string, string> = {
    name: CATALOG_METADATA_NAME,
    description: CATALOG_METADATA_DESCRIPTION,
    owner: CATALOG_SPEC_OWNER,
  };
  field = fieldMap[order.field as keyof typeof fieldMap] ?? CATALOG_METADATA_NAME;
  return {
    field: field,
    order: order.direction,
  };
}

export async function systemPlatformService(options: CatalogPlatformServiceOptions): Promise<SystemPlatformService> {

  const { logger, catalogClient, auth } = options;

  logger.info('Initializing SystemPlatformService');

  return {
    async getSystemsCount(ownership: OwnershipType, userEntityRef: string | undefined): Promise<number> {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      const allSystems = await catalogClient.getEntities(
        {
          filter: {
            kind: ['System'],
          },
          fields: [
            CATALOG_METADATA_NAME,
            CATALOG_SPEC_OWNER,
          ],
        },
        { token }
      );

      if (ownership === 'all') {
        return allSystems.items.length;
      }

      const userGroupRefs = await getUserGroups(catalogClient, auth, userEntityRef!!);
      const ownedSystems = allSystems.items.filter(system => {        
          const owner = system.spec?.owner?.toString() || '';

          logger.debug('************************************');
          logger.debug(`System: ${system.metadata.name}, Owner: ${owner}`);
          logger.debug(`User Groups: ${userGroupRefs.join(', ')}`);
          logger.debug('************************************');
          
          return userGroupRefs.includes(owner);
      });
      return ownedSystems.length;
    },

    async listSystems(request: SystemDefinitionsListRequest): Promise<SystemDefinitionListResult> {
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
            CATALOG_METADATA_NAME,
            CATALOG_SPEC_OWNER,
          ],
          order: getOrder(request.orderBy),
        },
        { token }
      );
      const allSystems = entities.items.map(entity => {
        return {
          apiVersion: entity.apiVersion,
          kind: entity.kind,
          metadata: entity.metadata,
          owner: entity.spec?.owner?.toString() || '',
        };
      });

      let filteredSystems = allSystems;
      if (request.ownership === 'owned') {
        const userGroupRefs = await getUserGroups(catalogClient, auth, request.userEntityRef!!);
        const ownedSystems = allSystems.filter(system => {          
          return userGroupRefs.includes(system.owner);
        });
        filteredSystems = ownedSystems;
      }

      const offset = request.offset ?? 0;
      const limit = request.limit ?? 20;
      return {
        items: filteredSystems.slice(offset, offset + limit),
        offset,
        limit,
        totalCount: filteredSystems.length,
      };
    },

    async getSystem(systemName: string): Promise<SystemDefinition> {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      const entities = await catalogClient.getEntities(
        {
          filter: { kind: ['System'], 'metadata.name': systemName },
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
