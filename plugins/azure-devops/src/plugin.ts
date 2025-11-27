import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { azureDevOpsApiRef, AzureDevOpsClient } from './api';

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