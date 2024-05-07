import { TaskScheduleDefinitionConfig } from '@backstage/backend-tasks';

export interface Config {
  search?: {
    collators?: {
      apis?: {
        schedule?: TaskScheduleDefinitionConfig;
      };
    };
  };
}