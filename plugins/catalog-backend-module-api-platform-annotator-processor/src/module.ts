import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { ApiPlatformAnnotatorProcessor } from './processor';

/** @public */
export const catalogModuleApiPlatformAnnotatorProcessor = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'api-platform-annotator-processor',
  register(reg) {
    reg.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        logger: coreServices.logger,
      },
      async init({ catalog, logger }) {
        catalog.addProcessor(ApiPlatformAnnotatorProcessor.fromConfig(logger));
      },
    });
  },
});