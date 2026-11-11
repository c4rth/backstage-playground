import { ResponseErrorPanel } from '@backstage/core-components';
import { ComponentChip, DependentsToggle, ComponentOwnership } from '../common';
import {
  LinkComponentDisplayName,
  useReloadOnChange,
  useStoredValue,
} from '@internal/plugin-components-react';
import {
  OwnershipType,
  ServiceDefinition,
  ServiceDefinitionsListRequest,
  ServiceVersionDefinition,
  DependentsType,
} from '@internal/plugin-api-platform-common';
import { useState } from 'react';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import {
  apiPlatformTranslationRef,
  ApiPlatformTranslator,
} from '../../translation';
import { useApi } from '@backstage/core-plugin-api';
import { ApiPlatformBackendApi } from '../../api';
import { apiPlatformBackendApiRef } from '../../plugin';
import { useStoredOwnership } from '../common';
import {
  Box,
  Cell,
  ColumnConfig,
  SearchField,
  Table,
  Text,
  useTable,
  Container,
  Header,
  SortDescriptor,
  Column,
  Card,
  CardHeader,
  CardBody,
  Flex,
} from '@backstage/ui';

export type BaseTableRow = {
  id: number;
  name: string;
  system: string;
  serviceDefinition: ServiceDefinition;
};

export type ToggleType = 'ownership' | 'dependents';

export const renderVersionList = (
  serviceDefinition: ServiceDefinition,
  renderItem: (version: ServiceVersionDefinition, idx: number) => JSX.Element,
) => (
  <Cell>
    <Flex direction="column" align="center" style={{ gap: 12 }}>
      {serviceDefinition.versions?.map((version, idx) => (
        <Box
          key={`${version.version ?? 'version'}-${idx}`}
          style={{ minWidth: 0, maxWidth: '100%' }}
        >
          {renderItem(version, idx)}
        </Box>
      ))}
    </Flex>
  </Cell>
);

const createNameColumn = <T extends BaseTableRow>(
  t: ApiPlatformTranslator,
): ColumnConfig<T> => ({
  label: t('table.columns.name'),
  width: '25%',
  id: 'name',
  isSortable: true,
  isRowHeader: true,
  cell: ({ serviceDefinition }) => (
    <Cell>
      <LinkComponentDisplayName
        href={`/api-platform/service/${serviceDefinition.system}/${serviceDefinition.serviceName}`}
        text={serviceDefinition.serviceName}
        type="service"
      />
    </Cell>
  ),
});

const createVersionColumn = <T extends BaseTableRow>(
  t: ApiPlatformTranslator,
): ColumnConfig<T> => ({
  label: t('table.columns.version'),
  width: '5%',
  id: 'version',
  isSortable: false,
  header: () => (
    <Column id="version" className="centered-col-header">
      <Text weight="bold">{t('table.columns.version')}</Text>
    </Column>
  ),
  cell: ({ serviceDefinition }) =>
    renderVersionList(serviceDefinition, (version, idx) => (
      <ComponentChip
        index={idx}
        backgroundColor="#C30045"
        text={version.version}
        link={`/api-platform/service/${serviceDefinition.system}/${serviceDefinition.serviceName}?version=${version.version}`}
      />
    )),
});

const createSystemColumn = <T extends BaseTableRow>(
  t: ApiPlatformTranslator,
): ColumnConfig<T> => ({
  label: t('table.columns.system'),
  width: '10%',
  id: 'system',
  isSortable: true,
  cell: ({ serviceDefinition }) => (
    <Cell>
      <LinkComponentDisplayName
        href={`/api-platform/system/${serviceDefinition.system}`}
        text={serviceDefinition.system}
        type="system"
      />
    </Cell>
  ),
});

export function buildColumns<T extends BaseTableRow>(
  environmentColumns: ColumnConfig<T>[],
  t: ApiPlatformTranslator,
): ColumnConfig<T>[] {
  return [
    createNameColumn<T>(t),
    createVersionColumn<T>(t),
    ...environmentColumns,
    createSystemColumn<T>(t),
  ];
}

type BaseServiceTableProps<T extends BaseTableRow> = {
  columns: ColumnConfig<T>[];
  toRow: (serviceDefinition: ServiceDefinition, idx: number) => T;
  storageOwnershipKey: string;
  storageSearchKey: string;
  toggleType?: ToggleType;
};

const getData = async <T extends BaseTableRow>(
  apiPlatformApi: ApiPlatformBackendApi,
  toggleType: ToggleType,
  ownershipType: OwnershipType,
  dependentsType: DependentsType,
  toRow: (serviceDefinition: ServiceDefinition, idx: number) => T,
  offset: number,
  pageSize: number,
  sort: SortDescriptor | null,
  search?: string,
) => {
  const result = await apiPlatformApi.listServices({
    offset,
    limit: pageSize,
    search,
    orderBy: sort
      ? ({
          field: sort.column.toString(),
          direction: sort.direction,
        } as ServiceDefinitionsListRequest['orderBy'])
      : undefined,
    ownershipType: toggleType === 'ownership' ? ownershipType : 'all',
    dependentsType: toggleType === 'dependents' ? dependentsType : undefined,
  });

  const res = result
    ? {
        data: result.items.map(toRow),
        totalCount: result.totalCount,
      }
    : {
        data: [],
        totalCount: 0,
      };
  return res;
};

export function BaseServiceTable<T extends BaseTableRow>({
  columns,
  toRow,
  storageOwnershipKey,
  storageSearchKey,
  toggleType = 'ownership',
}: BaseServiceTableProps<T>) {
  const { t } = useTranslationRef(apiPlatformTranslationRef);
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);
  const [countRows, setCountRows] = useState(0);
  const [ownershipType, setOwnershipType] =
    useStoredOwnership(storageOwnershipKey);
  const [dependentsType, setDependentsType] = useState<DependentsType>('all');
  const { initialValue, storeValue } = useStoredValue(storageSearchKey);

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
      toggleType,
      ownershipType,
      dependentsType,
      toRow,
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

  useReloadOnChange(reload, [ownershipType, dependentsType]);

  let title: string = t('serviceTable.title', { total: String(countRows) });
  if (toggleType === 'ownership') {
    title = t(
      ownershipType === 'owned'
        ? 'serviceTable.ownedTitle'
        : 'serviceTable.allTitle',
      { total: String(countRows) },
    );
  }

  if (tableProps.error) {
    return (
      <ResponseErrorPanel
        title={t('serviceTable.loadError')}
        error={tableProps.error}
      />
    );
  }

  return (
    <Container style={{ height: '100%' }}>
      <Card>
        <CardHeader>
          <Header
            title={title}
            customActions={
              <>
                {toggleType === 'ownership' && (
                  <ComponentOwnership
                    storageKey={storageOwnershipKey}
                    handleOwnershipChange={setOwnershipType}
                  />
                )}
                {toggleType === 'dependents' && (
                  <DependentsToggle
                    handleDependentChange={setDependentsType}
                    selectedType={dependentsType}
                  />
                )}
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
            key={`table-${ownershipType}-${dependentsType}`}
            {...tableProps}
            columnConfig={columns}
            emptyState={<div>{t('table.empty')}</div>}
            className="denseTable"
          />
        </CardBody>
      </Card>
    </Container>
  );
}
