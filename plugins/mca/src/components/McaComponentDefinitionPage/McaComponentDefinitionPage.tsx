import {
  Content,
  PageWithHeader,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { McaComponent } from '@internal/plugin-mca-common';
import { McaComponentDefinitionCard } from './McaComponentDefinitionCard';
import { mcaComponentsBackendApiRef } from '../../api';
import { McaComponentsBackendApi } from '../../api/McaComponentsBackendApi';
import { Box, Grid, Select, Option, FullPage, } from '@backstage/ui';

function mapMcaVersions(mca: McaComponent | undefined): Option[] {
  if (!mca) return [];

  const versions = [
    { version: mca.p4Version, suffix: '' },
    { version: mca.p3Version, suffix: '' },
    { version: mca.p2Version, suffix: '' },
    { version: mca.p1Version, suffix: '' },
    { version: mca.prdVersion, suffix: ' (PRD)' },
  ];

  return versions
    .filter(({ version }) => version)
    .map(({ version, suffix }) => ({
      label: `${version}${suffix}`,
      id: version!,
    }));
}

async function getMca(
  mcaApi: McaComponentsBackendApi,
  name: string,
): Promise<McaComponent> {
  const mca = await mcaApi.getMcaComponent(name);
  if (!mca) {
    throw new Error(`MCA component ${name} not found`);
  }
  return mca;
}

export const McaComponentDefinitionPage = () => {
  const mcaApi = useApi(mcaComponentsBackendApiRef);
  const { name } = useParams();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mca, setMca] = useState<McaComponent>();
  const [selectedVersion, setSelectedVersion] = useState<string>();
  const [versions, setVersions] = useState<Option[]>([]);
  const isInitialLoad = useRef(true);

  const queryVersion = searchParams.get('version');

  useEffect(() => {
    setSelectedVersion(undefined);
    setMca(undefined);
    setVersions([]);
    setLoading(true);
    setError(null);
    getMca(mcaApi, name!)
      .then(component => setMca(component))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [name, mcaApi]);

  useEffect(() => {
    if (!selectedVersion && mca) {
      const data = mapMcaVersions(mca);
      setVersions(data);

      let selVersion: string | undefined;
      if (
        isInitialLoad.current &&
        queryVersion &&
        data.some(item => item.id === queryVersion)
      ) {
        selVersion = queryVersion;
        isInitialLoad.current = false;
      } else if (data.length > 0) {
        selVersion = String(data[0].id);
      }
      if (selVersion) setSelectedVersion(selVersion);
    }
  }, [mca, queryVersion, selectedVersion]);

  if (error) return <ResponseErrorPanel error={error} />;
  if (loading || !selectedVersion) return <Progress />;

  const pageContent = (
    <Content>
      <Box mb="4">
        <Grid.Root columns="2">
          <Grid.Item>
            <Select
              onChange={selected => {
                setSelectedVersion(selected ? selected.toString() : undefined);
              }}
              label="Versions"
              options={versions}
              value={selectedVersion}
            />
          </Grid.Item>
        </Grid.Root>
      </Box>
      <McaComponentDefinitionCard mca={mca!} version={selectedVersion} />
    </Content>
  );

  return (
    <PageWithHeader key={name} themeId="apis" title={name} type="MCA Component">
      {pageContent}
    </PageWithHeader>
  );
};

export const NfsMcaComponentDefinitionPage = () => {
  const mcaApi = useApi(mcaComponentsBackendApiRef);
  const { name } = useParams();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mca, setMca] = useState<McaComponent>();
  const [selectedVersion, setSelectedVersion] = useState<string>();
  const [versions, setVersions] = useState<Option[]>([]);
  const isInitialLoad = useRef(true);

  const queryVersion = searchParams.get('version');

  useEffect(() => {
    setSelectedVersion(undefined);
    setMca(undefined);
    setVersions([]);
    setLoading(true);
    setError(null);
    getMca(mcaApi, name!)
      .then(component => setMca(component))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [name, mcaApi]);

  useEffect(() => {
    if (!selectedVersion && mca) {
      const data = mapMcaVersions(mca);
      setVersions(data);

      let selVersion: string | undefined;
      if (
        isInitialLoad.current &&
        queryVersion &&
        data.some(item => item.id === queryVersion)
      ) {
        selVersion = queryVersion;
        isInitialLoad.current = false;
      } else if (data.length > 0) {
        selVersion = String(data[0].id);
      }
      if (selVersion) setSelectedVersion(selVersion);
    }
  }, [mca, queryVersion, selectedVersion]);

  if (error) return <ResponseErrorPanel error={error} />;
  if (loading || !selectedVersion) return <Progress />;

  return (
    <FullPage>
    <PageWithHeader key={name} themeId="apis" title={name} type="MCA Component">
      <Content>
        <Box mb="4">
          <Grid.Root columns="2">
            <Grid.Item>
              <Select
                onChange={selected => {
                  setSelectedVersion(selected ? selected.toString() : undefined);
                }}
                label="Versions"
                options={versions}
                value={selectedVersion}
              />
            </Grid.Item>
          </Grid.Root>
        </Box>
        <McaComponentDefinitionCard mca={mca!} version={selectedVersion} />
      </Content>
      </PageWithHeader>
    </FullPage>
  );
};
