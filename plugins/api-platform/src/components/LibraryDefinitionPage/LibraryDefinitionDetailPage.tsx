import { useEffect, useState } from 'react';
import { ComponentEntity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import {
  AsyncEntityProvider,
  catalogApiRef,
} from '@backstage/plugin-catalog-react';
import { apiPlatformBackendApiRef } from '../../plugin';
import { LibraryDefinitionAllServicesCard } from './LibraryDefinitionAllServicesCard';
import { Container, PluginHeader, Header } from '@backstage/ui';
import { RiBookShelfLine } from '@remixicon/react';

interface LibraryDefinitionDetailPageProps {
  system: string;
  name: string;
  version: string;
}

export const LibraryDefinitionDetailPage = ({
  system,
  name,
  version,
}: LibraryDefinitionDetailPageProps) => {
  const [libraryEntity, setLibraryEntity] = useState<
    ComponentEntity | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const catalogApi = useApi(catalogApiRef);
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);

  const headerTitle = `${name} - ${version}`;

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
        const libVersion = libVersions.filter(lib => lib.version === version);
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
  }, [apiPlatformApi, catalogApi, system, name, version]);

  return (
    <AsyncEntityProvider loading={loading} error={error} entity={libraryEntity}>
      <PluginHeader
        icon={<RiBookShelfLine fontSize="inherit" />}
        breadcrumbs={[
          { label: 'Libraries', href: '/api-platform/library' },
        ]}
      />
      <Header
        title={headerTitle} />
      <Container>
        <LibraryDefinitionAllServicesCard
          system={system!}
          name={name!}
          version={version!}
          componentName={libraryEntity?.metadata.name}
        />
      </Container>
    </AsyncEntityProvider>
  );
};
