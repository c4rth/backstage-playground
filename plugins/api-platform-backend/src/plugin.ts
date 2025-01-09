import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { createApiDefinitionService } from './services/ApiDefinitionService';
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
        const apiDefinitionService = await createApiDefinitionService({
          logger,
          catalogClient,
          auth,
        });

        httpRouter.use(
          await createRouter({
            apiDefinitionService
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
