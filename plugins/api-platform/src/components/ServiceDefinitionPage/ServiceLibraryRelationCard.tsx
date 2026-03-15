import { Link, ResponseErrorPanel, Table, TableColumn } from "@backstage/core-components";
import { Flex } from "@backstage/ui";
import { Entity, parseEntityRef, RELATION_DEPENDS_ON } from "@backstage/catalog-model";
import { catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import { useApi } from "@backstage/core-plugin-api";
import useAsync from 'react-use/esm/useAsync';
import {
  ANNOTATION_LIBRARY_NAME,
  ANNOTATION_LIBRARY_VERSION,
  CATALOG_METADATA_LIBRARY_NAME,
  CATALOG_METADATA_LIBRARY_VERSION,
  CATALOG_SPEC_SYSTEM,
} from "@internal/plugin-api-platform-common";
import { ComponentDisplayName } from "../common";

type TableRow = {
  id: number;
  name: string;
  version: string;
  system: string;
  valid: boolean;
}

const serviceColumns: TableColumn<TableRow>[] = [
  {
    title: 'Name',
    width: '50%',
    field: 'name',
    highlight: true,
    defaultSort: 'asc',
    render: ({ system, name, valid }: TableRow) =>
      valid ?
        <Link to={`/api-platform/library/${system}/${name}`}>
          <ComponentDisplayName text={name} type="library" />
        </Link>
        :
        <ComponentDisplayName text={name} type="library" />
    ,
  },
  {
    title: 'Version',
    width: '35%',
    field: 'version',
    highlight: true,
    render: ({ system, name, version, valid }: TableRow) => (
      valid ?
        <Link to={`/api-platform/library/${system}/${name}?version=${version}`}>
          <ComponentDisplayName text={version} type="library" />
        </Link>
        :
        <ComponentDisplayName text={version} type="library" />

    ),
  },
  {
    title: 'System',
    width: '15%',
    highlight: true,
    field: 'system',
    render: ({ system, valid }: TableRow) =>
      valid ?
        <Link to={`/api-platform/system/${system}`}>
          <ComponentDisplayName text={system} type="system" />
        </Link>
        :
        <ComponentDisplayName text={system} type="system" />
    ,
  }
];

const extractNameAndVersion = (fullName: string): { name: string; version: string } => {
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
  let version = entity.metadata.annotations?.[ANNOTATION_LIBRARY_VERSION]?.toString();
  let name = entity.metadata.annotations?.[ANNOTATION_LIBRARY_NAME]?.toString() ?? '?';
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

const tableOptions = {
  search: true,
  padding: 'dense' as const,
  paging: false,
  draggable: false,
  thirdSortClick: false,
};

export const ServiceLibraryRelationCard = () => {
  const { entity } = useEntity();
  const catalogApi = useApi(catalogApiRef);

  const { value: entities = [], loading, error } = useAsync(async () => {

    const allRelations = entity.relations?.filter(r => r.type === RELATION_DEPENDS_ON) ?? [];

    if (allRelations.length === 0) return [];

    const relatedEntities: Entity[] = [];
    const dependsRefs = allRelations.map(r => r.targetRef);
    const dependsByRefs = await catalogApi.getEntitiesByRefs(
      {
        entityRefs: dependsRefs,
        fields: [CATALOG_METADATA_LIBRARY_NAME, CATALOG_METADATA_LIBRARY_VERSION, CATALOG_SPEC_SYSTEM],
      }
    );

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
            'library.depo.be/name': depName,
            'library.depo.be/version': undefined,
          },
          spec: {
            type: 'library',
            system: '-',
          },
        });
      }
    }

    return relatedEntities;
  }, [entity, catalogApi]);

  if (error) {
    return <ResponseErrorPanel title="Error" error={error} />;
  }

  const rows = entities.map(toRow);

  return (
    <Table<TableRow>
      isLoading={loading}
      columns={serviceColumns}
      options={tableOptions}
      title={
        <Flex align="center">
          Libraries ({rows.length})
        </Flex>
      }
      data={rows}
    />
  );
}