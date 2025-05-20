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
  pluginId: 'mca',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        database: coreServices.database,
        scheduler: coreServices.scheduler,
        config: coreServices.rootConfig,
      },
      async init({
        logger,
        httpRouter,
        database,
        scheduler,
        config,
      }) {
        httpRouter.use(
          await createRouter({
            logger,
            database,
            scheduler,
            config
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
