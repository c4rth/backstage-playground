import {
  Content,
  Header,
  Page,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { AsyncEntityProvider } from '@backstage/plugin-catalog-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useGetApiVersions } from '../../hooks';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { ComponentEntity } from '@backstage/catalog-model';
import { useParams, useSearchParams } from 'react-router-dom';
import { ComponentHeaderLabels } from '../common/ComponentHeaderLabels';
import { Box } from '@backstage/ui';

export const LibraryDefinitionPage = () => {
  const { system, name } = useParams();
  const [searchParams] = useSearchParams();
  const queryVersion = searchParams.get('version');

  const catalogApi = useApi(catalogApiRef);

  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(undefined);
  const [libraryEntity, setLibraryEntity] = useState<ComponentEntity | undefined>(undefined);
  const isInitialLoad = useRef(true);


  useEffect(() => {
    if (selectedVersion) {
      catalogApi.getEntityByRef(selectedVersion)
        .then(entity => setLibraryEntity(entity as ComponentEntity));
    }
  }, [selectedVersion, catalogApi]);

  return (
    <AsyncEntityProvider loading={false} entity={libraryEntity}>
      <Page
        themeId="libraries">
        <Header
          title={name}
          type='Library'>
          <ComponentHeaderLabels entity={libraryEntity ?? { metadata: { name, title: name } } as ComponentEntity} />
        </Header>

        <Content>
          <Box mb='1'>
            TO DO
          </Box>
        </Content>
      </Page>
    </AsyncEntityProvider>
  );
};