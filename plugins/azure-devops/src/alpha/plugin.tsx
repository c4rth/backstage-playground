import {
  ApiBlueprint,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { AzureDevOpsClient, azureDevOpsApiRef } from '../api';

const azureDevOpsApi = ApiBlueprint.make({
  name: 'azure-devops-api',
  params: defineParams =>
    defineParams({
      api: azureDevOpsApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new AzureDevOpsClient({ discoveryApi, fetchApi }),
    }),
});

export default createFrontendPlugin({
  pluginId: 'azure-devops',
  title: 'Azure DevOps',
  extensions: [azureDevOpsApi],
});

export {
  AzureDevOpsPipelinePage,
  AzureDevOpsGitTagsPage,
  AzureReadmeCard,
} from '../plugin';
