import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './services/router';
import { serviceInformationServiceRef } from './services/ServiceInformationService';
import { systemServiceRef } from './services/SystemService';
import { serviceServiceRef } from './services/ServiceService';
import { libraryServiceRef } from './services/LibraryService';
import { apiServiceRef } from './services/ApiService';
import { apiPlatformCatalogServiceRef } from './services/CatalogService';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { actionsRegistryServiceRef } from '@backstage/backend-plugin-api/alpha';
import { registerMcpActions } from './mcp-actions';

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
        httpRouter: coreServices.httpRouter,
        httpAuth: coreServices.httpAuth,
        userInfo: coreServices.userInfo,
        catalog: catalogServiceRef,
        auth: coreServices.auth,
        serviceInformationService: serviceInformationServiceRef,
        systemService: systemServiceRef,
        serviceService: serviceServiceRef,
        apiService: apiServiceRef,
        libraryService: libraryServiceRef,
        apiPlatformCatalogService: apiPlatformCatalogServiceRef,
        permissions: coreServices.permissions,
        actionsRegistry: actionsRegistryServiceRef,
        logger: coreServices.logger,
      },
      async init({
        httpRouter,
        httpAuth,
        userInfo,
        catalog,
        serviceInformationService,
        systemService,
        serviceService,
        apiService,
        libraryService,
        apiPlatformCatalogService,
        actionsRegistry,
        auth,
        logger,
      }) {
        httpRouter.use(
          await createRouter({
            httpAuth,
            userInfo,
            serviceInformationService,
            systemService,
            serviceService,
            apiService,
            libraryService,
            apiPlatformCatalogService,
          }),
        );
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
        registerMcpActions({
          actionsRegistry,
          logger,
          auth,
          catalog,
          systemService,
          serviceService,
          apiService,
        });
      },
    });
  },
});
