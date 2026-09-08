import { useApi } from '@backstage/core-plugin-api';
import { AsyncEntityProvider } from '@backstage/plugin-catalog-react';
import { useEffect, useMemo, useState } from 'react';
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
  const defaultVersion =
    versions.find(version => version.label === queryVersion)?.id ??
    versions[0]?.id;
  const activeVersion =
    selectedVersion && versions.some(version => version.id === selectedVersion)
      ? selectedVersion
      : defaultVersion;

  useEffect(() => {
    if (activeVersion) {
      catalogApi
        .getEntityByRef(activeVersion)
        .then((entity: any) => setApiEntity(entity as ApiEntity));
    }
  }, [activeVersion, catalogApi]);

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
                value={activeVersion}
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
