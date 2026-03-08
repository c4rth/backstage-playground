import { useCallback, useMemo } from 'react';
import { Table, Cell, Card, CardHeader, CardBody, Text, Flex, CellText, useTable, ColumnConfig } from '@backstage/ui';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useAsyncGitTags } from '../../hooks';
import {
  Link,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { GitTag } from '@backstage-community/plugin-azure-devops-common';
import { Entity } from '@backstage/catalog-model';

type TableRow = {
  id: number,
  gitTag: GitTag,
}

const emptyState = () => (
  <div style={{ padding: 'var(--bui-space-4)', textAlign: 'center' }}>
    No tags found.
  </div>
);

const cardTitle = (
  <Flex style={{ paddingTop: '12px', paddingLeft: '4px' }}>
    <Text variant='title-small' weight='bold'>Azure Repos - Git Tags</Text>
  </Flex>
);

const toTableRow = (gitTag: GitTag, idx: number): TableRow => ({
  id: idx,
  gitTag,
});

async function fetchData(
  getGitTags: (entity: Entity) => Promise<{ items: GitTag[] }>,
  entity: Entity,
) {
  const data = await getGitTags(entity);
  return data?.items.map(toTableRow) ?? [];
}

export const AzureDevOpsGitTagsPage = () => {
  const { entity } = useEntity();

  const getGitTags = useAsyncGitTags();

  const columns: ColumnConfig<TableRow>[] = useMemo(() => [
    {
      id: 'tag',
      label: 'Tag',
      isRowHeader: true,
      cell: item =>
        <Cell>
          <Link to={item.gitTag.link ?? ''}>{item.gitTag.name}</Link>
        </Cell>,
      isSortable: true,
    }, {
      id: 'commit',
      label: 'Commit',
      cell: item =>
        <Cell>
          <Link to={item.gitTag.commitLink ?? ''}>{item.gitTag.peeledObjectId ?? item.gitTag.objectId}</Link>
        </Cell>,
    }, {
      id: 'createdBy',
      label: 'Created By',
      cell: item => <CellText title={item.gitTag.createdBy ?? '-'} />,
    },
  ], []);

  const getData = useCallback(() => fetchData(getGitTags, entity), [getGitTags, entity]);

  const { tableProps } = useTable({
    mode: 'complete',
    getData,
    sortFn: (items, {
      column,
      direction
    }) => {
      return [...items].sort((a, b) => {
        const desc = direction === 'descending' ? -1 : 1;
        switch (column) {
          case 'tag':
            return desc * (a.gitTag.name?.localeCompare(b.gitTag.name ?? '') ?? 0);
          default:
            return 0;
        }
      });
    }
  });

  if (tableProps.error) {
    return <ResponseErrorPanel title="Failed to call AzureDevOps" error={tableProps.error} />;
  }

  if (tableProps.loading) {
    return <Progress />;
  }

  return (
    <Card>
      <CardHeader>{cardTitle}</CardHeader>
      <CardBody>
        <Table
          columnConfig={columns}
          {...tableProps}
          pagination={{
            type: 'none',
          }}
          emptyState={emptyState()}
        />
      </CardBody>
    </Card>
  );
};