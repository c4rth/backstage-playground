import { scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { createScaffolderFieldExtension } from '@backstage/plugin-scaffolder-react';
import {
  errorApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { NotFoundError } from '@backstage/errors';
import useAsync from 'react-use/esm/useAsync';
import { useState } from 'react';
import { ScaffolderField } from '@backstage/plugin-scaffolder-react/alpha';
import useDebounce from 'react-use/esm/useDebounce';
import { useTemplateSecrets } from '@backstage/plugin-scaffolder-react';
import { scmAuthApiRef } from '@backstage/integration-react';
import { ProjectPickerFieldSchema } from './schemas';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import { MenuItem } from '@material-ui/core';

export { ProjectPickerSchema } from './schemas';

const ProjectPicker = (props: typeof ProjectPickerFieldSchema.TProps) => {
  const { uiSchema, onChange, rawErrors, errors, schema, required } = props;

  const [projects, setProjects] = useState<
    Array<{
      value: string;
      label: string;
    }>
  >([]);
  const [selectedProject, setSelectedProject] = useState<undefined | string>(
    undefined,
  );
  const { secrets, setSecrets } = useTemplateSecrets();

  const identityApi = useApi(identityApiRef);
  const catalogApi = useApi(catalogApiRef);
  const errorApi = useApi(errorApiRef);
  const scmAuthApi = useApi(scmAuthApiRef);

  const { requestUserCredentials } = uiSchema?.['ui:options'] ?? {};

  useAsync(async () => {
    const { userEntityRef } = await identityApi.getBackstageIdentity();

    if (!userEntityRef) {
      errorApi.post(new NotFoundError('No user entity ref found'));
      return;
    }

    const { items } = await catalogApi.getEntities({
      filter: {
        kind: 'Group',
        ['relations.hasMember']: [userEntityRef],
      },
      fields: ['metadata.name'],
    });

    const uniqueNames = Array.from(
      new Set(
        items.map(item => {
          // Extract ABCD from 'prd.10.gemz.ABCD.ado.x'
          // const parts = item.metadata.name.split('.');
          // return parts.length >= 4 ? parts[3] : item.metadata.name;
          return item.metadata.name;
        }),
      ),
    );
    const result: Array<{
      value: string;
      label: string;
    }> = uniqueNames.sort().map(name => ({ value: name, label: name }));

    setProjects(result);
  });

  useDebounce(
    async () => {
      if (!requestUserCredentials) {
        return;
      }
      if (secrets[requestUserCredentials.secretsKey]) {
        return;
      }
      const { token } = await scmAuthApi.getCredentials({
        url: `https://dev.azure.com/`,
        additionalScope: {
          repoWrite: true,
          customScopes: { azure: [] },
        },
      });
      setSecrets({ [requestUserCredentials.secretsKey]: token });
    },
    500,
    [projects],
  );

  let authStatus = 'No authentication required';
  if (requestUserCredentials) {
    authStatus = secrets[requestUserCredentials.secretsKey]
      ? 'Authenticated'
      : 'Authenticating...';
  }
  const rawDescription = `${uiSchema['ui:description'] ?? schema.description} (${authStatus})`;

  return (
    <ScaffolderField
      rawErrors={rawErrors}
      rawDescription={rawDescription}
      required={required}
      errors={errors}
    >
      <InputLabel id="project-label">
        {uiSchema['ui:title'] ?? schema.title}
      </InputLabel>
      <Select
        labelId="project-label"
        value={selectedProject}
        label={uiSchema['ui:title'] ?? schema.title}
        onChange={value => {
          const newValue = value?.toString() ?? undefined;
          setSelectedProject(newValue);
          onChange(newValue);
        }}
      >
        {projects.map(project => (
          <MenuItem key={project.value} value={project.value}>
            {project.label}
          </MenuItem>
        ))}
      </Select>
    </ScaffolderField>
  );
};

export const ProjectPickerFieldExtension = scaffolderPlugin.provide(
  createScaffolderFieldExtension({
    name: 'ProjectPicker',
    component: ProjectPicker,
  }),
);
