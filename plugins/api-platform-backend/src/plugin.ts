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
        serviceInformationService: serviceInformationServiceRef,
        systemService: systemServiceRef,
        serviceService: serviceServiceRef,
        apiService: apiServiceRef,
        libraryService: libraryServiceRef,
        catalogService: apiPlatformCatalogServiceRef,
      },
      async init({
        httpRouter,
        httpAuth,
        userInfo,
        serviceInformationService,
        systemService,
        serviceService,
        apiService,
        libraryService,
        catalogService,
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
            catalogService,
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
