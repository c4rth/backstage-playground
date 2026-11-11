import { ResponseErrorPanel } from '@backstage/core-components';
import {
  McaBaseType,
  McaBaseTypeListOptions,
} from '@internal/plugin-mca-common';
import { useStoredValue } from '@internal/plugin-components-react';
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
  Card,
  CardHeader,
  CardBody,
} from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { mcaTranslationRef, McaTranslator } from '../../translation';

type TableRow = {
  id: number;
  baseType: string;
  packageName: string;
};

const getColumns = (t: McaTranslator): ColumnConfig<TableRow>[] => [
  {
    id: 'baseType',
    label: t('baseTypeTable.name'),
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
    label: t('baseTypeTable.package'),
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
    };
  }
  return {
    data: [],
    totalCount: 0,
  };
};

export const McaBaseTypeTable = memo(() => {
  const { t } = useTranslationRef(mcaTranslationRef);
  const columns = getColumns(t);
  const mcaApi = useApi(mcaComponentsBackendApiRef);

  const [countRows, setCountRows] = useState(0);
  const { initialValue, storeValue } = useStoredValue(STORAGE_KEY);

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
    initialSearch: initialValue,
    initialSort: { column: 'baseType', direction: 'ascending' },
  });

  if (tableProps.error) {
    return (
      <ResponseErrorPanel
        title={t('baseTypeTable.error')}
        error={tableProps.error}
      />
    );
  }

  return (
    <Container style={{ height: '100%' }}>
      <Card>
        <CardHeader>
          <Header
            title={t('baseTypeTable.title', { total: String(countRows) })}
            customActions={
              <SearchField
                placeholder={t('baseTypeTable.filterPlaceholder')}
                value={search.value}
                onChange={str => {
                  storeValue(str);
                  search.onChange(str);
                }}
                aria-label={t('baseTypeTable.filterLabel')}
                startCollapsed
                size="medium"
              />
            }
          />
        </CardHeader>
        <CardBody>
          <Table
            key="table-basetypes"
            {...tableProps}
            columnConfig={columns}
            emptyState={<div>{t('baseTypeTable.empty')}</div>}
            className="denseTable"
          />
        </CardBody>
      </Card>
    </Container>
  );
});
