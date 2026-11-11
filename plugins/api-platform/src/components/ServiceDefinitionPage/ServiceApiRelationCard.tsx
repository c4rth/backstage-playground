import { ResponseErrorPanel } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import {
  apiPlatformTranslationRef,
  ApiPlatformTranslator,
} from '../../translation';
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
} from '@internal/plugin-components-react';

type TableRow = {
  id: number;
  name: string;
  version: string;
  system: string;
};

const getServiceColumns = (
  t: ApiPlatformTranslator,
): ColumnConfig<TableRow>[] => [
  {
    label: t('table.columns.name'),
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
    label: t('table.columns.version'),
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
    label: t('table.columns.system'),
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
  const { t } = useTranslationRef(apiPlatformTranslationRef);
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
    <EntityInfoCard title={title}>
      <Table
        columnConfig={getServiceColumns(t)}
        {...tableProps}
        pagination={{
          type: 'none',
        }}
        emptyState={<div>{t('table.empty')}</div>}
        className="denseTable"
      />
    </EntityInfoCard>
  );
};

export const ServiceApiRelationCard = ({
  dependency,
}: ServiceApiRelationCardProps) => {
  const { t } = useTranslationRef(apiPlatformTranslationRef);
  const { entity } = useEntity();
  const catalogApi = useApi(catalogApiRef);

  const { value: entities = [], error } = useAsync(async () => {
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
    return (
      <ResponseErrorPanel title={t('serviceRelations.error')} error={error} />
    );
  }

  const rows = entities?.map(toRow) ?? [];

  if (error) {
    return (
      <ResponseErrorPanel
        title={t(
          dependency === 'consumed'
            ? 'serviceRelations.consumedError'
            : 'serviceRelations.providedError',
        )}
        error={error}
      />
    );
  }

  return (
    <ServiceApiRelationTable
      key={`${dependency}-${rows.length}`}
      title={t(
        dependency === 'consumed'
          ? 'serviceRelations.consumed'
          : 'serviceRelations.provided',
        { total: String(rows.length) },
      )}
      rows={rows}
    />
  );
};
