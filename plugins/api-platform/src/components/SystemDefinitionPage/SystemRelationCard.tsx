import { EntityInfoCard } from '@backstage/plugin-catalog-react';
import { useTable, ColumnConfig, Cell, Table } from '@backstage/ui';
import { LinkComponentDisplayName } from '@internal/plugin-components-react';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import {
  apiPlatformTranslationRef,
  ApiPlatformTranslator,
} from '../../translation';

type TableRow = {
  id: number;
  name: string;
  system: string;
};

const getApiColumns = (t: ApiPlatformTranslator): ColumnConfig<TableRow>[] => [
  {
    label: t('table.columns.name'),
    width: '100%',
    id: 'name',
    isRowHeader: true,
    cell: ({ name, system }: TableRow) => (
      <Cell>
        <LinkComponentDisplayName
          href={`/api-platform/api/${system}/${name}`}
          text={name}
          type="api"
        />
      </Cell>
    ),
  },
];

const getServiceColumns = (
  t: ApiPlatformTranslator,
): ColumnConfig<TableRow>[] => [
  {
    label: t('table.columns.name'),
    width: '100%',
    id: 'name',
    isRowHeader: true,
    cell: ({ name, system }: TableRow) => (
      <Cell>
        <LinkComponentDisplayName
          href={`/api-platform/service/${system}/${name}`}
          text={name}
          type="service"
        />
      </Cell>
    ),
  },
];

const getLibraryColumns = (
  t: ApiPlatformTranslator,
): ColumnConfig<TableRow>[] => [
  {
    label: t('table.columns.name'),
    width: '100%',
    id: 'name',
    isRowHeader: true,
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
];

const toRow = (item: string, idx: number, system: string): TableRow => ({
  id: idx,
  name: item,
  system,
});

interface SystemPlatformRelationCardProps {
  system: string;
  dependency: 'api' | 'service' | 'library';
  data: string[];
}

export const SystemRelationCard = ({
  system,
  dependency,
  data,
}: SystemPlatformRelationCardProps) => {
  const { t } = useTranslationRef(apiPlatformTranslationRef);
  const rows = data.map((item, idx) => toRow(item, idx, system));
  let columns: ColumnConfig<TableRow>[];
  let title: string;
  let empty: string;

  if (dependency === 'api') {
    columns = getApiColumns(t);
    title = t('systemRelations.apis', { total: String(rows.length) });
    empty = t('systemRelations.noApis');
  } else if (dependency === 'library') {
    columns = getLibraryColumns(t);
    title = t('systemRelations.libraries', { total: String(rows.length) });
    empty = t('systemRelations.noLibraries');
  } else {
    columns = getServiceColumns(t);
    title = t('systemRelations.services', { total: String(rows.length) });
    empty = t('systemRelations.noServices');
  }

  const { tableProps } = useTable({
    mode: 'complete',
    data: rows,
    paginationOptions: {
      type: 'none',
    },
    initialSort: {
      column: 'name',
      direction: 'ascending',
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

  return (
    <EntityInfoCard title={title}>
      <Table
        columnConfig={columns}
        {...tableProps}
        className="denseTable"
        emptyState={empty}
      />
    </EntityInfoCard>
  );
};
