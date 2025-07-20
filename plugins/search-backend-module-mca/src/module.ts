import {
  coreServices,
  createBackendModule,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
} from '@backstage/backend-plugin-api';
import { searchIndexRegistryExtensionPoint } from '@backstage/plugin-search-backend-node/alpha';
import { McaComponentsCollatorFactory } from './collators/McaComponentsCollatorFactory';
import { McaBaseTypesCollatorFactory } from './collators/McaBaseTypesCollatorFactory';

/**
 * Search backend module for mca.
 *
 * @public
 */
export const searchModuleMcaComponentsCollator = createBackendModule({
  pluginId: 'search',
  moduleId: 'mca-collator',
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
        logger.info('Initializing MCA search collators');
        const defaultSchedule = {
          frequency: { minutes: 10 },
          timeout: { minutes: 15 },
          initialDelay: { seconds: 3 },
        };

        const scheduleComponents = config.has('search.collators.mcaComponents.schedule')
          ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
            config.getConfig('search.collators.mcaComponents.schedule'),
          )
          : defaultSchedule;
        const limitComponents = config.getOptionalNumber('search.collators.mcaComponents.limit') ?? 100;

        indexRegistry.addCollator({
          schedule: scheduler.createScheduledTaskRunner(scheduleComponents),
          factory: McaComponentsCollatorFactory.fromConfig({
            discoveryApi: discovery,
            logger,
            auth,
            limit: limitComponents,
          }),
        });


        const scheduleBaseTypes = config.has('search.collators.mcaBaseTypes.schedule')
          ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
            config.getConfig('search.collators.mcaBaseTypes.schedule'),
          )
          : defaultSchedule;
        const limitBaseTypes = config.getOptionalNumber('search.collators.mcaBaseTypes.limit') ?? 100;

        indexRegistry.addCollator({
          schedule: scheduler.createScheduledTaskRunner(scheduleBaseTypes),
          factory: McaBaseTypesCollatorFactory.fromConfig({
            discoveryApi: discovery,
            logger,
            auth,
            limit: limitBaseTypes,
          }),
        });
      },
    });
  },
});