import {
  Link,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { ComponentChip } from '../common';
import {
  OwnershipType,
  ServiceDefinition,
  ServiceDefinitionsListRequest,
  ServiceVersionDefinition,
} from '@internal/plugin-api-platform-common';
import { useState } from 'react';
import { ComponentDisplayName, ComponentOwnership } from '../common';
import { useApi } from '@backstage/core-plugin-api';
import {
  ApiPlatformBackendApi,
  apiPlatformBackendApiRef,
} from '../../api/ApiPlatformBackendApi';
import { Box, Flex } from '@backstage/ui';
import { ListBox, ListBoxItem } from 'react-aria-components';
import { Query } from '@material-table/core';

export type BaseTableRow = {
  id: number;
  name: string;
  system: string;
  serviceDefinition: ServiceDefinition;
};

const PAGE_SIZE = 20;

export const LIST_ITEM_STYLE = {
  margin: 2,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '2.5rem',
};

export const renderVersionList = (
  serviceDefinition: ServiceDefinition,
  renderItem: (version: ServiceVersionDefinition, idx: number) => JSX.Element,
) => (
  <ListBox aria-label="Services versions">
    {serviceDefinition.versions?.map((version, idx) => (
      <ListBoxItem
        key={`${serviceDefinition.name}-${version.version}-${idx}`}
        style={LIST_ITEM_STYLE}
        aria-label={`${serviceDefinition.name} version ${version.version}`}
      >
        {renderItem(version, idx)}
      </ListBoxItem>
    ))}
  </ListBox>
);

const createNameColumn = <T extends BaseTableRow>(): TableColumn<T> => ({
  title: 'Name',
  width: '25%',
  field: 'name',
  highlight: true,
  defaultSort: 'asc',
  render: ({ serviceDefinition }) => (
    <Link
      to={`/api-platform/service/${serviceDefinition.system}/${serviceDefinition.serviceName}`}
    >
      <ComponentDisplayName
        text={serviceDefinition.serviceName}
        type="service"
      />
    </Link>
  ),
});

const createVersionColumn = <T extends BaseTableRow>(): TableColumn<T> => ({
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
});

const createSystemColumn = <T extends BaseTableRow>(): TableColumn<T> => ({
  title: 'System',
  width: '10%',
  highlight: true,
  field: 'system',
  render: ({ serviceDefinition }) => (
    <Link to={`/api-platform/system/${serviceDefinition.system}`}>
      <ComponentDisplayName text={serviceDefinition.system} type="system" />
    </Link>
  ),
});

export function buildColumns<T extends BaseTableRow>(
  environmentColumns: TableColumn<T>[],
): TableColumn<T>[] {
  return [
    createNameColumn<T>(),
    createVersionColumn<T>(),
    ...environmentColumns,
    createSystemColumn<T>(),
  ];
}

type BaseServiceTableProps<T extends BaseTableRow> = {
  columns: TableColumn<T>[];
  toRow: (serviceDefinition: ServiceDefinition, idx: number) => T;
  titleLabel: string;
  storageOwnershipKey: string;
  storageSearchKey: string;
};

const getData = async <T extends BaseTableRow>(
  apiPlatformApi: ApiPlatformBackendApi,
  query: Query<T>,
  ownership: OwnershipType,
  toRow: (serviceDefinition: ServiceDefinition, idx: number) => T,
) => {
  const page = query.page ?? 0;
  const pageSize = query.pageSize ?? PAGE_SIZE;

  const result = await apiPlatformApi.listServices({
    offset: page * pageSize,
    limit: pageSize,
    search: query.search,
    orderBy: query.orderBy
      ? ({
          field: query.orderBy.field,
          direction: query.orderDirection,
        } as ServiceDefinitionsListRequest['orderBy'])
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

export function BaseServiceTable<T extends BaseTableRow>({
  columns,
  toRow,
  titleLabel,
  storageOwnershipKey,
  storageSearchKey,
}: BaseServiceTableProps<T>) {
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);
  const [countRows, setCountRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [ownership, setOwnership] = useState<OwnershipType>(() =>
    sessionStorage.getItem(storageOwnershipKey) === 'owned' ? 'owned' : 'all',
  );

  const initialSearch = sessionStorage.getItem(storageSearchKey) ?? '';

  const fetchData = async (query: Query<T>) => {
    setLoading(true);
    setError(null);
    if (query.search !== undefined) {
      sessionStorage.setItem(storageSearchKey, query.search);
    }
    try {
      const result = await getData(apiPlatformApi, query, ownership, toRow);
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
    <Table<T>
      key={ownership}
      columns={columns}
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
          <Box ml="1">
            <b>
              {ownership === 'owned' ? 'Owned' : 'All'} {titleLabel} (
              {countRows})
            </b>
          </Box>
          <Box ml="4">
            <ComponentOwnership
              storageKey={storageOwnershipKey}
              handleOwnershipChange={setOwnership}
            />
          </Box>
        </Flex>
      }
      data={fetchData}
    />
  );
}
