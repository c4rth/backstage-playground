import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './services/router';
import { mcaComponentServiceRef } from './services/McaComponentService';
import { actionsRegistryServiceRef } from '@backstage/backend-plugin-api/alpha';
import { registerMcpActions } from './mcp-actions';

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
        mcaService: mcaComponentServiceRef,
        actionsRegistry: actionsRegistryServiceRef,
        logger: coreServices.logger,
      },
      async init({ httpRouter, mcaService, actionsRegistry, logger }) {
        httpRouter.use(
          await createRouter({
            mcaService,
          }),
        );
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
        httpRouter.addAuthPolicy({
          path: '/basetypes/javadoc',
          allow: 'unauthenticated',
        });
        registerMcpActions({
          actionsRegistry,
          logger,
          mcaService,
        });
      },
    });
  },
});
