import {
  ResponseErrorPanel,
  Table,
  TableColumn,
  Link,
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
import { apiPlatformBackendApiRef } from '../../api';
import { useState } from 'react';
import { Query, MTableAction } from '@material-table/core';
import { ApiPlatformBackendApi } from '../../api/ApiPlatformBackendApi';
import { ComponentDisplayName, ComponentOwnership } from '../common';
import { Box, Flex, Select } from '@backstage/ui';

type TableRow = {
  id: number;
  name: string;
  description: string;
  type: string;
  system: string;
  entityRef: string;
};

const PAGE_SIZE = 20;
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
  query: Query<TableRow>,
  ownership: OwnershipType,
  apiType: OpenApiType
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
    width: '45%',
    render: ({ description }: TableRow) => <OverflowTooltip text={description} line={2} />,
  },
  {
    title: 'Type',
    field: 'type',
    width: '5%',
    render: ({ type }: TableRow) => <OverflowTooltip text={type} line={2} />,
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

const API_TYPES = [
  ...OPENAPITYPE_LIST.map((type) => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1) })),
];

function getTitle(ownership: OwnershipType, apiType: OpenApiType, count: number): string {
  return `${ownership === 'owned' ? 'Owned' : 'All'} ${apiType === 'all' ? '' : API_TYPES.find(t => t.value === apiType)?.label ?? ''} APIs (${count})`;
}

export const ApiTable = () => {
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);
  const [countRows, setCountRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [ownership, setOwnership] = useState<OwnershipType>(
    () => (sessionStorage.getItem(STORAGE_OWNERSHIP_KEY) === 'owned' ? 'owned' : 'all')
  );
  const [selectedType, setSelectedType] = useState<OpenApiType>(
    () => (sessionStorage.getItem(STORAGE_TYPE_KEY) ? (sessionStorage.getItem(STORAGE_TYPE_KEY) as OpenApiType) : 'all')
  );

  const initialSearch = sessionStorage.getItem(STORAGE_SEARCH_KEY) || '';

  const fetchData = async (query: Query<TableRow>) => {
    setLoading(true);
    setError(null);
    if (query.search !== undefined) {
      sessionStorage.setItem(STORAGE_SEARCH_KEY, query.search);
    }
    try {
      const result = await getData(apiPlatformApi, query, ownership, selectedType);
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
    <Table<TableRow>
      key={`${ownership}-${selectedType}`}
      columns={COLUMNS}
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
          <Box ml="1">{getTitle(ownership, selectedType, countRows)}</Box>
          <Box ml="4"><ComponentOwnership storageKey={STORAGE_OWNERSHIP_KEY} handleOwnershipChange={setOwnership} /></Box>
        </Flex>
      }
      actions={[
        {
          isFreeAction: true,
          onClick: () => null,
          // @ts-ignore
          component: (
            <Box mx="4" style={{ width: '10em'}}>
              <Select
                name="apiType"
                size="medium"
                value={selectedType}
                onChange={(v) => setSelectedType(v as OpenApiType)}
                options={API_TYPES}
              />
            </Box>
          )
        },
      ]}
      components={{
        Action: (props: any) => {
          if (props.action.component) {
            return props.action.component;
          }
          return <MTableAction {...props} />;
        },
      }}
      data={fetchData}
    />
  );
};
