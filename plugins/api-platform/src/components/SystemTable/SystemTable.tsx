import {
  Link,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { EntityRefLinks } from '@backstage/plugin-catalog-react';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { Box, Flex, Text } from '@backstage/ui';
import { useState } from 'react';
import { ComponentDisplayName, ComponentOwnership } from '../common';
import { useApi } from '@backstage/core-plugin-api';
import {
  ApiPlatformBackendApi,
  apiPlatformBackendApiRef,
} from '../../api/ApiPlatformBackendApi';
import { Query } from '@material-table/core';
import {
  SystemDefinitionsListRequest,
  OwnershipType,
} from '@internal/plugin-api-platform-common';

type TableRow = {
  id: number;
  name: string;
  description: string;
  entityRef: string;
  owner: string;
};

const columns: TableColumn<TableRow>[] = [
  {
    title: 'Name',
    width: '25%',
    field: 'name',
    highlight: true,
    defaultSort: 'asc',
    render: ({ name }: TableRow) => (
      <Link to={name}>
        <ComponentDisplayName text={name} type="system" />
      </Link>
    ),
  },
  {
    title: 'Description',
    width: '50%',
    field: 'description',
    render: ({ description }: TableRow) => description || '-',
  },
  {
    title: 'Owner',
    width: '25%',
    field: 'owner',
    highlight: true,
    render: ({ owner }: TableRow) => (
      <EntityRefLinks entityRefs={[owner]} defaultKind="group" />
    ),
  },
];

const PAGE_SIZE = 20;
const STORAGE_OWNERSHIP_KEY = 'systemsTablePageOwner';
const STORAGE_SEARCH_KEY = 'systemsTablePageSearch';

const toEntityRow = (entity: Entity, idx: number): TableRow => ({
  id: idx,
  name: entity.metadata.name ?? '?',
  description: entity.metadata.description ?? '',
  entityRef: stringifyEntityRef(entity),
  owner: entity.spec?.owner?.toString() ?? '-',
});

const getData = async (
  apiPlatformApi: ApiPlatformBackendApi,
  ownership: OwnershipType,
  query: Query<TableRow>,
) => {
  const page = query.page ?? 0;
  const pageSize = query.pageSize ?? PAGE_SIZE;
  const result = await apiPlatformApi.listSystems({
    offset: page * pageSize,
    limit: pageSize,
    search: query.search,
    orderBy: query.orderBy
      ? ({
          field: query.orderBy.field,
          direction: query.orderDirection,
        } as SystemDefinitionsListRequest['orderBy'])
      : undefined,
    ownership,
  });

  return result
    ? {
        data: result.items.map(toEntityRow),
        totalCount: result.totalCount,
        page: Math.floor(result.offset / result.limit),
      }
    : {
        data: [],
        totalCount: 0,
        page: 0,
      };
};

export const SystemTable = () => {
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);
  const initialSearch = sessionStorage.getItem(STORAGE_SEARCH_KEY) ?? '';
  const [countRows, setCountRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [ownership, setOwnership] = useState<OwnershipType>(() =>
    sessionStorage.getItem(STORAGE_OWNERSHIP_KEY) === 'owned' ? 'owned' : 'all',
  );

  const fetchData = async (query: Query<TableRow>) => {
    setLoading(true);
    if (query.search !== undefined) {
      sessionStorage.setItem(STORAGE_SEARCH_KEY, query.search);
    }
    try {
      const result = await getData(apiPlatformApi, ownership, query);
      setCountRows(result.totalCount);
      setError(null);
      return result;
    } catch (e) {
      setError(e as Error);
      setCountRows(0);
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
          <Box>
            <Text variant="title-small" weight="bold">
              {ownership === 'owned' ? 'Owned' : 'All'} Systems ({countRows})
            </Text>
          </Box>
          <Box ml="4">
            <ComponentOwnership
              storageKey={STORAGE_OWNERSHIP_KEY}
              handleOwnershipChange={setOwnership}
            />
          </Box>
        </Flex>
      }
      data={fetchData}
    />
  );
};
