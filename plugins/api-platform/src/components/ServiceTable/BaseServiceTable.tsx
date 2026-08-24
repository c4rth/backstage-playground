import { ResponseErrorPanel } from '@backstage/core-components';
import { ComponentChip, DependentsToggle, ComponentOwnership } from '../common';
import { LinkComponentDisplayName } from '@internal/plugin-components-react';
import {
  OwnershipType,
  ServiceDefinition,
  ServiceDefinitionsListRequest,
  ServiceVersionDefinition,
  DependentsType,
} from '@internal/plugin-api-platform-common';
import { useEffect, useRef, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { ApiPlatformBackendApi } from '../../api';
import { apiPlatformBackendApiRef } from '../../plugin';
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
        <>
          {renderItem(version, idx)}
        </>
      ))}
    </Flex>
  </Cell>
);

const createNameColumn = <T extends BaseTableRow>(): ColumnConfig<T> => ({
  label: 'Name',
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

const createVersionColumn = <T extends BaseTableRow>(): ColumnConfig<T> => ({
  label: 'Version',
  width: '5%',
  id: 'version',
  isSortable: false,
  header: () => (
    <Column id="version" className="centered-col-header">
      <Text weight="bold">Version</Text>
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

const createSystemColumn = <T extends BaseTableRow>(): ColumnConfig<T> => ({
  label: 'System',
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
): ColumnConfig<T>[] {
  return [
    createNameColumn<T>(),
    createVersionColumn<T>(),
    ...environmentColumns,
    createSystemColumn<T>(),
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
      page: Math.floor(result.offset / result.limit),
    }
    : {
      data: [],
      totalCount: 0,
      page: 0,
    };
  return res;
};

const getTitleLabel = (toggleType: ToggleType, ownership: OwnershipType) => {
  if (toggleType === 'ownership') {
    return `${ownership === 'owned' ? 'Owned' : 'All'} Services`;
  }
  return 'Services';
};

export function BaseServiceTable<T extends BaseTableRow>({
  columns,
  toRow,
  storageOwnershipKey,
  storageSearchKey,
  toggleType = 'ownership',
}: BaseServiceTableProps<T>) {
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);
  const [countRows, setCountRows] = useState(0);
  const [ownershipType, setOwnershipType] = useState<OwnershipType>(() =>
    sessionStorage.getItem(storageOwnershipKey) === 'owned' ? 'owned' : 'all',
  );
  const [dependentsType, setDependentsType] = useState<DependentsType>('all');
  const isFirstRender = useRef(true);

  const initialSearch = sessionStorage.getItem(storageSearchKey) ?? '';

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
    initialSearch,
  });

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    reload();
  }, [ownershipType, dependentsType, reload]);

  if (tableProps.error) return <ResponseErrorPanel error={tableProps.error} />;

  return (
    <Container>
      <Header
        title={`${getTitleLabel(toggleType, ownershipType)} (${countRows})`}
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
            <Box style={{ marginLeft: 'auto', width: '250px' }}>
              <SearchField
                placeholder="Filter..."
                value={search.value}
                onChange={str => {
                  sessionStorage.setItem(storageSearchKey, str ?? '');
                  search.onChange(str);
                }}
                aria-label="Filter"
              />
            </Box>
          </>
        }
      />
      <Table
        key={`table-${ownershipType}-${dependentsType}`}
        {...tableProps}
        columnConfig={columns}
        emptyState={<div>No data available</div>}
        className="denseTable"
      />
    </Container>
  );
}
