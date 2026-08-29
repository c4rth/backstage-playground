import { useApi } from '@backstage/core-plugin-api';
import { AsyncEntityProvider } from '@backstage/plugin-catalog-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useGetApiVersions } from '../../hooks';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { ApiEntity } from '@backstage/catalog-model';
import { ApiDefinitionCard } from './ApiDefinitionCard';
import { useSearchParams } from 'react-router-dom';
import { API_NO_SYSTEM } from '@internal/plugin-api-platform-common';
import { Container, Header, PluginHeader, Select } from '@backstage/ui';
import { RiPuzzleFill } from '@remixicon/react';
import { useRouteRefParams } from '@backstage/frontend-plugin-api';
import { apiPlatformApiDefinitionRouteRef } from '../../routes';

export const ApiDefinitionPage = () => {
  const { system, name } = useRouteRefParams(apiPlatformApiDefinitionRouteRef);
  const [searchParams] = useSearchParams();
  const queryVersion = searchParams.get('version');

  const { apiVersions, loading, error } = useGetApiVersions(
    system ?? API_NO_SYSTEM,
    name!,
  );
  const catalogApi = useApi(catalogApiRef);

  const versions = useMemo(
    () =>
      apiVersions?.map(apiVersion => ({
        label: apiVersion.version,
        id: apiVersion.entityRef,
      })) ?? [],
    [apiVersions],
  );
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(
    undefined,
  );
  const [apiEntity, setApiEntity] = useState<ApiEntity | undefined>(undefined);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!selectedVersion && versions.length > 0) {
      let selVersion = null;
      if (
        isInitialLoad.current &&
        queryVersion &&
        versions.some(item => item.label === queryVersion)
      ) {
        selVersion = versions.find(item => item.label === queryVersion)?.id;
        isInitialLoad.current = false;
      } else {
        selVersion = versions[0].id;
      }
      if (selVersion) {
        setSelectedVersion(selVersion);
      }
    }
  }, [versions, queryVersion, selectedVersion]);

  useEffect(() => {
    if (selectedVersion) {
      catalogApi
        .getEntityByRef(selectedVersion)
        .then(entity => setApiEntity(entity as ApiEntity));
    }
  }, [selectedVersion, catalogApi]);

  return (
    <AsyncEntityProvider loading={loading} error={error} entity={apiEntity}>
      <PluginHeader
        icon={<RiPuzzleFill fontSize="inherit" />}
        breadcrumbs={[{ label: 'APIs', href: '/api-platform/api' }]}
      />
      <Header
        title={name}
        metadata={[
          {
            label: 'Versions',
            value: (
              <Select
                onChange={selected => {
                  setSelectedVersion(
                    selected ? selected.toString() : undefined,
                  );
                }}
                options={versions}
                value={selectedVersion}
                style={{ minWidth: '200px' }}
                aria-label="Versions"
              />
            ),
          },
        ]}
      />
      <Container>{apiEntity ? <ApiDefinitionCard /> : <div />}</Container>
    </AsyncEntityProvider>
  );
};
