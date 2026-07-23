import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import {
  createFormField,
  FormFieldBlueprint,
} from '@backstage/plugin-scaffolder-react/alpha';

const AlertMessageExtension = FormFieldBlueprint.make({
  name: 'AlertMessage',
  params: {
    field: async () =>
      import('./AlertMessage').then(m =>
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
      import('./ProjectPicker').then(m =>
        createFormField({
          name: 'ProjectPicker',
          component: m.ProjectPicker,
        }),
      ),
  },
});

export const scaffolderExtensions = createFrontendPlugin({
  pluginId: 'custom-scaffolder-extensions',
  extensions: [AlertMessageExtension, ProjectPickerFieldExtension],
});
