import { ComponentChip } from '../common';
import {
  ServiceDefinition,
  ServiceEnvironmentDefinitions,
  ServiceVersionDefinition,
} from '@internal/plugin-api-platform-common';
import { ColumnConfig, Text, Column } from '@backstage/ui';
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

const createEnvironmentColumn = (env: string): ColumnConfig<TableRow> => ({
  id: env,
  label: env.toUpperCase(),
  width: '12%',
  isSortable: false,
  header: () => (
    <Column id={env} className="centered-col-header">
      <Text weight="bold">{env.toUpperCase()}</Text>
    </Column>
  ),
  cell: ({ serviceDefinition, imageVersions }) =>
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

const ENV_COLUMNS: ColumnConfig<TableRow>[] = [
  createEnvironmentColumn('tst'),
  createEnvironmentColumn('gtu'),
  createEnvironmentColumn('uat'),
  createEnvironmentColumn('ptp'),
  createEnvironmentColumn('prd'),
];

const COLUMNS = buildColumns<TableRow>(ENV_COLUMNS);

export const ServiceTable = () => (
  <>
    <BaseServiceTable<TableRow>
      columns={COLUMNS}
      toRow={toRow}
      storageOwnershipKey="servicesTablePageOwner"
      storageSearchKey="servicesTablePageSearch"
    />
  </>
);
