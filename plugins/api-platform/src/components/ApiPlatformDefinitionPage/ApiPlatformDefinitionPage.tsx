import {
  Content,
  Header,
  Page,
  Progress,
  ResponseErrorPanel,
  Select,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useGetApiVersions } from '../../hooks';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { ApiEntity } from '@backstage/catalog-model';
import { ApiPlatformDefinitionCard } from './ApiPlatformDefinitionCard';
import { Box } from '@material-ui/core';
import { useParams, useSearchParams } from 'react-router-dom';
import { ComponentHeaderLabels } from '../common/ComponentHeaderLabels';
import { API_NO_SYSTEM } from '@internal/plugin-api-platform-common';

export const ApiPlatformDefinitionPage = () => {
  const { system, name } = useParams();
  const [searchParams] = useSearchParams();
  const queryVersion = searchParams.get('version');

  const { apiVersions, loading, error } = useGetApiVersions(system ?? API_NO_SYSTEM, name!);
  const catalogApi = useApi(catalogApiRef);

  const versions = useMemo(
    () => apiVersions?.map(apiVersion => ({
      label: apiVersion.version,
      value: apiVersion.entityRef
    })) ?? [],
    [apiVersions]
  );
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(undefined);
  const [apiEntity, setApiEntity] = useState<ApiEntity | undefined>(undefined);
  const isInitialLoad = useRef(true);
  const configApi = useApi(configApiRef);

  useEffect(() => {
    if (!selectedVersion && versions.length > 0) {
      let selVersion = null;
      if (isInitialLoad.current && queryVersion && versions.some(item => item.label === queryVersion)) {
        selVersion = versions.find(item => item.label === queryVersion)?.value;
        isInitialLoad.current = false;
      } else {
        selVersion = versions[0].value;
      }
      if (selVersion) {
        setSelectedVersion(selVersion);
      }
    }
  }, [versions, queryVersion, selectedVersion]);

  useEffect(() => {
    if (selectedVersion) {
      catalogApi.getEntityByRef(selectedVersion)
        .then(entity => setApiEntity(entity as ApiEntity));
    }
  }, [selectedVersion, catalogApi]);

  const generatedSubtitle = useMemo(() =>
    `${configApi.getOptionalString('organization.name') ?? 'Backstage'} API Explorer`,
    [configApi]
  );

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (loading) {
    return <Progress />
  }

  return (
    <Page
      themeId="apis">
      <Header
        title={`API - ${name}`}
        subtitle={generatedSubtitle}>
        <ComponentHeaderLabels entity={apiEntity ?? { metadata: { name, title: name } } as ApiEntity} />
      </Header>

      <Content>
        <Box mb={1}>
          <Select onChange={(selected) => {
            setSelectedVersion(selected.toString());
          }} label="Versions" items={versions} selected={selectedVersion} />
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
    </Page>
  );
};