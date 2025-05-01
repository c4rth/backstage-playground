import { SchedulerServiceTaskScheduleDefinitionConfig } from '@backstage/backend-plugin-api';

export interface Config {
  search?: {
    collators?: {
      mcaComponents?: {
        /**
         * The schedule for how often to run the collation job.
         */
        schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
        limit?: number;
      };
      mcaBaseTypes?: {
        /**
         * The schedule for how often to run the collation job.
         */
        schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
        limit?: number;
      };
    };
  };
}