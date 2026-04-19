import {
  Link,
  ResponseErrorPanel,
  Table,
  TableColumn,
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
import { ComponentDisplayName } from '../common';
import { Flex } from '@backstage/ui';

type TableRow = {
  id: number;
  system: string;
  name: string;
  version: string;
  environment: string;
};

const serviceColumns: TableColumn<TableRow>[] = [
  {
    title: 'Name',
    width: '50%',
    field: 'name',
    highlight: true,
    defaultSort: 'asc',
    render: ({ system, name, version, environment }: TableRow) => (
      <Link
        to={`/api-platform/service/${system}/${name}?version=${version}&env=${environment}`}
      >
        <ComponentDisplayName text={name} type="service" />
      </Link>
    ),
  },
  {
    title: 'Version',
    width: '20%',
    field: 'version',
  },
  {
    title: 'Environment',
    width: '15%',
    field: 'environment',
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

  if (error) {
    return (
      <ResponseErrorPanel
        title={`Error loading ${title.toLowerCase()}`}
        error={error}
      />
    );
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
