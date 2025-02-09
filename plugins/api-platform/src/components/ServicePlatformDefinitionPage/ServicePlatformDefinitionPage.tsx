import {
  Content,
  PageWithHeader,
  Progress,
  ResponseErrorPanel,
  Select,
  SelectItem,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import React, { useEffect, useState } from 'react';
import { useGetServiceVersions } from '../../hooks/useGetServiceVersions';
import { Box, Grid } from '@material-ui/core';
import { ServicePlatformDefinitionCard } from './ServicePlatformDefinitionCard';
import { ComponentEntity } from '@backstage/catalog-model';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ServiceDefinition } from '@internal/plugin-api-platform-common';

type MapVersionEnvironment = Map<string, Map<string, string>>

function parseServiceDefinition(svcDef: ServiceDefinition | undefined): MapVersionEnvironment {
  const mapVersion = new Map<string, Map<string, string>>();
  if (svcDef) {
    svcDef.versions.forEach(version => {
      const mapEnv = new Map<string, string>();
      if (version?.environments.tst) {
        mapEnv.set('TST', version.environments.tst.entityRef);
      }
      if (version?.environments.gtu) {
        mapEnv.set('GTU', version.environments.gtu.entityRef);
      }
      if (version?.environments.uat) {
        mapEnv.set('UAT', version.environments.uat.entityRef);
      }
      if (version?.environments.ptp) {
        mapEnv.set('PTP', version.environments.ptp.entityRef);
      }
      if (version?.environments.prd) {
        mapEnv.set('PRD', version.environments.prd.entityRef);
      }
      mapVersion.set(version.version, mapEnv);
    });
  }
  return mapVersion;
}

export const ServicePlatformDefinitionPage = () => {
  const { name } = useParams();
  const [searchParams] = useSearchParams();
  const { item: serviceDefinition, loading, error } = useGetServiceVersions(name!);

  const [queryVersion, setQueryVersion] = useState<string | null>(searchParams.get('version'));
  const [queryEnv, setQueryEnv] = useState<string | null>(searchParams.get('env'));

  const [mapVersionEnv, setMapVersionEnv] = useState<MapVersionEnvironment>();
  const [versions, setVersions] = useState<SelectItem[]>([]);
  const [environments, setEnvironments] = useState<SelectItem[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(undefined);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string | undefined>(undefined);
  const [serviceEntity, setServiceEntity] = useState<ComponentEntity | undefined>(undefined);

  const catalogApi = useApi(catalogApiRef);

  useEffect(() => {
    setMapVersionEnv(parseServiceDefinition(serviceDefinition));
    setVersions(serviceDefinition && serviceDefinition.versions
      ? serviceDefinition.versions.map((serviceVersion) => ({ label: serviceVersion.version, value: serviceVersion.version }))
      : []);
  }, [serviceDefinition])

  useEffect(() => {
    if (versions.length > 0) {
      if (queryVersion) {
        setSelectedVersion(queryVersion);
        setQueryVersion(null);
      } else {
        setSelectedVersion(versions.at(0)?.value.toString()!);
      }
    }
  }, [versions, queryVersion]);

  useEffect(() => {
    if (environments.length > 0) {
      if (queryEnv) {
        setSelectedEnvironment(queryEnv.toUpperCase());
        setQueryEnv(null);
      } else {
        setSelectedEnvironment(environments.at(0)?.value.toString()!);
      }
    }
  }, [environments, queryEnv]);

  useEffect(() => {
    if (selectedVersion) {
      const selectedSvc = mapVersionEnv!.get(selectedVersion)!;
      setSelectedEnvironment(undefined);
      const envs: SelectItem[] = Array.from(selectedSvc.keys()).map(s => ({ label: s, value: s }));
      setEnvironments(envs);
    }
  }, [selectedVersion, mapVersionEnv]);


  useEffect(() => {
    if (selectedVersion && selectedEnvironment) {
      const selectSvcEnv = mapVersionEnv!.get(selectedVersion)?.get(selectedEnvironment);
      if (selectSvcEnv) {
        catalogApi.getEntityByRef(selectSvcEnv)
          .then(entity => setServiceEntity(entity as ComponentEntity));
      }
    }
  }, [selectedVersion, selectedEnvironment, catalogApi, mapVersionEnv]);

  const configApi = useApi(configApiRef);
  const generatedSubtitle = `${configApi.getOptionalString('organization.name') ?? 'Backstage'} Service Explorer`;

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (loading) {
    return <Progress />
  }

  return (
    <PageWithHeader
      themeId="services"
      title={`Service - ${name}`}
      subtitle={generatedSubtitle}>
      <Content>
        <Box mb={1}>
          <Grid container>
            <Grid item md={6}>
              <Select onChange={(selected) => { setSelectedVersion(selected.toString()) }} label="Versions" items={versions} selected={selectedVersion} />
            </Grid>
            <Grid item md={6}>
              <Select onChange={(selected) => { setSelectedEnvironment(selected.toString()) }} label="Environments" items={environments} selected={selectedEnvironment} />
            </Grid>
          </Grid>
        </Box>

        <Box mb={-3}>
          {serviceEntity ?
            <ServicePlatformDefinitionCard serviceEntity={serviceEntity} />
            : <div />
          }
        </Box>
      </Content>
    </PageWithHeader>
  );

};