import { ResponseErrorPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { memo, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { McaComponent } from '@internal/plugin-mca-common';
import { mcaComponentsBackendApiRef } from '../../api';
import { McaComponentsBackendApi } from '../../api/McaComponentsBackendApi';
import { Select, Option, PluginHeader, Container, Header } from '@backstage/ui';
import { RiBubbleChartLine } from '@remixicon/react';
import { Progress } from '@internal/plugin-components-react';
import { useRouteRefParams } from '@backstage/frontend-plugin-api';
import { componentRouteRef } from '../../routes';
import { McaComponentDefinitionTabs } from './McaComponentDefinitionTabs';

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

type McaComponentType = 'operation' | 'element' | 'unknown';

function getMcaComponentType(componentName: string): McaComponentType {
  if (componentName.startsWith('Operation')) return 'operation';
  if (componentName.startsWith('Element')) return 'element';
  return 'unknown';
}

function getTabs(componentType: McaComponentType) {
  if (componentType === 'operation') {
    return [
      { id: 'overview', label: 'Overview', href: '.' },
      { id: 'inputfields', label: 'Input Fields', href: 'inputfields' },
      { id: 'outputfields', label: 'Output Fields', href: 'outputfields' },
      { id: 'methods', label: 'Methods', href: 'methods' },
      { id: 'raw', label: 'Raw', href: 'raw' },
    ];
  }
  if (componentType === 'element') {
    return [
      { id: 'overview', label: 'Overview', href: '.' },
      { id: 'fields', label: 'Fields', href: 'fields' },
      { id: 'methods', label: 'Methods', href: 'methods' },
      { id: 'raw', label: 'Raw', href: 'raw' },
    ];
  }
  return [];
}

export const McaComponentDefinitionPage = memo(() => {
  const mcaApi = useApi(mcaComponentsBackendApiRef);
  const { name } = useRouteRefParams(componentRouteRef);
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

  const componentType = getMcaComponentType(mca?.component ?? '');
  const tabs = getTabs(componentType);

  return (
    <>
      <PluginHeader
        icon={<RiBubbleChartLine fontSize="inherit" />}
        breadcrumbs={[{ label: 'MCA Components', href: '/mca/components' }]}
      />
      <Header
        title={name}
        metadata={[
          {
            label: 'Version',
            value: (
              <Select
                onChange={selected => {
                  setSelectedVersion(
                    selected ? selected.toString() : undefined,
                  );
                }}
                options={versions}
                value={selectedVersion}
                aria-label="Version"
              />
            ),
          },
        ]}
        tabs={tabs}
      />
      <Container>
        <McaComponentDefinitionTabs mca={mca!} version={selectedVersion} />
      </Container>
    </>
  );
});
