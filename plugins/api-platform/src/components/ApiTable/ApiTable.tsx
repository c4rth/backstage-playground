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
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import {
  apiPlatformTranslationRef,
  ApiPlatformTranslator,
} from '../../translation';
import { ApiPlatformBackendApi } from '../../api/ApiPlatformBackendApi';
import { ComponentOwnership, useStoredOwnership } from '../common';
import {
  ComponentDisplayName,
  LinkComponentDisplayName,
  useReloadOnChange,
  useStoredValue,
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
  Card,
  CardBody,
  CardHeader,
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
      }
    : {
        data: [],
        totalCount: 0,
      };
};

const getColumns = (t: ApiPlatformTranslator): ColumnConfig<TableRow>[] => [
  {
    id: 'name',
    width: '35%',
    label: t('table.columns.name'),
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
    label: t('table.columns.description'),
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
    label: t('table.columns.type'),
    width: '10%',
    isSortable: true,
    cell: ({ type }: TableRow) => <CellText title={type} />,
  },
  {
    id: 'system',
    width: '10%',
    label: t('table.columns.system'),
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

const getApiTypes = (t: ApiPlatformTranslator) => [
  ...OPENAPITYPE_LIST.map(type => ({
    id: type,
    label: t(`apiTable.types.${type}`),
  })),
];

function getTitle(
  t: ApiPlatformTranslator,
  ownershipType: OwnershipType,
  apiType: OpenApiType,
  count: number,
): string {
  return t(
    ownershipType === 'owned' ? 'apiTable.ownedTitle' : 'apiTable.allTitle',
    {
      type:
        apiType === 'all'
          ? ''
          : (getApiTypes(t).find(option => option.id === apiType)?.label ?? ''),
      total: String(count),
    },
  );
}

export const ApiTable = () => {
  const { t } = useTranslationRef(apiPlatformTranslationRef);
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);
  const [countRows, setCountRows] = useState(0);
  const [ownershipType, setOwnershipType] = useStoredOwnership(
    STORAGE_OWNERSHIP_KEY,
  );
  const { initialValue: selectedType, storeValue: setSelectedType } =
    useStoredValue<OpenApiType>(STORAGE_TYPE_KEY, 'all');
  const { initialValue, storeValue } = useStoredValue(STORAGE_SEARCH_KEY);

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
    initialSearch: initialValue,
  });

  useReloadOnChange(reload, [ownershipType, selectedType]);

  if (tableProps.error) {
    return (
      <ResponseErrorPanel
        title={t('apiTable.loadError')}
        error={tableProps.error}
      />
    );
  }

  return (
    <Container style={{ height: '100%' }}>
      <Card>
        <CardHeader>
          <Header
            title={getTitle(
              t,
              ownershipType,
              selectedType as OpenApiType,
              countRows,
            )}
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
                    onChange={selected => {
                      setSelectedType(selected as OpenApiType);
                    }}
                    aria-label={t('apiTable.typeLabel')}
                    options={getApiTypes(t)}
                  />
                </Box>
                <SearchField
                  placeholder={t('table.filterPlaceholder')}
                  value={search.value}
                  onChange={str => {
                    storeValue(str);
                    search.onChange(str);
                  }}
                  aria-label={t('table.filterLabel')}
                  size="medium"
                  startCollapsed
                />
              </>
            }
          />
        </CardHeader>
        <CardBody>
          <Table
            key={`table-${selectedType}-${ownershipType}`}
            {...tableProps}
            columnConfig={getColumns(t)}
            emptyState={<div>{t('table.empty')}</div>}
            className="denseTable"
          />
        </CardBody>
      </Card>
    </Container>
  );
};
