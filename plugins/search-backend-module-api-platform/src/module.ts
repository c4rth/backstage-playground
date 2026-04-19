import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogCollatorExtensionPoint } from '@backstage/plugin-search-backend-module-catalog';
import { apiPlatformCatalogCollatorEntityTransformer } from './collators/apiPlatformCatalogCollator';

/**
 * Search backend module for api-platform.
 *
 * @public
 */
export const searchModuleApiPlatformCollator = createBackendModule({
  pluginId: 'search',
  moduleId: 'api-platform-catalog-collator-extension',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        entityTransformer: catalogCollatorExtensionPoint,
      },
      async init({ logger, entityTransformer }) {
        logger.info('Initializing API Platform catalog search collator');
        entityTransformer.setEntityTransformer(
          apiPlatformCatalogCollatorEntityTransformer,
        );
      },
    });
  },
});
