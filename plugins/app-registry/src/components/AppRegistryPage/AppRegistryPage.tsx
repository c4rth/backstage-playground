import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { ComponentEntity } from "@backstage/catalog-model";
import { useEntity } from '@backstage/plugin-catalog-react';
import { useGetOperations } from '../../hooks';
import { ANNOTATION_SERVICE_NAME, ANNOTATION_SERVICE_VERSION } from "@internal/plugin-api-platform-common";
import { AppRegistryOperation } from '../../types';
import { RiCheckboxCircleFill, RiIndeterminateCircleLine, RiAddCircleFill } from '@remixicon/react'
import { ButtonIcon, Table, Cell, Tooltip, TooltipTrigger, Card, CardHeader, Text, CardBody, Grid, CellText, useTable, ColumnConfig, Box } from '@backstage/ui';
import styles from './AppRegistry.module.css';

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

const AbacTooltip = ({ icon, children }: { icon: JSX.Element, children: React.ReactNode }) => (
  <TooltipTrigger delay={250}>
    <ButtonIcon size='medium' variant='tertiary' style={{ width: '20px', padding: 0, background: 'transparent' }} icon={icon} />
    <Tooltip placement='bottom' style={{ maxWidth: '50em' }}>
      {children}
    </Tooltip>
  </TooltipTrigger>
);


const renderAbacCell = (operation: AppRegistryOperation) => {
  if (!operation.abac) {
    return (
      <AbacTooltip icon={<RiIndeterminateCircleLine color='var(--bui-fg-solid-disabled)' />}>
        No ABAC
      </AbacTooltip>
    );
  }
  if (operation.pdpMapping) {
    return (
      <AbacTooltip icon={<RiAddCircleFill color='primary' />}>
        <Text variant='title-x-small'><b>PDP Mapping</b></Text>
        <PdpMappingTable mapping={operation.pdpMapping} />
      </AbacTooltip>
    );
  }
  return (
    <AbacTooltip icon={<RiCheckboxCircleFill color='primary' />}>
      No PDP mapping
    </AbacTooltip>
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

const columns: ColumnConfig<TableRow>[] = [
  {
    id: 'method',
    label: 'Method',
    isRowHeader: true,
    cell: item => <CellText title={item.operation.method} />,
    isSortable: true,
    width: '10%'
  }, {
    id: 'name',
    label: 'Name',
    cell: item => <Cell style={{ paddingLeft: 'var(--bui-space-3)' }}>{item.operation.name}</Cell>,
    isSortable: true,
    width: '70%'
  }, {
    id: 'abac',
    label: 'ABAC',
    cell: item => <Cell style={{ paddingLeft: 'var(--bui-space-3)' }}>{renderAbacCell(item.operation)}</Cell>,
    width: '10%'
  }, {
    id: 'bFunction',
    label: 'B-Function',
    cell: item => <CellText title={item.operation.bFunction ?? '-'} />,
    isSortable: true,
    width: '10%'
  }
];

async function fetchData(
  getOperations: (system?: string, appName?: string, appVersion?: string, environment?: string) => Promise<AppRegistryOperation[] | undefined>,
  system?: string,
  appName?: string,
  appVersion?: string,
  environment?: string,
) {
  const data = await getOperations(system, appName, appVersion, environment);
  return data?.map(toTableRow) ?? [];
}

export const AppRegistryPage = () => {
  const { entity } = useEntity<ComponentEntity>();
  const system = entity.spec.system;
  const appName = entity.metadata.annotations?.[ANNOTATION_SERVICE_NAME]?.toString();
  const appVersion = entity.metadata.annotations?.[ANNOTATION_SERVICE_VERSION]?.toString();
  const environment = entity.spec?.lifecycle?.toUpperCase();
  const isFirstRender = useRef(true);

  const getOperations = useGetOperations();

  const {
    tableProps,
    reload,
  } = useTable({
    mode: 'complete',
    getData: () => fetchData(getOperations, system, appName, appVersion, environment),
    initialSort: {
      column: 'name',
      direction: 'ascending'
    },
    paginationOptions: {
      type: 'none',
    },
    sortFn: (items, {
      column,
      direction
    }) => {
      return [...items].sort((a, b) => {
        const desc = direction === 'descending' ? -1 : 1;
        switch (column) {
          case 'method':
            return desc * a.operation.method.localeCompare(b.operation.method);
          case 'name':
            return desc * a.operation.name.localeCompare(b.operation.name);
          case 'bFunction':
            return desc * ((a.operation.bFunction ?? '').localeCompare(b.operation.bFunction ?? ''));
          default:
            return 0;
        }
      });
    }
  });

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    reload();
  }, [entity, reload]);

  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);
  const boxRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const top = node.getBoundingClientRect().top;
      setMaxHeight(window.innerHeight - top - 50); // 50px padding from bottom
    }
  }, []);

  if (tableProps.error) {
    return <ResponseErrorPanel title="Failed to call AppRegistry" error={tableProps.error} />;
  }
  if (tableProps.loading) {
    return <Progress />;
  }

  return (
    <Card>
      <CardHeader>
        <Text variant='title-small' weight='bold'>
          Operations
        </Text>
      </CardHeader>
      <CardBody style={{ padding: '0' }}>
        <Box ref={boxRef} style={{ maxHeight: maxHeight ? `${maxHeight}px` : undefined, overflow: 'auto' }}>
          <Table
            columnConfig={columns}
            {...tableProps}
            pagination={{
              type: 'none',
            }}
            emptyState={emptyState()}
            className={styles.denseTable}
          />
        </Box>
      </CardBody>
    </Card>
  );

}