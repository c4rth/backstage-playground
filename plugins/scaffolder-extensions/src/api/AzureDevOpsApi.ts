import { createApiRef } from '@backstage/core-plugin-api';

/** @public */
export const azureDevOpsApiRef = createApiRef<AzureDevOpsApi>({
  id: 'plugin.custom-scaffolder-extensions.azure-devops-service',
});

/** @public */
export interface AzureDevOpsApi {
  getRepositories(
    projectName: string,
    host?: string,
    org?: string,
  ): Promise<string[]>;

  getBranches(
    projectName: string,
    repoName: string,
    host?: string,
    org?: string,
  ): Promise<string[]>;
}
