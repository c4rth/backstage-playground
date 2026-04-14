import {
  TableColumn,
  Table,
  Link,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useState } from 'react';
import { Box, Button, Flex } from '@backstage/ui';
import { ComponentDisplayName } from "../common";
import semver from 'semver';
import { LibraryDefinition } from "@internal/plugin-api-platform-common";
import { useApi } from '@backstage/core-plugin-api';
import { apiPlatformBackendApiRef } from '../../api';
import { generateReport } from './generateReport';
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
    defaultSort: 'asc',
    customSort: (a, b) => {
      const aValid = semver.valid(a.version);
      const bValid = semver.valid(b.version);
      if (aValid && bValid) {
        return semver.compare(a.version, b.version);
      }
      return a.version.localeCompare(b.version);
    },
    render: ({ name, system, version }: TableRow) => (
      <Link to={`/api-platform/library/${system}/${name}?version=${version}`}>
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

const toRow = (libDef: LibraryDefinition, system: string, name: string, idx: number): TableRow => ({
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

export const LibraryVersionsCard = ({ system, name }: LibraryVersionsCardProps) => {
  const [generating, setGenerating] = useState(false);
  const [errorReport, setErrorReport] = useState<Error | null>(null);
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);

  const { libraryVersions, loading, error } = useGetLibraryVersions(system!, name!);

  const handleGenerateReport = async () => {
    setGenerating(true);
    setErrorReport(null);
    try {
      await generateReport(apiPlatformApi, name, libraryVersions);
    } catch (errGenerate) {
      setErrorReport(errGenerate as Error);
    } finally {
      setGenerating(false);
    }
  };

  if (error || errorReport) {
    return <ResponseErrorPanel title='Error loading Library Versions' error={error || errorReport!} />;
  }

  const rows = libraryVersions?.map((l, idx) => toRow(l, system, name, idx)) ?? [];

  return (
    <Box>
      <Flex mb='4' mt='-3' style={{ justifyContent: 'end' }}>
        <Button
          style={{ backgroundColor: 'var(--bui-fg-info)' }}
          onClick={handleGenerateReport}
          isDisabled={generating}>
          Generate report
        </Button>
      </Flex>
      {generating && <Progress />}
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
          title={
            <Flex align="center">
              Versions
            </Flex>
          }
          data={rows}
        />
      </Box>
    </Box>
  );
};
