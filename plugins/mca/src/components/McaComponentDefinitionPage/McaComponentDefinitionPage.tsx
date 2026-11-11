import { ResponseErrorPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { NotFoundError } from '@backstage/errors';
import { memo, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { McaComponent } from '@internal/plugin-mca-common';
import { mcaComponentsBackendApiRef } from '../../api';
import { McaComponentsBackendApi } from '../../api/McaComponentsBackendApi';
import { Select, Option, PluginHeader, Container, Header } from '@backstage/ui';
import { RiBubbleChartLine } from '@remixicon/react';
import { Progress, useDocumentTitle } from '@internal/plugin-components-react';
import {
  useRouteRefParams,
  useTranslationRef,
} from '@backstage/frontend-plugin-api';
import { mcaTranslationRef, McaTranslator } from '../../translation';
import { componentRouteRef } from '../../routes';
import { McaComponentDefinitionTabs } from './McaComponentDefinitionTabs';

function mapMcaVersions(
  mca: McaComponent | undefined,
  t: McaTranslator,
): Option[] {
  if (!mca) return [];

  const versions = [
    { version: mca.p4Version, production: false },
    { version: mca.p3Version, production: false },
    { version: mca.p2Version, production: false },
    { version: mca.p1Version, production: false },
    { version: mca.prdVersion, production: true },
  ];

  return versions
    .filter(({ version }) => version)
    .map(({ version, production }) => ({
      label: production
        ? t('componentDefinition.productionVersion', { version: version! })
        : version!,
      id: version!,
    }));
}

async function getMca(
  mcaApi: McaComponentsBackendApi,
  name: string,
  t: McaTranslator,
): Promise<McaComponent> {
  const mca = await mcaApi.getMcaComponent(name);
  if (!mca) {
    throw new NotFoundError(t('componentDefinition.notFound', { name }));
  }
  return mca;
}

type McaComponentType = 'operation' | 'element' | 'unknown';

function getMcaComponentType(componentName: string): McaComponentType {
  if (componentName.startsWith('Operation')) return 'operation';
  if (componentName.startsWith('Element')) return 'element';
  return 'unknown';
}

function getTabs(componentType: McaComponentType, t: McaTranslator) {
  if (componentType === 'operation') {
    return [
      {
        id: 'overview',
        label: t('componentDefinition.tabs.overview'),
        href: '.',
      },
      {
        id: 'inputfields',
        label: t('componentDefinition.tabs.inputFields'),
        href: 'inputfields',
      },
      {
        id: 'outputfields',
        label: t('componentDefinition.tabs.outputFields'),
        href: 'outputfields',
      },
      {
        id: 'methods',
        label: t('componentDefinition.tabs.methods'),
        href: 'methods',
      },
      { id: 'raw', label: t('componentDefinition.tabs.raw'), href: 'raw' },
    ];
  }
  if (componentType === 'element') {
    return [
      {
        id: 'overview',
        label: t('componentDefinition.tabs.overview'),
        href: '.',
      },
      {
        id: 'fields',
        label: t('componentDefinition.tabs.fields'),
        href: 'fields',
      },
      {
        id: 'methods',
        label: t('componentDefinition.tabs.methods'),
        href: 'methods',
      },
      { id: 'raw', label: t('componentDefinition.tabs.raw'), href: 'raw' },
    ];
  }
  return [];
}

export const McaComponentDefinitionPage = memo(() => {
  const { t } = useTranslationRef(mcaTranslationRef);
  const mcaApi = useApi(mcaComponentsBackendApiRef);
  const { name } = useRouteRefParams(componentRouteRef);
  const [searchParams] = useSearchParams();
  useDocumentTitle(t('componentDefinition.title', { name }));

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
    getMca(mcaApi, name!, t)
      .then(component => setMca(component))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [name, mcaApi, t]);

  useEffect(() => {
    if (mca) {
      const data = mapMcaVersions(mca, t);
      setVersions(data);

      if (selectedVersion) return;
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
  }, [mca, queryVersion, selectedVersion, t]);

  if (error) return <ResponseErrorPanel error={error} />;
  if (loading || !selectedVersion) return <Progress />;

  const componentType = getMcaComponentType(mca?.component ?? '');
  const tabs = getTabs(componentType, t);

  return (
    <>
      <PluginHeader
        icon={<RiBubbleChartLine fontSize="inherit" />}
        breadcrumbs={[
          {
            label: t('componentDefinition.breadcrumb'),
            href: '/mca/components',
          },
          { label: name, href: '' },
        ]}
      />
      <Header
        title={name}
        metadata={[
          {
            label: t('componentDefinition.version'),
            value: (
              <Select
                onChange={selected => {
                  setSelectedVersion(
                    selected ? selected.toString() : undefined,
                  );
                }}
                options={versions}
                value={selectedVersion}
                aria-label={t('componentDefinition.version')}
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
