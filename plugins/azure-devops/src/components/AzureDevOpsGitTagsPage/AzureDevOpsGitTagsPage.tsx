import { Table, TableHeader, TableBody, Column, Row, Cell, Card, CardHeader, CardBody, Text, Flex } from '@backstage/ui';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useAsyncGitTags } from '../../hooks';
import { Cell as RACell } from 'react-aria-components';
import { useAsyncList } from 'react-stately';
import {
  Link,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { GitTag } from '@backstage-community/plugin-azure-devops-common';

const emptyState = () => (
  <div style={{ padding: 'var(--bui-space-4)', textAlign: 'center' }}>
    No tags found.
  </div>
);

const title = () => (
  <Flex style={{ paddingTop: '12px', paddingLeft: '4px' }}>
    <Text variant='title-small' weight='bold' >
      Azure Repos - Git Tags
    </Text>
  </Flex>
);

export const AzureDevOpsGitTagsPage = () => {
  const { entity } = useEntity();

  const getGitTags = useAsyncGitTags();

  const list = useAsyncList<GitTag>({
    async load({ }) {
      const data = await getGitTags(entity);
      return { items: data.items || [] };
    },
    async sort({ items, sortDescriptor }) {
      return {
        items: items.sort((a, b) => {
          const desc = sortDescriptor.direction === 'descending' ? -1 : 1;
          return desc * (a.name?.localeCompare(b.name ?? '') ?? 0);
        }),
      };
    }
  });  

  if (list.isLoading) {
    return (
      <Card>
        <CardHeader>
          {title()}
        </CardHeader>
        <CardBody>
          <Progress />
        </CardBody>
      </Card>
    );
  }

  if (list.error) {
    return (
      <Card>
        <CardHeader>
          {title()}
        </CardHeader>
        <CardBody>
          <ResponseErrorPanel error={list.error} />
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          {title()}
        </CardHeader>
        <CardBody>
          <Table
            aria-label="Azure Repos - Git Tags"
            sortDescriptor={list.sortDescriptor}
            onSortChange={list.sort}>
            <TableHeader>
              <Column isRowHeader allowsSorting>Tag</Column>
              <Column>Commit</Column>
              <Column>Created By</Column>
            </TableHeader>
            <TableBody items={list.items} renderEmptyState={emptyState}>
              {item => (
                <Row key={item.name} id={item.name}>
                  <RACell>
                    <Link to={item.link ?? ''}>{item.name}</Link>
                  </RACell>
                  <RACell>
                    <Link to={item.commitLink ?? ''}>{item.peeledObjectId ?? item.objectId}</Link>
                  </RACell>
                  <Cell textValue={item.createdBy ?? '-'} />
                </Row>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </>
  );
};