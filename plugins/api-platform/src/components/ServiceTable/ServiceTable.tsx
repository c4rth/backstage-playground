import { TableColumn } from '@backstage/core-components';
import { ComponentChip } from '../common';
import {
  ServiceDefinition,
  ServiceEnvironmentDefinitions,
  ServiceVersionDefinition,
} from '@internal/plugin-api-platform-common';
import { Text } from '@backstage/ui';
import {
  BaseServiceTable,
  BaseTableRow,
  buildColumns,
  renderVersionList,
} from './BaseServiceTable';

type TableRow = BaseTableRow & {
  imageVersions: string[][];
};

const EMPTY_STATE_STYLE = { pointerEvents: 'none' as const };

const toRow = (
  serviceDefinition: ServiceDefinition,
  idx: number,
): TableRow => ({
  id: idx,
  name: serviceDefinition.name,
  system: serviceDefinition.system,
  serviceDefinition,
  imageVersions: serviceDefinition.versions.map(version => {
    const envs: ServiceEnvironmentDefinitions = version.environments;
    const versions: string[] = [];
    if (envs.prd) {
      versions.push(envs.prd.imageVersion);
    } else {
      versions.push('');
    }
    if (envs.ptp) {
      versions.push(envs.ptp.imageVersion);
    } else {
      versions.push('');
    }
    if (envs.uat) {
      versions.push(envs.uat.imageVersion);
    } else {
      versions.push('');
    }
    if (envs.gtu) {
      versions.push(envs.gtu.imageVersion);
    } else {
      versions.push('');
    }
    if (envs.tst) {
      versions.push(envs.tst.imageVersion);
    } else {
      versions.push('');
    }
    return versions;
  }),
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
      return envData?.imageVersion.toLowerCase().includes(lowerQuery);
    });
  },
  render: ({ serviceDefinition, imageVersions }) =>
    renderVersionList(
      serviceDefinition,
      (version: ServiceVersionDefinition, idx) => {
        const envData =
          version.environments[env as keyof typeof version.environments];
        if (!envData) {
          return (
            <div style={EMPTY_STATE_STYLE}>
              <Text variant="body-medium">-</Text>
            </div>
          );
        }
        const index = imageVersions[idx].indexOf(envData.imageVersion);
        return (
          <ComponentChip
            index={index}
            service={envData}
            link={`/api-platform/service/${serviceDefinition.system}/${serviceDefinition.serviceName}?version=${version.version}&env=${env}`}
          />
        );
      },
    ),
});

const ENV_COLUMNS: TableColumn<TableRow>[] = [
  createEnvironmentColumn('tst'),
  createEnvironmentColumn('gtu'),
  createEnvironmentColumn('uat'),
  createEnvironmentColumn('ptp'),
  createEnvironmentColumn('prd'),
];

const COLUMNS = buildColumns<TableRow>(ENV_COLUMNS);

export const ServiceTable = () => (
  <BaseServiceTable<TableRow>
    columns={COLUMNS}
    toRow={toRow}
    titleLabel="Services"
    storageOwnershipKey="servicesTablePageOwner"
    storageSearchKey="servicesTablePageSearch"
  />
);
