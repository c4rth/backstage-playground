import {
  coreServices,
  createBackendModule,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
} from '@backstage/backend-plugin-api';
import { searchIndexRegistryExtensionPoint } from '@backstage/plugin-search-backend-node/alpha';
import { McaComponentsCollatorFactory } from './collators/McaComponentsCollatorFactory';

/**
 * Search backend module for mca-components.
 *
 * @public
 */
export const searchModuleMcaComponentsCollator = createBackendModule({
  pluginId: 'search',
  moduleId: 'mca-components',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        permissions: coreServices.permissions,
        discovery: coreServices.discovery,
        scheduler: coreServices.scheduler,
        auth: coreServices.auth,
        indexRegistry: searchIndexRegistryExtensionPoint,
      },
      async init({
        config,
        logger,
        discovery,
        scheduler,
        auth,
        indexRegistry,
      }) {
        const defaultSchedule = {
          frequency: { minutes: 10 },
          timeout: { minutes: 15 },
          initialDelay: { seconds: 3 },
        };

        const schedule = config.has('search.collators.mcaComponents.schedule')
          ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
            config.getConfig('search.collators.mcaComponents.schedule'),
          )
          : defaultSchedule;
        const limit = config.getOptionalNumber('search.collators.mcaComponents.limit') ?? 100;

        indexRegistry.addCollator({
          schedule: scheduler.createScheduledTaskRunner(schedule),
          factory: McaComponentsCollatorFactory.fromConfig({
            discoveryApi: discovery,
            logger,
            auth,
            limit
          }),
        });
      },
    });
  },
});