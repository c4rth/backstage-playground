import { Link, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Cell,
  CellText,
  ColumnConfig,
  Flex,
  SearchField,
  Table,
  Text,
  useTable,
} from '@backstage/ui';
import { useCallback, useState } from 'react';
import { ComponentDisplayName, ComponentOwnership } from '../common';
import { useApi } from '@backstage/core-plugin-api';
import {
  ApiPlatformBackendApi,
  apiPlatformBackendApiRef,
} from '../../api/ApiPlatformBackendApi';
import {
  OwnershipType,
  ANNOTATION_LIBRARY_NAME,
  ANNOTATION_LIBRARY_VERSION,
} from '@internal/plugin-api-platform-common';
import styles from './LibraryTable.module.css';

type TableRow = {
  id: number;
  name: string;
  description: string;
  latestVersion: string;
  entityRef: string;
  system: string;
};

const columns: ColumnConfig<TableRow>[] = [
  {
    id: 'name',
    label: 'Name',
    width: '25%',
    isRowHeader: true,
    isSortable: true,
    cell: ({ name, system }: TableRow) => (
      <Cell>
        <Text weight="bold">
          <Link to={`/api-platform/library/${system}/${name}`}>
            <ComponentDisplayName text={name} type="library" />
          </Link>
        </Text>
      </Cell>
    ),
  },
  {
    id: 'latestVersion',
    label: 'Latest Version',
    width: '15%',
    cell: ({ latestVersion }: TableRow) => (
      <CellText title={latestVersion || '-'} />
    ),
  },
  {
    id: 'description',
    label: 'Description',
    width: '50%',
    cell: ({ description }: TableRow) => (
      <CellText title={description || '-'} />
    ),
  },
  {
    id: 'system',
    label: 'System',
    width: '10%',
    cell: ({ system }: TableRow) =>
      system === '-' ? (
        <Cell>
          <ComponentDisplayName text={system} type="system" />
        </Cell>
      ) : (
        <Cell>
          <Text weight="bold">
            <Link to={`/api-platform/system/${system}`}>
              <ComponentDisplayName text={system} type="system" />
            </Link>
          </Text>
        </Cell>
      ),
  },
];

const STORAGE_OWNERSHIP_KEY = 'librariesTablePageOwner';
const STORAGE_SEARCH_KEY = 'librariesTablePageSearch';

const toEntityRow = (entity: Entity, idx: number): TableRow => ({
  id: idx,
  name:
    entity.metadata.annotations?.[ANNOTATION_LIBRARY_NAME]?.toString() ?? '?',
  description: entity.metadata.description ?? '',
  entityRef: stringifyEntityRef(entity),
  latestVersion:
    entity.metadata.annotations?.[ANNOTATION_LIBRARY_VERSION]?.toString() ??
    '-',
  system: entity.spec?.system?.toString() ?? '-',
});

const fetchData = async (
  apiPlatformApi: ApiPlatformBackendApi,
  ownership: OwnershipType,
) => {
  const result = await apiPlatformApi.listLibraries({
    ownership,
  });

  return result ? result.items.map(toEntityRow) : [];
};

const emptyState = () => (
  <div style={{ padding: 'var(--bui-space-4)', textAlign: 'center' }}>
    No libraries found.
  </div>
);

export const LibraryTable = () => {
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);
  const [ownership, setOwnership] = useState<OwnershipType>(() =>
    sessionStorage.getItem(STORAGE_OWNERSHIP_KEY) === 'owned' ? 'owned' : 'all',
  );
  const initialSearch = sessionStorage.getItem(STORAGE_SEARCH_KEY) ?? '';

  const { tableProps, search } = useTable({
    mode: 'complete',
    getData: () => fetchData(apiPlatformApi, ownership),
    initialSort: {
      column: 'name',
      direction: 'ascending',
    },
    paginationOptions: {
      type: 'none',
    },
    search: initialSearch,
    searchFn: (items, query) => {
      const lowerQuery = query.toLowerCase();
      if (query.search !== undefined) {
        sessionStorage.setItem(STORAGE_SEARCH_KEY, lowerQuery);
      }
      return items.filter(
        item =>
          item.name.toLowerCase().includes(lowerQuery) ||
          item.latestVersion.toLowerCase().includes(lowerQuery) ||
          item.description.toLowerCase().includes(lowerQuery) ||
          item.system.toLowerCase().includes(lowerQuery),
      );
    },
    sortFn: (items, { column, direction }) => {
      return [...items].sort((a, b) => {
        const desc = direction === 'descending' ? -1 : 1;
        switch (column) {
          case 'name':
            return desc * a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
    },
  });

  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);
  const boxRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const top = node.getBoundingClientRect().top;
      setMaxHeight(window.innerHeight - top - 50); // 50px padding from bottom
    }
  }, []);

  if (tableProps.error) {
    return (
      <ResponseErrorPanel
        title="Failed to call AppRegistry"
        error={tableProps.error}
      />
    );
  }
  if (tableProps.loading) {
    return <Progress />;
  }

  return (
    <Card style={{ height: '100%' }}>
      <CardHeader>
        <Flex align="center" gap="2">
          <Box>
            <Text variant="title-small" weight="bold">
              {ownership === 'owned' ? 'Owned' : 'All'} Libraries
            </Text>
          </Box>
          <Box ml="4">
            <ComponentOwnership
              storageKey={STORAGE_OWNERSHIP_KEY}
              handleOwnershipChange={setOwnership}
            />
          </Box>
          <Box style={{ marginLeft: 'auto', width: '250px' }}>
            <SearchField placeholder="Filter..." {...search} />
          </Box>
        </Flex>
      </CardHeader>
      <CardBody style={{ padding: '0' }}>
        <Box
          ref={boxRef}
          style={{
            maxHeight: maxHeight ? `${maxHeight}px` : undefined,
            overflow: 'auto',
          }}
        >
          <Table
            columnConfig={columns}
            {...tableProps}
            pagination={{
              type: 'none',
            }}
            emptyState={emptyState()}
            className={styles.denseTable}
          />
        </Box>
      </CardBody>
    </Card>
  );
};
