import {
  TableColumn,
  Table,
  Link,
  ResponseErrorPanel,
} from '@backstage/core-components';
import useAsync from 'react-use/esm/useAsync';
import { useState } from 'react';
import { Box, Flex, Text } from '@backstage/ui';
import { ListBox, ListBoxItem,  } from 'react-aria-components';
import { ComponentDisplayName } from "../common";
import {
  LibraryDefinition,
  ServiceDefinition
} from "@internal/plugin-api-platform-common";
import { useApi } from '@backstage/core-plugin-api';
import { apiPlatformBackendApiRef } from '../../api';
import { fetchAllServices } from './fetchServicesByLibrary';
import { ComponentChip } from '../common';
import { useGetLibraryVersions } from '../..';
import { DependentsToggle } from './DependtsToggle';

type TableRow = {
  id: number;
  name: string;
  system: string;
  serviceDefinition: ServiceDefinition;
};

const LIST_ITEM_STYLE = {
  margin: 2,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '2.5rem'
};

const renderVersionList = (serviceDefinition: ServiceDefinition, renderItem: (version: any, idx: number) => JSX.Element) => (
  <ListBox>
    {serviceDefinition.versions?.map((version, idx) => (
      <ListBoxItem key={`${serviceDefinition.name}-${version.version}-${idx}`} style={LIST_ITEM_STYLE}>
        {renderItem(version, idx)}
      </ListBoxItem>
    ))}
  </ListBox>
);

const createEnvironmentColumn = (env: string): TableColumn<TableRow> => ({
  title: env.toUpperCase(),
  width: '12%',
  align: 'center',
  cellStyle: { padding: 0 },
  sorting: false,
  render: ({ serviceDefinition }) =>
    renderVersionList(serviceDefinition, (version) => {
      const envData = version.environments[env as keyof typeof version.environments] as any;
      const dependencies = envData?.dependencies || [];
      const dependencyIndexes = envData?.dependencyIndexes || [];

      if (!dependencies.length) {
        return <Text variant="body-medium">-</Text>;
      }

      return (
        <ComponentChip
          index={dependencyIndexes[0] >= 0 ? dependencyIndexes[0] * 2 : 0}
          text={dependencies.join(', ')}
          clickable={false}
          backgroundColor='#2196F3'
        />
      );
    }),
  searchable: true,
  customFilterAndSearch: (query, row) => {
    if (!row.serviceDefinition?.versions) return false;
    const lowerQuery = query.toLowerCase();
    return row.serviceDefinition.versions.some(version => {
      const envData = version.environments[env as keyof typeof version.environments];
      return envData?.dependencies?.join(', ').toLowerCase().includes(lowerQuery);
    });
  },
});

const serviceColumns: TableColumn<TableRow>[] = [
  {
    title: 'Name',
    width: '25%',
    field: 'serviceDefinition.serviceName',
    highlight: true,
    defaultSort: 'asc',
    render: ({ serviceDefinition }) => (
      <Link to={`/api-platform/service/${serviceDefinition.system}/${serviceDefinition.serviceName}`}>
        <ComponentDisplayName text={serviceDefinition.serviceName} type="service" />
      </Link>
    ),
  },
  {
    title: 'Service Version',
    width: '5%',
    field: 'version',
    sorting: false,
    align: 'center',
    cellStyle: { padding: 0 },
    render: ({ serviceDefinition }) =>
      renderVersionList(serviceDefinition, (version, idx) => (
        <ComponentChip
          index={idx}
          text={version.version}
          clickable={false}
        />
      )),
  },
  createEnvironmentColumn('tst'),
  createEnvironmentColumn('gtu'),
  createEnvironmentColumn('uat'),
  createEnvironmentColumn('ptp'),
  createEnvironmentColumn('prd'),
  {
    title: 'System',
    width: '10%',
    highlight: true,
    field: 'system',
    render: ({ serviceDefinition }) => (
      <Link to={`/api-platform/system/${serviceDefinition.system}`}>
        <ComponentDisplayName text={serviceDefinition.system} type="system" />
      </Link>
    ),
  },
];

const toRow = (libraryVersions: LibraryDefinition[], serviceDefinition: ServiceDefinition, idx: number, libraryName: string): TableRow => {
  const versions = serviceDefinition.versions.map(version => ({
    ...version,
    environments: Object.fromEntries(
      Object.entries(version.environments).map(([key, data]) => {
        if (!data) return [key, data];

        const filtered = data.dependencies
          ?.filter((dep: string) => dep.includes(libraryName))
          .map(dep => {
            const lib = libraryVersions.find(lv => dep.includes(lv.version));
            return {
              version: lib?.version || dep,
              index: lib ? libraryVersions.indexOf(lib) : -1
            };
          }) || [];

        return [key, {
          ...data,
          dependencies: filtered.map(d => d.version),
          dependencyIndexes: filtered.map(d => d.index)
        } as any];
      })
    ) as typeof version.environments
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

export const LibraryServicesCard = ({ system, name }: LibraryServicesCardProps) => {
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);
  const [selectedDependency, setSelectedDependency] = useState('all');

  const { libraryVersions, loading: loadingLibVersions, error: errorLibVersion } = useGetLibraryVersions(system!, name!, false);

  const { value: allServices = [], loading, error } = useAsync(async () => {
    if (!name) return [];
    const result = await fetchAllServices(apiPlatformApi);
    return result.items;
  }, [apiPlatformApi, name]);

  if (error || errorLibVersion) {
    return <ResponseErrorPanel title='Error loading Library Versions' error={error || errorLibVersion!} />;
  }

  if (!libraryVersions) return null;

  const hasLibraryDependency = (service: ServiceDefinition) =>
    service.versions.some(version =>
      Object.values(version.environments).some(env =>
        env?.dependencies?.some((dep: string) => dep.includes(name))
      )
    );

  let filtered = allServices;
  if (selectedDependency === 'depends') {
    filtered = allServices.filter(hasLibraryDependency);
  } else if (selectedDependency === 'no') {
    filtered = allServices.filter(s => !hasLibraryDependency(s));
  }

  const rows = filtered.map((service, idx) => toRow(libraryVersions, service, idx, name));

  return (
    <>
      <Box mb='4'>
        <DependentsToggle handleDependentChange={(type) => setSelectedDependency(type)} />
      </Box>
      <Box>
        <Table<TableRow>
          isLoading={loading || loadingLibVersions}
          columns={serviceColumns}
          options={{
            search: true,
            padding: 'dense' as const,
            paging: false,
            draggable: false,
            thirdSortClick: false,
          }}
          title={
            <Flex align="center">
              Versions by services
            </Flex>
          }
          data={rows}
        />
      </Box>
    </>
  );
};
