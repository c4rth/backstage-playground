import {
  errorApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import useDebounce from 'react-use/lib/useDebounce';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { NotFoundError } from '@backstage/errors';
import useAsync from 'react-use/esm/useAsync';
import { useEffect, useMemo, useState } from 'react';
import { useTemplateSecrets } from '@backstage/plugin-scaffolder-react';
import { scmAuthApiRef } from '@backstage/integration-react';
import { AzureDevOpsRepoPickerFieldSchema } from './schemas';
import { ScaffolderField } from '@backstage/plugin-scaffolder-react/alpha';
import { Select } from '@backstage/ui';
import { azureDevOpsApiRef } from '../../api';

export { AzureDevOpsRepoPickerSchema } from './schemas';

export const AzureDevOpsRepoPicker = (
  props: typeof AzureDevOpsRepoPickerFieldSchema.TProps,
) => {
  const { uiSchema, onChange, rawErrors, errors, schema, required } = props;
  const { secrets, setSecrets } = useTemplateSecrets();

  const allowedHost = useMemo(
    () => uiSchema?.['ui:options']?.allowedHost ?? '',
    [uiSchema],
  );
  const allowedOrganization = useMemo(
    () => uiSchema?.['ui:options']?.allowedOrganization ?? '',
    [uiSchema],
  );

  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projects, setProjects] = useState<
    Array<{
      id: string;
      label: string;
    }>
  >([]);
  const [selectedProject, setSelectedProject] = useState<undefined | string>(
    undefined,
  );
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repos, setRepos] = useState<
    Array<{
      id: string;
      label: string;
    }>
  >([]);
  const [selectedRepo, setSelectedRepo] = useState<undefined | string>(
    undefined,
  );
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<undefined | string>(
    undefined,
  );
  const [branches, setBranches] = useState<
    Array<{
      id: string;
      label: string;
    }>
  >([]);

  const identityApi = useApi(identityApiRef);
  const catalogApi = useApi(catalogApiRef);
  const errorApi = useApi(errorApiRef);
  const scmAuthApi = useApi(scmAuthApiRef);
  const azureDevOpsApi = useApi(azureDevOpsApiRef);

  const { requestUserCredentials } = uiSchema?.['ui:options'] ?? {};

  useAsync(async () => {
    const { userEntityRef } = await identityApi.getBackstageIdentity();

    if (!userEntityRef) {
      errorApi.post(new NotFoundError('No user entity ref found'));
      return;
    }

    setLoadingProjects(true);
    const { items } = await catalogApi.getEntities({
      filter: {
        kind: 'Group',
        ['relations.hasMember']: [userEntityRef],
      },
      fields: ['metadata.name'],
    });

    let uniqueNames = Array.from(
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
      id: string;
      label: string;
    }> = uniqueNames.sort().map(name => ({ id: name, label: name }));

    setProjects(result);
    setLoadingProjects(false);
  });

  useEffect(() => {
    if (!selectedProject) {
      setRepos([]);
      setSelectedRepo(undefined);
      return;
    }

    const fetchRepos = async () => {
      setLoadingRepos(true);
      const items = await azureDevOpsApi.getRepositories(
        selectedProject,
        allowedHost,
        allowedOrganization,
      );
      const fetchedRepos =
        items?.map(item => ({ id: item, label: item })) ?? [];
      setRepos(fetchedRepos);
      setLoadingRepos(false);
    };

    fetchRepos();
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedProject || !selectedRepo) {
      setBranches([]);
      setSelectedBranch(undefined);
      return;
    }

    const fetchBranches = async () => {
      setLoadingBranches(true);
      const items = await azureDevOpsApi.getBranches(
        selectedProject,
        selectedRepo,
        allowedHost,
        allowedOrganization,
      );
      const fetchedBranches =
        items?.map(item => ({ id: item, label: item })) ?? [];
      setBranches(fetchedBranches);
      setLoadingBranches(false);
    };

    fetchBranches();
  }, [selectedProject, selectedRepo]);

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
      <Select
        loading={{ state: loadingProjects ? 'loading' : 'idle' }}
        name="project-label"
        label={uiSchema['ui:title'] ?? schema.title}
        search
        value={selectedProject}
        options={projects}
        onChange={selected => {
          const newValue = selected?.toString() ?? undefined;
          setSelectedProject(newValue);
        }}
        isRequired={required}
        aria-label="Project"
      />
      <Select
        loading={{ state: loadingRepos ? 'loading' : 'idle' }}
        name="repo-label"
        label="Repository"
        search
        value={selectedRepo}
        options={repos}
        onChange={selected => {
          const newValue = selected?.toString() ?? undefined;
          setSelectedRepo(newValue);
        }}
        isRequired={required}
        aria-label="Repository"
        style={{ marginTop: '16px' }}
      />
      <Select
        loading={{ state: loadingBranches ? 'loading' : 'idle' }}
        name="branch-label"
        label="Branch"
        search
        value={selectedBranch}
        options={branches}
        onChange={selected => {
          const newValue = selected?.toString() ?? undefined;
          setSelectedBranch(newValue);
          const repoUrl = `https://${allowedHost}/${allowedOrganization}/${selectedProject}/${selectedRepo}?version=GB${newValue}`;
          onChange(repoUrl);
        }}
        isRequired={required}
        aria-label="Branch"
        style={{ marginTop: '16px' }}
      />
    </ScaffolderField>
  );
};
