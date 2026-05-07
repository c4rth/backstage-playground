import {
  ResponseErrorPanel,
  Table,
  TableColumn,
  Link,
} from '@backstage/core-components';
import {
  McaComponent,
  McaComponentListOptions,
  McaComponentType,
  McaVersions,
} from '@internal/plugin-mca-common';
import { useApi } from '@backstage/core-plugin-api';
import { mcaComponentsBackendApiRef, McaComponentsBackendApi } from '../../api';
import { Query } from '@material-table/core';
import { memo, useEffect, useState } from 'react';
import { Flex } from '@backstage/ui';

type TableRow = {
  id: number;
  component: string;
  prdVersion: string;
  p1Version: string;
  p2Version: string;
  p3Version: string;
  p4Version: string;
  applicationCode: string;
  packageName: string;
};

function getColumns(versions?: McaVersions): TableColumn<TableRow>[] {
  const columns: TableColumn<TableRow>[] = [
    {
      title: 'Name',
      width: '45%',
      field: 'component',
      defaultSort: 'asc',
      highlight: true,
      render: row => <Link to={row.component}>{row.component}</Link>,
    },
    {
      title: 'Baseline',
      width: '5%',
      field: 'prdVersion',
      highlight: true,
      render: row => (
        <Link to={`${row.component}?version=${row.prdVersion}`}>
          {row.prdVersion}
        </Link>
      ),
    },
  ];
  if (versions?.p1Version) {
    columns.push({
      title: versions?.p1Version,
      width: '5%',
      field: 'p1Version',
      highlight: true,
      render: row =>
        row.p1Version ? (
          <Link to={`${row.component}?version=${row.p1Version}`}>
            {row.p1Version}
          </Link>
        ) : null,
    });
  }
  if (versions?.p2Version) {
    columns.push({
      title: versions?.p2Version,
      width: '5%',
      field: 'p2Version',
      highlight: true,
      render: row =>
        row.p2Version ? (
          <Link to={`${row.component}?version=${row.p2Version}`}>
            {row.p2Version}
          </Link>
        ) : null,
    });
  }
  if (versions?.p3Version) {
    columns.push({
      title: versions.p3Version,
      width: '5%',
      field: 'p3Version',
      highlight: true,
      render: row =>
        row.p3Version ? (
          <Flex align="center">
            <Link to={`${row.component}?version=${row.p3Version}`}>
              {row.p3Version}
            </Link>
          </Flex>
        ) : null,
    });
  }
  if (versions?.p4Version) {
    columns.push({
      title: versions.p4Version,
      width: '5%',
      field: 'p4Version',
      highlight: true,
      render: row =>
        row.p4Version ? (
          <Link to={`${row.component}?version=${row.p4Version}`}>
            {row.p4Version}
          </Link>
        ) : null,
    });
  }
  columns.push(
    {
      title: 'Package',
      width: '20%',
      field: 'packageName',
    },
    {
      title: 'System',
      width: '10%',
      field: 'applicationCode',
    },
  );
  return columns;
}

const PAGE_SIZE = 20;
const STORAGE_KEY = 'mcaComponentTableSearch';

const toEntityRow = (mca: McaComponent, idx: number): TableRow => ({
  id: idx,
  component: mca.component,
  prdVersion: mca.prdVersion,
  p1Version: mca.p1Version,
  p2Version: mca.p2Version,
  p3Version: mca.p3Version,
  p4Version: mca.p4Version,
  applicationCode: mca.applicationCode,
  packageName: mca.packageName,
});

async function getData(
  mcaApi: McaComponentsBackendApi,
  query: Query<TableRow>,
  type: McaComponentType,
) {
  const page = query.page || 0;
  const pageSize = query.pageSize || PAGE_SIZE;
  const result = await mcaApi.listMcaComponents({
    offset: page * pageSize,
    limit: pageSize,
    search: query.search,
    orderBy: query?.orderBy
      ? ({
          field: query.orderBy.field,
          direction: query.orderDirection,
        } as McaComponentListOptions['orderBy'])
      : undefined,
    type: type,
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

function getTitle(type: McaComponentType) {
  if (type === 'operation') return 'Operations';
  if (type === 'element') return 'Elements';
  if (type === 'all') return 'All components';
  return 'Unknown type';
}

type McaComponentTableProps = {
  type: McaComponentType;
};

export const McaComponentTable = memo<McaComponentTableProps>(({ type }) => {
  const mcaApi = useApi(mcaComponentsBackendApiRef);
  const [mcaVersions, setMcaVersions] = useState<McaVersions>();
  const [countRows, setCountRows] = useState<number>(0);
  const [loadingVersions, setLoadingVersions] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const initialSearch = sessionStorage.getItem(STORAGE_KEY) || '';
  const columns = getColumns(mcaVersions);
  const tableOptions = {
    paginationPosition: 'bottom' as const,
    search: true,
    padding: 'dense' as const,
    pageSize: PAGE_SIZE,
    pageSizeOptions: [10, PAGE_SIZE, 50],
    showEmptyDataSourceMessage: !loadingVersions,
    draggable: false,
    thirdSortClick: false,
    searchText: initialSearch,
  };
  const tableTitle = (
    <Flex align="center">
      {getTitle(type)} ({countRows})
    </Flex>
  );

  const dataFetcher = async (query: Query<TableRow>) => {
    setLoadingVersions(true);
    if (query.search !== undefined) {
      sessionStorage.setItem(STORAGE_KEY, query.search);
    }
    const result = await getData(mcaApi, query, type);
    setCountRows(result.totalCount);
    setLoadingVersions(false);
    return result;
  };

  useEffect(() => {
    mcaApi
      .getMcaVersions()
      .then(versions => setMcaVersions(versions))
      .catch(setError)
      .finally(() => setLoadingVersions(false));
  }, [mcaApi]);

  if (error) return <ResponseErrorPanel error={error} />;

  return (
    <Table<TableRow>
      key={type}
      columns={columns}
      options={tableOptions}
      title={tableTitle}
      data={dataFetcher}
    />
  );
});
