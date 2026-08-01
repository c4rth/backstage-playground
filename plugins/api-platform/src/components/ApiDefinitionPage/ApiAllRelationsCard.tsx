import { ResponseErrorPanel } from '@backstage/core-components';
import {
  Entity,
  parseEntityRef,
  RELATION_API_CONSUMED_BY,
  RELATION_API_PROVIDED_BY,
} from '@backstage/catalog-model';
import {
  CatalogApi,
  catalogApiRef,
  EntityInfoCard,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import {
  ANNOTATION_API_NAME,
  ANNOTATION_API_VERSION,
  ANNOTATION_SERVICE_NAME,
  ANNOTATION_SERVICE_VERSION,
  CATALOG_METADATA_SERVICE_NAME,
  CATALOG_METADATA_SERVICE_VERSION,
  CATALOG_SPEC_LIFECYCLE,
  CATALOG_SPEC_SYSTEM,
} from '@internal/plugin-api-platform-common';
import { useGetApiVersions } from '../../hooks';
import {
  ComponentDisplayName,
  LinkComponentDisplayName,
  Progress,
} from '@internal/plugin-api-platform-react';
import { Table, useTable, ColumnConfig, Cell, CellText } from '@backstage/ui';

type TableRow = {
  readonly id: number;
  readonly apiVersion: string;
  readonly svcName: string;
  readonly svcVersion: string;
  readonly svcEnvironment: string;
  readonly svcSystem: string;
};

const serviceColumns: ColumnConfig<TableRow>[] = [
  {
    label: 'Name',
    width: '50%',
    id: 'svcName',
    isRowHeader: true,
    cell: ({ svcName, svcVersion, svcEnvironment, svcSystem }: TableRow) => (
      <Cell>
        <LinkComponentDisplayName
          href={`/api-platform/service/${svcSystem}/${svcName}?version=${svcVersion}&env=${svcEnvironment}`}
          text={svcName}
          type="service"
        />
      </Cell>
    ),
  },
  {
    label: 'API Version',
    width: '20%',
    id: 'apiVersion',
    cell: ({ apiVersion }: TableRow) => <CellText title={apiVersion} />,
  },
  {
    label: 'Version',
    width: '10%',
    id: 'svcVersion',
    cell: ({ svcName, svcVersion, svcEnvironment, svcSystem }: TableRow) => (
      <Cell>
        <LinkComponentDisplayName
          href={`/api-platform/service/${svcSystem}/${svcName}?version=${svcVersion}&env=${svcEnvironment}`}
          text={svcVersion}
          type="service"
        />
      </Cell>
    ),
  },
  {
    label: 'Environment',
    width: '10%',
    id: 'svcEnvironment',
    cell: ({ svcName, svcVersion, svcEnvironment, svcSystem }: TableRow) => (
      <Cell>
        <LinkComponentDisplayName
          href={`/api-platform/service/${svcSystem}/${svcName}?version=${svcVersion}&env=${svcEnvironment}`}
          text={svcEnvironment}
          type="service"
        />
      </Cell>
    ),
  },
  {
    label: 'System',
    width: '10%',
    id: 'svcSystem',
    cell: ({ svcSystem }: TableRow) =>
      svcSystem === '-' ? (
        <Cell>
          <ComponentDisplayName text={svcSystem} type="system" />
        </Cell>
      ) : (
        <Cell>
          <LinkComponentDisplayName
            href={`/api-platform/system/${svcSystem}`}
            text={svcSystem}
            type="system"
          />
        </Cell>
      ),
  },
];

const toRow = (
  service: Entity & { apiVersion: string },
  idx: number,
): TableRow => ({
  id: idx,
  apiVersion: service.apiVersion || '?',
  svcName:
    service.metadata.annotations?.[ANNOTATION_SERVICE_NAME]?.toString() ?? '-',
  svcVersion:
    service.metadata.annotations?.[ANNOTATION_SERVICE_VERSION]?.toString() ??
    '-',
  svcEnvironment: service.spec?.lifecycle?.toString().toUpperCase() ?? '-',
  svcSystem: service.spec?.system?.toString() ?? '-',
});

const fetchEntities = async (
  catalogApi: CatalogApi,
  entity: Entity,
  dependency: 'provider' | 'consumer',
): Promise<Entity[]> => {
  const relationType =
    dependency === 'consumer'
      ? RELATION_API_CONSUMED_BY
      : RELATION_API_PROVIDED_BY;
  const relations =
    entity.relations?.filter(relation => relation.type === relationType) ?? [];

  if (relations.length === 0) {
    return [];
  }

  const targetNames = relations.map(
    relation => parseEntityRef(relation.targetRef).name,
  );

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

type ApiAllRelationsTableProps = {
  readonly title: string;
  readonly rows: TableRow[];
};

const ApiAllRelationsTable = ({ title, rows }: ApiAllRelationsTableProps) => {
  const { tableProps } = useTable({
    mode: 'complete',
    getData: () => rows,
    initialSort: {
      column: 'svcName',
      direction: 'ascending',
    },
    paginationOptions: {
      type: 'none',
    },
  });

  return (
    <EntityInfoCard title={`${title} (${rows.length})`}>
      <Table
        columnConfig={serviceColumns}
        {...tableProps}
        pagination={{
          type: 'none',
        }}
        emptyState={<div>No data available</div>}
        className="denseTable"
      />
    </EntityInfoCard>
  );
};

export const ApiAllRelationsCard = ({
  dependency,
}: ApiAllRelationsCardProps) => {
  const { entity } = useEntity();
  const catalogApi = useApi(catalogApiRef);

  const system = entity.spec?.system?.toString() ?? '';
  const apiName =
    entity?.metadata?.annotations?.[ANNOTATION_API_NAME]?.toString() ?? '';
  const title = dependency === 'consumer' ? 'Consumers' : 'Providers';

  const {
    apiVersions,
    loading: versionsLoading,
    error: versionsError,
  } = useGetApiVersions(system, apiName);

  const {
    value: allServices = [],
    loading: servicesLoading,
    error: servicesError,
  } = useAsync(async () => {
    if (!apiVersions?.length || !apiName) return [];

    const apiEntities = await catalogApi.getEntities({
      filter: {
        kind: ['API'],
        [`metadata.annotations.${ANNOTATION_API_NAME}`]: [apiName],
      },
    });

    const servicePromises = apiEntities.items
      .filter(
        apiEntity => apiEntity.metadata.annotations?.[ANNOTATION_API_VERSION],
      )
      .map(async apiEntity => {
        const apiVersion =
          apiEntity.metadata.annotations?.[
            ANNOTATION_API_VERSION
          ]?.toString() ?? '';
        try {
          const services = await fetchEntities(
            catalogApi,
            apiEntity,
            dependency,
          );
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

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return (
      <ResponseErrorPanel
        title={`Error loading ${title.toLowerCase()}`}
        error={error}
      />
    );
  }

  return (
    <ApiAllRelationsTable
      key={`${dependency}-${rows.length}`}
      title={title}
      rows={rows}
    />
  );
};
