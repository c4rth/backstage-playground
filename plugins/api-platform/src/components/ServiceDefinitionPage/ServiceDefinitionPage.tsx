import { useApi } from '@backstage/core-plugin-api';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useGetServiceVersions } from '../../hooks/useGetServiceVersions';
import { ComponentEntity } from '@backstage/catalog-model';
import {
  AsyncEntityProvider,
  catalogApiRef,
} from '@backstage/plugin-catalog-react';
import { Routes, Route, useSearchParams } from 'react-router-dom';
import { ServiceDefinition } from '@internal/plugin-api-platform-common';
import { Container, PluginHeader, Select, Header } from '@backstage/ui';
import { RiCpuLine } from '@remixicon/react';
import { useRouteRefParams } from '@backstage/frontend-plugin-api';
import { apiPlatformServiceDefinitionRouteRef } from '../../routes';
import {
  isAzureDevOpsAvailable,
  isAzurePipelinesAvailable,
} from '@internal/plugin-azure-devops';
import { isSonarQubeAvailable } from '@backstage-community/plugin-sonarqube-react';
import {
  ServiceDefinitionDependenciesCard,
  ServiceDefinitionOverviewCard,
} from './ServiceDefinitionCards';
import { AppRegistryPage } from '@internal/plugin-app-registry';
import {
  AzureDevOpsPipelinePage,
  AzureDevOpsGitTagsPage,
  AzureReadmeCard,
} from '@internal/plugin-azure-devops';
import { EntitySonarQubeContentPage } from '@backstage-community/plugin-sonarqube';

type MapVersionEnvironment = Map<string, Map<string, string>>;

function parseServiceDefinition(
  svcDef: ServiceDefinition | undefined,
): MapVersionEnvironment {
  const mapVersion = new Map<string, Map<string, string>>();
  const envKeys: Array<'tst' | 'gtu' | 'uat' | 'ptp' | 'prd'> = [
    'tst',
    'gtu',
    'uat',
    'ptp',
    'prd',
  ];
  svcDef?.versions.forEach(version => {
    const mapEnv = new Map<string, string>();
    envKeys.forEach(env => {
      const envDef = version?.environments?.[env];
      if (envDef) {
        mapEnv.set(env.toUpperCase(), envDef.entityRef);
      }
    });
    mapVersion.set(version.version, mapEnv);
  });
  return mapVersion;
}

