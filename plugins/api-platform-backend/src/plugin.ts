import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './services/router';
import { CatalogClient } from '@backstage/catalog-client';
import { actionsRegistryServiceRef } from '@backstage/backend-plugin-api/alpha';
import { createApiPlatformActions } from './actions/createApiPlatformActions';

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
        actionsRegistry: actionsRegistryServiceRef,
      },
      async init({
        logger,
        httpRouter,
        discovery,
        auth,
        database,
        actionsRegistry
      }) {
        const catalogClient = new CatalogClient({
          discoveryApi: discovery,
        });

        httpRouter.use(
          await createRouter({
            logger,
            catalogClient,
            database,
            auth,
            actionsRegistry
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
