import { ResponseErrorPanel } from '@backstage/core-components';
import {
  McaBaseType,
  McaBaseTypeListOptions,
} from '@internal/plugin-mca-common';
import { useApi } from '@backstage/core-plugin-api';
import { mcaComponentsBackendApiRef } from '../../api';
import { McaComponentsBackendApi } from '../../api/McaComponentsBackendApi';
import { useState, memo } from 'react';
import {
  ColumnConfig,
  Link,
  CellText,
  Cell,
  useTable,
  SortDescriptor,
  Table,
  Container,
  Header,
  SearchField,
  Box,
} from '@backstage/ui';

type TableRow = {
  id: number;
  baseType: string;
  packageName: string;
};

const columns: ColumnConfig<TableRow>[] = [
  {
    id: 'baseType',
    label: 'Name',
    width: '50%',
    isRowHeader: true,
    isSortable: true,
    cell: ({ baseType }: TableRow) => (
      <Cell>
        <Link
          href={`/mca/basetypes/${baseType}`}
          weight="bold"
          color="info"
          standalone
        >
          {baseType}
        </Link>
      </Cell>
    ),
  },
  {
    id: 'packageName',
    label: 'Package',
    width: '50%',
    cell: ({ packageName }: TableRow) => (
      <CellText title={packageName || '-'} />
    ),
  },
];

const STORAGE_KEY = 'mcaBaseTypeTableSearch';

function toTableRow(item: McaBaseType, idx: number) {
  return {
    id: idx,
    baseType: item.baseType,
    packageName: item.packageName,
  };
}

const getData = async (
  mcaApi: McaComponentsBackendApi,
  offset: number,
  pageSize: number,
  sort: SortDescriptor | null,
  search?: string,
) => {
  const result = await mcaApi.listMcaBaseTypes({
    offset,
    limit: pageSize,
    search,
    orderBy: sort
      ? ({
          field: sort.column.toString(),
          direction: sort.direction,
        } as McaBaseTypeListOptions['orderBy'])
      : undefined,
  });
  if (result) {
    return {
      data: result.items.map(toTableRow),
      totalCount: result.totalCount,
      page: Math.floor(result.offset / result.limit),
    };
  }
  return {
    data: [],
    totalCount: 0,
    page: 0,
  };
};

export const McaBaseTypeTable = memo(() => {
  const mcaApi = useApi(mcaComponentsBackendApiRef);

  const [countRows, setCountRows] = useState(0);
  const initialSearch = sessionStorage.getItem(STORAGE_KEY) || '';

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
    const result = await getData(mcaApi, offset, pageSize, sort, search);
    setCountRows(result.totalCount);
    return result;
  };

  const { tableProps, search } = useTable({
    mode: 'offset',
    getData: fetchData,
    paginationOptions: {
      pageSize: 20,
      pageSizeOptions: [10, 20, 50],
    },
    initialSearch,
    initialSort: { column: 'baseType', direction: 'ascending' },
  });

  if (tableProps.error) {
    return (
      <ResponseErrorPanel
        title="Failed to call MCA API"
        error={tableProps.error}
      />
    );
  }

  return (
    <Container>
      <Header
        title={`BaseTypes (${countRows})`}
        customActions={
          <Box style={{ marginLeft: 'auto', width: '250px' }}>
            <SearchField
              placeholder="Filter..."
              value={search.value}
              onChange={str => {
                sessionStorage.setItem(STORAGE_KEY, str ?? '');
                search.onChange(str);
              }}
              aria-label="Filter"
            />
          </Box>
        }
      />
      <Table
        key={`table-basetypes`}
        {...tableProps}
        columnConfig={columns}
        emptyState={<div>No data available</div>}
        className="denseTable"
      />
    </Container>
  );
});
