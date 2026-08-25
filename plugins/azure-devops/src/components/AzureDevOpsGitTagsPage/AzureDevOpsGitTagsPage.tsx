import { useCallback, useEffect, useMemo } from 'react';
import {
  Table,
  Cell,
  Card,
  CardHeader,
  CardBody,
  Text,
  Flex,
  CellText,
  useTable,
  ColumnConfig,
  Link,
} from '@backstage/ui';
import { useEntity } from '@backstage/plugin-catalog-react';
import { ResponseErrorPanel } from '@backstage/core-components';
import { GitTag } from '@backstage-community/plugin-azure-devops-common';
import { Progress } from '@internal/plugin-components-react';
import { useGitTags } from '../../hooks';

type TableRow = {
  id: number;
  gitTag: GitTag;
};

const emptyState = () => (
  <div style={{ padding: 'var(--bui-space-4)', textAlign: 'center' }}>
    No tags found.
  </div>
);

const cardTitle = (
  <Flex style={{ paddingTop: '12px', paddingLeft: '4px' }}>
    <Text variant="title-small" weight="bold">
      Azure Repos - Git Tags
    </Text>
  </Flex>
);

const toTableRow = (gitTag: GitTag, idx: number): TableRow => ({
  id: idx,
  gitTag,
});

async function fetchData(
  items: GitTag[] | undefined,
): Promise<TableRow[]> {
  return (items ?? []).map(toTableRow);
}

export const AzureDevOpsGitTagsPage = () => {
  const { entity } = useEntity();
  const {
    items: gitTags,
    loading: gitTagsLoading,
    error: gitTagsError,
  } = useGitTags(entity);

  const columns: ColumnConfig<TableRow>[] = useMemo(
    () => [
      {
        id: 'tag',
        label: 'Tag',
        isRowHeader: true,
        cell: item => (
          <Cell>
            <Link
              href={item.gitTag.link ?? ''}
              weight="bold"
              color="info"
              standalone
            >
              {item.gitTag.name}
            </Link>
          </Cell>
        ),
        isSortable: true,
      },
      {
        id: 'commit',
        label: 'Commit',
        cell: item => (
          <Cell>
            <Link
              href={item.gitTag.commitLink ?? ''}
              weight="bold"
              color="info"
              standalone
            >
              {item.gitTag.peeledObjectId ?? item.gitTag.objectId}
            </Link>
          </Cell>
        ),
      },
      {
        id: 'createdBy',
        label: 'Created By',
        cell: item => <CellText title={item.gitTag.createdBy ?? '-'} />,
      },
    ],
    [],
  );

  const getData = useCallback(() => fetchData(gitTags), [gitTags]);

  const { tableProps, reload } = useTable({
    mode: 'complete',
    getData,
    sortFn: (items, { column, direction }) => {
      const desc = direction === 'descending' ? -1 : 1;
      return [...items].sort((a, b) => {
        switch (column) {
          case 'tag':
            return (
              desc * (a.gitTag.name?.localeCompare(b.gitTag.name ?? '') ?? 0)
            );
          default:
            return 0;
        }
      });
    },
  });

  useEffect(() => {
    reload();
  }, [gitTags, reload]);

  const error = gitTagsError ?? tableProps.error;

  if (error) {
    return (
      <ResponseErrorPanel
        title="Failed to call AzureDevOps"
        error={error}
      />
    );
  }

  if (gitTagsLoading || tableProps.isPending) {
    return <Progress />;
  }

  return (
    <Card>
      <CardHeader>{cardTitle}</CardHeader>
      <CardBody>
        <Table
          className="denseTable"
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
