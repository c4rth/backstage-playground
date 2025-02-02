import {
  Content,
  PageWithHeader,
  Progress,
  ResponseErrorPanel,
  Select,
  SelectItem,
} from '@backstage/core-components';
import { configApiRef, useApi, useRouteRefParams } from '@backstage/core-plugin-api';
import { entityRouteRef } from '@backstage/plugin-catalog-react';
import React, { useEffect, useState } from 'react';
import { useGetServiceVersions } from '../../hooks/useGetServiceVersions';
import { Box, Grid } from '@material-ui/core';
import { ServicePlatformDefinitionCard } from './ServicePlatformDefinitionCard';
import { ComponentEntity } from '@backstage/catalog-model';
import { catalogApiRef } from '@backstage/plugin-catalog-react';

export const ServicePlatformDefinitionPage = () => {

  const { name } = useRouteRefParams(entityRouteRef);
  const { item: serviceDefinition, loading, error } = useGetServiceVersions(name);

  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [versions, setVersions] = useState<SelectItem[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("");
  const [environments, setEnvironments] = useState<SelectItem[]>([]);
  const [serviceEntity, setServiceEntity] = useState<ComponentEntity | undefined>(undefined);

  const catalogApi = useApi(catalogApiRef);

  useEffect(() => {
    if (versions.length > 0) {
      setSelectedVersion(versions.at(0)?.value.toString()!);
    }
  }, [versions]);

  useEffect(() => {
    if (environments.length > 0) {
      setSelectedEnvironment(environments.at(0)?.value.toString()!);
    }
  }, [environments]);

  useEffect(() => {
    if (selectedVersion !== "") {
      const selectedSvc = serviceDefinition?.versions.filter(versDef => versDef.version === selectedVersion)[0];
      const envs: SelectItem[] = []
      if (selectedSvc?.environments.tst) {
        envs.push({ label: 'TST', value: selectedSvc.environments.tst.entityRef });
      }
      if (selectedSvc?.environments.gtu) {
        envs.push({ label: 'GTU', value: selectedSvc.environments.gtu.entityRef });
      }
      if (selectedSvc?.environments.uat) {
        envs.push({ label: 'UAT', value: selectedSvc.environments.uat.entityRef });
      }
      if (selectedSvc?.environments.ptp) {
        envs.push({ label: 'PTP', value: selectedSvc.environments.ptp.entityRef });
      }
      if (selectedSvc?.environments.prd) {
        envs.push({ label: 'PRD', value: selectedSvc.environments.prd.entityRef });
      }
      setEnvironments(envs);
    }
  }, [selectedVersion, serviceDefinition]);


  useEffect(() => {
    if (selectedVersion !== "" && selectedEnvironment !== "") {
      catalogApi.getEntityByRef(selectedEnvironment)
        .then(entity => setServiceEntity(entity as ComponentEntity));
    }
  }, [selectedVersion, selectedEnvironment, catalogApi]);

  useEffect(() => {
    setVersions(serviceDefinition && serviceDefinition.versions
      ? serviceDefinition.versions.map((serviceVersion) => ({ label: serviceVersion.version, value: serviceVersion.version }))
      : []);
  }, [serviceDefinition])

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