import { ResponseErrorPanel } from '@backstage/core-components';
import { Table, useTable, ColumnConfig, Cell } from '@backstage/ui';
import {
  Entity,
  parseEntityRef,
  RELATION_CONSUMES_API,
  RELATION_PROVIDES_API,
} from '@backstage/catalog-model';
import {
  catalogApiRef,
  EntityInfoCard,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import {
  ANNOTATION_API_NAME,
  ANNOTATION_API_VERSION,
  CATALOG_METADATA_API_NAME,
  CATALOG_METADATA_API_VERSION,
  CATALOG_SPEC_SYSTEM,
} from '@internal/plugin-api-platform-common';
import {
  ComponentDisplayName,
  LinkComponentDisplayName,
} from '@internal/plugin-api-platform-react';
import { Progress } from '@backstage/frontend-plugin-api';

type TableRow = {
  id: number;
  name: string;
  version: string;
  system: string;
};

const serviceColumns: ColumnConfig<TableRow>[] = [
  {
    label: 'Name',
    width: '50%',
    id: 'name',
    isRowHeader: true,
    cell: ({ system, name, version }: TableRow) =>
      version === 'local' ? (
        <Cell>
          <ComponentDisplayName text={name} type="api" />
        </Cell>
      ) : (
        <Cell>
          <LinkComponentDisplayName
            href={`/api-platform/api/${system}/${name}?version=${version}`}
            text={name}
            type="api"
          />
        </Cell>
      ),
  },
  {
    label: 'Version',
    width: '35%',
    id: 'version',
    cell: ({ system, name, version }: TableRow) =>
      version === 'local' ? (
        <Cell>
          <ComponentDisplayName text={name} type="api" />
        </Cell>
      ) : (
        <Cell>
          <LinkComponentDisplayName
            href={`/api-platform/api/${system}/${name}?version=${version}`}
            text={version}
            type="api"
          />
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
          <LinkComponentDisplayName
            href={`/api-platform/system/${system}`}
            text={system}
            type="system"
          />
        </Cell>
      ),
  },
];

const toRow = (entity: Entity, idx: number): TableRow => ({
  id: idx,
  name: entity.metadata.annotations?.[ANNOTATION_API_NAME]?.toString() ?? '?',
  version:
    entity.metadata.annotations?.[ANNOTATION_API_VERSION]?.toString() ?? '?',
  system: entity.spec?.system?.toString() ?? '-',
});

const createLocalEntity = (name: string): Entity =>
  ({
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'API',
    metadata: {
      name,
      annotations: {
        [ANNOTATION_API_NAME]: name,
        [ANNOTATION_API_VERSION]: 'local',
      },
    },
  }) as Entity;

interface ServiceApiRelationCardProps {
  dependency: 'provided' | 'consumed';
}

type ServiceApiRelationTableProps = {
  title: string;
  rows: TableRow[];
};

const ServiceApiRelationTable = ({
  title,
  rows,
}: ServiceApiRelationTableProps) => {
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

export const ServiceApiRelationCard = ({
  dependency,
}: ServiceApiRelationCardProps) => {
  const { entity } = useEntity();
  const catalogApi = useApi(catalogApiRef);

  const {
    value: entities = [],
    loading,
    error,
  } = useAsync(async () => {
    const relationType =
      dependency === 'consumed' ? RELATION_CONSUMES_API : RELATION_PROVIDES_API;
    const allRelations =
      entity.relations?.filter(r => r.type === relationType) ?? [];

    if (allRelations.length === 0) return [];

    const defaultRelations = allRelations.filter(r =>
      r.targetRef.startsWith('api:default/'),
    );
    const localRelations = allRelations.filter(r =>
      r.targetRef.startsWith('api:local/'),
    );

    const relatedEntities: Entity[] = [];

    if (defaultRelations.length > 0) {
      const targetNames = defaultRelations.map(
        r => parseEntityRef(r.targetRef).name,
      );
      try {
        const response = await catalogApi.getEntities({
          fields: [
            CATALOG_METADATA_API_NAME,
            CATALOG_METADATA_API_VERSION,
            CATALOG_SPEC_SYSTEM,
          ],
          filter: {
            kind: ['API'],
            'metadata.name': targetNames,
          },
        });
        relatedEntities.push(...response.items);
      } catch (fetchError) {
        // Continue with local entities even if default fetch fails
      }
    }

    localRelations.forEach(r => {
      const name = parseEntityRef(r.targetRef).name;
      relatedEntities.push(createLocalEntity(name));
    });

    return relatedEntities;
  }, [entity, dependency, catalogApi]);

  if (error) {
    return <ResponseErrorPanel title="Error" error={error} />;
  }

  const title = dependency === 'consumed' ? 'Consumed APIs' : 'Provided APIs';

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
    <ServiceApiRelationTable
      key={`${dependency}-${rows.length}`}
      title={title}
      rows={rows}
    />
  );
};
