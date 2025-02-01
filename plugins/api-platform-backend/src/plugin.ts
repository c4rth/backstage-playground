import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { createApiPlatformService } from './services/ApiPlatformService';
import { createCatalogPlatformService } from './services/CatalogPlatformService';
import { createServicePlatformService } from './services/ServicePlatformService';
import { CatalogClient } from '@backstage/catalog-client';

/**
 * apiPlatformPlugin backend plugin
 *
 * @public
 */
export const apiPlatformPlugin = createBackendPlugin({
  pluginId: 'api-platform',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
      },
      async init({
        logger,
        httpRouter,
        discovery,
        auth,
      }) {
        const catalogClient = new CatalogClient({
          discoveryApi: discovery,
        });
        const apiPlatformService = await createApiPlatformService({
          logger,
          catalogClient,
          auth,
        });
        const catalogPlatformService = await createCatalogPlatformService({
          logger,
          catalogClient,
          auth,
        });
        const servicePlatformService = await createServicePlatformService({
          logger,
          catalogClient,
          auth
        });

        httpRouter.use(
          await createRouter({
            apiPlatformService,
            catalogPlatformService,
            servicePlatformService,
          }),
        );
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
