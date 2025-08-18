import {
  ResponseErrorPanel,
  StatusOK,
  StatusPending,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { ComponentEntity } from "@backstage/catalog-model";
import { useEntity } from '@backstage/plugin-catalog-react';
import { useGetOperations } from '../../hooks';
import { ANNOTATION_SERVICE_NAME, ANNOTATION_SERVICE_VERSION } from "@internal/plugin-api-platform-common";
import { Box, IconButton, Typography } from '@material-ui/core';
import { AppRegistryOperation } from '../../types';
import MapIcon from '@material-ui/icons/Map';
import { Table as MuiTable, TableBody as MuiTableBody, TableCell as MuiTableCell, TableHead as MuiTableHead, TableRow as MuiTableRow } from '@material-ui/core';
import { InfoPopOver } from '@internal/plugin-api-platform-react';
import { memo, useMemo } from 'react';

type TableRow = {
  id: number,
  operation: AppRegistryOperation,
}

const PdpMappingTable = memo<{ mapping: { valuePath: string; pdpField: string; }[] }>(({ mapping }) => (
  <MuiTable size="small">
    <MuiTableHead>
      <MuiTableRow>
        <MuiTableCell>
          <Typography variant="button">Value Path</Typography>
        </MuiTableCell>
        <MuiTableCell>
          <Typography variant="button">PDP Field</Typography>
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
      <Typography variant="body2">{operation.method}</Typography>
    ),
  },
  {
    title: 'Name',
    width: '70%',
    field: 'operation.name',
    highlight: true,
    defaultSort: 'asc',
    render: ({ operation }) => (
      <Typography variant="body2">{operation.name}</Typography>
    ),
  },
  {
    title: 'ABAC',
    field: 'operation.abac',
    width: '5%',
    render: ({ operation }) => (operation.abac ? <StatusOK /> : <StatusPending />),
  },
  {
    title: 'B-Function',
    width: '10%',
    field: 'operation.bFunction',
  },
  {
    title: 'PDP Mapping',
    width: '10%',
    field: 'id',
    render: ({ operation }) =>
      operation.pdpMapping ? (
        <InfoPopOver
          title="PDP Mapping"
          variant="h6"
          content={<PdpMappingTable mapping={operation.pdpMapping} />}
        >
          <IconButton size="small" aria-label="View PDP mapping">
            <MapIcon />
          </IconButton>
        </InfoPopOver>
      ) : null,
  },
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
    <Box display="flex" alignItems="center">
      <Box mr={1} />
      Operations ({rows.length})
    </Box>
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