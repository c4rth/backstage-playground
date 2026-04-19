import { SchedulerServiceTaskScheduleDefinition } from '@backstage/backend-plugin-api';
import { HumanDuration } from '@backstage/types';
import { Duration } from 'luxon';

export interface Config {
  analytics?: {
    /**
     * @visibility frontend
     */
    threshold?: Duration;
    /**
     * @visibility frontend
     */
    schedule?: SchedulerServiceTaskScheduleDefinition;
  };
}
