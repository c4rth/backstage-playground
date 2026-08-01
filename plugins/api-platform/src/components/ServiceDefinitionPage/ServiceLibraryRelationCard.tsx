import { ResponseErrorPanel } from '@backstage/core-components';
import { Table, useTable, ColumnConfig, Cell } from '@backstage/ui';
import {
  Entity,
  parseEntityRef,
  RELATION_DEPENDS_ON,
} from '@backstage/catalog-model';
import {
  catalogApiRef,
  EntityInfoCard,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import {
  ANNOTATION_LIBRARY_NAME,
  ANNOTATION_LIBRARY_VERSION,
  CATALOG_METADATA_LIBRARY_NAME,
  CATALOG_METADATA_LIBRARY_VERSION,
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
  valid: boolean;
};

const serviceColumns: ColumnConfig<TableRow>[] = [
  {
    label: 'Name',
    width: '50%',
    id: 'name',
    isRowHeader: true,
    cell: ({ system, name, valid }: TableRow) =>
      valid ? (
        <Cell>
          <LinkComponentDisplayName
            href={`/api-platform/library/${system}/${name}`}
            text={name}
            type="library"
          />
        </Cell>
      ) : (
        <Cell>
          <ComponentDisplayName text={name} type="library" />
        </Cell>
      ),
  },
  {
    label: 'Version',
    width: '35%',
    id: 'version',
    cell: ({ system, name, version, valid }: TableRow) =>
      valid ? (
        <Cell>
          <LinkComponentDisplayName
            href={`/api-platform/library/${system}/${name}?version=${version}`}
            text={version}
            type="library"
          />
        </Cell>
      ) : (
        <Cell>
          <ComponentDisplayName text={version} type="library" />
        </Cell>
      ),
  },
  {
    label: 'System',
    width: '15%',
    id: 'system',
    cell: ({ system, valid }: TableRow) =>
      valid ? (
        <Cell>
          <LinkComponentDisplayName
            href={`/api-platform/system/${system}`}
            text={system}
            type="system"
          />
        </Cell>
      ) : (
        <Cell>
          <ComponentDisplayName text={system} type="system" />
        </Cell>
      ),
  },
];

const extractNameAndVersion = (
  fullName: string,
): { name: string; version: string } => {
  const lastVIndex = fullName.lastIndexOf('-v');
  if (lastVIndex !== -1) {
    return {
      name: fullName.substring(0, lastVIndex),
      version: fullName.substring(lastVIndex + 2),
    };
  }
  return { name: fullName, version: '-' };
};

const toRow = (entity: Entity, idx: number): TableRow => {
  let version =
    entity.metadata.annotations?.[ANNOTATION_LIBRARY_VERSION]?.toString();
  let name =
    entity.metadata.annotations?.[ANNOTATION_LIBRARY_NAME]?.toString() ??
    entity.metadata.name;
  let valid = true;
  if (!version) {
    const extracted = extractNameAndVersion(name);
    name = extracted.name;
    version = extracted.version;
    valid = false;
  }
  return {
    id: idx,
    name: name,
    version: version,
    system: entity.spec?.system?.toString() ?? '-',
    valid: valid,
  };
};

type ServiceLibraryRelationTableProps = {
  title: string;
  rows: TableRow[];
};

const ServiceLibraryRelationTable = ({
  title,
  rows,
}: ServiceLibraryRelationTableProps) => {
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

export const ServiceLibraryRelationCard = () => {
  const { entity } = useEntity();
  const catalogApi = useApi(catalogApiRef);

  const {
    value: entities = [],
    loading,
    error,
  } = useAsync(async () => {
    const allRelations =
      entity.relations?.filter(r => r.type === RELATION_DEPENDS_ON) ?? [];

    if (allRelations.length === 0) return [];

    const relatedEntities: Entity[] = [];
    const dependsRefs = allRelations.map(r => r.targetRef);
    const dependsByRefs = await catalogApi.getEntitiesByRefs({
      entityRefs: dependsRefs,
      fields: [
        CATALOG_METADATA_LIBRARY_NAME,
        CATALOG_METADATA_LIBRARY_VERSION,
        CATALOG_SPEC_SYSTEM,
      ],
    });

    for (let i = 0; i < allRelations.length; i++) {
      const relation = allRelations[i];
      const depName = parseEntityRef(relation.targetRef).name;

      // getEntitiesByRefs returns items in the same order as the input refs
      const matchedEntity = dependsByRefs.items[i];
      if (matchedEntity) {
        relatedEntities.push(matchedEntity);
      } else {
        relatedEntities.push({
          apiVersion: 'v1',
          kind: 'Component',
          metadata: {
            name: depName,
            annotations: {
              'library.depo.be/name': depName,
            },
          },
          spec: {
            system: '-',
          },
        });
      }
    }

    return relatedEntities;
  }, [entity, catalogApi]);

  const rows = entities?.map(toRow) ?? [];

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return (
      <ResponseErrorPanel title={`Error loading Libraries`} error={error} />
    );
  }

  return (
    <ServiceLibraryRelationTable
      key={`service-library-${rows.length}`}
      title="Libraries"
      rows={rows}
    />
  );
};
