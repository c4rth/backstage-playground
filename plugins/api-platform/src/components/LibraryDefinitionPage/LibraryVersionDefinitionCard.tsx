import {
  Content,
  Header,
  Page,
  TableColumn,
  Table,
  Link,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { AsyncEntityProvider, } from '@backstage/plugin-catalog-react';
import { useEffect, useMemo, useState } from 'react';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { ComponentEntity, Entity,  } from '@backstage/catalog-model';
import { useParams, useSearchParams } from 'react-router-dom';
import { ComponentHeaderLabels } from '../common/ComponentHeaderLabels';
import { Box, Flex } from '@backstage/ui';
import { ComponentDisplayName } from "../common";
import {
  ANNOTATION_IMAGE_VERSION,
  ANNOTATION_SERVICE_NAME,
  ANNOTATION_SERVICE_VERSION,
} from "@internal/plugin-api-platform-common";
import useAsync from 'react-use/esm/useAsync';
import { fetchServicesByLibrary } from './fetchServicesByLibrary';

type TableRow = {
  readonly id: number;
  readonly svcName: string;
  readonly svcVersion: string;
  readonly svcImageVersion: string;
  readonly svcEnvironment: string;
  readonly svcSystem: string;
};

const serviceColumns: TableColumn<TableRow>[] = [
  {
    title: 'Name',
    width: '50%',
    field: 'svcName',
    highlight: true,
    defaultSort: 'asc',
    render: ({ svcName, svcVersion, svcEnvironment, svcSystem }: TableRow) => (
      <Link to={`/api-platform/service/${svcSystem}/${svcName}?version=${svcVersion}&env=${svcEnvironment}`}>
        <ComponentDisplayName text={svcName} type='service' />
      </Link>
    ),
  },
  {
    title: 'Version',
    width: '10%',
    field: 'svcImageVersion',
    sorting: false,
  },
  {
    title: 'Environment',
    width: '10%',
    field: 'svcEnvironment',
  },
  {
    title: 'System',
    width: '10%',
    highlight: true,
    field: 'system',
    render: ({ svcSystem }: TableRow) => {
      if (svcSystem === "-") {
        return <ComponentDisplayName text={svcSystem} type="system" />;
      }
      return (
        <Link to={`/api-platform/system/${svcSystem}`} >
          <ComponentDisplayName text={svcSystem} type="system" />
        </Link >
      );
    },
  }
];


const tableOptions = {
  search: true,
  padding: 'dense' as const,
  paging: false,
  draggable: false,
  thirdSortClick: false,
} as const;

const toRow = (service: Entity, idx: number): TableRow => ({
  id: idx,
  svcName: service.metadata[ANNOTATION_SERVICE_NAME]?.toString() ?? '-',
  svcVersion: service.metadata[ANNOTATION_SERVICE_VERSION]?.toString() ?? '-',
  svcImageVersion: service.metadata[ANNOTATION_IMAGE_VERSION]?.toString() ?? '-',
  svcEnvironment: service.spec?.lifecycle?.toString().toUpperCase() ?? '-',
  svcSystem: service.spec?.system?.toString() ?? '-',
});

export const LibraryVersionDefinitionCard = () => {
  const { name } = useParams();
  const [searchParams] = useSearchParams();
  const queryVersion = searchParams.get('version');
  const queryEntityRef = searchParams.get('entityRef');

  const catalogApi = useApi(catalogApiRef);

  const [libraryEntity, setLibraryEntity] = useState<ComponentEntity | undefined>(undefined);


  useEffect(() => {
    if (queryEntityRef) {
      catalogApi.getEntityByRef(queryEntityRef)
        .then(entity => setLibraryEntity(entity as ComponentEntity));
    }
  }, [queryEntityRef, catalogApi]);


  const { value: allServices = [], loading: servicesLoading, error: servicesError } = useAsync(async () => {
    if (!name || !libraryEntity) return [];
    const serviceArrays = await fetchServicesByLibrary(catalogApi, libraryEntity!);
    return serviceArrays.flat();
  }, [libraryEntity, catalogApi]);

  const rows = useMemo(() => allServices.map(toRow), [allServices]);

  const tableTitle = useMemo(() => (
    <Flex align="center">
      Services ({rows.length})
    </Flex>
  ), [rows.length]);

  const loading = servicesLoading;
  const error = servicesError;

  if (error) {
    return <ResponseErrorPanel title='Error loading Services' error={error} />;
  }

  return (
    <AsyncEntityProvider loading={loading} error={error} entity={libraryEntity}>

      <Page
        themeId="libraries">
        <Header
          title={`${name} - v${queryVersion}`}
          type='Library'>
          <ComponentHeaderLabels entity={{ metadata: { name, title: name } } as ComponentEntity} />
        </Header>

        <Content>
          <Box mb='1'>
            <Table<TableRow>
              isLoading={loading}
              columns={serviceColumns}
              options={tableOptions}
              title={tableTitle}
              data={rows}
            />
          </Box>
        </Content>
      </Page>
    </AsyncEntityProvider>
  );
};