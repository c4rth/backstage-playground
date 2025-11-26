import { Table, TableHeader, TableBody, Column, Row, Cell, Card, CardHeader, CardBody, Text } from '@backstage/ui';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useGitTags } from '../../hooks';
import { Cell as RACell } from 'react-aria-components';
import {
  Link,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';

const emptyState = () => (
  <div style={{ padding: 'var(--bui-space-4)', textAlign: 'center' }}>
    No tags found.
  </div>
);

export const AzureDevOpsGitTagsPage = () => {
  const { entity } = useEntity();

  const { items, loading, error } = useGitTags(entity);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Text variant='title-small' weight='bold'>Azure Repos - Git Tags</Text>
        </CardHeader>
        <CardBody>
          <Progress />
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <Text variant='title-small' weight='bold'>Azure Repos - Git Tags</Text>
        </CardHeader>
        <CardBody>
          <ResponseErrorPanel error={error} />
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <Text variant='title-small' weight='bold'>
            Azure Repos - Git Tags
          </Text>
        </CardHeader>
        <CardBody>
          <Table aria-label="Azure Repos - Git Tags">
            <TableHeader>
              <Column isRowHeader>Tag</Column>
              <Column>Commit</Column>
              <Column>Created By</Column>
            </TableHeader>
            <TableBody items={items} renderEmptyState={emptyState}>
              {item => (
                <Row key={item.name} id={item.name}>
                  <RACell>
                    <Link to={item.link ?? ''}>{item.name}</Link>
                  </RACell>
                  <RACell>
                    <Link to={item.commitLink ?? ''}>{item.peeledObjectId}</Link>
                  </RACell>
                  <Cell title={item.createdBy ?? '-'} />
                </Row>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </>
  );
};