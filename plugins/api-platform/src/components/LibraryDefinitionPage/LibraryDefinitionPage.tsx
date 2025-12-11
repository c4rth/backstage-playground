import {
  Content,
  Header,
  Page,
  TableColumn,
  Table,
  Link,
  ResponseErrorPanel,
  Select,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { AsyncEntityProvider, CatalogApi } from '@backstage/plugin-catalog-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { ComponentEntity, Entity, parseEntityRef, RELATION_DEPENDENCY_OF } from '@backstage/catalog-model';
import { useParams, useSearchParams } from 'react-router-dom';
import { ComponentHeaderLabels } from '../common/ComponentHeaderLabels';
import { Box, Flex } from '@backstage/ui';
import { ComponentDisplayName } from "../common";
import semver from 'semver';
import {
  ANNOTATION_LIBRARY_VERSION,
  ANNOTATION_SERVICE_NAME,
  ANNOTATION_SERVICE_VERSION,
  CATALOG_METADATA_SERVICE_NAME,
  CATALOG_METADATA_SERVICE_VERSION,
  CATALOG_SPEC_LIFECYCLE,
  CATALOG_SPEC_SYSTEM
} from "@internal/plugin-api-platform-common";
import useAsync from 'react-use/esm/useAsync';
import { useGetLibraryVersions } from '../../hooks';


type TableRow = {
  readonly id: number;
  readonly libraryVersion: string;
  readonly svcName: string;
  readonly svcVersion: string;
  readonly svcEnvironment: string;
  readonly svcSystem: string;
};


const serviceColumns: TableColumn<TableRow>[] = [
  {
    title: 'Name',
    width: '50%',
    field: 'svcName',
    highlight: true,
    defaultSort: 'asc',
    render: ({ svcName, svcVersion, svcEnvironment, svcSystem }: TableRow) => (
      <Link to={`/api-platform/service/${svcSystem}/${svcName}?version=${svcVersion}&env=${svcEnvironment}`}>
        <ComponentDisplayName text={svcName} type='service' />
      </Link>
    ),
  },
  {
    title: 'Version',
    width: '10%',
    field: 'svcVersion',
    customSort: (a, b) => {
      const aValid = semver.valid(a.svcVersion);
      const bValid = semver.valid(b.svcVersion);
      if (aValid && bValid) {
        return semver.compare(a.svcVersion, b.svcVersion);
      }
      return a.svcVersion.localeCompare(b.svcVersion);
    },
  },
  {
    title: 'Environment',
    width: '10%',
    field: 'svcEnvironment',
  },
  {
    title: 'System',
    width: '10%',
    highlight: true,
    field: 'system',
    render: ({ svcSystem }: TableRow) => {
      if (svcSystem === "-") {
        return <ComponentDisplayName text={svcSystem} type="system" />;
      }
      return (
        <Link to={`/api-platform/system/${svcSystem}`} >
          <ComponentDisplayName text={svcSystem} type="system" />
        </Link >
      );
    },
  }
];

const fetchEntities = async (
  catalogApi: CatalogApi,
  entity: Entity,
): Promise<Entity[]> => {
  const relations = entity.relations?.filter(relation => relation.type === RELATION_DEPENDENCY_OF) ?? [];

  if (relations.length === 0) {
    return [];
  }

  const targetNames = relations.map(relation => parseEntityRef(relation.targetRef).name);

  const response = await catalogApi.getEntities({
    fields: [
      CATALOG_METADATA_SERVICE_NAME,
      CATALOG_METADATA_SERVICE_VERSION,
      CATALOG_SPEC_LIFECYCLE,
      CATALOG_SPEC_SYSTEM,
    ],
    filter: {
      kind: ['Component'],
      'spec.type': ['service'],
      'metadata.name': targetNames,
    },
  });

  return response.items;
};

const fetchServices = async (
  catalogApi: CatalogApi,
  libraryEntity: ComponentEntity,
): Promise<(Entity & { libVersion: string })[]> => {
  const servicePromises = libraryEntity.metadata[ANNOTATION_LIBRARY_VERSION]
    ? [libraryEntity].map(async libEntity => {
      const libVersion = libEntity.metadata[ANNOTATION_LIBRARY_VERSION]!.toString();
      try {
        const services = await fetchEntities(catalogApi, libEntity);
        return services.map(service => ({ ...service, libVersion }));
      } catch {
        // Continue even if one fails
        return [];
      }
    })
    : [];

  const serviceArrays = await Promise.all(servicePromises);
  return serviceArrays.flat();
}

const tableOptions = {
  search: true,
  padding: 'dense' as const,
  paging: false,
  draggable: false,
  thirdSortClick: false,
} as const;

const toRow = (service: Entity & { libVersion: string }, idx: number): TableRow => ({
  id: idx,
  libraryVersion: service.libVersion || '?',
  svcName: service.metadata[ANNOTATION_SERVICE_NAME]?.toString() ?? '-',
  svcVersion: service.metadata[ANNOTATION_SERVICE_VERSION]?.toString() ?? '-',
  svcEnvironment: service.spec?.lifecycle?.toString().toUpperCase() ?? '-',
  svcSystem: service.spec?.system?.toString() ?? '-',
});

export const LibraryDefinitionPage = () => {
  const { system, name } = useParams();
  const [searchParams] = useSearchParams();
  const queryVersion = searchParams.get('version');

  const { libraryVersions, loading: versionsLoading, error: errorVersions } = useGetLibraryVersions(system!, name!);
  const catalogApi = useApi(catalogApiRef);

  const versions = useMemo(
    () => libraryVersions?.map(libraryVersion => ({
      label: libraryVersion.version,
      value: libraryVersion.entityRef
    })) ?? [],
    [libraryVersions]
  );
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(undefined);
  const [libraryEntity, setLibraryEntity] = useState<ComponentEntity | undefined>(undefined);

  useEffect(() => {
    if (selectedVersion) {
      catalogApi.getEntityByRef(selectedVersion)
        .then(entity => setLibraryEntity(entity as ComponentEntity));
    }
  }, [selectedVersion, catalogApi]);

  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!selectedVersion && versions.length > 0) {
      let selVersion = null;
      if (isInitialLoad.current && queryVersion && versions.some(item => item.label === queryVersion)) {
        selVersion = versions.find(item => item.label === queryVersion)?.value;
        isInitialLoad.current = false;
      } else {
        selVersion = versions[0].value;
      }
      if (selVersion) {
        setSelectedVersion(selVersion);
      }
    }
  }, [versions, queryVersion, selectedVersion]);

  useEffect(() => {
    if (selectedVersion) {
      catalogApi.getEntityByRef(selectedVersion)
        .then(entity => setLibraryEntity(entity as ComponentEntity));
    }
  }, [selectedVersion, catalogApi]);

  const { value: allServices = [], loading: servicesLoading, error: servicesError } = useAsync(async () => {
    if (!name) return [];

    const serviceArrays = await fetchServices(catalogApi, libraryEntity!);
    return serviceArrays.flat();
  }, [libraryEntity, catalogApi]);

  const rows = useMemo(() => allServices.map(toRow), [allServices]);

  const tableTitle = useMemo(() => (
    <Flex align="center">
      Services ({rows.length})
    </Flex>
  ), [rows.length]);

  const loading = versionsLoading || servicesLoading;
  const error = errorVersions || servicesError;

  if (error) {
    return <ResponseErrorPanel title='Error loading Services' error={error} />;
  }

  return (
    <AsyncEntityProvider loading={false} entity={libraryEntity}>
      <Page
        themeId="libraries">
        <Header
          title={name}
          type='Library'>
          <ComponentHeaderLabels entity={libraryEntity ?? { metadata: { name, title: name } } as ComponentEntity} />
        </Header>

        <Content>
          <Box mb='1'>
            <Select onChange={(selected) => {
              setSelectedVersion(selected.toString());
            }} label="Versions" items={versions} selected={selectedVersion} />
          </Box>
          <Box mb='-3'>
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