import {
  Link,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { ComponentChip } from '../common';
import { OwnershipType, ServiceDefinition, ServiceDefinitionsListRequest, ServiceEnvironmentDefinitions, ServiceVersionDefinition } from '@internal/plugin-api-platform-common';
import { useState } from 'react';
import { ComponentDisplayName, ComponentOwnership } from '../common';
import { useApi } from '@backstage/core-plugin-api';
import { ApiPlatformBackendApi, apiPlatformBackendApiRef } from '../../api/ApiPlatformBackendApi';
import { Box, Flex, Text } from '@backstage/ui';
import { ListBox, ListBoxItem } from 'react-aria-components';
import { Query } from '@material-table/core';

type TableRow = {
  id: number;
  name: string;
  system: string;
  serviceDefinition: ServiceDefinition;
  imageVersions: string[][];
};

const PAGE_SIZE = 20;
const STORAGE_OWNERSHIP_KEY = 'servicesTablePageOwner';
const STORAGE_SEARCH_KEY = 'servicesTablePageSearch';

const LIST_ITEM_STYLE = {
  margin: 2,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '2.5rem',
};

const EMPTY_STATE_STYLE = { pointerEvents: 'none' as const };

const toRow = (serviceDefinition: ServiceDefinition, idx: number): TableRow => ({
  id: idx,
  name: serviceDefinition.name,
  system: serviceDefinition.system,
  serviceDefinition,
  imageVersions: serviceDefinition.versions.map(version => {
    const envs: ServiceEnvironmentDefinitions = version.environments;
    const versions: string[] = [];
    if (envs.prd) { versions.push(envs.prd.imageVersion); } else { versions.push(''); }
    if (envs.ptp) { versions.push(envs.ptp.imageVersion); } else { versions.push(''); }
    if (envs.uat) { versions.push(envs.uat.imageVersion); } else { versions.push(''); }
    if (envs.gtu) { versions.push(envs.gtu.imageVersion); } else { versions.push(''); }
    if (envs.tst) { versions.push(envs.tst.imageVersion); } else { versions.push(''); }
    return versions;
  }),
});

const renderVersionList = (serviceDefinition: ServiceDefinition, renderItem: (version: any, idx: number) => JSX.Element) => (
  <ListBox aria-label='Services versions'>
    {serviceDefinition.versions?.map((version, idx) => (
      <ListBoxItem key={`${serviceDefinition.name}-${version.version}-${idx}`} style={LIST_ITEM_STYLE} aria-label={`${serviceDefinition.name} version ${version.version}`}>
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
  render: ({ serviceDefinition, imageVersions }) =>
    renderVersionList(serviceDefinition, (version: ServiceVersionDefinition, idx) => {
      const envData = version.environments[env as keyof typeof version.environments];
      if (!envData) {
        return (
          <div style={EMPTY_STATE_STYLE}>
            <Text variant="body-medium">-</Text>
          </div>
        );
      }     
      const index = imageVersions[idx].indexOf(envData.imageVersion);
      return (
        <ComponentChip
          index={index}
          service={envData}
          link={`/api-platform/service/${serviceDefinition.system}/${serviceDefinition.serviceName}?version=${version.version}&env=${env}`}
        />
      );
    }),
});

const COLUMNS: TableColumn<TableRow>[] = [
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
  {
    title: 'Version',
    width: '5%',
    field: 'version',
    sorting: false,
    align: 'center',
    cellStyle: { padding: 0 },
    render: ({ serviceDefinition }) =>
      renderVersionList(serviceDefinition, (version, idx) => (
        <ComponentChip
          index={idx}
          backgroundColor="#C30045"
          text={version.version}
          link={`/api-platform/service/${serviceDefinition.system}/${serviceDefinition.serviceName}?version=${version.version}`}
        />
      )),
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

const getData = async (
  apiPlatformApi: ApiPlatformBackendApi,
  query: Query<TableRow>,
  ownership: OwnershipType
) => {
  const page = query.page ?? 0;
  const pageSize = query.pageSize ?? PAGE_SIZE;

  const result = await apiPlatformApi.listServices({
    offset: page * pageSize,
    limit: pageSize,
    search: query.search,
    orderBy: query.orderBy
      ? {
        field: query.orderBy.field,
        direction: query.orderDirection,
      } as ServiceDefinitionsListRequest['orderBy']
      : undefined,
    ownership,
  });

  return result
    ? {
      data: result.items.map(toRow),
      totalCount: result.totalCount,
      page: Math.floor(result.offset / result.limit),
    }
    : {
      data: [],
      totalCount: 0,
      page: 0,
    };
};

export const ServiceTable = () => {
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);
  const [countRows, setCountRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [ownership, setOwnership] = useState<OwnershipType>(
    () => (sessionStorage.getItem(STORAGE_OWNERSHIP_KEY) === 'owned' ? 'owned' : 'all')
  );

  const initialSearch = sessionStorage.getItem(STORAGE_SEARCH_KEY) ?? '';

  const fetchData = async (query: Query<TableRow>) => {
    setLoading(true);
    setError(null);
    if (query.search !== undefined) {
      sessionStorage.setItem(STORAGE_SEARCH_KEY, query.search);
    }
    try {
      const result = await getData(apiPlatformApi, query, ownership);
      setCountRows(result.totalCount);
      return result;
    } catch (e) {
      setError(e as Error);
      return {
        data: [],
        totalCount: 0,
        page: 0,
      };
    } finally {
      setLoading(false);
    }
  };

  if (error) return <ResponseErrorPanel error={error} />;

  return (
    <Table<TableRow>
      key={ownership}
      columns={COLUMNS}
      options={{
        search: true,
        padding: 'dense' as const,
        pageSize: PAGE_SIZE,
        pageSizeOptions: [10, PAGE_SIZE, 50],
        showEmptyDataSourceMessage: countRows === 0 && !loading,
        draggable: false,
        thirdSortClick: false,
        searchText: initialSearch,
      }}
      title={
        <Flex gap="0" align="center">
          <Box mr="1" />
          {ownership === 'owned' ? 'Owned' : 'All'} Services ({countRows})
          <Box ml="4" />
          <ComponentOwnership storageKey={STORAGE_OWNERSHIP_KEY} handleOwnershipChange={setOwnership} />
        </Flex>
      }
      data={fetchData}
    />
  );
};