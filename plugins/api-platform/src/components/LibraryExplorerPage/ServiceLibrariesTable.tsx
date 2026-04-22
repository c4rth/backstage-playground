import { TableColumn } from '@backstage/core-components';
import { ComponentChip } from '../common';
import { ServiceDefinition } from '@internal/plugin-api-platform-common';
import { Flex, Text } from '@backstage/ui';
import {
  BaseServiceTable,
  BaseTableRow,
  buildColumns,
  renderVersionList,
} from '../ServiceTable';

type TableRow = BaseTableRow;

const toRow = (
  serviceDefinition: ServiceDefinition,
  idx: number,
): TableRow => ({
  id: idx,
  name: serviceDefinition.name,
  system: serviceDefinition.system,
  serviceDefinition,
});

const createEnvironmentColumn = (env: string): TableColumn<TableRow> => ({
  title: env.toUpperCase(),
  width: '12%',
  align: 'center',
  cellStyle: { padding: 0 },
  sorting: false,
  searchable: true,
  customFilterAndSearch: (query, row) => {
    if (!row.serviceDefinition?.versions) return false;
    const lowerQuery = query.toLowerCase();
    return row.serviceDefinition.versions.some(version => {
      const envData =
        version.environments[env as keyof typeof version.environments];
      return envData?.dependencies
        ?.join(', ')
        .toLowerCase()
        .includes(lowerQuery);
    });
  },
  render: ({ serviceDefinition }) =>
    renderVersionList(serviceDefinition, version => {
      const envData = version.environments[
        env as keyof typeof version.environments
      ] as any;
      const dependencies = envData?.dependencies || [];

      if (!dependencies.length) {
        return <Text variant="body-medium">-</Text>;
      }
      return (
        <Flex direction="column" align="center" gap="0.5">
          {dependencies.map((dep: string, i: number) => (
            <ComponentChip key={dep} index={i} text={dep} />
          ))}
        </Flex>
      );
    }),
});

const ENV_COLUMNS: TableColumn<TableRow>[] = [
  createEnvironmentColumn('tst'),
  createEnvironmentColumn('gtu'),
  createEnvironmentColumn('uat'),
  createEnvironmentColumn('ptp'),
  createEnvironmentColumn('prd'),
];

const COLUMNS = buildColumns<TableRow>(ENV_COLUMNS);

export const ServiceLibrariesTable = () => (
  <BaseServiceTable<TableRow>
    columns={COLUMNS}
    toRow={toRow}
    titleLabel="Services - Libraries"
    storageOwnershipKey="serviceLibrariesTablePageOwner"
    storageSearchKey="serviceLibrariesTablePageSearch"
  />
);
