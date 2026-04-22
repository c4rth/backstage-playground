import {
  TableColumn,
  Table,
  ResponseErrorPanel,
} from '@backstage/core-components';
import useAsync from 'react-use/esm/useAsync';
import { useMemo, useState } from 'react';
import { Box, Flex, Text } from '@backstage/ui';
import {
  LibraryDefinition,
  ServiceDefinition,
} from '@internal/plugin-api-platform-common';
import { useApi } from '@backstage/core-plugin-api';
import { apiPlatformBackendApiRef } from '../../api';
import { fetchAllServices } from './fetchServicesByLibrary';
import { ComponentChip } from '../common';
import { useGetLibraryVersions } from '../..';
import { DependentsToggle, DependentsType } from './DependentsToggle';
import {
  BaseTableRow,
  buildColumns,
  renderVersionList,
} from '../ServiceTable';

type TableRow = BaseTableRow;

const createEnvironmentColumn = (env: string): TableColumn<TableRow> => ({
  title: env.toUpperCase(),
  width: '12%',
  align: 'center',
  cellStyle: { padding: 0 },
  sorting: false,
  render: ({ serviceDefinition }) =>
    renderVersionList(serviceDefinition, version => {
      const envData = version.environments[
        env as keyof typeof version.environments
      ] as any;
      const dependencies = envData?.dependencies || [];
      const dependencyIndexes = envData?.dependencyIndexes || [];

      if (!dependencies.length) {
        return <Text variant="body-medium">-</Text>;
      }
      const index =
        (dependencyIndexes[0] >= 0 ? dependencyIndexes[0] + 1 : 0) * 2;
      return (
        <ComponentChip
          index={index}
          text={dependencies.join(', ')}
        />
      );
    }),
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
});

const ENV_COLUMNS: TableColumn<TableRow>[] = [
  createEnvironmentColumn('tst'),
  createEnvironmentColumn('gtu'),
  createEnvironmentColumn('uat'),
  createEnvironmentColumn('ptp'),
  createEnvironmentColumn('prd'),
];

const COLUMNS = buildColumns<TableRow>(ENV_COLUMNS);

const toRow = (
  libraryVersions: LibraryDefinition[],
  serviceDefinition: ServiceDefinition,
  idx: number,
  libraryName: string,
): TableRow => {
  const versions = serviceDefinition.versions.map(version => ({
    ...version,
    environments: Object.fromEntries(
      Object.entries(version.environments).map(([key, data]) => {
        if (!data) return [key, data];

        const filtered =
          data.dependencies
            ?.filter((dep: string) => dep.includes(libraryName))
            .map(dep => {
              const lib = libraryVersions.find(lv => dep.includes(lv.version));
              return {
                version: lib?.version || dep,
                index: lib ? libraryVersions.indexOf(lib) : -1,
              };
            }) || [];

        return [
          key,
          {
            ...data,
            dependencies: filtered.map(d => d.version),
            dependencyIndexes: filtered.map(d => d.index),
          } as any,
        ];
      }),
    ) as typeof version.environments,
  }));

  return {
    id: idx,
    name: serviceDefinition.name,
    system: serviceDefinition.system,
    serviceDefinition: { ...serviceDefinition, versions },
  };
};

interface LibraryServicesCardProps {
  system: string;
  name: string;
}

export const LibraryDefinitionServicesCard = ({
  system,
  name,
}: LibraryServicesCardProps) => {
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);
  const [selectedDependency, setSelectedDependency] =
    useState<DependentsType>('all');

  const {
    libraryVersions,
    loading: loadingLibVersions,
    error: errorLibVersion,
  } = useGetLibraryVersions(system!, name!, false);

  const {
    value: allServices = [],
    loading,
    error,
  } = useAsync(async () => {
    if (!name) return [];
    const result = await fetchAllServices(apiPlatformApi);
    return result.items;
  }, [apiPlatformApi, name]);

  const rows = useMemo(() => {
    if (!libraryVersions) return [];

    const hasLibraryDependency = (service: ServiceDefinition) =>
      service.versions.some(version =>
        Object.values(version.environments).some(env =>
          env?.dependencies?.some((dep: string) => dep.includes(name)),
        ),
      );

    let filtered = allServices;
    if (selectedDependency === 'yes') {
      filtered = allServices.filter(hasLibraryDependency);
    } else if (selectedDependency === 'no') {
      filtered = allServices.filter(s => !hasLibraryDependency(s));
    }

    return filtered.map((service, idx) =>
      toRow(libraryVersions, service, idx, name),
    );
  }, [allServices, name, selectedDependency, libraryVersions]);

  if (error || errorLibVersion) {
    return (
      <ResponseErrorPanel
        title="Error loading Library Versions"
        error={error || errorLibVersion!}
      />
    );
  }

  if (!libraryVersions) return null;

  return (
    <>
      <Box mb="4">
        <DependentsToggle
          handleDependentChange={type => setSelectedDependency(type)}
        />
      </Box>
      <Box>
        <Table<TableRow>
          isLoading={loading || loadingLibVersions}
          columns={COLUMNS}
          options={{
            search: true,
            padding: 'dense' as const,
            draggable: false,
            thirdSortClick: false,
            pageSize: 20,
            pageSizeOptions: [10, 20, 50],
          }}
          title={<Flex align="center">Versions by services</Flex>}
          data={rows}
        />
      </Box>
    </>
  );
};
