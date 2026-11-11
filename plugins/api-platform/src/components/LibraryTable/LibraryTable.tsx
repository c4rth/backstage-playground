import { ResponseErrorPanel } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import {
  apiPlatformTranslationRef,
  ApiPlatformTranslator,
} from '../../translation';
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
  Card,
  CardHeader,
  CardBody,
  FullPage,
} from '@backstage/ui';
import { ComponentOwnership, useStoredOwnership } from '../common';
import {
  ComponentDisplayName,
  LinkComponentDisplayName,
  useDocumentTitle,
  useReloadOnChange,
  useStoredValue,
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

const getColumns = (t: ApiPlatformTranslator): ColumnConfig<TableRow>[] => [
  {
    id: 'name',
    label: t('table.columns.name'),
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
    label: t('table.columns.latestVersion'),
    width: '15%',
    cell: ({ latestVersion }: TableRow) => (
      <CellText title={latestVersion || '-'} />
    ),
  },
  {
    id: 'description',
    label: t('table.columns.description'),
    width: '50%',
    cell: ({ description }: TableRow) => (
      <CellText title={description || '-'} />
    ),
  },
  {
    id: 'system',
    label: t('table.columns.system'),
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

const emptyState = (t: ApiPlatformTranslator) => (
  <div style={{ padding: 'var(--bui-space-4)', textAlign: 'center' }}>
    {t('libraryTable.empty')}
  </div>
);

export const LibraryTable = () => {
  const { t } = useTranslationRef(apiPlatformTranslationRef);
  useDocumentTitle(t('libraryTable.documentTitle'));
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);
  const [ownershipType, setOwnershipType] = useStoredOwnership(
    STORAGE_OWNERSHIP_KEY,
  );
  const { initialValue, storeValue } = useStoredValue(STORAGE_SEARCH_KEY);

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
    initialSearch: initialValue,
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
        title={t('libraryTable.loadError')}
        error={tableProps.error}
      />
    );
  }

  return (
    <FullPage>
      <Container style={{ height: '100%' }}>
        <Card>
          <CardHeader>
            <Header
              title={t(
                ownershipType === 'owned'
                  ? 'libraryTable.ownedTitle'
                  : 'libraryTable.allTitle',
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
              key={ownershipType}
              columnConfig={getColumns(t)}
              {...tableProps}
              pagination={{
                type: 'none',
              }}
              emptyState={emptyState(t)}
              className="denseTable"
              style={{ paddingBottom: '16px' }}
            />
          </CardBody>
        </Card>
      </Container>
    </FullPage>
  );
};
