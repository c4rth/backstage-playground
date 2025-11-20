import {
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { ComponentEntity } from "@backstage/catalog-model";
import { useEntity } from '@backstage/plugin-catalog-react';
import { useGetOperations } from '../../hooks';
import { ANNOTATION_SERVICE_NAME, ANNOTATION_SERVICE_VERSION } from "@internal/plugin-api-platform-common";
import { AppRegistryOperation } from '../../types';
import { InfoPopOver } from '@internal/plugin-api-platform-react';
import { memo, useMemo } from 'react';
import { RiCheckboxCircleFill, RiIndeterminateCircleLine, RiAddCircleFill } from '@remixicon/react'
import { ButtonIcon, Flex, Text, Tooltip, TooltipTrigger } from '@backstage/ui';

// TODO-MUI
import { Table as MuiTable, TableBody as MuiTableBody, TableCell as MuiTableCell, TableHead as MuiTableHead, TableRow as MuiTableRow } from '@material-ui/core';

type TableRow = {
  id: number,
  operation: AppRegistryOperation,
}

const PdpMappingTable = memo<{ mapping: { valuePath: string; pdpField: string; }[] }>(({ mapping }) => (
  <MuiTable size="small">
    <MuiTableHead>
      <MuiTableRow>
        <MuiTableCell>
          <Text>Value Path</Text>
        </MuiTableCell>
        <MuiTableCell>
          <Text>PDP Field</Text>
        </MuiTableCell>
      </MuiTableRow>
    </MuiTableHead>
    <MuiTableBody>
      {mapping.map((row, index) => (
        <MuiTableRow key={`${row.valuePath}-${row.pdpField}-${index}`}>
          <MuiTableCell component="th" scope="row">
            {row.valuePath}
          </MuiTableCell>
          <MuiTableCell>{row.pdpField}</MuiTableCell>
        </MuiTableRow>
      ))}
    </MuiTableBody>
  </MuiTable>
));

const columns: TableColumn<TableRow>[] = [
  {
    title: 'Method',
    width: '5%',
    field: 'operation.method',
    render: ({ operation }) => (
      <Text>{operation.method}</Text>
    ),
  },
  {
    title: 'Name',
    width: '70%',
    field: 'operation.name',
    highlight: true,
    defaultSort: 'asc',
    render: ({ operation }) => (
      <Text>{operation.name}</Text>
    ),
  },
  {
    title: 'ABAC',
    field: 'operation.abac',
    width: '5%',
    render: ({ operation }) => {
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
      if (operation.abac) {
        return (
          <TooltipTrigger delay={250}>
            <ButtonIcon size='medium' style={{ width: 'auto', background: 'transparent'}} icon={<RiCheckboxCircleFill color='primary'/>} />            
            <Tooltip placement='bottom'>No PDP mapping</Tooltip>
          </TooltipTrigger>
        );
      }
      return (
        <TooltipTrigger delay={250}>
            <ButtonIcon size='medium' style={{ width: 'auto', background: 'transparent'}} icon={<RiIndeterminateCircleLine color='var(--bui-fg-solid-disabled)' />} />          
          <Tooltip placement='bottom'>No ABAC</Tooltip>
        </TooltipTrigger>
      );
    }
  },
  {
    title: 'B-Function',
    width: '10%',
    field: 'operation.bFunction',
  }
];

const toTableRow = (operation: AppRegistryOperation, idx: number): TableRow => ({
  id: idx,
  operation,
});

export const AppRegistryPage = () => {
  const { entity } = useEntity<ComponentEntity>();
  const entityData = useMemo(() => {
    const system = entity.spec.system;
    const appName = entity.metadata[ANNOTATION_SERVICE_NAME]?.toString();
    const appVersion = entity.metadata[ANNOTATION_SERVICE_VERSION]?.toString();
    const environment = entity.spec?.lifecycle?.toUpperCase();

    return {
      system,
      appName,
      appVersion,
      environment,
    };
  }, [entity]);

  const { data, loading, error } = useGetOperations(
    entityData.system,
    entityData.appName,
    entityData.appVersion,
    entityData.environment
  );

  const rows = useMemo(() => data?.map(toTableRow) ?? [], [data]);

  const tableOptions = useMemo(() => ({
    search: true,
    padding: 'dense' as const,
    paging: false,
    showEmptyDataSourceMessage: !loading,
    draggable: false,
    thirdSortClick: false,
  }), [loading]);

  const tableTitle = useMemo(() => (
    <Flex align="center">
      Operations ({rows.length})
    </Flex>
  ), [rows.length]);

  if (error) {
    return <ResponseErrorPanel title="Failed to call AppRegistry" error={error} />;
  }

  return (
    <Table<TableRow>
      isLoading={loading}
      columns={columns}
      options={tableOptions}
      title={tableTitle}
      data={rows}
    />
  );
}