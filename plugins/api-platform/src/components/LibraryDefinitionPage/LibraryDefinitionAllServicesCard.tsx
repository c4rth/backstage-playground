import { ResponseErrorPanel } from '@backstage/core-components';
import useAsync from 'react-use/esm/useAsync';
import { useMemo, useState } from 'react';
import {
  Box,
  Text,
  ColumnConfig,
  Table,
  useTable,
  Column,
  SearchField,
} from '@backstage/ui';
import {
  LibraryDefinition,
  ServiceDefinition,
  DependentsType,
} from '@internal/plugin-api-platform-common';
import { useApi } from '@backstage/core-plugin-api';
import { apiPlatformBackendApiRef } from '../../plugin';
import { fetchAllServices } from './fetchServicesByLibrary';
import { ComponentChip } from '../common';
import { useGetLibraryVersions } from '../..';
import { DependentsToggle } from '../common';
import { BaseTableRow, buildColumns, renderVersionList } from '../ServiceTable';
import { EntityInfoCard } from '@backstage/plugin-catalog-react';
import { Progress } from '@backstage/frontend-plugin-api';

type TableRow = BaseTableRow;

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
  cell: ({ serviceDefinition }) =>
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
      return <ComponentChip index={index} text={dependencies.join(', ')} />;
    }),
});

const ENV_COLUMNS: ColumnConfig<TableRow>[] = [
  createEnvironmentColumn('tst'),
  createEnvironmentColumn('gtu'),
  createEnvironmentColumn('uat'),
  createEnvironmentColumn('ptp'),
  createEnvironmentColumn('prd'),
];

const COLUMNS = buildColumns<TableRow>(ENV_COLUMNS);

const toRow = (
  libraryVersions: LibraryDefinition[],
  libraryVersionIndex: Map<string, number>,
  serviceDefinition: ServiceDefinition,
  idx: number,
  libraryName: string,
): TableRow => {
  const regexp = new RegExp(`.*${libraryName}-v`);
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
                version: lib?.version || dep.replace(regexp, '').trim(),
                index: lib ? (libraryVersionIndex.get(lib.version) ?? -1) : -1,
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
  version?: string;
  componentName?: string;
}

type LibraryDefinitionAllServiceTableProps = {
  title: string;
  rows: TableRow[];
  version?: string;
  selectedDependency: DependentsType;
  setSelectedDependency: (type: DependentsType) => void;
};

const LibraryDefinitionAllServiceTable = ({
  title,
  rows,
  version,
  selectedDependency,
  setSelectedDependency,
}: LibraryDefinitionAllServiceTableProps) => {
  const { tableProps, search } = useTable({
    mode: 'complete',
    getData: () => rows,
    initialSort: {
      column: 'name',
      direction: 'ascending',
    },
    paginationOptions: {
      type: 'none',
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
    searchFn: (items, query) => {
      const lowerQuery = query.toLowerCase();
      return items.filter(item => {
        return (
          item.name.toLowerCase().includes(lowerQuery) ||
          item.system.toLowerCase().includes(lowerQuery) ||
          item.serviceDefinition.versions.some(version => {
            return Object.values(version.environments).some(envData => {
              return envData?.dependencies
                ?.join(', ')
                .toLowerCase()
                .includes(lowerQuery);
            });
          })
        );
      });
    },
  });

  return (
    <EntityInfoCard
      title={title}
      headerActions={
        <>
          {!version && (
              <DependentsToggle
                handleDependentChange={type => setSelectedDependency(type)}
                selectedType={selectedDependency}
              />
          )}
          <Box style={{ marginLeft: 'auto', width: '250px' }}>
            <SearchField
              placeholder="Filter..."
              value={search.value}
              onChange={str => {
                search.onChange(str);
              }}
              aria-label="Filter"
            />
          </Box>
        </>
      }
    >
      <Box>
        <Table
          columnConfig={COLUMNS}
          {...tableProps}
          pagination={{
            type: 'none',
          }}
          emptyState={<div>No data available</div>}
          className="denseTable"
        />
      </Box>
    </EntityInfoCard>
  );
};

export const LibraryDefinitionAllServicesCard = ({
  system,
  name,
  version,
  componentName,
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

  const title = version
    ? `Services depending on ${name} ${version}`
    : 'All services';

  const rows = useMemo(() => {
    if (!libraryVersions) return [];

    const libraryVersionIndex = new Map(
      libraryVersions.map((libraryVersion, idx) => [
        libraryVersion.version,
        idx,
      ]),
    );

    const serviceHasDependency = (
      service: ServiceDefinition,
      dependencyName: string,
    ) =>
      service.versions.some(v =>
        Object.values(v.environments).some(env =>
          env?.dependencies?.some((dep: string) =>
            dep.includes(dependencyName),
          ),
        ),
      );

    const hasLibraryDependency = (service: ServiceDefinition) =>
      serviceHasDependency(service, name);

    let filtered = allServices;
    if (selectedDependency === 'yes') {
      filtered = allServices.filter(hasLibraryDependency);
    } else if (selectedDependency === 'no') {
      filtered = allServices.filter(s => !hasLibraryDependency(s));
    }

    if (version && componentName) {
      filtered = filtered.filter(service =>
        serviceHasDependency(service, componentName),
      );
    }

    return filtered.map((service, idx) =>
      toRow(libraryVersions, libraryVersionIndex, service, idx, name),
    );
  }, [
    allServices,
    name,
    selectedDependency,
    libraryVersions,
    version,
    componentName,
  ]);

  if (loading || loadingLibVersions) {
    return <Progress />;
  }

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
    <LibraryDefinitionAllServiceTable
      key={`${name}-${selectedDependency}-${rows.length}`}
      title={title}
      rows={rows}
      version={version}
      selectedDependency={selectedDependency}
      setSelectedDependency={setSelectedDependency}
    />
  );
};
