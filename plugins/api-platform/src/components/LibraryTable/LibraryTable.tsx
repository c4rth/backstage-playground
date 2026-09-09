import { ResponseErrorPanel } from '@backstage/core-components';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  Container,
  Cell,
  CellText,
  ColumnConfig,
  SearchField,
  Table,
  useTable,
  Header,
} from '@backstage/ui';
import {
  ComponentOwnership,
  useReloadOnChange,
  useStoredOwnership,
  useStoredSearch,
} from '../common';
import {
  ComponentDisplayName,
  LinkComponentDisplayName,
  Progress,
} from '@internal/plugin-components-react';
import { useApi } from '@backstage/core-plugin-api';
import { ApiPlatformBackendApi } from '../../api';
import { apiPlatformBackendApiRef } from '../../plugin';
import {
  OwnershipType,
  ANNOTATION_LIBRARY_NAME,
  ANNOTATION_LIBRARY_VERSION,
} from '@internal/plugin-api-platform-common';

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
        <LinkComponentDisplayName
          href={`/api-platform/library/${system}/${name}`}
          text={name}
          type="library"
        />
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
          <LinkComponentDisplayName
            href={`/api-platform/system/${system}`}
            text={system}
            type="system"
          />
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
  ownershipType: OwnershipType,
) => {
  const result = await apiPlatformApi.listLibraries({
    ownershipType,
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
  const [ownershipType, setOwnershipType] = useStoredOwnership(
    STORAGE_OWNERSHIP_KEY,
  );
  const { initialSearch, storeSearch } = useStoredSearch(STORAGE_SEARCH_KEY);

  const { tableProps, search, reload } = useTable({
    mode: 'complete',
    getData: () => fetchData(apiPlatformApi, ownershipType),
    initialSort: {
      column: 'name',
      direction: 'ascending',
    },
    paginationOptions: {
      type: 'none',
    },
    initialSearch: initialSearch,
    searchFn: (items, query) => {
      const lowerQuery = query.toLowerCase();
      return items.filter(
        item =>
          item.name.toLowerCase().includes(lowerQuery) ||
          item.latestVersion.toLowerCase().includes(lowerQuery) ||
          item.description.toLowerCase().includes(lowerQuery) ||
          item.system.toLowerCase().includes(lowerQuery),
      );
    },
    onSearchChange: newSearch => {
      storeSearch(newSearch);
    },
    sortFn: (items, { column, direction }) => {
      const desc = direction === 'descending' ? -1 : 1;
      return [...items].sort((a, b) => {
        switch (column) {
          case 'name':
            return desc * a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
    },
  });

  useReloadOnChange(reload, [ownershipType]);

  if (tableProps.error) {
    return (
      <ResponseErrorPanel
        title="Failed to call AppRegistry"
        error={tableProps.error}
      />
    );
  }
  if (tableProps.isPending) {
    return <Progress />;
  }

  return (
    <Container style={{ backgroundColor: 'var(--bui-bg-neutral-1)' }}>
      <Header
        title={`${ownershipType === 'owned' ? 'Owned' : 'All'} Libraries`}
        customActions={
          <>
            <ComponentOwnership
              storageKey={STORAGE_OWNERSHIP_KEY}
              handleOwnershipChange={setOwnershipType}
            />
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
        key={ownershipType}
        columnConfig={columns}
        {...tableProps}
        pagination={{
          type: 'none',
        }}
        emptyState={emptyState()}
        className="denseTable"
        style={{ paddingBottom: '16px' }}
      />
    </Container>
  );
};
