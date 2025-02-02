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
import { useGetApiVersions } from '../../hooks';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { ApiEntity } from '@backstage/catalog-model';
import { ApiPlatformDefinitionCard } from './ApiPlatformDefinitionCard';
import { Box } from '@material-ui/core';

export const ApiPlatformDefinitionPage = () => {
  const { name } = useRouteRefParams(entityRouteRef);
  const { apiVersions, loading, error } = useGetApiVersions(name);
  const catalogApi = useApi(catalogApiRef);

  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [versions, setVersions] = useState<SelectItem[]>([]);
  const [apiEntity, setApiEntity] = useState<ApiEntity | undefined>(undefined);

  useEffect(() => {
    if (versions.length > 0) {
      setSelectedVersion(versions.at(0)?.value.toString()!);
    }
  }, [versions]);

  useEffect(() => {
    if (selectedVersion !== "") {
      catalogApi.getEntityByRef(selectedVersion)
        .then(entity => setApiEntity(entity as ApiEntity));
    }
  }, [selectedVersion, catalogApi]);

  useEffect(() => {
    setVersions(apiVersions
      ? apiVersions.map(apiVersion => ({ label: apiVersion.version, value: apiVersion.entityRef }))
      : []);
  }, [apiVersions])

  const configApi = useApi(configApiRef);
  const generatedSubtitle = `${configApi.getOptionalString('organization.name') ?? 'Backstage'} API Explorer`;

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (loading) {
    return <Progress />
  }

  return (
    <PageWithHeader
      themeId="apis"
      title={`API - ${name}`}
      subtitle={generatedSubtitle}>
      <Content>
        <Box mb={1}>
          <Select onChange={(selected) => { setSelectedVersion(selected.toString()) }} label="Versions" items={versions} selected={selectedVersion} />
        </Box>
        <Box mb={-3}>
          {apiEntity ?
            <ApiPlatformDefinitionCard apiEntity={apiEntity!} />
            : <div />
          }
        </Box>
      </Content>
    </PageWithHeader>
  );
};