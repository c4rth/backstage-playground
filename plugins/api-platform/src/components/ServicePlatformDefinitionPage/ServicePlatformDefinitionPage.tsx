import {
  Content,
  Header,
  Page,
  Progress,
  ResponseErrorPanel,
  Select,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useGetServiceVersions } from '../../hooks/useGetServiceVersions';
import { Box, Grid } from '@material-ui/core';
import { ServicePlatformDefinitionCard } from './ServicePlatformDefinitionCard';
import { ComponentEntity } from '@backstage/catalog-model';
import { catalogApiRef, EntityProvider } from '@backstage/plugin-catalog-react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ServiceDefinition } from '@internal/plugin-api-platform-common';
import { ComponentHeaderLabels } from '../common/ComponentHeaderLabels';
import { ComponentHeaderContextMenu } from '../common/ComponentHeaderContextMenu';

type MapVersionEnvironment = Map<string, Map<string, string>>

function parseServiceDefinition(svcDef: ServiceDefinition | undefined): MapVersionEnvironment {

  const mapVersion = new Map<string, Map<string, string>>();
  const envKeys: Array<'tst' | 'gtu' | 'uat' | 'ptp' | 'prd'> = ['tst', 'gtu', 'uat', 'ptp', 'prd'];
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

export const ServicePlatformDefinitionPage = () => {
  const { system, name } = useParams();
  const [searchParams] = useSearchParams();
  const queryVersion = searchParams.get('version');
  const queryEnv = searchParams.get('env');
  const { item: serviceDefinition, loading, error } = useGetServiceVersions(system!, name!);
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(undefined);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string | undefined>(undefined);
  const [serviceEntity, setServiceEntity] = useState<ComponentEntity | undefined>(undefined);
  const isInitialLoad = useRef(true);
  const catalogApi = useApi(catalogApiRef);
  const configApi = useApi(configApiRef);

  const mapVersionEnv = useMemo(() => parseServiceDefinition(serviceDefinition), [serviceDefinition]);

  const versions = useMemo(() =>
    serviceDefinition?.versions?.map(v => ({ label: v.version, value: v.version })) || [],
    [serviceDefinition]
  );

  useEffect(() => {
    if (!selectedVersion && versions.length > 0) {
      let selVersion = null;
      if (isInitialLoad.current && queryVersion && versions.some(item => item.value === queryVersion)) {
        selVersion = queryVersion;
      } else {
        selVersion = versions[0].value;
      }
      if (selVersion) setSelectedVersion(selVersion);
    }
  }, [versions, queryVersion, selectedVersion]);

  const environments = useMemo(() => {
    if (!selectedVersion) return [];
    const selectedSvc = mapVersionEnv.get(selectedVersion);
    return selectedSvc ? Array.from(selectedSvc.keys()).map(s => ({ label: s, value: s })) : [];
  }, [selectedVersion, mapVersionEnv]);

  useEffect(() => {
    if (selectedVersion && !selectedEnvironment && environments.length > 0) {
      let selEnv = null;
      if (isInitialLoad.current && queryEnv && environments.some(item => item.value === queryEnv.toUpperCase())) {
        selEnv = queryEnv.toUpperCase();
        isInitialLoad.current = false;
      } else {
        selEnv = environments[0].value;
      }
      if (selEnv) setSelectedEnvironment(selEnv);
    }
    else {
      if (!environments.some(item => item.value === selectedEnvironment)) {
        setSelectedEnvironment(environments[0]?.value);
      }
    }
  }, [selectedVersion, environments, queryEnv, selectedEnvironment]);

  useEffect(() => {
    if (selectedVersion && selectedEnvironment) {
      const selectSvcEnv = mapVersionEnv.get(selectedVersion)?.get(selectedEnvironment);
      if (selectSvcEnv) {
        catalogApi.getEntityByRef(selectSvcEnv)
          .then(entity => setServiceEntity(entity as ComponentEntity));
      }
    }
  }, [selectedVersion, selectedEnvironment, catalogApi, mapVersionEnv]);

  const generatedSubtitle = `${configApi.getOptionalString('organization.name') ?? 'Backstage'} Service Explorer`;

  if (error) return <ResponseErrorPanel error={error} />;
  if (loading) return <Progress />;

  return (
    <Page
      themeId="services">
      <Header
        title={`Service - ${name}`}
        subtitle={generatedSubtitle}>
        <ComponentHeaderLabels entity={serviceEntity ?? { metadata: { name, title: name } } as ComponentEntity} />
        <ComponentHeaderContextMenu />
      </Header>
      <Content>
        <Box mb={1}>
          <Grid container>
            <Grid item md={6}>
              <Select onChange={selected => setSelectedVersion(selected.toString())} label="Versions" items={versions} selected={selectedVersion} />
            </Grid>
            <Grid item md={6}>
              <Select onChange={selected => setSelectedEnvironment(selected.toString())} label="Environments" items={environments} selected={selectedEnvironment} />
            </Grid>
          </Grid>
        </Box>
        <Box mb={-3}>
          {serviceEntity ? (
            <EntityProvider entity={serviceEntity}>
              <ServicePlatformDefinitionCard />
            </EntityProvider>
          ) : <div />}
        </Box>
      </Content>
    </Page>
  );
};