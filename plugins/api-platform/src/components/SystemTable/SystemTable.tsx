import { ResponseErrorPanel } from '@backstage/core-components';
import { EntityRefLinks } from '@backstage/plugin-catalog-react';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  Cell,
  CellText,
  ColumnConfig,
  SearchField,
  Table,
  useTable,
  Container,
  Header,
  SortDescriptor,
  Card,
  CardHeader,
  CardBody,
} from '@backstage/ui';
import { useState } from 'react';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import {
  apiPlatformTranslationRef,
  ApiPlatformTranslator,
} from '../../translation';
import { ComponentOwnership, useStoredOwnership } from '../common';
import {
  LinkComponentDisplayName,
  useReloadOnChange,
  useStoredValue,
} from '@internal/plugin-components-react';
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

const getColumns = (t: ApiPlatformTranslator): ColumnConfig<TableRow>[] => [
  {
    id: 'name',
    width: '25%',
    label: t('table.columns.name'),
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
    label: t('table.columns.description'),
    isSortable: true,
    cell: ({ description }: TableRow) => (
      <CellText title={description || '-'} />
    ),
  },
  {
    id: 'owner',
    width: '25%',
    label: t('table.columns.owner'),
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
    };
  }
  return {
    data: [],
    totalCount: 0,
  };
};

export const SystemTable = () => {
  const { t } = useTranslationRef(apiPlatformTranslationRef);
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);
  const { initialValue, storeValue } = useStoredValue(STORAGE_SEARCH_KEY);
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
    initialSearch: initialValue,
  });

  useReloadOnChange(reload, [ownershipType]);

  if (tableProps.error) {
    return (
      <ResponseErrorPanel
        title={t('systemTable.loadError')}
        error={tableProps.error}
      />
    );
  }

  return (
    <Container style={{ height: '100%' }}>
      <Card>
        <CardHeader>
          <Header
            title={t(
              ownershipType === 'owned'
                ? 'systemTable.ownedTitle'
                : 'systemTable.allTitle',
              { total: String(countRows) },
            )}
            customActions={
              <>
                <ComponentOwnership
                  storageKey={STORAGE_OWNERSHIP_KEY}
                  handleOwnershipChange={setOwnershipType}
                />
                <SearchField
                  placeholder={t('table.filterPlaceholder')}
                  value={search.value}
                  onChange={str => {
                    storeValue(str);
                    search.onChange(str);
                  }}
                  aria-label={t('table.filterLabel')}
                  startCollapsed
                  size="medium"
                />
              </>
            }
          />
        </CardHeader>
        <CardBody>
          <Table
            key={`table-${ownershipType}`}
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
