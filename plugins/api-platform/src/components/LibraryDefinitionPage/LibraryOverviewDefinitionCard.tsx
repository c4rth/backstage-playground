import {
  TableColumn,
  Table,
  Link,
  ResponseErrorPanel,
  Page,
  Header,
  Content,
  Progress,
} from '@backstage/core-components';
import { useMemo, useState, } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Flex } from '@backstage/ui';
import { ComponentDisplayName, ComponentHeaderLabels } from "../common";
import semver from 'semver';
import {
  LibraryDefinition
} from "@internal/plugin-api-platform-common";
import { useGetLibraryVersions } from '../../hooks';
import { ComponentEntity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { apiPlatformBackendApiRef } from '../../api';
import { generateReport } from './generateReport';

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
        <ComponentDisplayName text={`${name} v${version}`} type="library" />
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

const tableOptions = {
  search: false,
  padding: 'default' as const,
  paging: false,
  draggable: false,
  thirdSortClick: false,
} as const;

const toRow = (libDef: LibraryDefinition, system: string, name: string, idx: number): TableRow => ({
  id: idx,
  version: libDef.version || '?',
  name,
  system,
  svcNumber: libDef.dependsOfCount || 0,
  entityRef: libDef.entityRef,
});

const tableTitle = (
  <Flex align="center">
    By versions
  </Flex>
);

export const LibraryOverviewDefinitionCard = () => {
  const { system, name } = useParams();
  const [generating, setGenerating] = useState(false);
  const [errorGen, setErrorGen] = useState<Error | null>(null);
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);

  const { libraryVersions, loading: versionsLoading, error } = useGetLibraryVersions(system!, name!);

  const rows = useMemo(() => libraryVersions?.map((l, idx) => toRow(l, system!, name!, idx)) ?? [], [libraryVersions, name, system]);

  const handleGenerateReport = async () => {
    setGenerating(true);
    setErrorGen(null);
    try {
      await generateReport(apiPlatformApi, name!, libraryVersions);
    } catch (errGenerate) {
      setErrorGen(errGenerate as Error);
    } finally {
      setGenerating(false);
    }
  }

  if (error || errorGen) {
    return <ResponseErrorPanel title='Error loading Services' error={error || errorGen!} />;
  }

  return (
    <Page
      themeId="libraries">
      <Header
        title={name}
        type='Library'>
        <ComponentHeaderLabels entity={{ metadata: { name, title: name } } as ComponentEntity} />
      </Header>

      <Content>
        <Flex m='4' mt='-3' style={{ justifyContent: 'end' }}>
          <Button variant='primary' onClick={handleGenerateReport}>
            Generate report
          </Button>
        </Flex>
        {generating && <Progress />}
        <Box>
          <Table<TableRow>
            isLoading={versionsLoading}
            columns={serviceColumns}
            options={tableOptions}
            title={tableTitle}
            data={rows}
          />
        </Box>
      </Content>
    </Page>
  );
};