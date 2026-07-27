import {
  ResponseErrorPanel,
} from '@backstage/core-components';
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
  ANNOTATION_SERVICE_NAME,
  ANNOTATION_SERVICE_VERSION,
  CATALOG_METADATA_SERVICE_NAME,
  CATALOG_METADATA_SERVICE_VERSION,
  CATALOG_SPEC_LIFECYCLE,
  CATALOG_SPEC_SYSTEM,
} from '@internal/plugin-api-platform-common';
import { ComponentDisplayName } from '@internal/plugin-api-platform-react';
import { Link, Table, useTable, ColumnConfig, Cell, Text } from '@backstage/ui';
import { Progress } from '@backstage/frontend-plugin-api';

type TableRow = {
  id: number;
  system: string;
  name: string;
  version: string;
  environment: string;
};

const serviceColumns: ColumnConfig<TableRow>[] = [
  {
    label: 'Name',
    width: '50%',
    id: 'name',
    isRowHeader: true,
    cell: ({ system, name, version, environment }: TableRow) => (
      <Cell>
        <Text weight="bold">
          <Link
            href={`/api-platform/service/${system}/${name}?version=${version}&env=${environment}`}
            weight="bold"
            color="info"
            standalone
          >
            <ComponentDisplayName text={name} type="service" />
          </Link>
        </Text>
      </Cell>
    ),
  },
  {
    label: 'Version',
    width: '20%',
    id: 'version',
    cell: ({ system, name, version, environment }: TableRow) => (
      <Cell>
        <Text weight="bold">
          <Link
            href={`/api-platform/service/${system}/${name}?version=${version}&env=${environment}`}
            weight="bold"
            color="info"
            standalone
          >
            <ComponentDisplayName text={version} type="service" />
          </Link>
        </Text>
      </Cell>
    ),
  },
  {
    label: 'Environment',
    width: '15%',
    id: 'environment',
   cell: ({ system, name, version, environment }: TableRow) => (
      <Cell>
        <Text weight="bold">
          <Link
            href={`/api-platform/service/${system}/${name}?version=${version}&env=${environment}`}
            weight="bold"
            color="info"
            standalone
          >
            <ComponentDisplayName text={environment} type="service" />
          </Link>
        </Text>
      </Cell>
    ),
  },
  {
    label: 'System',
    width: '15%',
    id: 'system',
    cell: ({ system }: TableRow) =>
      system === '-' ? (
        <Cell>
          <ComponentDisplayName text={system} type="system" />
        </Cell>
      ) : (
        <Cell>
          <Text weight="bold">
            <Link
              href={`/api-platform/system/${system}`}
              weight="bold"
              color="info"
              standalone
            >
              <ComponentDisplayName text={system} type="system" />
            </Link>
          </Text>
        </Cell>
      ),
  },
];

const toRow = (entity: Entity, idx: number): TableRow => ({
  id: idx,
  system: entity.spec?.system?.toString() ?? '?',
  name:
    entity.metadata.annotations?.[ANNOTATION_SERVICE_NAME]?.toString() ?? '?',
  version:
    entity.metadata.annotations?.[ANNOTATION_SERVICE_VERSION]?.toString() ??
    '?',
  environment: entity.spec?.lifecycle?.toString().toUpperCase() ?? '?',
});

const fetchEntities = async (
  catalogApi: CatalogApi,
  entity: Entity,
  dependency: 'provider' | 'consumer',
) => {
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
      CATALOG_SPEC_SYSTEM,
      CATALOG_SPEC_LIFECYCLE,
    ],
    filter: {
      kind: ['Component'],
      'spec.type': ['service'],
      'metadata.name': targetNames,
    },
  });

  return response.items;
};

interface ApiRelationCardProps {
  dependency: 'provider' | 'consumer';
}

type ApiRelationTableProps = {
  title: string;
  rows: TableRow[];
};

const ApiRelationTable = ({ title, rows }: ApiRelationTableProps) => {
  const { tableProps } = useTable({
    mode: 'complete',
    getData: () => rows,
    initialSort: {
      column: 'name',
      direction: 'ascending',
    },
    paginationOptions: {
      type: 'none',
    },
  });

  return (
    <EntityInfoCard
      title={`${title} (${rows.length})`}>
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

export const ApiRelationCard = ({ dependency }: ApiRelationCardProps) => {
  const { entity } = useEntity();
  const catalogApi = useApi(catalogApiRef);
  const title = dependency === 'consumer' ? 'Consumers' : 'Providers';

  const {
    value: entities,
    loading,
    error,
  } = useAsync(
    () => fetchEntities(catalogApi, entity, dependency),
    [catalogApi, entity, dependency],
  );

  const rows = entities?.map(toRow) ?? [];

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
    <ApiRelationTable
      key={`${dependency}-${rows.length}`}
      title={title}
      rows={rows}
    />
  );
};
