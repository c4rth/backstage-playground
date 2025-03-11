import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { CatalogClient } from '@backstage/catalog-client';

/**
 * apiPlatformBackendPlugin backend plugin
 *
 * @public
 */
export const apiPlatformBackendPlugin = createBackendPlugin({
  pluginId: 'api-platform',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
        database: coreServices.database,
      },
      async init({
        logger,
        httpRouter,
        discovery,
        auth,
        database,
      }) {
        const catalogClient = new CatalogClient({
          discoveryApi: discovery,
        });

        httpRouter.use(
          await createRouter({
            logger,
            catalogClient,
            database,
            auth
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
