import {
  TableColumn,
  Table,
  Link,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { Box, Flex } from '@backstage/ui';
import { ComponentDisplayName } from '../common';
import semver from 'semver';
import { LibraryDefinition } from '@internal/plugin-api-platform-common';
import { useGetLibraryVersions } from '../..';

type TableRow = {
  readonly id: number;
  readonly version: string;
  readonly name: string;
  readonly system: string;
  readonly svcNumber: number;
  readonly entityRef: string;
};

const serviceColumns: TableColumn<TableRow>[] = [
  {
    title: 'Version',
    width: '50%',
    field: 'libraryVersion',
    highlight: true,
    defaultSort: 'desc',
    customSort: (a, b) => {
      const aValid = semver.valid(a.version);
      const bValid = semver.valid(b.version);
      if (aValid && bValid) {
        return semver.compare(a.version, b.version);
      }
      return a.version.localeCompare(b.version);
    },
    render: ({ version, entityRef }: TableRow) => (
      <Link
        to={`/catalog/default/component/${entityRef.replace(/^component:default\//, '')}`}
      >
        <ComponentDisplayName text={`${version}`} type="library" />
      </Link>
    ),
  },
  {
    title: 'Used by # Services',
    width: '50%',
    field: 'svcNumber',
    sorting: false,
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

export const LibraryDefinitionVersionsCard = ({
  system,
  name,
}: LibraryVersionsCardProps) => {
  const { libraryVersions, loading, error } = useGetLibraryVersions(
    system!,
    name!,
  );

  if (error) {
    return (
      <ResponseErrorPanel
        title="Error loading Library Versions"
        error={error!}
      />
    );
  }

  const rows =
    libraryVersions?.map((l, idx) => toRow(l, system, name, idx)) ?? [];

  return (
    <Box>
      <Box>
        <Table<TableRow>
          isLoading={loading}
          columns={serviceColumns}
          options={{
            search: false,
            padding: 'dense' as const,
            paging: false,
            draggable: false,
            thirdSortClick: false,
          }}
          title={<Flex align="center">Versions</Flex>}
          data={rows}
        />
      </Box>
    </Box>
  );
};
