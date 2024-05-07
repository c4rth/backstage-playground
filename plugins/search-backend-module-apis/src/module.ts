import {
    coreServices,
    createBackendModule,
} from '@backstage/backend-plugin-api';
import { searchIndexRegistryExtensionPoint } from '@backstage/plugin-search-backend-node/alpha';
import { readScheduleConfigOptions } from './collators/config';
import { DefaultApisCollatorFactory } from './collators/DefaultApisCollatorFactory';
import { catalogServiceRef } from '@backstage/plugin-catalog-node/alpha';

export const searchModuleApisCollator = createBackendModule({
    pluginId: 'search',
    moduleId: 'apis-collator',
    register(reg) {
        reg.registerInit({
            deps: {
                auth: coreServices.auth,
                config: coreServices.rootConfig,
                discovery: coreServices.discovery,
                tokenManager: coreServices.tokenManager,
                scheduler: coreServices.scheduler,
                indexRegistry: searchIndexRegistryExtensionPoint,
                catalog: catalogServiceRef,
                logger: coreServices.logger,
            },
            async init({
                config,
                logger,
                auth,
                discovery,
                tokenManager,
                scheduler,
                indexRegistry,
                catalog,
            }) {
                indexRegistry.addCollator({
                    schedule: scheduler.createScheduledTaskRunner(
                        readScheduleConfigOptions(config),
                    ),
                    factory: DefaultApisCollatorFactory.fromConfig(config, {
                        auth,
                        discovery,
                        tokenManager,
                        catalogClient: catalog,
                        logger,
                    }),
                });
            },
        });
    },
});