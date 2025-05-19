import { SchedulerServiceTaskScheduleDefinition } from '@backstage/backend-plugin-api';

export interface Config {
  mcaComponents?: {
    /**
    * @visibility frontend
    */
    serviceBaseUrl?: string;
    /**
     * @visibility frontend
     */
    baseTypes?: {
      /**
       * @visibility frontend
       */
      baseUrl?: string;
      /**
       * @visibility frontend
       */
      listBaseUrl?: string;
      /**
       * @visibility frontend
       */
      schedule?: SchedulerServiceTaskScheduleDefinition;
    };
    /**
     * @visibility frontend
     */
    operations?: {
      /**
       * @visibility frontend
       */
      csvBaseUrl?: string;
      /**
       * @visibility frontend
       */
      schedule?: SchedulerServiceTaskScheduleDefinition;
    };
  };
}