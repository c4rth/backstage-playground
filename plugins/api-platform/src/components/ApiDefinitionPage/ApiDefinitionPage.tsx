import {
  Content,
  Header,
  Page,
  Select,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { AsyncEntityProvider } from '@backstage/plugin-catalog-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useGetApiVersions } from '../../hooks';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { ApiEntity } from '@backstage/catalog-model';
import { ApiDefinitionCard } from './ApiDefinitionCard';
import { useParams, useSearchParams } from 'react-router-dom';
import { ComponentHeaderLabels } from '../common';
import { API_NO_SYSTEM } from '@internal/plugin-api-platform-common';
import { Box } from '@backstage/ui';

export const ApiDefinitionPage = () => {
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

  return (
    <AsyncEntityProvider loading={loading} error={error} entity={apiEntity}>
      <Page
        themeId="apis">
        <Header
          title={name}
          type='API'>
          <ComponentHeaderLabels entity={apiEntity ?? { metadata: { name, title: name } } as ApiEntity} />
        </Header>

        <Content>
          <Box mb='1'>
            <Select onChange={(selected) => {
              setSelectedVersion(selected.toString());
            }} label="Versions" items={versions} selected={selectedVersion} />
          </Box>
          <Box mb='-3'>
            {apiEntity ?
              <ApiDefinitionCard />
              : <div />
            }
          </Box>
        </Content>
      </Page>
    </AsyncEntityProvider>
  );
};