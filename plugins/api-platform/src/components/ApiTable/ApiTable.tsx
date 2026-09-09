import {
  ResponseErrorPanel,
  OverflowTooltip,
} from '@backstage/core-components';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  ANNOTATION_API_NAME,
  ANNOTATION_API_TYPE,
  ApiDefinitionsListRequest,
  OPENAPITYPE_LIST,
  OpenApiType,
  OwnershipType,
} from '@internal/plugin-api-platform-common';
import { useApi } from '@backstage/core-plugin-api';
import { apiPlatformBackendApiRef } from '../../plugin';
import { useState } from 'react';
import { ApiPlatformBackendApi } from '../../api/ApiPlatformBackendApi';
import {
  ComponentOwnership,
  useReloadOnChange,
  useStoredOwnership,
  useStoredSearch,
} from '../common';
import {
  ComponentDisplayName,
  LinkComponentDisplayName,
} from '@internal/plugin-components-react';
import {
  Box,
  Select,
  Cell,
  ColumnConfig,
  SearchField,
  Table,
  useTable,
  Container,
  Header,
  SortDescriptor,
  CellText,
} from '@backstage/ui';

type TableRow = {
  id: number;
  name: string;
  description: string;
  type: string;
  system: string;
  entityRef: string;
};

const STORAGE_OWNERSHIP_KEY = 'apisTablePageOwner';
const STORAGE_SEARCH_KEY = 'apisTablePageSearch';
const STORAGE_TYPE_KEY = 'apisTablePageType';

const toEntityRow = (entity: Entity, idx: number): TableRow => ({
  id: idx,
  name: entity.metadata.annotations?.[ANNOTATION_API_NAME]?.toString() ?? '?',
  description: entity.metadata.description ?? '',
  type: entity.metadata.annotations?.[ANNOTATION_API_TYPE]?.toString() ?? '-',
  system: entity.spec?.system?.toString() ?? '-',
  entityRef: stringifyEntityRef(entity),
});

const getData = async (
  apiPlatformApi: ApiPlatformBackendApi,
  ownershipType: OwnershipType,
  apiType: OpenApiType,
  offset: number,
  pageSize: number,
  sort: SortDescriptor | null,
  search?: string,
) => {
  const result = await apiPlatformApi.listApis({
    offset: offset,
    limit: pageSize,
    search: search,
    orderBy: sort
      ? ({
          field: sort.column.toString(),
          direction: sort.direction,
        } as ApiDefinitionsListRequest['orderBy'])
      : undefined,
    ownershipType,
    apiType,
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

const COLUMNS: ColumnConfig<TableRow>[] = [
  {
    id: 'name',
    width: '35%',
    label: 'Name',
    isRowHeader: true,
    isSortable: true,
    cell: ({ system, name }: TableRow) => (
      <Cell>
        <LinkComponentDisplayName
          href={`/api-platform/api/${system}/${name}`}
          text={name}
          type="api"
        />
      </Cell>
    ),
  },
  {
    id: 'description',
    label: 'Description',
    width: '45%',
    isSortable: true,
    cell: ({ description }: TableRow) => (
      <Cell>
        <OverflowTooltip text={description} line={2} />
      </Cell>
    ),
  },
  {
    id: 'type',
    label: 'Type',
    width: '10%',
    isSortable: true,
    cell: ({ type }: TableRow) => <CellText title={type} />,
  },
  {
    id: 'system',
    width: '10%',
    label: 'System',
    isSortable: true,
    cell: ({ system }: TableRow) =>
      system === '-' ? (
        <Cell>
          <ComponentDisplayName text={system} type="system" />
        </Cell>
      ) : (
        <Cell>
          <LinkComponentDisplayName
            href={`/api-platform/system/${system}`}
            text={system}
            type="system"
          />
        </Cell>
      ),
  },
];

const API_TYPES = [
  ...OPENAPITYPE_LIST.map(type => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
  })),
];

function getTitle(
  ownershipType: OwnershipType,
  apiType: OpenApiType,
  count: number,
): string {
  return `${ownershipType === 'owned' ? 'Owned' : 'All'} ${apiType === 'all' ? '' : (API_TYPES.find(t => t.value === apiType)?.label ?? '')} APIs (${count})`;
}

export const ApiTable = () => {
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);
  const [countRows, setCountRows] = useState(0);
  const [ownershipType, setOwnershipType] = useStoredOwnership(
    STORAGE_OWNERSHIP_KEY,
  );
  const [selectedType, setSelectedType] = useState<OpenApiType>(() =>
    sessionStorage.getItem(STORAGE_TYPE_KEY)
      ? (sessionStorage.getItem(STORAGE_TYPE_KEY) as OpenApiType)
      : 'all',
  );
  const { initialSearch, storeSearch } = useStoredSearch(STORAGE_SEARCH_KEY);

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
      selectedType,
      offset,
      pageSize,
      sort,
      search,
    );
    setCountRows(result.totalCount);
    return result;
  };

  const { tableProps, reload, search } = useTable({
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

  useReloadOnChange(reload, [ownershipType, selectedType]);

  if (tableProps.error) return <ResponseErrorPanel error={tableProps.error} />;

  return (
    <Container style={{ backgroundColor: 'var(--bui-bg-neutral-1)' }}>
      <Header
        title={getTitle(ownershipType, selectedType, countRows)}
        customActions={
          <>
            <ComponentOwnership
              storageKey={STORAGE_OWNERSHIP_KEY}
              handleOwnershipChange={setOwnershipType}
            />

            <Box mx="4" style={{ width: '10em' }}>
              <Select
                name="apiType"
                size="medium"
                value={selectedType}
                onChange={v => {
                  setSelectedType(v as OpenApiType);
                }}
                aria-label="API Type"
                options={API_TYPES}
              />
            </Box>
            <SearchField
              placeholder="Filter..."
              value={search.value}
              onChange={str => {
                storeSearch(str);
                search.onChange(str);
              }}
              aria-label="Filter"
              startCollapsed
              style={{ marginLeft: 'auto', maxWidth: '300px' }}
            />
          </>
        }
      />
      <Table
        key={`table-${selectedType}-${ownershipType}`}
        {...tableProps}
        columnConfig={COLUMNS}
        emptyState={<div>No data available</div>}
        className="denseTable"
      />
    </Container>
  );
};
