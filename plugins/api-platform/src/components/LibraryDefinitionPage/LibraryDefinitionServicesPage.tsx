import { Page, Header, Content } from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ComponentEntity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import {
  AsyncEntityProvider,
  catalogApiRef,
} from '@backstage/plugin-catalog-react';
import { apiPlatformBackendApiRef } from '../../api';
import { ComponentHeaderLabels } from '../common';
import { LibraryDefinitionAllServicesCard } from './LibraryDefinitionAllServicesCard';

export const LibraryDefinitionServicesPage = () => {
  const { system, name, version } = useParams();
  const resolvedVersion = version === 'services' ? undefined : version;
  const [libraryEntity, setLibraryEntity] = useState<
    ComponentEntity | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const catalogApi = useApi(catalogApiRef);
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);

  const headerTitle = resolvedVersion
    ? `${name} - ${resolvedVersion}`
    : `${name}`;

  useEffect(() => {
    if (!name || !system) return;

    const fetchLibraryEntity = async () => {
      setLoading(true);
      try {
        const libVersions = await apiPlatformApi.getLibraryVersions(
          system,
          name,
          true,
        );
        const libVersion = resolvedVersion
          ? libVersions.filter(lib => lib.version === resolvedVersion)
          : libVersions;
        if (libVersion?.[0]?.entityRef) {
          const entity = await catalogApi.getEntityByRef(
            libVersion[0].entityRef,
          );
          setLibraryEntity(entity as ComponentEntity);
        }
      } catch (err) {
        setError(err as Error);
        setLibraryEntity(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryEntity();
  }, [apiPlatformApi, catalogApi, system, name, resolvedVersion]);

  return (
    <AsyncEntityProvider loading={loading} error={error} entity={libraryEntity}>
      <Page themeId="libraries">
        <Header title={headerTitle} type="Library">
          <ComponentHeaderLabels
            entity={
              libraryEntity ??
              ({ metadata: { name, title: name } } as ComponentEntity)
            }
          />
        </Header>
        <Content>
          <LibraryDefinitionAllServicesCard
            system={system!}
            name={name!}
            version={resolvedVersion}
            componentName={libraryEntity?.metadata.name}
          />
        </Content>
      </Page>
    </AsyncEntityProvider>
  );
};
