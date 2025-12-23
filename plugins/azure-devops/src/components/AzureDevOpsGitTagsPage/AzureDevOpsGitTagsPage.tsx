import { Table, TableHeader, TableBody, Column, Row, Cell, Card, CardHeader, CardBody, Text, Flex, CellText } from '@backstage/ui';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useAsyncGitTags } from '../../hooks';
import { useAsyncList } from 'react-stately';
import {
  Link,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { GitTag } from '@backstage-community/plugin-azure-devops-common';

export const AzureDevOpsGitTagsPage = () => {
  const { entity } = useEntity();

  const getGitTags = useAsyncGitTags();

  const list = useAsyncList<GitTag>({
    async load() {
      const data = await getGitTags(entity);
      return { items: data.items || [] };
    },
    async sort({ items, sortDescriptor }) {
      const desc = sortDescriptor.direction === 'descending' ? -1 : 1;
      return {
        items: items.sort((a, b) => desc * (a.name?.localeCompare(b.name ?? '') ?? 0)),
      };
    },
  });  

  const cardTitle = (
    <Flex style={{ paddingTop: '12px', paddingLeft: '4px' }}>
      <Text variant='title-small' weight='bold'>Azure Repos - Git Tags</Text>
    </Flex>
  );

  if (list.isLoading) {
    return (
      <Card>
        <CardHeader>{cardTitle}</CardHeader>
        <CardBody><Progress /></CardBody>
      </Card>
    );
  }

  if (list.error) {
    return (
      <Card>
        <CardHeader>{cardTitle}</CardHeader>
        <CardBody><ResponseErrorPanel error={list.error} /></CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>{cardTitle}</CardHeader>
      <CardBody>
        <Table
          aria-label="Azure Repos - Git Tags"
          sortDescriptor={list.sortDescriptor}
          onSortChange={list.sort}
        >
          <TableHeader>
            <Column isRowHeader allowsSorting>Tag</Column>
            <Column>Commit</Column>
            <Column>Created By</Column>
          </TableHeader>
          <TableBody 
            items={list.items}
            renderEmptyState={() => (
              <div style={{ padding: 'var(--bui-space-4)', textAlign: 'center' }}>
                No tags found.
              </div>
            )}
          >
            {item => (
              <Row key={item.name} id={item.name} className='custom-bui-TableRow'>
                <Cell>
                  <Link to={item.link ?? ''}>{item.name}</Link>
                </Cell>
                <Cell>
                  <Link to={item.commitLink ?? ''}>{item.peeledObjectId ?? item.objectId}</Link>
                </Cell>
                <CellText title={item.createdBy ?? '-'} />
              </Row>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
};