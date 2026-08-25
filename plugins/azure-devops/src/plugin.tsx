import {
  ApiBlueprint,
  configApiRef,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { Entity } from '@backstage/catalog-model';
import {
  AZURE_DEVOPS_REPO_ANNOTATION,
  AZURE_DEVOPS_PROJECT_ANNOTATION,
  AZURE_DEVOPS_BUILD_DEFINITION_ANNOTATION,
} from '@backstage-community/plugin-azure-devops-common';
import { AzureDevOpsClient, azureDevOpsApiRef } from './api';

const azureDevOpsApi = ApiBlueprint.make({
  name: 'azure-devops-api',
  params: defineParams =>
    defineParams({
      api: azureDevOpsApiRef,
      deps: {
        configApi: configApiRef,
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ configApi, discoveryApi, fetchApi }) =>
        new AzureDevOpsClient({ configApi, discoveryApi, fetchApi }),
    }),
});

/** @public */
export const isAzureDevOpsAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[AZURE_DEVOPS_REPO_ANNOTATION]);

/** @public */
export const isAzurePipelinesAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[AZURE_DEVOPS_REPO_ANNOTATION]) ||
  (Boolean(entity.metadata.annotations?.[AZURE_DEVOPS_PROJECT_ANNOTATION]) &&
    Boolean(
      entity.metadata.annotations?.[AZURE_DEVOPS_BUILD_DEFINITION_ANNOTATION],
    ));

export default createFrontendPlugin({
  pluginId: 'azure-devops',
  title: 'Azure DevOps',
  extensions: [azureDevOpsApi],
});
