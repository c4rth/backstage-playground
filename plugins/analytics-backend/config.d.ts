import { SchedulerServiceTaskScheduleDefinition } from '@backstage/backend-plugin-api';
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
