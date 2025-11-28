import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { azureDevOpsApiRef, AzureDevOpsClient } from './api';
import {
  AZURE_DEVOPS_REPO_ANNOTATION,
  AZURE_DEVOPS_PROJECT_ANNOTATION,
  AZURE_DEVOPS_BUILD_DEFINITION_ANNOTATION,
} from '@backstage-community/plugin-azure-devops-common';

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

export const azdoPlugin = createPlugin({
  id: 'azdo',
  apis: [
    createApiFactory({
      api: azureDevOpsApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new AzureDevOpsClient({ discoveryApi, fetchApi }),
    }),
  ],
});

export const AzureDevOpsPipelinePage = azdoPlugin.provide(
  createComponentExtension({
    name: 'AzureDevOpsPipelinePage',
    component: {
      lazy: () =>
        import('./components/AzureDevOpsPipelinePage').then(m => m.AzureDevOpsPipelinePage),
    },
  }),
);

export const AzureDevOpsGitTagsPage = azdoPlugin.provide(
  createComponentExtension({
    name: 'AzureDevOpsGitTagsPage',
    component: {
      lazy: () =>
        import('./components/AzureDevOpsGitTagsPage').then(m => m.AzureDevOpsGitTagsPage),
    },
  }),
);

export const AzureReadmeCard = azdoPlugin.provide(
  createComponentExtension({
    name: 'EntityAzureReadmeCard',
    component: {
      lazy: () => import('./components/ReadmeCard').then(m => m.ReadmeCard),
    },
  }),
);