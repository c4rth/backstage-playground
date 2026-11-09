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
        httpAuth: coreServices.httpAuth,
        analyticsService: analyticsServiceRef,
      },
      async init({ httpRouter, httpAuth, analyticsService }) {
        httpRouter.use(
          await createRouter({
            analyticsService,
            httpAuth,
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
