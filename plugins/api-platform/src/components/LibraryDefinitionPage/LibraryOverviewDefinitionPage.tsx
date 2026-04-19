import {
  Page,
  Header,
  Content,
  TabbedLayout,
} from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import { LibraryVersionsCard } from './LibraryVersionsCard';
import { LibraryServicesCard } from './LibraryServicesCard';
import { useEffect, useState } from 'react';
import { ComponentEntity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import {
  AsyncEntityProvider,
  catalogApiRef,
} from '@backstage/plugin-catalog-react';
import { apiPlatformBackendApiRef } from '../../api';
import { ComponentHeaderLabels } from '../common';

export const LibraryOverviewDefinitionPage = () => {
  const { system, name } = useParams();
  const [libraryEntity, setLibraryEntity] = useState<
    ComponentEntity | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const catalogApi = useApi(catalogApiRef);
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);

  useEffect(() => {
    if (!name || !system) return;

    const fetchLibraryEntity = async () => {
      try {
        const libVersions = await apiPlatformApi.getLibraryVersions(
          system,
          name,
          true,
        );
        const lastVersion = libVersions[0];
        if (lastVersion?.entityRef) {
          const entity = await catalogApi.getEntityByRef(lastVersion.entityRef);
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
  }, [apiPlatformApi, catalogApi, system, name]);

  return (
    <AsyncEntityProvider loading={loading} error={error} entity={libraryEntity}>
      <Page themeId="libraries">
        <Header title={name} type="Library">
          <ComponentHeaderLabels
            entity={
              libraryEntity ??
              ({ metadata: { name, title: name } } as ComponentEntity)
            }
          />
        </Header>
        <Content>
          <TabbedLayout>
            <TabbedLayout.Route path="/" title="By versions">
              <LibraryVersionsCard system={system!} name={name!} />
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/services" title="By services">
              <LibraryServicesCard system={system!} name={name!} />
            </TabbedLayout.Route>
          </TabbedLayout>
        </Content>
      </Page>
    </AsyncEntityProvider>
  );
};
