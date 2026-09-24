import {
  ApiBlueprint,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import {
  createFormField,
  FormFieldBlueprint,
} from '@backstage/plugin-scaffolder-react/alpha';
import { discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { AzureDevOpsClient, azureDevOpsApiRef } from './api';

const AlertMessageExtension = FormFieldBlueprint.make({
  name: 'AlertMessage',
  params: {
    field: async () =>
      import('./extensions/AlertMessage').then(m =>
        createFormField({
          name: 'AlertMessage',
          component: m.AlertMessage,
        }),
      ),
  },
});

const ProjectPickerFieldExtension = FormFieldBlueprint.make({
  name: 'project-picker',
  params: {
    field: async () =>
      import('./extensions/ProjectPicker').then(m =>
        createFormField({
          name: 'ProjectPicker',
          component: m.ProjectPicker,
        }),
      ),
  },
});

const AzureDevOpsRepoPickerFieldExtension = FormFieldBlueprint.make({
  name: 'azure-devops-repo-picker',
  params: {
    field: async () =>
      import('./extensions/AzureDevOpsRepoPicker').then(m =>
        createFormField({
          name: 'AzureDevOpsRepoPicker',
          component: m.AzureDevOpsRepoPicker,
        }),
      ),
  },
});

const azureDevOpsApi = ApiBlueprint.make({
  name: 'azure-devops',
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

export const scaffolderExtensions = createFrontendPlugin({
  pluginId: 'custom-scaffolder-extensions',
  extensions: [
    AlertMessageExtension,
    ProjectPickerFieldExtension,
    AzureDevOpsRepoPickerFieldExtension,
    azureDevOpsApi,
  ],
});
