import { ResponseErrorPanel } from '@backstage/core-components';
import { Cell, ColumnConfig, Table, useTable, CellText } from '@backstage/ui';
import { LinkComponentDisplayName } from '@internal/plugin-components-react';
import semver from 'semver';
import { LibraryDefinition } from '@internal/plugin-api-platform-common';
import { useGetLibraryVersions } from '../..';
import { EntityInfoCard } from '@backstage/plugin-catalog-react';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import {
  apiPlatformTranslationRef,
  ApiPlatformTranslator,
} from '../../translation';

type TableRow = {
  readonly id: number;
  readonly version: string;
  readonly name: string;
  readonly system: string;
  readonly svcNumber: number;
  readonly entityRef: string;
};

const getColumns = (t: ApiPlatformTranslator): ColumnConfig<TableRow>[] => [
  {
    label: t('table.columns.version'),
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
    label: t('table.columns.services'),
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
  const { t } = useTranslationRef(apiPlatformTranslationRef);
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
    <EntityInfoCard title={title}>
      <Table
        columnConfig={getColumns(t)}
        {...tableProps}
        pagination={{
          type: 'none',
        }}
        emptyState={<div>{t('table.empty')}</div>}
        className="denseTable"
      />
    </EntityInfoCard>
  );
};

export const LibraryDefinitionVersionsCard = ({
  system,
  name,
}: LibraryVersionsCardProps) => {
  const { t } = useTranslationRef(apiPlatformTranslationRef);
  const { libraryVersions, error } = useGetLibraryVersions(system!, name!);

  const rows =
    libraryVersions?.map((l, idx) => toRow(l, system, name, idx)) ?? [];

  if (error) {
    return (
      <ResponseErrorPanel
        title={t('libraryDefinition.versionsError')}
        error={error}
      />
    );
  }

  return (
    <LibraryVersionsTable
      key={`lib-${name}-${rows.length}`}
      title={t('libraryDefinition.versions', { total: String(rows.length) })}
      rows={rows}
    />
  );
};
