import {
  Content,
  Header,
  Page,
  TableColumn,
  Table,
  Link,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { AsyncEntityProvider, } from '@backstage/plugin-catalog-react';
import { useEffect, useMemo, useState, Fragment } from 'react';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { ComponentEntity, } from '@backstage/catalog-model';
import { useParams, useSearchParams } from 'react-router-dom';
import { ComponentHeaderLabels } from '../common/ComponentHeaderLabels';
import { Box, Flex, Text } from '@backstage/ui';
import { ComponentDisplayName } from "../common";
import {
  ServiceDefinition,
} from "@internal/plugin-api-platform-common";
import useAsync from 'react-use/esm/useAsync';
import { fetchAllServicesByLibrary } from './fetchServicesByLibrary';
import { ListBox, ListBoxItem } from 'react-aria-components';
import { apiPlatformBackendApiRef } from '../../api';
import { useGetLibraryVersions } from '../../hooks';

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
  minHeight: '2.5rem',
};

const EMPTY_STATE_STYLE = { pointerEvents: 'none' as const };

const renderVersionList = (serviceDefinition: ServiceDefinition, renderItem: (version: any, idx: number) => JSX.Element) => (
  <ListBox>
    {serviceDefinition.versions?.map((version, idx) => (
      <Fragment key={`${serviceDefinition.name}-${version.version}-${idx}`}>
        <ListBoxItem style={LIST_ITEM_STYLE}>{renderItem(version, idx)}</ListBoxItem>
      </Fragment>
    ))}
  </ListBox>
);

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
      const envData = version.environments[env as keyof typeof version.environments];
      return envData?.imageVersion.toLowerCase().includes(lowerQuery);
    });
  },
  render: ({ serviceDefinition }) =>
    renderVersionList(serviceDefinition, (version) =>
      env in version.environments ? (
        <div style={EMPTY_STATE_STYLE}>
          <Text variant="body-medium">{version.environments[env as keyof typeof version.environments]?.imageVersion ?? '-'}</Text>
        </div>
      ) : (
        <div style={EMPTY_STATE_STYLE}>
          <Text variant="body-medium">-</Text>
        </div>
      )
    ),
});

const serviceColumns: TableColumn<TableRow>[] = [
  {
    title: 'Name',
    width: '25%',
    field: 'name',
    highlight: true,
    defaultSort: 'asc',
    render: ({ serviceDefinition }) => (
      <Link to={`/api-platform/service/${serviceDefinition.system}/${serviceDefinition.serviceName}`}>
        <ComponentDisplayName text={serviceDefinition.serviceName} type="service" />
      </Link>
    ),
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


const tableOptions = {
  search: true,
  padding: 'dense' as const,
  paging: false,
  draggable: false,
  thirdSortClick: false,
} as const;

const toRow = (serviceDefinition: ServiceDefinition, idx: number): TableRow => ({
  id: idx,
  name: serviceDefinition.name,
  system: serviceDefinition.system,
  serviceDefinition,
});

export const LibraryVersionDefinitionCard = () => {
  const { system, name } = useParams();
  const [searchParams] = useSearchParams();
  const queryVersion = searchParams.get('version');

  const [libEntityRef, setLibEntityRef] = useState<string | null>(null);

  const catalogApi = useApi(catalogApiRef);
  const apiPlatformApi = useApi(apiPlatformBackendApiRef);

  const [libraryEntity, setLibraryEntity] = useState<ComponentEntity | undefined>(undefined);

  useEffect(() => {
    if (!name || !queryVersion) return;
    const fetchLibEntityRef = async () => {
      try {
        const libVersions = await apiPlatformApi.getLibraryVersions(system!, name!);
        const matchedVersion = libVersions.find(lv => lv.version === queryVersion);
        return matchedVersion?.entityRef;
      } catch (error) {
        return undefined;
      }
    };
    fetchLibEntityRef()
      .then((entityRef) => {
        setLibEntityRef(entityRef || null);
      });
  }, [apiPlatformApi, system, name, queryVersion]);

  useEffect(() => {
    if (!libEntityRef) return;
    catalogApi.getEntityByRef(libEntityRef)
      .then(entity => setLibraryEntity(entity as ComponentEntity));
  }, [catalogApi, libEntityRef, system, name, queryVersion]);

  const { value: allServices = [], loading: servicesLoading, error: servicesError } = useAsync(async () => {
    if (!name || !libraryEntity || !libEntityRef) return [];
    const libName = libEntityRef.replace(/^component:/, '').replace(/^default\//, '');

    const result = await fetchAllServicesByLibrary(apiPlatformApi, libName);

    return result.items;
  }, [libraryEntity, apiPlatformApi, libEntityRef]);

  const rows = useMemo(() => allServices.map(toRow), [allServices]);

  const tableTitle = useMemo(() => (
    <Flex align="center">
      Services ({rows.length})
    </Flex>
  ), [rows.length]);

  const loading = servicesLoading;
  const error = servicesError;

  if (error) {
    return <ResponseErrorPanel title='Error loading Services' error={error} />;
  }

  return (
    <AsyncEntityProvider loading={loading} error={error} entity={libraryEntity}>
      <Page
        themeId="libraries">
        <Header
          title={`${name} - v${queryVersion}`}
          type='Library'>
          <ComponentHeaderLabels entity={{ metadata: { name, title: name } } as ComponentEntity} />
        </Header>
        <Content>
          <Box mb='1'>
            <Table<TableRow>
              isLoading={loading}
              columns={serviceColumns}
              options={tableOptions}
              title={tableTitle}
              data={rows}
            />
          </Box>
        </Content>
      </Page>
    </AsyncEntityProvider>
  );
};