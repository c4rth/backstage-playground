import { Config } from '@backstage/config';
import {
  readTaskScheduleDefinitionFromConfig,
  TaskScheduleDefinition,
} from '@backstage/backend-tasks';
import { InputError } from '@backstage/errors';
import { EntityFilterQuery } from '@backstage/catalog-client';

const configKey = 'search.collators.apis';

const defaults = {
  schedule: {
    frequency: { minutes: 10 },
    timeout: { minutes: 15 },
    initialDelay: { seconds: 3 },
  },
  collatorOptions: {
    locationTemplate: '/catalog/:namespace/api/:name',
    filter: {
      kind: 'api'
    },
    batchSize: 500,
  },
};

export function readScheduleConfigOptions(
  configRoot: Config,
): TaskScheduleDefinition {
  let schedule: TaskScheduleDefinition | undefined = undefined;

  const config = configRoot.getOptionalConfig(configKey);
  if (config) {
    const scheduleConfig = config.getOptionalConfig('schedule');
    if (scheduleConfig) {
      try {
        schedule = readTaskScheduleDefinitionFromConfig(scheduleConfig);
      } catch (error) {
        throw new InputError(`Invalid schedule at ${configKey}, ${error}`);
      }
    }
  }
  return schedule ?? defaults.schedule;
}

export function readCollatorConfigOptions(configRoot: Config): {
  locationTemplate: string;
  filter: EntityFilterQuery | undefined;
  batchSize: number;
} {
  const config = configRoot.getOptionalConfig(configKey);
  if (!config) {
    return defaults.collatorOptions;
  }

  return {
    locationTemplate: defaults.collatorOptions.locationTemplate,
    filter: defaults.collatorOptions.filter,
    batchSize:
      config.getOptionalNumber('batchSize') ??
      defaults.collatorOptions.batchSize,
  };
}