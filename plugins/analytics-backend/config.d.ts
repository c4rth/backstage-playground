import { SchedulerServiceTaskScheduleDefinitionConfig } from '@backstage/backend-plugin-api';
import { HumanDuration } from '@backstage/types';

export interface Config {
  analytics?: {
    /**
     * @visibility backend
     */
    threshold?: string | HumanDuration;
    /**
     * @visibility backend
     */
    schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
  };
}
