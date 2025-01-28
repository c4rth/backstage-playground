import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { ServicePlatformService } from './types';
import { API_PLATFORM_API_NAME_ANNOTATION } from '@internal/plugin-api-platform-common';
import { CatalogApi } from '@backstage/catalog-client';

export async function servicePlatformService({
  logger,
  catalogClient,
  auth,
}: {
  logger: LoggerService;
  catalogClient: CatalogApi,
  auth: AuthService,
}): Promise<ServicePlatformService> {
  logger.info('Initializing ApiDefinitionService');

  return {

    async listServices(): Promise<{ items: any[] }> {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      const entities = await catalogClient.getEntities(
        {
          filter: {
            kind: ['Component'],
            'spec.type': ['service']
          },
        },
        { token });
      const uniqueEntities = Array.from(
        new Map(entities.items.map(entity => [entity.metadata[API_PLATFORM_API_NAME_ANNOTATION], entity])).values()
      );
      return { items: uniqueEntities };
    },
  }

}