export const ServiceDefinitionPage = () => {
  const { system, name } = useRouteRefParams(
    apiPlatformServiceDefinitionRouteRef,
  );
  const [searchParams] = useSearchParams();
  const queryVersion = searchParams.get('version');
  const queryEnv = searchParams.get('env');
  const {
    item: serviceDefinition,
    loading,
    error,
  } = useGetServiceVersions(system!, name!);
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(
    undefined,
  );
  const [selectedEnvironment, setSelectedEnvironment] = useState<
    string | undefined
  >(undefined);
  const [serviceEntity, setServiceEntity] = useState<
    ComponentEntity | undefined
  >(undefined);
  const isInitialLoad = useRef(true);
  const catalogApi = useApi(catalogApiRef);

  const mapVersionEnv = useMemo(
    () => parseServiceDefinition(serviceDefinition),
    [serviceDefinition],
  );

  const versions = useMemo(
    () =>
      serviceDefinition?.versions?.map(v => ({
        label: v.version,
        id: v.version,
      })) || [],
    [serviceDefinition],
  );

  useEffect(() => {
    if (!selectedVersion && versions.length > 0) {
      let selVersion = null;
      if (
        isInitialLoad.current &&
        queryVersion &&
        versions.some(item => item.id === queryVersion)
      ) {
        selVersion = queryVersion;
      } else {
        selVersion = versions[0].id;
      }
      if (selVersion) setSelectedVersion(selVersion);
    }
  }, [versions, queryVersion, selectedVersion]);

  const environments = useMemo(() => {
    if (!selectedVersion) return [];
    const selectedSvc = mapVersionEnv.get(selectedVersion);
    return selectedSvc
      ? Array.from(selectedSvc.keys()).map(s => ({ label: s, id: s }))
      : [];
  }, [selectedVersion, mapVersionEnv]);

  useEffect(() => {
    if (selectedVersion && !selectedEnvironment && environments.length > 0) {
      let selEnv = null;
      if (
        isInitialLoad.current &&
        queryEnv &&
        environments.some(item => item.id === queryEnv.toUpperCase())
      ) {
        selEnv = queryEnv.toUpperCase();
        isInitialLoad.current = false;
      } else {
        selEnv = environments[0].id;
      }
      if (selEnv) setSelectedEnvironment(selEnv);
    } else {
      if (!environments.some(item => item.id === selectedEnvironment)) {
        setSelectedEnvironment(environments[0]?.id);
      }
    }
  }, [selectedVersion, environments, queryEnv, selectedEnvironment]);

  useEffect(() => {
    if (selectedVersion && selectedEnvironment) {
      const selectSvcEnv = mapVersionEnv
        .get(selectedVersion)
        ?.get(selectedEnvironment);
      if (selectSvcEnv) {
        catalogApi
          .getEntityByRef(selectSvcEnv)
          .then(entity => setServiceEntity(entity as ComponentEntity));
      }
    }
  }, [selectedVersion, selectedEnvironment, catalogApi, mapVersionEnv]);

  const sonarQube = serviceEntity && isSonarQubeAvailable(serviceEntity);
  const azureDevOps = serviceEntity && isAzureDevOpsAvailable(serviceEntity);
  const azurePipelines =
    serviceEntity && isAzurePipelinesAvailable(serviceEntity);

  return (
    <AsyncEntityProvider loading={loading} error={error} entity={serviceEntity}>
      <PluginHeader
        icon={<RiCpuLine fontSize="inherit" />}
        breadcrumbs={[{ label: 'Services', href: '/api-platform/service' }]}
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
                style={{ minWidth: '50px' }}
                aria-label="Version"
              />
            ),
          },
          {
            label: 'Environment',
            value: (
              <Select
                onChange={selected =>
                  setSelectedEnvironment(
                    selected ? selected.toString() : undefined,
                  )
                }
                options={environments}
                value={selectedEnvironment}
                style={{ minWidth: '50px' }}
                aria-label="Environment"
              />
            ),
          },
        ]}
        tabs={[
          { id: 'overview', label: 'Overview', href: '.' },
          { id: 'dependencies', label: 'Dependencies', href: 'dependencies' },
          { id: 'app-registry', label: 'App Registry', href: 'app-registry' },
          ...(azurePipelines
            ? [{ id: 'ci-cd', label: 'CI/CD', href: 'ci-cd' }]
            : []),
          ...(azureDevOps
            ? [{ id: 'git-tags', label: 'Git Tags', href: 'git-tags' }]
            : []),
          ...(azureDevOps
            ? [{ id: 'readme', label: 'Readme', href: 'readme' }]
            : []),
          ...(sonarQube
            ? [{ id: 'sonar', label: 'SonarQube', href: 'sonarqube' }]
            : []),
        ]}
      />
      <Container>
        {serviceEntity && (
          <Routes>
            <Route path="/" element={<ServiceDefinitionOverviewCard />} />
            <Route
              path="dependencies"
              element={<ServiceDefinitionDependenciesCard />}
            />
            <Route path="app-registry" element={<AppRegistryPage />} />
            {azurePipelines && (
              <Route path="ci-cd" element={<AzureDevOpsPipelinePage />} />
            )}
            {azureDevOps && (
              <Route path="git-tags" element={<AzureDevOpsGitTagsPage />} />
            )}
            {azureDevOps && (
              <Route path="readme" element={<AzureReadmeCard />} />
            )}
            {sonarQube && (
              <Route
                path="sonarqube"
                element={<EntitySonarQubeContentPage />}
              />
            )}
          </Routes>
        )}
      </Container>
    </AsyncEntityProvider>
  );
};
