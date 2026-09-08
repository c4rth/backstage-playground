import { ResponseErrorPanel } from '@backstage/core-components';
import { EntityRefLinks } from '@backstage/plugin-catalog-react';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  Box,
  Cell,
  CellText,
  ColumnConfig,
  SearchField,
  Table,
  useTable,
  Container,
  Header,
  SortDescriptor,
} from '@backstage/ui';
import { useState } from 'react';
import {
  ComponentOwnership,
  useReloadOnChange,
  useStoredOwnership,
  useStoredSearch,
} from '../common';
import { LinkComponentDisplayName } from '@internal/plugin-components-react';
import { useApi } from '@backstage/core-plugin-api';
import { ApiPlatformBackendApi } from '../../api/ApiPlatformBackendApi';
import { apiPlatformBackendApiRef } from '../../plugin';
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

const COLUMNS: ColumnConfig<TableRow>[] = [
  {
    id: 'name',
    width: '25%',
    label: 'Name',
    isRowHeader: true,
    isSortable: true,
    cell: ({ name }: TableRow) => (
      <Cell>
        <LinkComponentDisplayName href={name} text={name} type="system" />
      </Cell>
    ),
  },
  {
    id: 'description',
    width: '50%',
    label: 'Description',
    isSortable: true,
    cell: ({ description }: TableRow) => (
      <CellText title={description || '-'} />
    ),
  },
  {
    id: 'owner',
    width: '25%',
    label: 'Owner',
    isSortable: true,
    cell: ({ owner }: TableRow) => (
      <Cell>
        <EntityRefLinks entityRefs={[owner]} defaultKind="group" />
      </Cell>
    ),
  },
];

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
  ownershipType: OwnershipType,
  offset: number,
  pageSize: number,
  sort: SortDescriptor | null,
  search?: string,
) => {
  const result = await apiPlatformApi.listSystems({
    offset,
    limit: pageSize,
    search,
    orderBy: sort
      ? ({
          field: sort.column.toString(),
          direction: sort.direction,
        } as SystemDefinitionsListRequest['orderBy'])
      : undefined,
    ownershipType,
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
};

function getTitle(ownership: OwnershipType, countRows: number) {
  return `${ownership === 'owned' ? 'Owned' : 'All'} Systems (${countRows})`;
}

export const SystemTable = () => {
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);
  const { initialSearch, storeSearch } = useStoredSearch(STORAGE_SEARCH_KEY);
  const [countRows, setCountRows] = useState(0);
  const [ownershipType, setOwnershipType] = useStoredOwnership(
    STORAGE_OWNERSHIP_KEY,
  );

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
    const result = await getData(
      apiPlatformApi,
      ownershipType,
      offset,
      pageSize,
      sort,
      search,
    );
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
    initialSort: {
      column: 'name',
      direction: 'ascending',
    },
    initialSearch,
  });

  useReloadOnChange(reload, [ownershipType]);

  if (tableProps.error) return <ResponseErrorPanel error={tableProps.error} />;

  return (
    <Container>
      <Header
        title={getTitle(ownershipType, countRows)}
        customActions={
          <>
            <ComponentOwnership
              storageKey={STORAGE_OWNERSHIP_KEY}
              handleOwnershipChange={setOwnershipType}
            />
            <Box style={{ marginLeft: 'auto', width: '250px' }}>
              <SearchField
                placeholder="Filter..."
                value={search.value}
                onChange={str => {
                  storeSearch(str);
                  search.onChange(str);
                }}
                aria-label="Filter"
              />
            </Box>
          </>
        }
      />
      <Table
        key={`table-${ownershipType}`}
        {...tableProps}
        columnConfig={COLUMNS}
        emptyState={<div>No data available</div>}
        className="denseTable"
      />
    </Container>
  );
};
