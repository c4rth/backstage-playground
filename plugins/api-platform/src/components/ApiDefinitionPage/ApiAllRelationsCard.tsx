import { Link, ResponseErrorPanel, Table, TableColumn } from "@backstage/core-components";
import { Entity, parseEntityRef, RELATION_API_CONSUMED_BY, RELATION_API_PROVIDED_BY } from "@backstage/catalog-model";
import { CatalogApi, catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import { useApi } from "@backstage/core-plugin-api";
import useAsync from 'react-use/esm/useAsync';
import {
  ANNOTATION_API_NAME,
  ANNOTATION_API_VERSION,
  ANNOTATION_SERVICE_NAME,
  ANNOTATION_SERVICE_VERSION,
  CATALOG_METADATA_SERVICE_NAME,
  CATALOG_METADATA_SERVICE_VERSION,
  CATALOG_SPEC_LIFECYCLE,
  CATALOG_SPEC_SYSTEM
} from "@internal/plugin-api-platform-common";
import { useGetApiVersions } from "../../hooks";
import semver from 'semver';
import { ComponentDisplayName } from "../common";
import { Flex } from '@backstage/ui';

type TableRow = {
  readonly id: number;
  readonly apiVersion: string;
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
    render: ({ svcName, svcVersion, svcEnvironment, svcSystem }: TableRow) => (
      <Link to={`/api-platform/service/${svcSystem}/${svcName}?version=${svcVersion}&env=${svcEnvironment}`}>
        <ComponentDisplayName text={svcName} type='service' />
      </Link>
    ),
  },
  {
    title: 'API Version',
    width: '20%',
    field: 'apiVersion',
    defaultSort: 'asc',
    customSort: (a, b) => {
      const aValid = semver.valid(a.apiVersion);
      const bValid = semver.valid(b.apiVersion);
      if (aValid && bValid) {
        return semver.compare(a.apiVersion, b.apiVersion);
      }
      return a.apiVersion.localeCompare(b.apiVersion);
    },
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
    render: ({ svcSystem }: TableRow) =>
      svcSystem === "-" ? (
        <ComponentDisplayName text={svcSystem} type="system" />
      ) : (
        <Link to={`/api-platform/system/${svcSystem}`}>
          <ComponentDisplayName text={svcSystem} type="system" />
        </Link>
      ),
  },
];

const toRow = (service: Entity & { apiVersion: string }, idx: number): TableRow => ({
  id: idx,
  apiVersion: service.apiVersion || '?',
  svcName: service.metadata[ANNOTATION_SERVICE_NAME]?.toString() ?? '-',
  svcVersion: service.metadata[ANNOTATION_SERVICE_VERSION]?.toString() ?? '-',
  svcEnvironment: service.spec?.lifecycle?.toString().toUpperCase() ?? '-',
  svcSystem: service.spec?.system?.toString() ?? '-',
});

const fetchEntities = async (
  catalogApi: CatalogApi,
  entity: Entity,
  dependency: 'provider' | 'consumer'
): Promise<Entity[]> => {
  const relationType = dependency === 'consumer' ? RELATION_API_CONSUMED_BY : RELATION_API_PROVIDED_BY;
  const relations = entity.relations?.filter(relation => relation.type === relationType) ?? [];

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

interface ApiAllRelationsCardProps {
  readonly dependency: 'provider' | 'consumer';
}

export const ApiAllRelationsCard = ({ dependency }: ApiAllRelationsCardProps) => {
  const { entity } = useEntity();
  const catalogApi = useApi(catalogApiRef);

  const system = entity.spec?.system?.toString() ?? '';
  const apiName = entity.metadata[ANNOTATION_API_NAME]?.toString() ?? '';
  const title = dependency === 'consumer' ? 'Consumers' : 'Providers';

  const { apiVersions, loading: versionsLoading, error: versionsError } = useGetApiVersions(system, apiName);

  const { value: allServices = [], loading: servicesLoading, error: servicesError } = useAsync(async () => {
    if (!apiVersions?.length || !apiName) return [];

    const apiEntities = await catalogApi.getEntities({
      filter: {
        kind: ['API'],
        [`metadata.${ANNOTATION_API_NAME}`]: [apiName],
      },
    });

    const servicePromises = apiEntities.items
      .filter(apiEntity => apiEntity.metadata[ANNOTATION_API_VERSION])
      .map(async apiEntity => {
        const apiVersion = apiEntity.metadata[ANNOTATION_API_VERSION]!.toString();
        try {
          const services = await fetchEntities(catalogApi, apiEntity, dependency);
          return services.map(service => ({ ...service, apiVersion }));
        } catch {
          return [];
        }
      });

    const serviceArrays = await Promise.all(servicePromises);
    return serviceArrays.flat();
  }, [apiVersions, catalogApi, dependency, apiName]);

  const rows = allServices.map(toRow);
  const loading = versionsLoading || servicesLoading;
  const error = versionsError || servicesError;

  if (error) {
    return <ResponseErrorPanel title={`Error loading ${title.toLowerCase()}`} error={error} />;
  }

  return (
    <Table<TableRow>
      isLoading={loading}
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
          {title} ({rows.length})
        </Flex>
      }
      data={rows}
    />
  );
};