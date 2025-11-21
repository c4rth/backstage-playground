import {
  ResponseErrorPanel,
  Table,
  TableColumn,
  Link,
  Progress,
} from '@backstage/core-components';
import {
  McaBaseType,
  McaBaseTypeListOptions,
} from '@internal/plugin-mca-common';
import { useApi } from '@backstage/core-plugin-api';
import { mcaComponentsBackendApiRef } from '../../api';
import { Query } from '@material-table/core';
import { McaComponentsBackendApi } from '../../api/McaComponentsBackendApi';
import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { Flex } from '@backstage/ui';

type TableRow = {
  id: number,
  baseType: string,
  packageName: string,
}

const columns: TableColumn<TableRow>[] = [
  {
    title: 'Name',
    width: '50%',
    field: 'baseType',
    defaultSort: 'asc',
    highlight: true,
    render: (row) => (
      <Link to={`/mca/basetypes/${row.baseType}`}>
        {row.baseType}
      </Link>
    ),
  },
  {
    title: 'Package',
    width: '50%',
    field: 'packageName',
  },
];

const PAGE_SIZE = 20;
const STORAGE_KEY = 'mcaBaseTypeTableSearch';

function toEntityRow(item: McaBaseType, idx: number) {
  return {
    id: idx,
    baseType: item.baseType,
    packageName: item.packageName,
  };
}

async function getData(mcaApi: McaComponentsBackendApi, query: Query<TableRow>) {
  const page = query.page || 0;
  const pageSize = query.pageSize || PAGE_SIZE;
  const result = await mcaApi.listMcaBaseTypes({
    offset: page * pageSize,
    limit: pageSize,
    search: query.search,
    orderBy: query?.orderBy &&
      ({
        field: query.orderBy.field,
        direction: query.orderDirection,
      } as McaBaseTypeListOptions['orderBy']),
  });
  if (result) {
    return {
      data: result.items.map(toEntityRow),
      totalCount: result.totalCount,
      page: Math.floor(result.offset / result.limit),
    };
  }
  return {
    data: [],
    totalCount: 0,
    page: 0,
  };
}

function getCount(mcaApi: McaComponentsBackendApi) {
  return mcaApi.getMcaBaseTypesCount();
}

export const McaBaseTypeTable = memo(() => {
  const mcaApi = useApi(mcaComponentsBackendApiRef);

  const [countRows, setCountRows] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const initialSearch = useMemo(() =>
    sessionStorage.getItem(STORAGE_KEY) || '',
    []
  );

  useEffect(() => {
    getCount(mcaApi)
      .then(count => {
        setCountRows(count);
        setLoadingCount(false);
      })
      .catch(err => {
        setError(err);
        setLoadingCount(false);
      });
  }, [mcaApi]);

  const dataFunction = useCallback(async (query: Query<TableRow>) => {
    // Persist search term
    if (query.search !== undefined) {
      sessionStorage.setItem(STORAGE_KEY, query.search);
    }
    return getData(mcaApi, query);
  }, [mcaApi]);

  const tableOptions = useMemo(() => ({
    paginationPosition: 'bottom' as const,
    search: true,
    padding: 'dense' as const,
    pageSize: PAGE_SIZE,
    pageSizeOptions: [10, PAGE_SIZE, 50],
    showEmptyDataSourceMessage: !loadingCount,
    draggable: false,
    thirdSortClick: false,
    searchText: initialSearch,
  }), [loadingCount, initialSearch]);
  const tableTitle = useMemo(() => (
    <Flex align="center">
      BaseTypes ({countRows})
    </Flex>
  ), [countRows]);


  if (loadingCount) return <Progress />;
  if (error) return <ResponseErrorPanel error={error} />;

  return (
    <Table<TableRow>
      columns={columns}
      options={tableOptions}
      title={tableTitle}
      data={dataFunction}
    />
  );
});