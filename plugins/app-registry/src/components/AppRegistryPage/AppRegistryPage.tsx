import {
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { ComponentEntity } from "@backstage/catalog-model";
import { useEntity } from '@backstage/plugin-catalog-react';
import { useGetOperations } from '../../hooks';
import { ANNOTATION_SERVICE_NAME, ANNOTATION_SERVICE_VERSION } from "@internal/plugin-api-platform-common";
import { AppRegistryOperation } from '../../types';
import { InfoPopOver } from '@internal/plugin-api-platform-react';
import { RiCheckboxCircleFill, RiIndeterminateCircleLine, RiAddCircleFill } from '@remixicon/react'
import { ButtonIcon, Column, Table, TableHeader, TableBody, Row, Cell, Tooltip, TooltipTrigger, Card, CardHeader, Text, CardBody, Grid, CellText } from '@backstage/ui';
import { ResizableTableContainer } from 'react-aria-components';
import { useAsyncList } from 'react-stately';

type TableRow = {
  id: number,
  operation: AppRegistryOperation,
}

const PdpMappingTable = ({ mapping }: { mapping: { valuePath: string; pdpField: string; }[] }) => (
  <Grid.Root columns='2' mt="var(--bui-space-3)">
    <Grid.Item><b>Value Path</b></Grid.Item>
    <Grid.Item><b>PDP Field</b></Grid.Item>
    {mapping.map((row) => (
      <>
        <Grid.Item>{row.valuePath}</Grid.Item>
        <Grid.Item>{row.pdpField}</Grid.Item>
      </>
    ))}
  </Grid.Root>
);

const renderAbacCell = (operation: AppRegistryOperation) => {
  if (!operation.abac) {
    return (
      <TooltipTrigger delay={250}>
        <ButtonIcon size='medium' style={{ width: 'auto', background: 'transparent' }} icon={<RiIndeterminateCircleLine color='var(--bui-fg-solid-disabled)' />} />
        <Tooltip placement='bottom'>No ABAC</Tooltip>
      </TooltipTrigger>
    );
  }
  if (operation.pdpMapping) {
    return (
      <InfoPopOver
        title="PDP Mapping"
        variant="h6"
        delayTime={250}
        content={<PdpMappingTable mapping={operation.pdpMapping} />}>
        <RiAddCircleFill color='primary' />
      </InfoPopOver>
    );
  }
  return (
    <TooltipTrigger delay={250}>
      <ButtonIcon size='medium' style={{ width: 'auto', background: 'transparent' }} icon={<RiCheckboxCircleFill color='primary' />} />
      <Tooltip placement='bottom'>No PDP mapping</Tooltip>
    </TooltipTrigger>
  );
};

const emptyState = () => (
  <div style={{ padding: 'var(--bui-space-4)', textAlign: 'center' }}>
    No operations found.
  </div>
);

const toTableRow = (operation: AppRegistryOperation, idx: number): TableRow => ({
  id: idx,
  operation,
});

export const AppRegistryPage = () => {
  const { entity } = useEntity<ComponentEntity>();
  const system = entity.spec.system;
  const appName = entity.metadata[ANNOTATION_SERVICE_NAME]?.toString();
  const appVersion = entity.metadata[ANNOTATION_SERVICE_VERSION]?.toString();
  const environment = entity.spec?.lifecycle?.toUpperCase();

  const getOperations = useGetOperations();

  const list = useAsyncList<TableRow>({
    async load({ }) {
      const data = await getOperations(
        system,
        appName,
        appVersion,
        environment,
      );
      const rows = data?.map(toTableRow) ?? [];
      const sortedRows = rows.sort((a, b) => a.operation.name.localeCompare(b.operation.name));
      return { items: sortedRows };
    },
    async sort({ items, sortDescriptor }) {
      return {
        items: items.sort((a, b) => {
          const desc = sortDescriptor.direction === 'descending' ? -1 : 1;
          switch (sortDescriptor.column) {
            case 'method':
              return desc * a.operation.method.localeCompare(b.operation.method);
            case 'name':
              return desc * a.operation.name.localeCompare(b.operation.name);
            case 'bFunction':
              return desc * ((a.operation.bFunction ?? '').localeCompare(b.operation.bFunction ?? ''));
            default:
              return 0;
          }
        }),
      };
    },
    initialSortDescriptor: { column: 'name', direction: 'ascending' },
  });

  if (list.error) {
    return <ResponseErrorPanel title="Failed to call AppRegistry" error={list.error} />;
  }
  if (list.isLoading) {
    return <Progress />;
  }

  return (
    <Card>
      <CardHeader>
        <Text variant='title-small' weight='bold'>
          Operations
        </Text>
      </CardHeader>
      <CardBody style={{ padding: '0'}}>
        <ResizableTableContainer >
          <Table sortDescriptor={list.sortDescriptor} onSortChange={list.sort} aria-label="App Registry operations" >
            <TableHeader>
              <Column id='method' isRowHeader width='10%' allowsSorting>Method</Column>
              <Column id='name' width='70%' allowsSorting>Name</Column>
              <Column id='abac' width='10%'>ABAC</Column>
              <Column id='bFunction' width='10%' allowsSorting>B-Function</Column>
            </TableHeader>
            <TableBody items={list.items} renderEmptyState={emptyState}>
                {(item: TableRow) => (
                <Row id={item.id} className='custom-bui-TableRow'>
                  <CellText title={item.operation.method} />
                  <Cell style={{ padding: 'var(--bui-space-3)' }}>{item.operation.name}</Cell>
                  <Cell style={{ padding: 'var(--bui-space-3)' }}>{renderAbacCell(item.operation)}</Cell>
                  <CellText title={item.operation.bFunction ?? '-'} />
                </Row>
                )}
            </TableBody>
          </Table>
        </ResizableTableContainer>
      </CardBody>
    </Card>
  );

}