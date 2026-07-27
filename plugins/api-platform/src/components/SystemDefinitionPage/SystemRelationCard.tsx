import { EntityInfoCard } from '@backstage/plugin-catalog-react';
import { Link, useTable, ColumnConfig, Cell, Text, Table } from '@backstage/ui';
import { ComponentDisplayName } from '@internal/plugin-api-platform-react';

type TableRow = {
  id: number;
  name: string;
  system: string;
};

const apiColumns: ColumnConfig<TableRow>[] = [
  {
    label: 'Name',
    width: '100%',
    id: 'name',
    isRowHeader: true,
    cell: ({ name, system }: TableRow) => (
      <Cell>
        <Text weight="bold">
          <Link
            href={`/api-platform/api/${system}/${name}`}
            weight="bold"
            color="info"
            standalone
          >
            <ComponentDisplayName type="api" text={name} />
          </Link>
        </Text>
      </Cell>
    ),
  },
];

const serviceColumns: ColumnConfig<TableRow>[] = [
  {
    label: 'Name',
    width: '100%',
    id: 'name',
    isRowHeader: true,
    cell: ({ name, system }: TableRow) => (
      <Cell>
        <Text weight="bold">
          <Link
            href={`/api-platform/service/${system}/${name}`}
            weight="bold"
            color="info"
            standalone
          >
            <ComponentDisplayName type="service" text={name} />
          </Link>
        </Text>
      </Cell>
    ),
  },
];

const libraryColumns: ColumnConfig<TableRow>[] = [
  {
    label: 'Name',
    width: '100%',
    id: 'name',
    isRowHeader: true,
    cell: ({ name, system }: TableRow) => (
      <Cell>
        <Text weight="bold">
          <Link
            href={`/api-platform/library/${system}/${name}`}
            weight="bold"
            color="info"
            standalone
          >
            <ComponentDisplayName type="library" text={name} />
          </Link>
        </Text>
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
  let columns: ColumnConfig<TableRow>[];
  let title: string;

  if (dependency === 'api') {
    columns = apiColumns;
    title = 'APIs';
  } else if (dependency === 'library') {
    columns = libraryColumns;
    title = 'Libraries';
  } else {
    columns = serviceColumns;
    title = 'Services';
  }

  const rows = data.map((item, idx) => toRow(item, idx, system));

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
    <EntityInfoCard
      title={`${title} (${rows.length})`}
    >
      <Table
        columnConfig={columns}
        {...tableProps}
        className="denseTable"
        emptyState={`No ${title.toLowerCase()} found for this system.`}
      />
    </EntityInfoCard>
  );
};
