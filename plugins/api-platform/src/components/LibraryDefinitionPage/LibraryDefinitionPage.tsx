import {
  Page,
  Header,
  Content,
  TabbedLayout,
  HeaderActionMenu,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import { LibraryDefinitionVersionsCard } from './LibraryDefinitionVersionsCard';
import { LibraryDefinitionServicesCard } from './LibraryDefinitionServicesCard';
import { useEffect, useState } from 'react';
import { ComponentEntity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import {
  AsyncEntityProvider,
  catalogApiRef,
} from '@backstage/plugin-catalog-react';
import { apiPlatformBackendApiRef } from '../../api';
import { ComponentHeaderLabels } from '../common';
import { LibraryDefinition } from '@internal/plugin-api-platform-common';
import { generateReport } from './generateReport';

export const LibraryDefinitionPage = () => {
  const { system, name } = useParams();
  const [libraryEntity, setLibraryEntity] = useState<
    ComponentEntity | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const catalogApi = useApi(catalogApiRef);
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);
  const [generating, setGenerating] = useState(false);
  const [errorReport, setErrorReport] = useState<Error | null>(null);
  const [libraryVersions, setLibraryVersions] = useState<
    LibraryDefinition[] | undefined
  >(undefined);

  useEffect(() => {
    if (!name || !system) return;

    const fetchLibraryEntity = async () => {
      try {
        const libVersions = await apiPlatformApi.getLibraryVersions(
          system,
          name,
          true,
        );
        setLibraryVersions(libVersions);
        const lastVersion = libVersions[0];
        if (lastVersion?.entityRef) {
          const entity = await catalogApi.getEntityByRef(lastVersion.entityRef);
          setLibraryEntity(entity as ComponentEntity);
        }
      } catch (err) {
        setError(err as Error);
        setLibraryEntity(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryEntity();
  }, [apiPlatformApi, catalogApi, system, name]);

  const handleGenerateReport = async () => {
    setGenerating(true);
    setErrorReport(null);
    try {
      await generateReport(apiPlatformApi, name!, libraryVersions);
    } catch (errGenerate) {
      setErrorReport(errGenerate as Error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AsyncEntityProvider loading={loading} error={error} entity={libraryEntity}>
      <Page themeId="libraries">
        <Header title={`${name}`} type="Library">
          <ComponentHeaderLabels
            entity={
              libraryEntity ??
              ({ metadata: { name, title: name } } as ComponentEntity)
            }
          />
          <HeaderActionMenu
            actionItems={[
              {
                label: 'Generate report',
                onClick: handleGenerateReport,
                disabled: loading || !!error,
              },
            ]}
          />
        </Header>
        <Content>
          {generating && <Progress />}
          {errorReport && (
            <ResponseErrorPanel
              title="Error generating report"
              error={errorReport}
            />
          )}
          <TabbedLayout>
            <TabbedLayout.Route path="/" title="By versions">
              <LibraryDefinitionVersionsCard system={system!} name={name!} />
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/services" title="By services">
              <LibraryDefinitionServicesCard system={system!} name={name!} />
            </TabbedLayout.Route>
          </TabbedLayout>
        </Content>
      </Page>
    </AsyncEntityProvider>
  );
};
