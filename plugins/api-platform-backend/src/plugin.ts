import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { catalogServiceRef } from '@backstage/plugin-catalog-node/alpha';
import { createApiDefinitionService } from './services/ApiDefinitionService';

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
        httpAuth: coreServices.httpAuth,
        catalogClient: catalogServiceRef,
        auth: coreServices.auth,
      },
      async init({
        logger,
        httpRouter,
        catalogClient,
        httpAuth, 
        auth,
      }) {
        const apiDefinitionService = await createApiDefinitionService({
          logger,
          catalogClient,
          auth,
        });

        httpRouter.use(
          await createRouter({
            httpAuth,
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
