import {
  Link,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import {
  ComponentChip,
  DependentsToggle,
  ComponentDisplayName,
  ComponentOwnership,
} from '../common';
import {
  OwnershipType,
  ServiceDefinition,
  ServiceDefinitionsListRequest,
  ServiceVersionDefinition,
  DependentsType,
} from '@internal/plugin-api-platform-common';
import { useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import {
  ApiPlatformBackendApi,
  apiPlatformBackendApiRef,
} from '../../api/ApiPlatformBackendApi';
import { Box, Flex, Text } from '@backstage/ui';
import { Query } from '@material-table/core';

export type BaseTableRow = {
  id: number;
  name: string;
  system: string;
  serviceDefinition: ServiceDefinition;
};

export type ToggleType = 'ownership' | 'dependents';

const PAGE_SIZE = 20;

export const LIST_ITEM_STYLE = {
  margin: 2,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '2.5rem',
};

export const renderVersionList = (
  serviceDefinition: ServiceDefinition,
  renderItem: (version: ServiceVersionDefinition, idx: number) => JSX.Element,
) => (
  <>
    {serviceDefinition.versions?.map((version, idx) => (
      <Box
        key={`${serviceDefinition.name}-${version.version}-${idx}`}
        style={LIST_ITEM_STYLE}
        aria-label={`${serviceDefinition.name} version ${version.version}`}
      >
        {renderItem(version, idx)}
      </Box>
    ))}
  </>
);

const createNameColumn = <T extends BaseTableRow>(): TableColumn<T> => ({
  title: 'Name',
  width: '25%',
  field: 'name',
  highlight: true,
  defaultSort: 'asc',
  render: ({ serviceDefinition }) => (
    <Link
      to={`/api-platform/service/${serviceDefinition.system}/${serviceDefinition.serviceName}`}
    >
      <ComponentDisplayName
        text={serviceDefinition.serviceName}
        type="service"
      />
    </Link>
  ),
});

const createVersionColumn = <T extends BaseTableRow>(): TableColumn<T> => ({
  title: 'Version',
  width: '5%',
  field: 'version',
  sorting: false,
  align: 'center',
  cellStyle: { padding: 0 },
  render: ({ serviceDefinition }) =>
    renderVersionList(serviceDefinition, (version, idx) => (
      <ComponentChip
        index={idx}
        backgroundColor="#C30045"
        text={version.version}
        link={`/api-platform/service/${serviceDefinition.system}/${serviceDefinition.serviceName}?version=${version.version}`}
      />
    )),
});

const createSystemColumn = <T extends BaseTableRow>(): TableColumn<T> => ({
  title: 'System',
  width: '10%',
  highlight: true,
  field: 'system',
  render: ({ serviceDefinition }) => (
    <Link to={`/api-platform/system/${serviceDefinition.system}`}>
      <ComponentDisplayName text={serviceDefinition.system} type="system" />
    </Link>
  ),
});

export function buildColumns<T extends BaseTableRow>(
  environmentColumns: TableColumn<T>[],
): TableColumn<T>[] {
  return [
    createNameColumn<T>(),
    createVersionColumn<T>(),
    ...environmentColumns,
    createSystemColumn<T>(),
  ];
}

type BaseServiceTableProps<T extends BaseTableRow> = {
  columns: TableColumn<T>[];
  toRow: (serviceDefinition: ServiceDefinition, idx: number) => T;
  storageOwnershipKey: string;
  storageSearchKey: string;
  toggleType?: ToggleType;
};

const getData = async <T extends BaseTableRow>(
  apiPlatformApi: ApiPlatformBackendApi,
  query: Query<T>,
  toggleType: ToggleType,
  ownershipType: OwnershipType,
  dependentsType: DependentsType,
  toRow: (serviceDefinition: ServiceDefinition, idx: number) => T,
) => {
  const page = query.page ?? 0;
  const pageSize = query.pageSize ?? PAGE_SIZE;

  const result = await apiPlatformApi.listServices({
    offset: page * pageSize,
    limit: pageSize,
    search: query.search,
    orderBy: query.orderBy
      ? ({
        field: query.orderBy.field,
        direction: query.orderDirection,
      } as ServiceDefinitionsListRequest['orderBy'])
      : undefined,
    ownershipType: toggleType === 'ownership' ? ownershipType : 'all',
    dependentsType: toggleType === 'dependents' ? dependentsType : undefined,
  });

  return result
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [ownershipType, setOwnershipType] = useState<OwnershipType>(() =>
    sessionStorage.getItem(storageOwnershipKey) === 'owned' ? 'owned' : 'all',
  );
  const [dependentsType, setDependentsType] = useState<DependentsType>('all');

  const initialSearch = sessionStorage.getItem(storageSearchKey) ?? '';

  const fetchData = async (query: Query<T>) => {
    setLoading(true);
    setError(null);
    if (query.search !== undefined) {
      sessionStorage.setItem(storageSearchKey, query.search);
    }
    try {
      const result = await getData(
        apiPlatformApi,
        query,
        toggleType,
        ownershipType,
        dependentsType,
        toRow,
      );
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
    <Table<T>
      key={`${ownershipType}-${dependentsType}`}
      columns={columns}
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
          <Box>
            <Text variant="title-small" weight="bold">
              {getTitleLabel(toggleType, ownershipType)} ({countRows})
            </Text>
          </Box>
          <Box ml="4">
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
          </Box>
        </Flex>
      }
      data={fetchData}
    />
  );
}
