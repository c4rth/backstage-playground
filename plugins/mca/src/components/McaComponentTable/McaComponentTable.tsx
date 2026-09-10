import { ResponseErrorPanel } from '@backstage/core-components';
import {
  McaComponent,
  McaComponentListOptions,
  McaComponentType,
  McaVersions,
} from '@internal/plugin-mca-common';
import { useApi } from '@backstage/core-plugin-api';
import { mcaComponentsBackendApiRef, McaComponentsBackendApi } from '../../api';
import { memo, useEffect, useState, useRef } from 'react';
import {
  Link,
  useTable,
  SortDescriptor,
  Table,
  Container,
  Header,
  SearchField,
  ColumnConfig,
  CellText,
  Cell,
  Card,
  CardHeader,
  CardBody,
} from '@backstage/ui';

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

function getColumns(versions?: McaVersions): ColumnConfig<TableRow>[] {
  const columns: ColumnConfig<TableRow>[] = [
    {
      id: 'component',
      label: 'Name',
      width: '40%',
      isRowHeader: true,
      isSortable: true,
      cell: row => (
        <Cell>
          <Link href={row.component} weight="bold" color="info" standalone>
            {row.component}
          </Link>
        </Cell>
      ),
    },
    {
      id: 'prdVersion',
      label: 'Baseline',
      width: '6%',
      isSortable: true,
      cell: row => (
        <Cell>
          <Link
            href={`${row.component}?version=${row.prdVersion}`}
            weight="bold"
            color="info"
            standalone
          >
            {row.prdVersion}
          </Link>
        </Cell>
      ),
    },
    {
      id: 'p1Version',
      label: versions?.p1Version || '',
      width: '6%',
      isSortable: true,
      cell: row =>
        row.p1Version ? (
          <Cell>
            <Link
              href={`${row.component}?version=${row.p1Version}`}
              weight="bold"
              color="info"
              standalone
            >
              {row.p1Version}
            </Link>
          </Cell>
        ) : (
          <Cell />
        ),
    },
    {
      id: 'p2Version',
      label: versions?.p2Version || '',
      width: '6%',
      isSortable: true,
      cell: row =>
        row.p2Version ? (
          <Cell>
            <Link
              href={`${row.component}?version=${row.p2Version}`}
              weight="bold"
              color="info"
              standalone
            >
              {row.p2Version}
            </Link>
          </Cell>
        ) : (
          <Cell />
        ),
    },
    {
      id: 'p3Version',
      label: versions?.p3Version || '',
      width: '6%',
      isSortable: true,
      cell: row =>
        row.p3Version ? (
          <Cell>
            <Link
              href={`${row.component}?version=${row.p3Version}`}
              weight="bold"
              color="info"
              standalone
            >
              {row.p3Version}
            </Link>
          </Cell>
        ) : (
          <Cell />
        ),
    },
    {
      id: 'p4Version',
      label: versions?.p4Version || '',
      width: '6%',
      isSortable: true,
      cell: row =>
        row.p4Version ? (
          <Cell>
            <Link
              href={`${row.component}?version=${row.p4Version}`}
              weight="bold"
              color="info"
              standalone
            >
              {row.p4Version}
            </Link>
          </Cell>
        ) : (
          <Cell />
        ),
    },
    {
      id: 'packageName',
      label: 'Package',
      width: '20%',
      cell: row => <CellText title={row.packageName} />,
    },
    {
      label: 'System',
      width: '10%',
      id: 'applicationCode',
      cell: row => <CellText title={row.applicationCode} />,
    },
  ];
  return columns;
}

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
  type: McaComponentType,
  offset: number,
  pageSize: number,
  sort: SortDescriptor | null,
  search?: string,
) {
  const result = await mcaApi.listMcaComponents({
    offset,
    limit: pageSize,
    search,
    orderBy: sort
      ? ({
          field: sort.column.toString(),
          direction: sort.direction,
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
  const [error, setError] = useState<Error | null>(null);
  const isFirstRender = useRef(true);

  const initialSearch = sessionStorage.getItem(STORAGE_KEY) || '';
  const columns = getColumns(mcaVersions);

  useEffect(() => {
    mcaApi
      .getMcaVersions()
      .then(versions => setMcaVersions(versions))
      .catch(setError);
  }, [mcaApi]);

  const fetchData = async ({
    offset,
    pageSize,
    sort,
    search,
  }: {
    offset: number;
    pageSize: number;
    sort: SortDescriptor | null;
    search?: string;
  }) => {
    const result = await getData(mcaApi, type, offset, pageSize, sort, search);
    setCountRows(result.totalCount);
    return result;
  };

  const { tableProps, search, reload } = useTable({
    mode: 'offset',
    getData: fetchData,
    paginationOptions: {
      pageSize: 20,
      pageSizeOptions: [10, 20, 50],
    },
    initialSearch,
    initialSort: { column: 'component', direction: 'ascending' },
  });

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    reload();
  }, [type, reload]);

  if (error) return <ResponseErrorPanel error={error} />;

  return (
    <Container style={{ height: '100%' }}>
      <Card>
        <CardHeader>
          <Header
            title={`${getTitle(type)} (${countRows})`}
            customActions={
              <SearchField
                placeholder="Filter..."
                value={search.value}
                onChange={str => {
                  sessionStorage.setItem(STORAGE_KEY, str ?? '');
                  search.onChange(str);
                }}
                aria-label="Filter"
                startCollapsed
                style={{ marginLeft: 'auto', maxWidth: '300px' }}
              />
            }
          />
        </CardHeader>
        <CardBody>
          <Table
            key={`table-${type}`}
            {...tableProps}
            columnConfig={columns}
            emptyState={<div>No data available</div>}
            className="denseTable"
          />
        </CardBody>
      </Card>
    </Container>
  );
});
