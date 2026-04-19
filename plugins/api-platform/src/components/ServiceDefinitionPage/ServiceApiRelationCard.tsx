import {
  Link,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { Flex } from '@backstage/ui';
import {
  Entity,
  parseEntityRef,
  RELATION_CONSUMES_API,
  RELATION_PROVIDES_API,
} from '@backstage/catalog-model';
import { catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import {
  ANNOTATION_API_NAME,
  ANNOTATION_API_VERSION,
  CATALOG_METADATA_API_NAME,
  CATALOG_METADATA_API_VERSION,
  CATALOG_SPEC_SYSTEM,
} from '@internal/plugin-api-platform-common';
import { ComponentDisplayName } from '../common';

type TableRow = {
  id: number;
  name: string;
  version: string;
  system: string;
};

const serviceColumns: TableColumn<TableRow>[] = [
  {
    title: 'Name',
    width: '50%',
    field: 'name',
    highlight: true,
    defaultSort: 'asc',
    render: ({ system, name, version }: TableRow) =>
      version === 'local' ? (
        <ComponentDisplayName text={name} type="api" />
      ) : (
        <Link to={`/api-platform/api/${system}/${name}?version=${version}`}>
          <ComponentDisplayName text={name} type="api" />
        </Link>
      ),
  },
  {
    title: 'Version',
    width: '35%',
    field: 'version',
  },
  {
    title: 'System',
    width: '15%',
    highlight: true,
    field: 'system',
    render: ({ system }: TableRow) =>
      system === '-' ? (
        <ComponentDisplayName text={system} type="system" />
      ) : (
        <Link to={`/api-platform/system/${system}`}>
          <ComponentDisplayName text={system} type="system" />
        </Link>
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

const tableOptions = {
  search: true,
  padding: 'dense' as const,
  paging: false,
  draggable: false,
  thirdSortClick: false,
};

interface ServiceApiRelationCardProps {
  dependency: 'provided' | 'consumed';
}

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

  const rows = entities.map(toRow);

  return (
    <Table<TableRow>
      isLoading={loading}
      columns={serviceColumns}
      options={tableOptions}
      title={
        <Flex align="center">
          {title} ({rows.length})
        </Flex>
      }
      data={rows}
    />
  );
};
