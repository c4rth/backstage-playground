import {
  Content,
  PageWithHeader,
  Progress,
  ResponseErrorPanel,
  Select,
  SelectItem,
} from '@backstage/core-components';
import { configApiRef, useApi, useRouteRefParams } from '@backstage/core-plugin-api';
import { EntityProvider, entityRouteRef } from '@backstage/plugin-catalog-react';
import React, { useEffect, useRef, useState } from 'react';
import { useGetApiVersions } from '../../hooks';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { ApiEntity } from '@backstage/catalog-model';
import { ApiPlatformDefinitionCard } from './ApiPlatformDefinitionCard';
import { Box } from '@material-ui/core';
import { useSearchParams } from 'react-router-dom';

export const ApiPlatformDefinitionPage = () => {
  const { name } = useRouteRefParams(entityRouteRef);
  const [searchParams] = useSearchParams();
  const queryVersion = searchParams.get('version');

  const { apiVersions, loading, error } = useGetApiVersions(name);
  const catalogApi = useApi(catalogApiRef);

  const [versions, setVersions] = useState<SelectItem[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(undefined);
  const [apiEntity, setApiEntity] = useState<ApiEntity | undefined>(undefined);

  const isInitialLoad = useRef(true);

  const configApi = useApi(configApiRef);

  useEffect(() => {
    const data = apiVersions
      ? apiVersions.map(apiVersion => ({ label: apiVersion.version, value: apiVersion.entityRef }))
      : []
    setVersions(data);
    let selVersion = null;
    if (isInitialLoad.current && queryVersion && data.some(item => item.label === queryVersion)) {
      selVersion = data.find(item => item.label === queryVersion)?.value;
    } else if (data.length > 0) {
      selVersion = data[0].value;
    }
    if (selVersion)
      setSelectedVersion(selVersion);
  }, [apiVersions, queryVersion])

  useEffect(() => {
    if (selectedVersion) {
      catalogApi.getEntityByRef(selectedVersion)
        .then(entity => setApiEntity(entity as ApiEntity));
    }
  }, [selectedVersion, catalogApi]);
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
            <EntityProvider entity={apiEntity}>
              <ApiPlatformDefinitionCard />
            </EntityProvider>
            : <div />
          }
        </Box>
      </Content>
    </PageWithHeader>
  );
};