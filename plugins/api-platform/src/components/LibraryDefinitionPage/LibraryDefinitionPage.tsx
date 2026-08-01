import { ResponseErrorPanel } from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import { LibraryDefinitionVersionsCard } from './LibraryDefinitionVersionsCard';
import { LibraryDefinitionAllServicesCard } from './LibraryDefinitionAllServicesCard';
import { useEffect, useState } from 'react';
import { ComponentEntity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import {
  AsyncEntityProvider,
  catalogApiRef,
} from '@backstage/plugin-catalog-react';
import { apiPlatformBackendApiRef } from '../../plugin';
import { LibraryDefinition } from '@internal/plugin-api-platform-common';
import { generateReport } from './generateReport';
import {
  ButtonIcon,
  Container,
  PluginHeader,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  TooltipTrigger,
  Tooltip,
} from '@backstage/ui';
import { RiBookShelfLine } from '@remixicon/react';
import { Progress } from '@internal/plugin-api-platform-react';

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
      <PluginHeader
        title={`Library - ${name}`}
        icon={<RiBookShelfLine fontSize="inherit" />}
        customActions={
          <TooltipTrigger>
            <ButtonIcon
              onClick={handleGenerateReport}
              isDisabled={loading || !!error}
              icon={<RiBookShelfLine />}
            />
            <Tooltip>Generate report</Tooltip>
          </TooltipTrigger>
        }
      />
      <Container>
        {generating && <Progress />}
        {errorReport && (
          <ResponseErrorPanel
            title="Error generating report"
            error={errorReport}
          />
        )}
        <Tabs>
          <TabList>
            <Tab id="tab1">By versions</Tab>
            <Tab id="tab2">By services</Tab>
          </TabList>
          <TabPanel id="tab1">
            <LibraryDefinitionVersionsCard system={system!} name={name!} />
          </TabPanel>
          <TabPanel id="tab2">
            <LibraryDefinitionAllServicesCard system={system!} name={name!} />
          </TabPanel>
        </Tabs>
      </Container>
    </AsyncEntityProvider>
  );
};
