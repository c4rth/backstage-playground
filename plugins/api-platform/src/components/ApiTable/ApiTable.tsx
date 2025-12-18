import {
  ResponseErrorPanel,
  Table,
  TableColumn,
  Link,
  OverflowTooltip,
  Progress,
} from '@backstage/core-components';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  ANNOTATION_API_NAME,
  ApiDefinitionsListRequest,
  OwnershipType,
} from '@internal/plugin-api-platform-common';
import { useApi } from '@backstage/core-plugin-api';
import { apiPlatformBackendApiRef } from '../../api';
import { useEffect, useState } from 'react';
import { Query } from '@material-table/core';
import { ApiPlatformBackendApi } from '../../api/ApiPlatformBackendApi';
import { ComponentDisplayName, ComponentOwnership } from '../common';
import { Box, Flex } from '@backstage/ui';

type TableRow = {
  id: number;
  name: string;
  description: string;
  system: string;
  entityRef: string;
};

const PAGE_SIZE = 20;
const STORAGE_OWNERSHIP_KEY = 'apisTablePageOwner';
const STORAGE_SEARCH_KEY = 'apisTablePageSearch';

const toEntityRow = (entity: Entity, idx: number): TableRow => ({
  id: idx,
  name: entity.metadata[ANNOTATION_API_NAME]?.toString() ?? '?',
  description: entity.metadata.description ?? '',
  system: entity.spec?.system?.toString() ?? '-',
  entityRef: stringifyEntityRef(entity),
});

const getData = async (
  apiPlatformApi: ApiPlatformBackendApi,
  query: Query<TableRow>,
  ownership: OwnershipType
) => {
  const page = query.page ?? 0;
  const pageSize = query.pageSize ?? PAGE_SIZE;
  const result = await apiPlatformApi.listApis({
    offset: page * pageSize,
    limit: pageSize,
    search: query.search,
    orderBy: query.orderBy
      ? {
          field: query.orderBy.field,
          direction: query.orderDirection,
        } as ApiDefinitionsListRequest['orderBy']
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

const COLUMNS: TableColumn<TableRow>[] = [
  {
    title: 'Name',
    width: '25%',
    field: 'name',
    defaultSort: 'asc',
    highlight: true,
    render: ({ system, name }: TableRow) => (
      <Link to={`/api-platform/api/${system}/${name}`}>
        <ComponentDisplayName text={name} type="api" />
      </Link>
    ),
  },
  {
    title: 'Description',
    field: 'description',
    width: '50%',
    render: ({ description }: TableRow) => <OverflowTooltip text={description} line={2} />,
  },
  {
    title: 'System',
    width: '10%',
    field: 'system',
    highlight: true,
    render: ({ system }: TableRow) =>
      system === '-' ? (
        <ComponentDisplayName text={system} type="system" />
      ) : (
        <Link to={`/api-platform/system/${system}`}>
          <ComponentDisplayName text={system} type="system" />
        </Link>
      ),
  },
];

export const ApiTable = () => {
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);
  const [countRows, setCountRows] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [ownership, setOwnership] = useState<OwnershipType>(
    () => (sessionStorage.getItem(STORAGE_OWNERSHIP_KEY) === 'owned' ? 'owned' : 'all')
  );

  const initialSearch = sessionStorage.getItem(STORAGE_SEARCH_KEY) || '';

  useEffect(() => {
    let isMounted = true;

    const fetchCount = async () => {
      setLoadingCount(true);
      setError(null);
      try {
        const count = await apiPlatformApi.getApisCount(ownership);
        if (isMounted) {
          setCountRows(count);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoadingCount(false);
        }
      }
    };

    fetchCount();

    return () => {
      isMounted = false;
    };
  }, [apiPlatformApi, ownership]);

  const fetchData = async (query: Query<TableRow>) => {
    if (query.search !== undefined) {
      sessionStorage.setItem(STORAGE_SEARCH_KEY, query.search);
    }
    return getData(apiPlatformApi, query, ownership);
  };

  if (loadingCount) return <Progress />;
  if (error) return <ResponseErrorPanel error={error} />;

  return (
    <Table<TableRow>
      isLoading={loadingCount}
      columns={COLUMNS}
      options={{
        search: true,
        padding: 'dense' as const,
        pageSize: PAGE_SIZE,
        pageSizeOptions: [10, PAGE_SIZE, 50],
        showEmptyDataSourceMessage: !loadingCount,
        draggable: false,
        thirdSortClick: false,
        searchText: initialSearch,
      }}
      title={
        <Flex gap="0" align="center">
          <Box mr="1" />
          {ownership === 'owned' ? 'Owned' : 'All'} APIs ({countRows})
          <Box ml="4" />
          <ComponentOwnership storageKey={STORAGE_OWNERSHIP_KEY} handleOwnershipChange={setOwnership} />
        </Flex>
      }
      data={fetchData}
    />
  );
};