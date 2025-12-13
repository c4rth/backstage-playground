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
import { ComponentEntity, } from '@backstage/catalog-model';
import { useParams, useSearchParams } from 'react-router-dom';
import { ComponentHeaderLabels } from '../common/ComponentHeaderLabels';
import { Box, Flex, Text } from '@backstage/ui';
import { ComponentDisplayName } from "../common";
import {
  ServiceDefinition,
} from "@internal/plugin-api-platform-common";
import useAsync from 'react-use/esm/useAsync';
import { fetchAllServicesByLibraryVersion } from './fetchServicesByLibrary';
import { ListBox, ListBoxItem } from 'react-aria-components';
import { apiPlatformBackendApiRef } from '../../api';

type TableRow = {
  id: number;
  name: string;
  system: string;
  serviceDefinition: ServiceDefinition;
};

const renderVersionList = (serviceDefinition: ServiceDefinition, renderItem: (version: any, idx: number) => JSX.Element) => (
  <ListBox>
    {serviceDefinition.versions?.map((version, idx) => (
      <ListBoxItem
        key={`${serviceDefinition.name}-${version.version}-${idx}`}
        style={{ margin: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '2.5rem' }}
      >
        {renderItem(version, idx)}
      </ListBoxItem>
    ))}
  </ListBox>
);

const createEnvironmentColumn = (env: string): TableColumn<TableRow> => ({
  title: env.toUpperCase(),
  width: '12%',
  align: 'center',
  cellStyle: { padding: 0 },
  sorting: false,
  searchable: true,
  customFilterAndSearch: (query, row) => {
    if (!row.serviceDefinition?.versions) return false;
    const lowerQuery = query.toLowerCase();
    return row.serviceDefinition.versions.some(version => {
      const envData = version.environments[env as keyof typeof version.environments];
      return envData?.imageVersion.toLowerCase().includes(lowerQuery);
    });
  },
  render: ({ serviceDefinition }) =>
    renderVersionList(serviceDefinition, (version) => (
      <Text variant="body-medium">
        {version.environments[env as keyof typeof version.environments]?.imageVersion ?? '-'}
      </Text>
    )),
});

const serviceColumns: TableColumn<TableRow>[] = [
  {
    title: 'Name',
    width: '25%',
    field: 'name',
    highlight: true,
    defaultSort: 'asc',
    render: ({ serviceDefinition }) => (
      <Link to={`/api-platform/service/${serviceDefinition.system}/${serviceDefinition.serviceName}`}>
        <ComponentDisplayName text={serviceDefinition.serviceName} type="service" />
      </Link>
    ),
  },
  createEnvironmentColumn('tst'),
  createEnvironmentColumn('gtu'),
  createEnvironmentColumn('uat'),
  createEnvironmentColumn('ptp'),
  createEnvironmentColumn('prd'),
  {
    title: 'System',
    width: '10%',
    highlight: true,
    field: 'system',
    render: ({ serviceDefinition }) => (
      <Link to={`/api-platform/system/${serviceDefinition.system}`}>
        <ComponentDisplayName text={serviceDefinition.system} type="system" />
      </Link>
    ),
  },
];

const tableOptions = {
  search: true,
  padding: 'dense' as const,
  paging: false,
  draggable: false,
  thirdSortClick: false,
} as const;

const toRow = (serviceDefinition: ServiceDefinition, idx: number): TableRow => ({
  id: idx,
  name: serviceDefinition.name,
  system: serviceDefinition.system,
  serviceDefinition,
});

export const LibraryVersionDefinitionPage = () => {
  const { system, name } = useParams();
  const [searchParams] = useSearchParams();
  const queryVersion = searchParams.get('version');

  const catalogApi = useApi(catalogApiRef);
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);

  const [libraryEntity, setLibraryEntity] = useState<ComponentEntity | undefined>(undefined);
  const [libEntityRef, setLibEntityRef] = useState<string | null>(null);

  useEffect(() => {
    if (!name || !queryVersion) return;
    
    const fetchLibraryEntity = async () => {
      try {
        const libVersions = await apiPlatformApi.getLibraryVersions(system!, name!);
        const matchedVersion = libVersions.find(lv => lv.version === queryVersion);
        
        if (matchedVersion?.entityRef) {
          setLibEntityRef(matchedVersion.entityRef);
          const entity = await catalogApi.getEntityByRef(matchedVersion.entityRef);
          setLibraryEntity(entity as ComponentEntity);
        }
      } catch (error) {
        setLibEntityRef(null);
        setLibraryEntity(undefined);
      }
    };
    
    fetchLibraryEntity();
  }, [apiPlatformApi, catalogApi, system, name, queryVersion]);

  const { value: allServices = [], loading, error } = useAsync(async () => {
    if (!name || !libraryEntity || !libEntityRef) return [];
    const libVersionRef = libEntityRef.replace(/^component:/, '').replace(/^default\//, '');

    const result = await fetchAllServicesByLibraryVersion(apiPlatformApi, libVersionRef);

    return result.items;
  }, [libraryEntity, apiPlatformApi, libEntityRef]);

  const rows = useMemo(() => allServices.map(toRow), [allServices]);

  const tableTitle = useMemo(() => (
    <Flex align="center">
      Services ({rows.length})
    </Flex>
  ), [rows.length]);

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
          <ComponentHeaderLabels entity={libraryEntity ?? { metadata: { name, title: name } } as ComponentEntity} />
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