import {
  Content,
  PageWithHeader,
  Progress,
  ResponseErrorPanel,
  Select,
  SelectedItems,
  SelectItem,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Box } from '@material-ui/core';
import { useParams, useSearchParams } from 'react-router-dom';
import { McaComponent } from '@internal/plugin-mca-common';
import { McaComponentDefinitionCard } from './McaComponentDefinitionCard';
import { mcaComponentsBackendApiRef } from '../../api';
import { McaComponentsBackendApi } from '../../api/McaComponentsBackendApi';
import { Grid } from '@backstage/ui';

type McaComponentVersion = {
  label: string;
  value: string;
};

const mapMcaVersions = (mca: McaComponent | undefined): McaComponentVersion[] => {
  if (!mca) {
    return [];
  }

  // Create version entries in priority order
  const versionEntries = [
    { version: mca.p4Version, suffix: '' },
    { version: mca.p3Version, suffix: '' },
    { version: mca.p2Version, suffix: '' },
    { version: mca.p1Version, suffix: '' },
    { version: mca.prdVersion, suffix: ' (PRD)' },
  ];

  return versionEntries
    .filter(({ version }) => version) // Filter out falsy versions
    .map(({ version, suffix }) => ({
      label: `${version}${suffix}`,
      value: version!,
    }));
}

async function getMca(mcaApi: McaComponentsBackendApi, name: string,): Promise<McaComponent> {
  const mca = await mcaApi.getMcaComponent(name);
  if (!mca) {
    throw new Error(`MCA component ${name} not found`);
  }
  return mca;
}

export const McaComponentDefinitionPage = () => {
  const mcaApi = useApi(mcaComponentsBackendApiRef);
  const configApi = useApi(configApiRef);
  const { name } = useParams();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mca, setMca] = useState<McaComponent>();
  const [selectedVersion, setSelectedVersion] = useState<string>();
  const isInitialLoad = useRef(true);


  const [versions, setVersions] = useState<SelectItem[]>([]);

  const queryVersion = useMemo(() =>
    searchParams.get('version'),
    [searchParams]
  );
  const organizationName = useMemo(() =>
    configApi.getOptionalString('organization.name') ?? 'Backstage',
    [configApi]
  );
  const subtitle = useMemo(() =>
    `${organizationName} MCA Component Explorer`,
    [organizationName]
  );

  const selectProps = useMemo(() => ({
    onChange: (selected: SelectedItems) => {
      setSelectedVersion(selected.toString())
    },
    label: "Versions",
    items: versions,
    selected: selectedVersion,
  }), [versions, selectedVersion]);

  useEffect(() => {
    setSelectedVersion(undefined);
    setMca(undefined);
    setLoading(true);
    setError(null);
    getMca(mcaApi, name!).then(component => {
      setVersions([]);
      setMca(component);
      setLoading(false);
    }).catch(err => {
      setError(err);
      setLoading(false);
    });
  }, [name, mcaApi]);

  useEffect(() => {
    if (!selectedVersion) {
      const mcaVersions = mapMcaVersions(mca);
      const data = mcaVersions.map(mcaVersion => ({ label: mcaVersion.label, value: mcaVersion.value }));
      setVersions(data);
      let selVersion: string | undefined;
      if (isInitialLoad.current && queryVersion && data.some(item => item.value === queryVersion)) {
        selVersion = data.find(item => item.value === queryVersion)?.value;
        isInitialLoad.current = false;
      } else if (data.length > 0) {
        selVersion = data[0].value;
      }
      if (selVersion) setSelectedVersion(selVersion);
    }
  }, [mca, queryVersion, selectedVersion]);

  if (error) return <ResponseErrorPanel error={error} />;
  if (loading) return <Progress />;

  return (
    <PageWithHeader
      key={name}
      themeId="apis"
      title={`MCA Component - ${name}`}
      subtitle={subtitle}
    >
      <Content>
        <Box mb={1}>
          <Grid.Root columns='2'>
            <Grid.Item>
              <Select {...selectProps} />
            </Grid.Item>
          </Grid.Root>
        </Box>
        <Box mb={-3}>
          {mca ? <McaComponentDefinitionCard mca={mca} version={selectedVersion!} /> : <div />}
        </Box>
      </Content>
    </PageWithHeader>
  );
};