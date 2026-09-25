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
import { Select, Text, Flex } from '@backstage/ui';
import { azureDevOpsApiRef } from '../../api';
import { LoadingIcon } from './LoadingIcon';

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

    /* TODO: for test */
    uniqueNames.push('java-playground');

    const result: Array<{
      id: string;
      label: string;
    }> = uniqueNames.sort().map(name => ({ id: name, label: name }));

    setProjects(result);
    setLoadingProjects(false);
  });

  useEffect(() => {
    setRepos([]);
    setSelectedRepo(undefined);
    setBranches([]);
    setSelectedBranch(undefined);
    let active = true;

    if (selectedProject) {
      const fetchRepos = async () => {
        setLoadingRepos(true);
        const items = await azureDevOpsApi.getRepositories(
          selectedProject,
          allowedHost,
          allowedOrganization,
        );
        if (!active) {
          return;
        }
        const fetchedRepos =
          items?.map(item => ({ id: item, label: item })) ?? [];
        setRepos(fetchedRepos);
        setLoadingRepos(false);
      };

      fetchRepos();
    } else {
      setLoadingRepos(false);
    }

    return () => {
      active = false;
    };
  }, [selectedProject, allowedHost, allowedOrganization, azureDevOpsApi]);

  useEffect(() => {
    setSelectedBranch(undefined);
    setBranches([]);
    let active = true;

    if (selectedProject && selectedRepo) {
      const fetchBranches = async () => {
        setLoadingBranches(true);
        const items = await azureDevOpsApi.getBranches(
          selectedProject,
          selectedRepo,
          allowedHost,
          allowedOrganization,
        );
        if (!active) {
          return;
        }
        const fetchedBranches =
          items?.map(item => ({ id: item, label: item })) ?? [];
        setBranches(fetchedBranches);
        setLoadingBranches(false);
      };

      fetchBranches();
    } else {
      setLoadingBranches(false);
    }

    return () => {
      active = false;
    };
  }, [
    selectedProject,
    selectedRepo,
    allowedHost,
    allowedOrganization,
    azureDevOpsApi,
  ]);

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
    <ScaffolderField rawErrors={rawErrors} required={required} errors={errors}>
      <Flex direction="column">
        <Text>{uiSchema['ui:title'] ?? schema.title}</Text>
        <Text variant="body-small" color="secondary">
          {rawDescription}
        </Text>
      </Flex>
      <Select
        loading={{ state: loadingProjects ? 'loading' : 'idle' }}
        icon={loadingProjects ? <LoadingIcon /> : undefined}
        name="project-label"
        label="Project"
        search
        value={selectedProject}
        options={projects}
        placeholder="Select a project"
        onChange={selected => {
          const newValue = selected?.toString() ?? undefined;
          setSelectedBranch(undefined);
          setSelectedRepo(undefined);
          setSelectedProject(newValue);
          onChange({
            project: newValue ?? '',
            repository: '',
            branch: '',
          });
        }}
        isRequired={required}
        aria-label="Project"
        style={{ marginTop: '16px' }}
      />
      <Select
        loading={{ state: loadingRepos ? 'loading' : 'idle' }}
        icon={loadingRepos ? <LoadingIcon /> : undefined}
        name="repo-label"
        label="Repository"
        search
        value={selectedRepo}
        options={repos}
        placeholder="Select a repository"
        onChange={selected => {
          const newValue = selected?.toString() ?? undefined;
          setSelectedBranch(undefined);
          setSelectedRepo(newValue);
          onChange({
            project: selectedProject ?? '',
            repository: newValue ?? '',
            branch: '',
          });
        }}
        isRequired={required}
        aria-label="Repository"
        style={{ marginTop: '16px' }}
      />
      <Select
        loading={{ state: loadingBranches ? 'loading' : 'idle' }}
        icon={loadingBranches ? <LoadingIcon /> : undefined}
        name="branch-label"
        label="Branch"
        search
        value={selectedBranch ?? ''}
        options={branches}
        placeholder="Select a branch"
        onChange={selected => {
          const newValue = selected?.toString() ?? undefined;
          setSelectedBranch(newValue);
          onChange({
            project: selectedProject ?? '',
            repository: selectedRepo ?? '',
            branch: newValue ?? '',
          });
        }}
        isRequired={required}
        aria-label="Branch"
        style={{ marginTop: '16px' }}
      />
    </ScaffolderField>
  );
};
