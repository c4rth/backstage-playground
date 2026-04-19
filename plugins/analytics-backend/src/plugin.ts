import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './services/router';
import { analyticsServiceRef } from './services';

/**
 * analyticsPlugin backend plugin
 *
 * @public
 */
export const analyticsPlugin = createBackendPlugin({
  pluginId: 'analytics',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        analyticsService: analyticsServiceRef,
      },
      async init({ httpRouter, analyticsService }) {
        httpRouter.use(
          await createRouter({
            analyticsService,
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
