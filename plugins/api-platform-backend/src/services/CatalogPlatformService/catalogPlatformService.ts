import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { CatalogApi } from '@backstage/catalog-client';
import { CatalogPlatformService } from './types';

export async function catalogPlatformService({
  logger,
  catalogClient,
  auth,
}: {
  logger: LoggerService;
  catalogClient: CatalogApi,
  auth: AuthService,
}): Promise<CatalogPlatformService> {
  logger.info('Initializing CatalogPlatformService');

  return {
    async registerCatalogInfo(location: { target: string }): Promise<String> {
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      logger.debug(`Test location: ${location.target}`);
      const existResponse = await catalogClient.addLocation(
        {
          type: 'url',
          target: location.target,
          dryRun: true
        },
        { token }
      );
      logger.debug(JSON.stringify(existResponse));
      let returnMessage = '';
      if (existResponse.exists) {
        const apiEntity = existResponse.entities.filter(entity => entity.kind === 'API')[0];
        const entityRef = `api:${apiEntity.metadata.namespace}/${apiEntity.metadata.name}`;
        logger.debug(`Refresh entity: ${entityRef}`);
        await catalogClient.refreshEntity(
          entityRef,
          { token }
        );
        returnMessage = 'Refreshed';
      } else {
        logger.debug(`Add new location: ${location.target}`);
        const locationResponse = await catalogClient.addLocation(
          {
            type: 'url',
            target: location.target,
            dryRun: false
          },
          { token }
        );
        logger.debug(`Location created: ${locationResponse.location.target}`);
        returnMessage = 'Created';
      }
      return `{"message" : "${returnMessage}: ${location.target}"}`;
    },

  };

}
