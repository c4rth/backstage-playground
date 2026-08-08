import { ResponseErrorPanel } from '@backstage/core-components';
import { Cell, ColumnConfig, Table, useTable, CellText } from '@backstage/ui';
import { LinkComponentDisplayName, Progress } from '@internal/plugin-components-react';
import semver from 'semver';
import { LibraryDefinition } from '@internal/plugin-api-platform-common';
import { useGetLibraryVersions } from '../..';
import { EntityInfoCard } from '@backstage/plugin-catalog-react';

type TableRow = {
  readonly id: number;
  readonly version: string;
  readonly name: string;
  readonly system: string;
  readonly svcNumber: number;
  readonly entityRef: string;
};

const columns: ColumnConfig<TableRow>[] = [
  {
    label: 'Version',
    width: '50%',
    id: 'libraryVersion',
    isRowHeader: true,
    isSortable: true,
    cell: ({ system, name, version }: TableRow) => (
      <Cell>
        <LinkComponentDisplayName
          href={`/api-platform/library/${system}/${name}?version=${version}`}
          text={version}
          type="library"
        />
      </Cell>
    ),
  },
  {
    label: 'Used by # Services',
    width: '50%',
    id: 'svcNumber',
    cell: ({ svcNumber }: TableRow) => <CellText title={`${svcNumber}`} />,
  },
];

const toRow = (
  libDef: LibraryDefinition,
  system: string,
  name: string,
  idx: number,
): TableRow => ({
  id: idx,
  version: libDef.version || '?',
  name,
  system,
  svcNumber: libDef.dependsOfCount || 0,
  entityRef: libDef.entityRef,
});

interface LibraryVersionsCardProps {
  system: string;
  name: string;
}

type LibraryVersionsTableProps = {
  readonly title: string;
  readonly rows: TableRow[];
};

const LibraryVersionsTable = ({ title, rows }: LibraryVersionsTableProps) => {
  const { tableProps } = useTable({
    mode: 'complete',
    getData: () => rows,
    initialSort: {
      column: 'libraryVersion',
      direction: 'descending',
    },
    paginationOptions: {
      type: 'none',
    },
    sortFn: (items, { direction }) => {
      const desc = direction === 'descending' ? -1 : 1;
      return [...items].sort((a, b) => {
        const aValid = semver.valid(a.version);
        const bValid = semver.valid(b.version);
        if (aValid && bValid) {
          return desc * semver.compare(a.version, b.version);
        }
        return desc * a.version.localeCompare(b.version);
      });
    },
  });

  return (
    <EntityInfoCard title={`${title} (${rows.length})`}>
      <Table
        columnConfig={columns}
        {...tableProps}
        pagination={{
          type: 'none',
        }}
        emptyState={<div>No data available</div>}
        className="denseTable"
      />
    </EntityInfoCard>
  );
};

export const LibraryDefinitionVersionsCard = ({
  system,
  name,
}: LibraryVersionsCardProps) => {
  const { libraryVersions, loading, error } = useGetLibraryVersions(
    system!,
    name!,
  );

  const rows =
    libraryVersions?.map((l, idx) => toRow(l, system, name, idx)) ?? [];

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return (
      <ResponseErrorPanel
        title="Error loading Library Versions"
        error={error}
      />
    );
  }

  return (
    <LibraryVersionsTable
      key={`lib-${name}-${rows.length}`}
      title="Library Versions"
      rows={rows}
    />
  );
};
