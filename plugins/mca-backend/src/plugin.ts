import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './services/router';
import { mcaComponentServiceRef } from './services/McaComponentService';

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
        httpRouter: coreServices.httpRouter,
        mcaService: mcaComponentServiceRef
      },
      async init({
        httpRouter,
        mcaService
      }) {
        httpRouter.use(
          await createRouter({
            mcaService,
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
