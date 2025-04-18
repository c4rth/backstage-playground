import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './services/router';

/**
 * mcaComponentsBackendPlugin backend plugin
 *
 * @public
 */
export const mcaComponentsBackendPlugin = createBackendPlugin({
  pluginId: 'mca-components',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        database: coreServices.database,
      },
      async init({
        logger,
        httpRouter,
        database,
      }) {
        httpRouter.use(
          await createRouter({
            logger,
            database,
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
