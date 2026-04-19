import {
  Link,
  Progress,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import {
  CatalogApi,
  catalogApiRef,
  EntityRefLinks,
  getEntityRelations,
  humanizeEntityRef,
} from '@backstage/plugin-catalog-react';
import {
  CompoundEntityRef,
  Entity,
  RELATION_OWNED_BY,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { isExternalUrl } from '../../lib/helper';
import { RiGlobalLine } from '@remixicon/react';
import { BackstageIcon } from './BackstageIcon';
import { Box } from '@backstage/ui';

type TableRow = {
  id: number;
  name: string;
  title: string;
  description: string;
  isExternal: boolean;
  link: string;
  entityRef: string;
  ownedByRelationsTitle: string;
  ownedByRelations: CompoundEntityRef[];
};

const columns: TableColumn<TableRow>[] = [
  {
    title: 'Document',
    width: '25%',
    field: 'title',
    highlight: true,
    defaultSort: 'asc',
    render: ({ title, link }: TableRow) => <Link to={link}>{title}</Link>,
  },
  {
    title: 'Description',
    width: '50%',
    field: 'description',
  },
  {
    title: 'Owner',
    width: '20%',
    field: 'ownedByRelationsTitle',
    render: ({ ownedByRelations }: TableRow) => (
      <EntityRefLinks entityRefs={ownedByRelations} defaultKind="group" />
    ),
  },
  {
    title: 'Type',
    width: '5%',
    field: 'isExternal',
    render: ({ isExternal }: TableRow) => (
      <span>{isExternal ? <RiGlobalLine /> : <BackstageIcon />}</span>
    ),
  },
];

export const TechDocsTable = () => {
  const catalogApi: CatalogApi = useApi(catalogApiRef);

  const {
    value: items,
    loading,
    error,
  } = useAsync(async () => {
    const response = await catalogApi.getEntities({
      filter: {
        kind: 'Component',
        'spec.type': 'documentation',
      },
    });
    return response.items;
  });

  if (error) return <ResponseErrorPanel error={error} />;
  if (loading) return <Progress />;

  const rows = items?.map(toEntityRow) || [];
  const showPagination = rows.length > 20 || false;

  return (
    <Table<TableRow>
      isLoading={loading}
      columns={columns}
      options={{
        search: true,
        paging: showPagination,
        pageSize: 20,
        showEmptyDataSourceMessage: !loading,
        draggable: false,
      }}
      title={
        <Box display="flex" style={{ alignItems: 'center' }} mr="1">
          All ({items ? items.length : 0})
        </Box>
      }
      data={rows ?? []}
    />
  );
};

function toEntityRow(entity: Entity, idx: number): TableRow {
  const ownedByRelations = getEntityRelations(entity, RELATION_OWNED_BY);
  const isExternal = isExternalUrl(
    entity?.metadata?.annotations?.['backstage.io/techdocs-ref'],
  );
  const url = `${entity.metadata.namespace}/${entity.kind.toLocaleLowerCase()}/${entity.metadata.name}`;
  return {
    id: idx,
    name: entity.metadata.name?.toString() || '?',
    title: entity.metadata.title?.toString() || '?',
    description: entity.metadata.description || '',
    isExternal: isExternal,
    link: url,
    entityRef: stringifyEntityRef(entity),
    ownedByRelationsTitle: ownedByRelations
      .map(r => humanizeEntityRef(r, { defaultKind: 'group' }))
      .join(', '),
    ownedByRelations,
  };
}
