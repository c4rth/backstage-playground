import { SchedulerServiceTaskScheduleDefinitionConfig } from '@backstage/backend-plugin-api';

export interface Config {
  mcaComponents?: {
    /**
     * @visibility backend
     */
    serviceBaseUrl?: string;
    /**
     * @visibility backend
     */
    baseTypes?: {
      /**
       * @visibility backend
       */
      baseUrl?: string;
      /**
       * @visibility backend
       */
      listBaseUrl?: string;
      /**
       * @visibility backend
       */
      schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
    };
    /**
     * @visibility frontend
     */
    operations?: {
      /**
       * @visibility backend
       */
      csvBaseUrl?: string;
      /**
       * @visibility backend
       */
      schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
    };
  };
}
